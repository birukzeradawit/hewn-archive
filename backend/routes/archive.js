const express = require('express');
const pool = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all archive items
router.get('/', async (req, res) => {
  try {
    const { collection, item_type } = req.query;
    let query = `
      SELECT a.*, u.username as creator_name
      FROM archive_items a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (collection) {
      paramCount++;
      query += ` AND a.collection_name = $${paramCount}`;
      params.push(collection);
    }

    if (item_type) {
      paramCount++;
      query += ` AND a.item_type = $${paramCount}`;
      params.push(item_type);
    }

    query += ' ORDER BY a.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get archive item by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.username as creator_name
       FROM archive_items a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Archive item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create archive item (authenticated users)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      collection_name,
      item_type,
      location,
      year,
      image_url,
      document_url,
      metadata
    } = req.body;

    const result = await pool.query(
      `INSERT INTO archive_items (title, description, collection_name, item_type, location, year, image_url, document_url, metadata, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [title, description, collection_name, item_type, location, year, image_url, document_url, JSON.stringify(metadata), req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update archive item (admin or creator)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      collection_name,
      item_type,
      location,
      year,
      image_url,
      document_url,
      metadata
    } = req.body;

    // Check permissions
    const itemCheck = await pool.query(
      'SELECT created_by FROM archive_items WHERE id = $1',
      [req.params.id]
    );

    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Archive item not found' });
    }

    if (req.user.role !== 'admin' && itemCheck.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      `UPDATE archive_items
       SET title = $1, description = $2, collection_name = $3, item_type = $4, location = $5, year = $6,
           image_url = $7, document_url = $8, metadata = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [title, description, collection_name, item_type, location, year, image_url, document_url, JSON.stringify(metadata), req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete archive item (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM archive_items WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Archive item not found' });
    }

    res.json({ message: 'Archive item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;