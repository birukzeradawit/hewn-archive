const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

const requireVerified = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT email_verified FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!result.rows[0].email_verified) {
      return res.status(403).json({ message: 'Email verification required' });
    }
    
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const requireActive = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT active FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!result.rows[0].active) {
      return res.status(403).json({ message: 'Account is inactive' });
    }
    
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { authMiddleware, adminMiddleware, requireVerified, requireActive };