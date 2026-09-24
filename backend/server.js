const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { generalLimit } = require('./middleware/rateLimit');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(generalLimit);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/content', require('./routes/content'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/archive', require('./routes/archive'));
app.use('/api/search', require('./routes/search'));

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, '..')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;