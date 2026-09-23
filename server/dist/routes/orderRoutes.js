import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
const router = Router();
function formatOrder(o) {
    if (!o)
        return null;
    let items = [];
    try {
        items = JSON.parse(o.items_json || '[]');
    }
    catch (e) {
        items = [];
    }
    return {
        ...o,
        items
    };
}
// POST /api/orders (Public checkout)
router.post('/', (req, res) => {
    try {
        const { customer_name, customer_email, customer_phone, delivery_address, delivery_city, outlet_id, delivery_date, delivery_time_slot, payment_method, items, special_notes } = req.body;
        if (!customer_name || !customer_phone || !delivery_address || !items || !items.length) {
            return res.status(400).json({ error: 'Missing required customer or items information' });
        }
        const id = `ord-${uuidv4().slice(0, 8)}`;
        // Generate order number like CC-48192
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const order_number = `CC-${randomNum}`;
        let subtotal = 0;
        for (const item of items) {
            subtotal += (Number(item.price) || 0) * (Number(item.quantity) || 1);
        }
        const delivery_fee = 350; // Standard flat delivery in LKR
        const total_amount = subtotal + delivery_fee;
        const payment_status = payment_method === 'card' ? 'paid' : 'pending';
        const order_status = 'pending';
        const stmt = db.prepare(`
      INSERT INTO orders (
        id, order_number, customer_name, customer_email, customer_phone,
        delivery_address, delivery_city, outlet_id, delivery_date, delivery_time_slot,
        payment_method, payment_status, order_status, subtotal, delivery_fee,
        total_amount, items_json, special_notes
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?
      )
    `);
        stmt.run(id, order_number, customer_name, customer_email || '', customer_phone, delivery_address, delivery_city || 'Colombo', outlet_id || 'outlet-colombo', delivery_date || 'Next Day', delivery_time_slot || 'Morning (9:00 AM - 1:00 PM)', payment_method || 'cod', payment_status, order_status, subtotal, delivery_fee, total_amount, JSON.stringify(items), special_notes || '');
        const created = db.prepare(`
      SELECT o.*, out.name as outlet_name
      FROM orders o
      LEFT JOIN outlets out ON o.outlet_id = out.id
      WHERE o.id = ?
    `).get(id);
        res.status(201).json({
            order: formatOrder(created),
            message: 'Order placed successfully!'
        });
    }
    catch (err) {
        console.error('Order creation error:', err);
        res.status(500).json({ error: err.message || 'Failed to place order' });
    }
});
// GET /api/orders/track/:orderNumber (Public tracking)
router.get('/track/:orderNumber', (req, res) => {
    const { orderNumber } = req.params;
    const cleanTerm = (orderNumber || '').trim().toUpperCase();
    const numOnly = cleanTerm.replace(/^(CC-|TSG-)/i, '');
    const order = db.prepare(`
    SELECT o.*, out.name as outlet_name, out.phone as outlet_phone
    FROM orders o
    LEFT JOIN outlets out ON o.outlet_id = out.id
    WHERE UPPER(o.order_number) = ?
       OR UPPER(o.order_number) = ?
       OR UPPER(o.order_number) = ?
       OR o.order_number LIKE ?
       OR o.id = ?
  `).get(cleanTerm, `CC-${numOnly}`, `TSG-${numOnly}`, `%${numOnly}%`, cleanTerm);
    if (!order) {
        return res.status(404).json({ error: 'Order not found. Please verify your order number.' });
    }
    res.json({ order: formatOrder(order) });
});
// GET /api/orders (Admin list with status filter and search)
router.get('/', requireAdmin, (req, res) => {
    const { status, search, outlet } = req.query;
    let query = `
    SELECT o.*, out.name as outlet_name
    FROM orders o
    LEFT JOIN outlets out ON o.outlet_id = out.id
    WHERE 1=1
  `;
    const params = [];
    if (status && status !== 'all') {
        query += ` AND o.order_status = ?`;
        params.push(status);
    }
    if (outlet && outlet !== 'all') {
        query += ` AND o.outlet_id = ?`;
        params.push(outlet);
    }
    if (search) {
        query += ` AND (o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ? OR o.customer_email LIKE ?)`;
        const s = `%${search}%`;
        params.push(s, s, s, s);
    }
    query += ` ORDER BY o.created_at DESC`;
    const rows = db.prepare(query).all(...params);
    res.json({ orders: rows.map(formatOrder), count: rows.length });
});
// GET /api/orders/:id (Admin single)
router.get('/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const order = db.prepare(`
    SELECT o.*, out.name as outlet_name, out.phone as outlet_phone
    FROM orders o
    LEFT JOIN outlets out ON o.outlet_id = out.id
    WHERE o.id = ?
  `).get(id);
    if (!order)
        return res.status(404).json({ error: 'Order not found' });
    res.json({ order: formatOrder(order) });
});
// PATCH /api/orders/:id/status (Admin update status)
router.patch('/:id/status', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { order_status, payment_status } = req.body;
    const validStatuses = ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (order_status && !validStatuses.includes(order_status)) {
        return res.status(400).json({ error: `Invalid order status. Must be one of: ${validStatuses.join(', ')}` });
    }
    db.prepare(`
    UPDATE orders SET
      order_status = COALESCE(?, order_status),
      payment_status = COALESCE(?, payment_status)
    WHERE id = ?
  `).run(order_status, payment_status, id);
    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    res.json({ order: formatOrder(updated), message: 'Order status updated successfully' });
});
export default router;
