import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
const router = Router();
// Helper to format product
function formatProduct(p) {
    if (!p)
        return null;
    let gallery = [];
    let variants = [];
    try {
        gallery = JSON.parse(p.gallery_json || '[]');
    }
    catch (e) {
        gallery = [];
    }
    try {
        variants = JSON.parse(p.variants_json || '[]');
    }
    catch (e) {
        variants = [];
    }
    return {
        ...p,
        in_stock: Boolean(p.in_stock),
        is_featured: Boolean(p.is_featured),
        is_best_seller: Boolean(p.is_best_seller),
        gallery,
        variants
    };
}
// GET /api/products
router.get('/', (req, res) => {
    const { category, outlet, search, minPrice, maxPrice, inStock, featured, bestSeller, sort } = req.query;
    let query = `
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
    const params = [];
    if (category && category !== 'all') {
        query += ` AND (c.slug = ? OR c.id = ?)`;
        params.push(category, category);
    }
    if (outlet && outlet !== 'all') {
        query += ` AND (p.outlet_id = ? OR p.outlet_id IS NULL)`;
        params.push(outlet);
    }
    if (search) {
        query += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.short_description LIKE ?)`;
        const s = `%${search}%`;
        params.push(s, s, s);
    }
    if (minPrice) {
        query += ` AND p.base_price >= ?`;
        params.push(Number(minPrice));
    }
    if (maxPrice) {
        query += ` AND p.base_price <= ?`;
        params.push(Number(maxPrice));
    }
    if (inStock === 'true') {
        query += ` AND p.in_stock = 1`;
    }
    if (featured === 'true') {
        query += ` AND p.is_featured = 1`;
    }
    if (bestSeller === 'true') {
        query += ` AND p.is_best_seller = 1`;
    }
    // Sorting
    if (sort === 'price-asc') {
        query += ` ORDER BY p.base_price ASC`;
    }
    else if (sort === 'price-desc') {
        query += ` ORDER BY p.base_price DESC`;
    }
    else if (sort === 'name-asc') {
        query += ` ORDER BY p.name ASC`;
    }
    else if (sort === 'rating' || sort === 'popularity') {
        query += ` ORDER BY p.is_best_seller DESC, p.is_featured DESC, p.created_at DESC`;
    }
    else {
        query += ` ORDER BY p.created_at DESC`;
    }
    const rows = db.prepare(query).all(...params);
    const formatted = rows.map(formatProduct);
    res.json({ products: formatted, count: formatted.length });
});
// GET /api/products/:idOrSlug
router.get('/:idOrSlug', (req, res) => {
    const { idOrSlug } = req.params;
    const product = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ? OR p.slug = ?
  `).get(idOrSlug, idOrSlug);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product: formatProduct(product) });
});
// Admin: POST /api/products
router.post('/', requireAdmin, (req, res) => {
    try {
        const { name, category_id, outlet_id, short_description, description, base_price, original_price, unit, in_stock, stock_quantity, is_featured, is_best_seller, freshness_badge, image_url, gallery, variants } = req.body;
        if (!name || !category_id || !base_price || !image_url) {
            return res.status(400).json({ error: 'Name, category, base price, and image URL are required' });
        }
        const id = `prod-${uuidv4().slice(0, 8)}`;
        const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        let slug = baseSlug;
        let counter = 1;
        while (db.prepare('SELECT id FROM products WHERE slug = ?').get(slug)) {
            slug = `${baseSlug}-${counter++}`;
        }
        const stmt = db.prepare(`
      INSERT INTO products (
        id, name, slug, category_id, outlet_id, short_description, description,
        base_price, original_price, unit, in_stock, stock_quantity,
        is_featured, is_best_seller, freshness_badge, image_url,
        gallery_json, variants_json
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?
      )
    `);
        stmt.run(id, name, slug, category_id, outlet_id || null, short_description || '', description || '', Number(base_price), original_price ? Number(original_price) : null, unit || '1 KG', in_stock ? 1 : 0, stock_quantity !== undefined ? Number(stock_quantity) : 50, is_featured ? 1 : 0, is_best_seller ? 1 : 0, freshness_badge || 'Export Quality', image_url, JSON.stringify(gallery || []), JSON.stringify(variants || []));
        const created = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
        res.status(201).json({ product: formatProduct(created), message: 'Product created successfully' });
    }
    catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: error.message || 'Failed to create product' });
    }
});
// Admin: PUT /api/products/:id
router.put('/:id', requireAdmin, (req, res) => {
    try {
        const { id } = req.params;
        const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const { name, category_id, outlet_id, short_description, description, base_price, original_price, unit, in_stock, stock_quantity, is_featured, is_best_seller, freshness_badge, image_url, gallery, variants } = req.body;
        const stmt = db.prepare(`
      UPDATE products SET
        name = COALESCE(?, name),
        category_id = COALESCE(?, category_id),
        outlet_id = ?,
        short_description = COALESCE(?, short_description),
        description = COALESCE(?, description),
        base_price = COALESCE(?, base_price),
        original_price = ?,
        unit = COALESCE(?, unit),
        in_stock = COALESCE(?, in_stock),
        stock_quantity = COALESCE(?, stock_quantity),
        is_featured = COALESCE(?, is_featured),
        is_best_seller = COALESCE(?, is_best_seller),
        freshness_badge = COALESCE(?, freshness_badge),
        image_url = COALESCE(?, image_url),
        gallery_json = COALESCE(?, gallery_json),
        variants_json = COALESCE(?, variants_json)
      WHERE id = ?
    `);
        stmt.run(name, category_id, outlet_id || null, short_description, description, base_price ? Number(base_price) : null, original_price !== undefined ? (original_price ? Number(original_price) : null) : existing.original_price, unit, in_stock !== undefined ? (in_stock ? 1 : 0) : null, stock_quantity !== undefined ? Number(stock_quantity) : null, is_featured !== undefined ? (is_featured ? 1 : 0) : null, is_best_seller !== undefined ? (is_best_seller ? 1 : 0) : null, freshness_badge, image_url, gallery ? JSON.stringify(gallery) : null, variants ? JSON.stringify(variants) : null, id);
        const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
        res.json({ product: formatProduct(updated), message: 'Product updated successfully' });
    }
    catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: error.message || 'Failed to update product' });
    }
});
// Admin: DELETE /api/products/:id
router.delete('/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);
    if (result.changes === 0) {
        return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
});
export default router;
