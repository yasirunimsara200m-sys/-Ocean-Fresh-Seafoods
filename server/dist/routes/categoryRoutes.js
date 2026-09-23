import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
const router = Router();
// GET /api/categories
router.get('/', (req, res) => {
    const categories = db.prepare(`
    SELECT c.*, COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
    GROUP BY c.id
    ORDER BY c.display_order ASC, c.name ASC
  `).all();
    res.json({ categories });
});
// Admin: POST /api/categories
router.post('/', requireAdmin, (req, res) => {
    const { name, description, image_url, display_order } = req.body;
    if (!name)
        return res.status(400).json({ error: 'Category name is required' });
    const id = `cat-${uuidv4().slice(0, 8)}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    try {
        db.prepare(`
      INSERT INTO categories (id, name, slug, description, image_url, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, slug, description || '', image_url || '', display_order || 0);
        const created = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
        res.status(201).json({ category: created });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// Admin: PUT /api/categories/:id
router.put('/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { name, description, image_url, display_order } = req.body;
    try {
        db.prepare(`
      UPDATE categories SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url),
        display_order = COALESCE(?, display_order)
      WHERE id = ?
    `).run(name, description, image_url, display_order, id);
        const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
        res.json({ category: updated });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// Admin: DELETE /api/categories/:id
router.delete('/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    if (result.changes === 0)
        return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
});
export default router;
