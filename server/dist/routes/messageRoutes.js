import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
const router = Router();
// POST /api/messages (Public contact submission)
router.post('/', (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'Name, email, subject, and message are required' });
    }
    const id = `msg-${uuidv4().slice(0, 8)}`;
    db.prepare(`
    INSERT INTO messages (id, name, email, phone, subject, message)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, name, email, phone || '', subject, message);
    res.status(201).json({ message: 'Thank you for contacting us! Our team will get back to you shortly.' });
});
// GET /api/messages (Admin list)
router.get('/', requireAdmin, (req, res) => {
    const messages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
    res.json({ messages });
});
// PATCH /api/messages/:id/read
router.patch('/:id/read', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { is_read } = req.body;
    db.prepare('UPDATE messages SET is_read = ? WHERE id = ?').run(is_read ? 1 : 0, id);
    res.json({ message: 'Message updated' });
});
// DELETE /api/messages/:id
router.delete('/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM messages WHERE id = ?').run(id);
    res.json({ message: 'Message deleted' });
});
export default router;
