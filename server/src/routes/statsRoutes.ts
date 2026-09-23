import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/admin/stats
router.get('/', requireAdmin, (req, res) => {
  try {
    const revenueRow = db.prepare(`
      SELECT SUM(total_amount) as total_revenue
      FROM orders
      WHERE order_status != 'cancelled'
    `).get() as any;

    const totalOrdersRow = db.prepare('SELECT COUNT(*) as total_orders FROM orders').get() as any;
    const pendingOrdersRow = db.prepare("SELECT COUNT(*) as pending_orders FROM orders WHERE order_status = 'pending'").get() as any;
    const productsCountRow = db.prepare('SELECT COUNT(*) as total_products FROM products').get() as any;
    const lowStockCountRow = db.prepare('SELECT COUNT(*) as low_stock FROM products WHERE in_stock = 0 OR stock_quantity <= 5').get() as any;
    const unreadMessagesRow = db.prepare('SELECT COUNT(*) as unread_messages FROM messages WHERE is_read = 0').get() as any;

    const ordersByStatus = db.prepare(`
      SELECT order_status, COUNT(*) as count
      FROM orders
      GROUP BY order_status
    `).all();

    const revenueByOutlet = db.prepare(`
      SELECT out.name as outlet_name, SUM(o.total_amount) as revenue, COUNT(o.id) as orders_count
      FROM orders o
      LEFT JOIN outlets out ON o.outlet_id = out.id
      WHERE o.order_status != 'cancelled'
      GROUP BY o.outlet_id
    `).all();

    const recentOrders = db.prepare(`
      SELECT o.id, o.order_number, o.customer_name, o.customer_phone, o.total_amount, o.order_status, o.delivery_date, o.created_at, out.name as outlet_name
      FROM orders o
      LEFT JOIN outlets out ON o.outlet_id = out.id
      ORDER BY o.created_at DESC
      LIMIT 6
    `).all();

    res.json({
      stats: {
        totalRevenue: revenueRow?.total_revenue || 0,
        totalOrders: totalOrdersRow?.total_orders || 0,
        pendingOrders: pendingOrdersRow?.pending_orders || 0,
        totalProducts: productsCountRow?.total_products || 0,
        lowStockCount: lowStockCountRow?.low_stock || 0,
        unreadMessages: unreadMessagesRow?.unread_messages || 0,
        ordersByStatus,
        revenueByOutlet,
        recentOrders
      }
    });
  } catch (err: any) {
    console.error('Stats fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
