/**
 * Base application error with HTTP status code and standardized error code.
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (HTTP 400).
 */
class ValidationError extends AppError {
  constructor(message, code = 'VALIDATION_ERROR') {
    super(message, 400, code);
  }
}

/**
 * Resource not found error (HTTP 404).
 */
class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

/**
 * GitHub API rate limit error (HTTP 429).
 */
class RateLimitError extends AppError {
  constructor(
    message = 'GitHub API rate limit exceeded. Please configure GITHUB_TOKEN or wait before retrying.',
    code = 'RATE_LIMIT_EXCEEDED'
  ) {
    super(message, 429, code);
  }
}

/**
 * Upstream GitHub communication failure (HTTP 502).
 */
class UpstreamError extends AppError {
  constructor(message = 'Upstream GitHub API failure', code = 'UPSTREAM_GITHUB_ERROR') {
    super(message, 502, code);
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  UpstreamError
};
