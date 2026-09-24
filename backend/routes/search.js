const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Search content
router.get('/', async (req, res) => {
  try {
    const { q, category, content_type, published, featured } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    let query = `
      SELECT c.*, cat.name as category_name, u.username as author_name
      FROM content c
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE (c.title ILIKE $1 OR c.description ILIKE $1)
    `;
    
    const params = [`%${q}%`];
    let paramCount = 1;

    if (category) {
      paramCount++;
      query += ` AND c.category_id = $${paramCount}`;
      params.push(category);
    }

    if (content_type) {
      paramCount++;
      query += ` AND c.content_type = $${paramCount}`;
      params.push(content_type);
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

    query += ' ORDER BY c.created_at DESC LIMIT 50';

    const result = await pool.query(query, params);
    res.json({
      query: q,
      results: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search archive items
router.get('/archive', async (req, res) => {
  try {
    const { q, collection, item_type, year } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    let query = `
      SELECT a.*, u.username as creator_name
      FROM archive_items a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE (a.title ILIKE $1 OR a.description ILIKE $1 OR a.collection_name ILIKE $1)
    `;
    
    const params = [`%${q}%`];
    let paramCount = 1;

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

    if (year) {
      paramCount++;
      query += ` AND a.year = $${paramCount}`;
      params.push(year);
    }

    query += ' ORDER BY a.created_at DESC LIMIT 50';

    const result = await pool.query(query, params);
    res.json({
      query: q,
      results: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get search filters
router.get('/filters', async (req, res) => {
  try {
    const categories = await pool.query('SELECT * FROM categories ORDER BY name');
    const contentTypes = await pool.query('SELECT DISTINCT content_type FROM content WHERE content_type IS NOT NULL ORDER BY content_type');
    const collections = await pool.query('SELECT DISTINCT collection_name FROM archive_items WHERE collection_name IS NOT NULL ORDER BY collection_name');
    const itemTypes = await pool.query('SELECT DISTINCT item_type FROM archive_items WHERE item_type IS NOT NULL ORDER BY item_type');
    const years = await pool.query('SELECT DISTINCT year FROM archive_items WHERE year IS NOT NULL ORDER BY year DESC');

    res.json({
      categories: categories.rows,
      contentTypes: contentTypes.rows,
      collections: collections.rows,
      itemTypes: itemTypes.rows,
      years: years.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;