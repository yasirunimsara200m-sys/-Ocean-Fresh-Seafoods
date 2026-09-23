import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'seafood-secret-key-2026';
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
    if (!admin) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
    const isValid = bcrypt.compareSync(password, admin.password_hash);
    if (!isValid) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
    const token = jwt.sign({ id: admin.id, username: admin.username, role: admin.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
        token,
        admin: {
            id: admin.id,
            username: admin.username,
            name: admin.name,
            role: admin.role
        }
    });
});
router.get('/me', requireAdmin, (req, res) => {
    const admin = db.prepare('SELECT id, username, name, role, created_at FROM admins WHERE id = ?').get(req.user?.id);
    if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
    }
    res.json({ admin });
});
export default router;
