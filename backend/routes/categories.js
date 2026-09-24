const express = require('express');
const pool = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create category (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    const result = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;