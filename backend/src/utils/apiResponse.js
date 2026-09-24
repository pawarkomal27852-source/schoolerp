/**
 * Standardised API response helpers.
 * Import these in every controller to keep response shapes consistent.
 *
 * Standard success:   { success: true,  message, data }
 * Paginated:          { success: true,  message, data, pagination }
 * Error:              { success: false, message, errors? }
 */

/**
 * 200 / 201 success response.
 * @param {import('express').Response} res
 * @param {*}      data
 * @param {string} message
 * @param {number} statusCode
 */
export function sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

/**
 * 201 Created — shorthand for resource creation.
 */
export function sendCreated(res, data, message = 'Resource created successfully') {
  return sendSuccess(res, data, message, 201);
}

/**
 * 200 Paginated list response.
 * @param {import('express').Response} res
 * @param {Array}  data
 * @param {{ total: number, page: number, limit: number, totalPages: number }} pagination
 * @param {string} message
 */
export function sendPaginated(res, data, pagination, message = 'Data retrieved successfully') {
  return res.status(200).json({ success: true, message, data, pagination });
}

/**
 * Build a pagination object from query params.
 * @param {number} total      Total documents matched
 * @param {number} page       Current page (1-based)
 * @param {number} limit      Items per page
 */
export function buildPagination(total, page, limit) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Direct error response — prefer throwing AppError in services.
 * Use only when you need a non-throwing inline error.
 */
export function sendError(res, message = 'Error', statusCode = 400, errors = []) {
  const payload = { success: false, message };
  if (errors.length > 0) payload.errors = errors;
  return res.status(statusCode).json(payload);
}
