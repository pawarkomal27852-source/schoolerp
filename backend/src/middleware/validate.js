import { validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';

/**
 * Collects express-validator errors and forwards a 422 AppError if any exist.
 * Place AFTER your validator chain, BEFORE the controller handler.
 *
 * @example
 *   router.post('/', createStudentValidator, validate, createStudentController);
 */
export function validate(req, _res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array().map((e) => ({
      field: e.path ?? e.param,
      message: e.msg,
    }));
    return next(new AppError('Validation failed', 422, errors));
  }

  return next();
}
