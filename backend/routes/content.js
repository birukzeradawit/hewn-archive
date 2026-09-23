const express = require('express');
const pool = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all content
router.get('/', async (req, res) => {
  try {
    const { category, published, featured } = req.query;
    let query = `
      SELECT c.*, cat.name as category_name, u.username as author_name
      FROM content c
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND c.category_id = $${paramCount}`;
      params.push(category);
    }

    if (published !== undefined) {
      paramCount++;
      query += ` AND c.published = $${paramCount}`;
      params.push(published === 'true');
    }

    if (featured !== undefined) {
      paramCount++;
      query += ` AND c.featured = $${paramCount}`;
      params.push(featured === 'true');
    }

    query += ' ORDER BY c.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get content by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, cat.name as category_name, u.username as author_name
       FROM content c
       LEFT JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create content (authenticated users)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      category_id,
      content_type,
      image_url,
      file_url,
      author,
      date_created,
      featured,
      published
    } = req.body;

    const result = await pool.query(
      `INSERT INTO content (title, description, category_id, content_type, image_url, file_url, author, date_created, featured, published, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [title, description, category_id, content_type, image_url, file_url, author, date_created, featured, published, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update content (admin or author)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      category_id,
      content_type,
      image_url,
      file_url,
      author,
      date_created,
      featured,
      published
    } = req.body;

    // Check permissions
    const contentCheck = await pool.query(
      'SELECT created_by FROM content WHERE id = $1',
      [req.params.id]
    );

    if (contentCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Content not found' });
    }

    if (req.user.role !== 'admin' && contentCheck.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      `UPDATE content
       SET title = $1, description = $2, category_id = $3, content_type = $4, image_url = $5, file_url = $6,
           author = $7, date_created = $8, featured = $9, published = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [title, description, category_id, content_type, image_url, file_url, author, date_created, featured, published, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete content (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM content WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;