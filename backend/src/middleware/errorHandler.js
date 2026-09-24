import { logger } from '../utils/logger.js';

/**
 * Custom application error class.
 * Throw this anywhere in the service/controller layers.
 *
 * @example  throw new AppError('Student not found', 404);
 */
export class AppError extends Error {
  /**
   * @param {string}   message     Human-readable error message.
   * @param {number}   statusCode  HTTP status code (default 500).
   * @param {Array}    [errors]    Validation error array (optional).
   */
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Mongoose CastError (invalid ObjectId).
 */
function handleCastError(err) {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
}

/**
 * Handle Mongoose duplicate key error (code 11000).
 */
function handleDuplicateKey(err) {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue?.[field];
  return new AppError(`Duplicate value for '${field}': "${value}". Please use a different value.`, 409);
}

/**
 * Handle Mongoose validation errors.
 */
function handleValidationError(err) {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return new AppError('Validation failed', 422, errors);
}

/**
 * Handle expired JWT.
 */
function handleJWTExpired() {
  return new AppError('Your session has expired. Please log in again.', 401);
}

/**
 * Handle invalid JWT.
 */
function handleJWTInvalid() {
  return new AppError('Invalid token. Please log in again.', 401);
}

/**
 * Global error-handling middleware.
 * MUST be the last middleware registered in app.js.
 *
 * @param {Error}                    err
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {Function}                 _next
 */
// eslint-disable-next-line no-unused-vars
export function globalErrorHandler(err, req, res, _next) {
  let error = err;

  // ── Transform known Mongoose / JWT errors into AppErrors ─────────────────
  if (err.name === 'CastError')           error = handleCastError(err);
  if (err.code === 11000)                 error = handleDuplicateKey(err);
  if (err.name === 'ValidationError')     error = handleValidationError(err);
  if (err.name === 'TokenExpiredError')   error = handleJWTExpired();
  if (err.name === 'JsonWebTokenError')   error = handleJWTInvalid();

  const statusCode = error.statusCode || 500;
  const message    = error.isOperational ? error.message : 'Internal Server Error';
  const errors     = error.errors || [];

  // Log non-operational (programming) errors always; operational ones only in dev
  if (!error.isOperational) {
    logger.error(`[${req.method}] ${req.originalUrl} — Unexpected error`, err);
  } else if (process.env.NODE_ENV !== 'production') {
    logger.debug(`[${req.method}] ${req.originalUrl} — ${statusCode}: ${message}`);
  }

  const payload = {
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(process.env.NODE_ENV !== 'production' && !error.isOperational && { stack: err.stack }),
  };

  res.status(statusCode).json(payload);
}

/**
 * 404 middleware — mounted after all routes.
 */
export function notFound(req, res, _next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
