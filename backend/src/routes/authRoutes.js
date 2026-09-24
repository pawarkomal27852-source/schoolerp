import { Router }           from 'express';
import { loginValidator }   from '../validators/authValidator.js';
import { validate }         from '../middleware/validate.js';
import { protect }          from '../middleware/auth.js';
import { authLimiter }      from '../middleware/rateLimiter.js';
import { auditMiddleware }  from '../utils/auditLogger.js';
import { login, getMe, logout } from '../controllers/authController.js';

const router = Router();

// POST /api/v1/auth/login — audit login events
router.post(
  '/login',
  authLimiter,
  loginValidator,
  validate,
  auditMiddleware('auth', 'login', (_req, body) => body?.data?.user?._id || null),
  login
);

// GET /api/v1/auth/me
router.get('/me', protect, getMe);

// POST /api/v1/auth/logout — audit logout events
router.post(
  '/logout',
  protect,
  auditMiddleware('auth', 'logout'),
  logout
);

export default router;
