import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

function formatOrder(o: any) {
  if (!o) return null;
  let items = [];
  try {
    items = typeof o.items_json === 'string' ? JSON.parse(o.items_json || '[]') : (o.items_json || []);
  } catch (e) {
    items = [];
  }
  return {
    ...o,
    subtotal: Number(o.subtotal || 0),
    delivery_fee: Number(o.delivery_fee || 0),
    total_amount: Number(o.total_amount || 0),
    items
  };
}

// POST /api/orders (Public checkout)
router.post('/', async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      delivery_city,
      outlet_id,
      delivery_date,
      delivery_time_slot,
      payment_method,
      items,
      special_notes
    } = req.body;

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
    const delivery_fee = subtotal >= 15000 ? 0 : 450;
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

    await stmt.run(
      id,
      order_number,
      customer_name,
      customer_email || '',
      customer_phone,
      delivery_address,
      delivery_city || 'Colombo',
      outlet_id || 'outlet-athurugiriya',
      delivery_date || 'Standard Fast Dispatch',
      delivery_time_slot || 'Direct Cold-Chain',
      payment_method || 'cod',
      payment_status,
      order_status,
      subtotal,
      delivery_fee,
      total_amount,
      JSON.stringify(items),
      special_notes || ''
    );

    // Auto-decrement product stock_quantity & update in_stock status
    const updateStockStmt = db.prepare(`
      UPDATE products 
      SET 
        stock_quantity = GREATEST(0, stock_quantity - ?),
        in_stock = CASE WHEN (stock_quantity - ?) <= 0 THEN 0 ELSE 1 END
      WHERE id = ?
    `);

    for (const item of items) {
      if (item.product_id) {
        const qty = Number(item.quantity) || 1;
        await updateStockStmt.run(qty, qty, item.product_id);
      }
    }

    const created = await db.prepare(`
      SELECT o.*, out.name as outlet_name
      FROM orders o
      LEFT JOIN outlets out ON o.outlet_id = out.id
      WHERE o.id = ?
    `).get(id);

    res.status(201).json({
      order: formatOrder(created),
      message: 'Order placed successfully!'
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: err.message || 'Failed to place order' });
  }
});

// GET /api/orders/track/:orderNumber (Public tracking)
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const cleanTerm = (orderNumber || '').trim().toUpperCase();
    const numOnly = cleanTerm.replace(/^(CC-|TSG-)/i, '');

    const order = await db.prepare(`
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders (Admin list with status filter and search)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { status, search, outlet } = req.query;

    let query = `
      SELECT o.*, out.name as outlet_name
      FROM orders o
      LEFT JOIN outlets out ON o.outlet_id = out.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ` AND o.order_status = ?`;
      params.push(status);
    }

    if (outlet && outlet !== 'all') {
      query += ` AND o.outlet_id = ?`;
      params.push(outlet);
    }

    if (search) {
      query += ` AND (o.order_number ILIKE ? OR o.customer_name ILIKE ? OR o.customer_phone ILIKE ? OR o.customer_email ILIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ` ORDER BY o.created_at DESC`;

    const rows = await db.prepare(query).all(...params);
    res.json({ orders: rows.map(formatOrder), count: rows.length });
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id (Admin single)
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await db.prepare(`
      SELECT o.*, out.name as outlet_name, out.phone as outlet_phone
      FROM orders o
      LEFT JOIN outlets out ON o.outlet_id = out.id
      WHERE o.id = ?
    `).get(id);

    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order: formatOrder(order) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/status (Admin update status)
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, payment_status } = req.body;

    const validStatuses = ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (order_status && !validStatuses.includes(order_status)) {
      return res.status(400).json({ error: `Invalid order status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const currentOrder = await db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
    if (!currentOrder) return res.status(404).json({ error: 'Order not found' });

    // If transitioning to cancelled from non-cancelled, restock the products
    if (order_status === 'cancelled' && currentOrder.order_status !== 'cancelled') {
      try {
        const items = typeof currentOrder.items_json === 'string'
          ? JSON.parse(currentOrder.items_json || '[]')
          : (currentOrder.items_json || []);

        const restockStmt = db.prepare(`
          UPDATE products 
          SET 
            stock_quantity = stock_quantity + ?,
            in_stock = 1
          WHERE id = ?
        `);
        for (const item of items) {
          if (item.product_id) {
            const qty = Number(item.quantity) || 1;
            await restockStmt.run(qty, item.product_id);
          }
        }
      } catch (e) {
        console.error('Failed to restock items on order cancel:', e);
      }
    }

    await db.prepare(`
      UPDATE orders SET
        order_status = COALESCE(?, order_status),
        payment_status = COALESCE(?, payment_status)
      WHERE id = ?
    `).run(order_status, payment_status, id);

    const updated = await db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    res.json({ order: formatOrder(updated), message: 'Order status updated successfully' });
  } catch (err: any) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
