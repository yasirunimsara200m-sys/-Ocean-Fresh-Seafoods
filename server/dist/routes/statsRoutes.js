import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
const router = Router();
// GET /api/admin/stats
router.get('/', requireAdmin, async (req, res) => {
    try {
        const revenueRow = await db.prepare(`
      SELECT SUM(total_amount) as total_revenue
      FROM orders
      WHERE order_status != 'cancelled'
    `).get();
        const totalOrdersRow = await db.prepare('SELECT COUNT(*) as total_orders FROM orders').get();
        const pendingOrdersRow = await db.prepare("SELECT COUNT(*) as pending_orders FROM orders WHERE order_status = 'pending'").get();
        const productsCountRow = await db.prepare('SELECT COUNT(*) as total_products FROM products').get();
        const lowStockCountRow = await db.prepare('SELECT COUNT(*) as low_stock FROM products WHERE in_stock = 0 OR stock_quantity <= 5').get();
        const unreadMessagesRow = await db.prepare('SELECT COUNT(*) as unread_messages FROM messages WHERE is_read = 0').get();
        const ordersByStatus = await db.prepare(`
      SELECT order_status, COUNT(*) as count
      FROM orders
      GROUP BY order_status
    `).all();
        const revenueByOutlet = await db.prepare(`
      SELECT out.name as outlet_name, SUM(o.total_amount) as revenue, COUNT(o.id) as orders_count
      FROM orders o
      LEFT JOIN outlets out ON o.outlet_id = out.id
      WHERE o.order_status != 'cancelled'
      GROUP BY out.name
    `).all();
        const recentOrders = await db.prepare(`
      SELECT o.id, o.order_number, o.customer_name, o.customer_phone, o.total_amount, o.order_status, o.delivery_date, o.created_at, out.name as outlet_name
      FROM orders o
      LEFT JOIN outlets out ON o.outlet_id = out.id
      ORDER BY o.created_at DESC
      LIMIT 6
    `).all();
        const lowStockProducts = await db.prepare(`
      SELECT id, name, unit, base_price, stock_quantity, in_stock, image_url
      FROM products
      WHERE in_stock = 0 OR stock_quantity <= 5
      ORDER BY stock_quantity ASC
    `).all();
        res.json({
            stats: {
                totalRevenue: Number(revenueRow?.total_revenue || 0),
                totalOrders: Number(totalOrdersRow?.total_orders || 0),
                pendingOrders: Number(pendingOrdersRow?.pending_orders || 0),
                totalProducts: Number(productsCountRow?.total_products || 0),
                lowStockCount: Number(lowStockCountRow?.low_stock || 0),
                lowStockProducts: lowStockProducts.map((p) => ({
                    ...p,
                    base_price: Number(p.base_price || 0),
                    stock_quantity: Number(p.stock_quantity || 0),
                    in_stock: Boolean(Number(p.in_stock) === 1)
                })),
                unreadMessages: Number(unreadMessagesRow?.unread_messages || 0),
                ordersByStatus: ordersByStatus.map((r) => ({
                    ...r,
                    count: Number(r.count || 0)
                })),
                revenueByOutlet: revenueByOutlet.map((r) => ({
                    ...r,
                    revenue: Number(r.revenue || 0),
                    orders_count: Number(r.orders_count || 0)
                })),
                recentOrders: recentOrders.map((o) => ({
                    ...o,
                    total_amount: Number(o.total_amount || 0)
                }))
            }
        });
    }
    catch (err) {
        console.error('Stats fetch error:', err);
        res.status(500).json({ error: err.message });
    }
});
export default router;
