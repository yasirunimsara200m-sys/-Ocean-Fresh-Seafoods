import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'seafood-secret-key-2026';
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        const admin = await db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
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
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message || 'Login failed' });
    }
});
router.get('/me', requireAdmin, async (req, res) => {
    try {
        const admin = await db.prepare('SELECT id, username, name, role, created_at FROM admins WHERE id = ?').get(req.user?.id);
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        res.json({ admin });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Update Admin Username / Password / Profile
router.put('/profile', requireAdmin, async (req, res) => {
    try {
        const { current_password, new_username, new_password, new_name } = req.body;
        if (!current_password) {
            return res.status(400).json({ error: 'Current password is required to make changes' });
        }
        const admin = await db.prepare('SELECT * FROM admins WHERE id = ?').get(req.user?.id);
        if (!admin) {
            return res.status(404).json({ error: 'Admin account not found' });
        }
        const isValid = bcrypt.compareSync(current_password, admin.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Incorrect current password' });
        }
        let passwordHash = admin.password_hash;
        if (new_password) {
            if (new_password.trim().length < 6) {
                return res.status(400).json({ error: 'New password must be at least 6 characters' });
            }
            const salt = bcrypt.genSaltSync(10);
            passwordHash = bcrypt.hashSync(new_password.trim(), salt);
        }
        const updatedUsername = new_username?.trim() ? new_username.trim() : admin.username;
        const updatedName = new_name?.trim() ? new_name.trim() : admin.name;
        // Check if new username is already taken by another admin
        if (updatedUsername !== admin.username) {
            const existing = await db.prepare('SELECT id FROM admins WHERE username = ? AND id != ?').get(updatedUsername, admin.id);
            if (existing) {
                return res.status(400).json({ error: 'Username is already taken by another account' });
            }
        }
        await db.prepare(`
      UPDATE admins SET
        username = ?,
        name = ?,
        password_hash = ?
      WHERE id = ?
    `).run(updatedUsername, updatedName, passwordHash, admin.id);
        const token = jwt.sign({ id: admin.id, username: updatedUsername, role: admin.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: 'Admin credentials updated successfully!',
            token,
            admin: {
                id: admin.id,
                username: updatedUsername,
                name: updatedName,
                role: admin.role
            }
        });
    }
    catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: err.message || 'Failed to update credentials' });
    }
});
export default router;
