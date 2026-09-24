const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../config/email');
const { generalLimit, authLimit, passwordResetLimit } = require('../middleware/rateLimit');

const router = express.Router();

// Register
router.post('/register', authLimit, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, verification_token, verification_token_expires) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role',
      [username, email, password_hash, verificationToken, verificationTokenExpires]
    );

    const user = result.rows[0];

    // Send verification email
    try {
      await sendVerificationEmail(email, username, verificationToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue anyway - user can request new verification email
    }

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        email_verified: false
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', authLimit, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, role, email_verified, created_at FROM users WHERE id = $1',
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

// Verify email
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    const result = await pool.query(
      'SELECT id, username, email, verification_token_expires FROM users WHERE verification_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    const user = result.rows[0];

    // Check if token is expired
    if (new Date() > new Date(user.verification_token_expires)) {
      return res.status(400).json({ message: 'Verification token has expired' });
    }

    // Mark user as verified
    await pool.query(
      'UPDATE users SET email_verified = true, verification_token = NULL, verification_token_expires = NULL WHERE id = $1',
      [user.id]
    );

    res.json({ message: 'Email verified successfully! You can now login.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request password reset
router.post('/forgot-password', passwordResetLimit, async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query(
      'SELECT id, username FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists, but still return success message
      return res.json({ message: 'If an account with this email exists, a password reset link has been sent.' });
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [resetToken, resetTokenExpires, user.id]
    );

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({ message: 'If an account with this email exists, a password reset link has been sent.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const result = await pool.query(
      'SELECT id, reset_token_expires FROM users WHERE reset_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    const user = result.rows[0];

    // Check if token is expired
    if (new Date() > new Date(user.reset_token_expires)) {
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [password_hash, user.id]
    );

    res.json({ message: 'Password reset successfully! You can now login with your new password.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query(
      'SELECT id, username, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await pool.query(
      'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3',
      [verificationToken, verificationTokenExpires, user.id]
    );

    // Send verification email
    try {
      await sendVerificationEmail(email, user.username, verificationToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;