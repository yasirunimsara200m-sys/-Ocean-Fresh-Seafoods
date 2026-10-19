import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/outlets
router.get('/', async (req, res) => {
  try {
    const outlets = await db.prepare('SELECT * FROM outlets ORDER BY name ASC').all();
    res.json({ outlets });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/outlets/:slugOrId
router.get('/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const outlet = await db.prepare('SELECT * FROM outlets WHERE id = ? OR slug = ?').get(slugOrId, slugOrId);
    if (!outlet) return res.status(404).json({ error: 'Outlet not found' });
    res.json({ outlet });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: POST /api/outlets
router.post('/', requireAdmin, async (req, res) => {
  const { name, city, address, phone, email, opening_hours, is_active } = req.body;
  if (!name || !city || !address || !phone) {
    return res.status(400).json({ error: 'Name, city, address, and phone are required' });
  }

  const id = `outlet-${uuidv4().slice(0, 8)}`;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  try {
    await db.prepare(`
      INSERT INTO outlets (id, name, slug, city, address, phone, email, opening_hours, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, slug, city, address, phone, email || '', opening_hours || '', is_active !== undefined ? (is_active ? 1 : 0) : 1);

    const created = await db.prepare('SELECT * FROM outlets WHERE id = ?').get(id);
    res.status(201).json({ outlet: created });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: PUT /api/outlets/:id
router.put('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, city, address, phone, email, opening_hours, is_active } = req.body;

  try {
    await db.prepare(`
      UPDATE outlets SET
        name = COALESCE(?, name),
        city = COALESCE(?, city),
        address = COALESCE(?, address),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        opening_hours = COALESCE(?, opening_hours),
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(name, city, address, phone, email, opening_hours, is_active !== undefined ? (is_active ? 1 : 0) : null, id);

    const updated = await db.prepare('SELECT * FROM outlets WHERE id = ?').get(id);
    res.json({ outlet: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
