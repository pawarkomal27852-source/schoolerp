import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

/**
 * Protect middleware — verifies the Bearer JWT in the Authorization header.
 * Attaches the decoded payload to req.user on success.
 *
 * Usage: router.get('/protected', protect, controller)
 */
export function protect(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Not authenticated. Please log in to access this resource.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, email, iat, exp }
    return next();
  } catch (err) {
    // TokenExpiredError and JsonWebTokenError are handled by globalErrorHandler
    return next(err);
  }
}

/**
 * Authorize middleware — restricts access by role.
 * Must be used AFTER protect().
 *
 * Usage: router.delete('/:id', protect, authorize('admin'), controller)
 *
 * @param {...string} roles  Allowed roles (from constants/roles.js)
 */
export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role '${req.user.role}' is not authorized to access this resource.`,
          403
        )
      );
    }
    return next();
  };
}
