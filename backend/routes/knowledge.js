const express = require('express');
const pool = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all knowledge resources
router.get('/', async (req, res) => {
  try {
    const { published, category, resource_type } = req.query;
    let query = `
      SELECT k.*, u.username as author_name
      FROM knowledge_resources k
      LEFT JOIN users u ON k.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (published !== undefined) {
      paramCount++;
      query += ` AND k.published = $${paramCount}`;
      params.push(published === 'true');
    }

    if (category) {
      paramCount++;
      query += ` AND k.category = $${paramCount}`;
      params.push(category);
    }

    if (resource_type) {
      paramCount++;
      query += ` AND k.resource_type = $${paramCount}`;
      params.push(resource_type);
    }

    query += ' ORDER BY k.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get knowledge resource by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT k.*, u.username as author_name
       FROM knowledge_resources k
       LEFT JOIN users u ON k.created_by = u.id
       WHERE k.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Knowledge resource not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create knowledge resource (authenticated users)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      resource_type,
      content,
      file_url,
      external_link,
      category,
      author,
      published
    } = req.body;

    const result = await pool.query(
      `INSERT INTO knowledge_resources (title, description, resource_type, content, file_url, external_link, category, author, published, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [title, description, resource_type, content, file_url, external_link, category, author, published, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update knowledge resource (admin or author)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      resource_type,
      content,
      file_url,
      external_link,
      category,
      author,
      published
    } = req.body;

    // Check permissions
    const resourceCheck = await pool.query(
      'SELECT created_by FROM knowledge_resources WHERE id = $1',
      [req.params.id]
    );

    if (resourceCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Knowledge resource not found' });
    }

    if (req.user.role !== 'admin' && resourceCheck.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      `UPDATE knowledge_resources
       SET title = $1, description = $2, resource_type = $3, content = $4, file_url = $5, external_link = $6,
           category = $7, author = $8, published = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [title, description, resource_type, content, file_url, external_link, category, author, published, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete knowledge resource (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM knowledge_resources WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Knowledge resource not found' });
    }

    res.json({ message: 'Knowledge resource deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;