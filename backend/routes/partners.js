const express = require('express');
const pool = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all partners
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM partners ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get partner by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM partners WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create partner (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, organization, description, website, logo_url, contact_email } = req.body;

    const result = await pool.query(
      'INSERT INTO partners (name, organization, description, website, logo_url, contact_email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, organization, description, website, logo_url, contact_email]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update partner (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, organization, description, website, logo_url, contact_email } = req.body;

    const result = await pool.query(
      'UPDATE partners SET name = $1, organization = $2, description = $3, website = $4, logo_url = $5, contact_email = $6 WHERE id = $7 RETURNING *',
      [name, organization, description, website, logo_url, contact_email, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete partner (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM partners WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    res.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;