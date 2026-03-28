const logger = require('../utils/logger');

const notFound = (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
  logger.error(`${status} - ${err.message} - ${req.originalUrl}`);

  // Don't leak stack traces in production
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
