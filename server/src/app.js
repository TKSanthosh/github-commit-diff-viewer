const express = require('express');
const cors = require('cors');
const commitRoutes = require('./routes/commit.routes');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

const app = express();

// Cross-Origin Resource Sharing configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsing
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'git-diff-server' });
});

// Commit API routes
app.use(commitRoutes);

// 404 fallback
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
