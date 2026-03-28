const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const productRoutes = require('../routes/productRoutes');
const syncRoutes = require('../routes/syncRoutes');
const { errorHandler, notFound } = require('../middleware/errorMiddleware');
const logger = require('../utils/logger');

const app = express();

// Security headers
app.use(helmet());
app.set('trust proxy', 1);
// CORS — restrict to frontend origin in production
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
app.use(rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { error: 'Too many requests, please try again later.' },
}));

// Body parsing & compression
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// HTTP request logging
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/sync', syncRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
