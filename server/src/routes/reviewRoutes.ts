import { Router } from 'express';
import { db } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/reviews
router.get('/', (req, res) => {
  const reviews = db.prepare('SELECT * FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC').all();
  res.json({ reviews });
});

// POST /api/reviews
router.post('/', (req, res) => {
  const { author_name, location, rating, review_text } = req.body;
  if (!author_name || !location || !review_text) {
    return res.status(400).json({ error: 'Author name, location and review text are required' });
  }

  const id = `rev-${uuidv4().slice(0, 8)}`;
  db.prepare(`
    INSERT INTO reviews (id, author_name, location, rating, review_text, is_approved)
    VALUES (?, ?, ?, ?, ?, 1)
  `).run(id, author_name, location, Number(rating) || 5, review_text);

  res.status(201).json({ message: 'Review submitted successfully!' });
});

export default router;
