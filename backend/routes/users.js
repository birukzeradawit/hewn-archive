const express = require('express');
const pool = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, role, created_at, email_verified, active FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update current user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET username = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, username, email, role, created_at, email_verified, active',
      [username, email, req.user.id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const userResult = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const validPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, req.user.id]
    );
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle account status
router.post('/toggle-status', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE users SET active = NOT active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, username, email, role, created_at, email_verified, active',
      [req.user.id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export user data
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, username, email, role, created_at, email_verified, active FROM users WHERE id = $1',
      [req.user.id]
    );
    
    const contentResult = await pool.query(
      'SELECT * FROM content WHERE created_by = $1',
      [req.user.id]
    );
    
    const archiveResult = await pool.query(
      'SELECT * FROM archive_items WHERE created_by = $1',
      [req.user.id]
    );
    
    res.json({
      user: userResult.rows[0],
      content: contentResult.rows,
      archive: archiveResult.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete own account
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM content WHERE created_by = $1', [req.user.id]);
    await pool.query('DELETE FROM archive_items WHERE created_by = $1', [req.user.id]);
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { username, email } = req.body;

    // Check if user can update (admin or own profile)
    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      'UPDATE users SET username = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, username, email, role',
      [username, email, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;