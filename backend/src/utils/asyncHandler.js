/**
 * Wraps an async Express route handler so you don't need try/catch in every controller.
 * Errors are forwarded to the global error handler via next().
 *
 * @param {Function} fn  Async route handler (req, res, next) => Promise
 * @returns {Function}   Express middleware
 *
 * @example
 *   router.get('/', asyncHandler(async (req, res) => {
 *     const data = await SomeService.getAll();
 *     res.json({ success: true, data });
 *   }));
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
