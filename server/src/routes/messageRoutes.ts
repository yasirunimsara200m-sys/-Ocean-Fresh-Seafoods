import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// POST /api/messages (Public contact submission)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Name, email, subject, and message are required' });
    }

    const id = `msg-${uuidv4().slice(0, 8)}`;
    await db.prepare(`
      INSERT INTO messages (id, name, email, phone, subject, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, email, phone || '', subject, message);

    res.status(201).json({ message: 'Thank you for contacting us! Our team will get back to you shortly.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/messages (Admin list)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const messages = await db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
    res.json({ messages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/messages/:id/read
router.patch('/:id/read', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_read } = req.body;
    await db.prepare('UPDATE messages SET is_read = ? WHERE id = ?').run(is_read ? 1 : 0, id);
    res.json({ message: 'Message updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/messages/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.prepare('DELETE FROM messages WHERE id = ?').run(id);
    res.json({ message: 'Message deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
