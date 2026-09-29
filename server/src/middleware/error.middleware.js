/**
 * Centralized error-handling middleware.
 * Formats all errors into the structured JSON format:
 * {
 *   "error": {
 *     "code": "...",
 *     "message": "..."
 *   }
 * }
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || 500;
  const code = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const message = err.message || 'An unexpected error occurred.';

  // In non-test environments, log internal server errors for observability
  if (process.env.NODE_ENV !== 'test' && statusCode >= 500) {
    console.error(`[Error] ${statusCode} ${code}: ${message}`, err.stack);
  }

  res.status(statusCode).json({
    error: {
      code,
      message
    }
  });
}

/**
 * 404 handler for undefined routes.
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    }
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
