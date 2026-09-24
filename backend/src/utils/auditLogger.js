import AuditLog from '../models/AuditLog.js';
import { logger } from './logger.js';

/**
 * Create an audit log entry asynchronously.
 * Never throws — audit logging must not break the main request flow.
 *
 * @param {object} params
 * @param {string}  params.module      Module name (from AUDIT_MODULES)
 * @param {string}  params.action      Action type (from AUDIT_ACTIONS)
 * @param {string}  [params.userId]    ID of the user who performed the action
 * @param {string}  [params.recordId]  ID of the affected document
 * @param {string}  [params.description]
 * @param {string}  [params.ipAddress]
 * @param {string}  [params.userAgent]
 * @param {object}  [params.metadata]  Any additional context
 */
export async function createAuditLog({
  module,
  action,
  userId    = null,
  recordId  = null,
  description = '',
  ipAddress = '',
  userAgent = '',
  metadata  = {},
}) {
  try {
    await AuditLog.create({
      module,
      action,
      userId,
      recordId,
      description,
      ipAddress,
      userAgent,
      metadata,
    });
  } catch (err) {
    // Log the failure but never crash the request
    logger.warn('Failed to write audit log entry', err);
  }
}

/**
 * Express middleware factory — automatically creates an audit log entry
 * AFTER a route handler succeeds (non-4xx/5xx response).
 *
 * Usage: router.post('/', protect, auditMiddleware('student', 'create'), createController)
 *
 * @param {string} module
 * @param {string} action
 * @param {Function} [getRecordId]  Optional fn(req, res) => string — extracts recordId from response
 */
export function auditMiddleware(module, action, getRecordId = null) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function (body) {
      // Only log successful responses
      if (res.statusCode < 400 && body?.success) {
        const recordId = getRecordId ? getRecordId(req, body) : null;

        createAuditLog({
          module,
          action,
          userId:      req.user?.id    || null,
          recordId,
          description: `${action} on ${module}`,
          ipAddress:   req.ip          || '',
          userAgent:   req.headers['user-agent'] || '',
          metadata:    { method: req.method, url: req.originalUrl },
        });
      }
      return originalJson(body);
    };

    next();
  };
}
