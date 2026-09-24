import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess }  from '../utils/apiResponse.js';
import * as authService from '../services/authService.js';

/**
 * POST /api/v1/auth/login
 * Public — returns JWT + user profile on valid credentials.
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { token, user } = await authService.login(email, password);

  sendSuccess(res, { token, user }, 'Login successful');
});

/**
 * GET /api/v1/auth/me
 * Protected — returns the currently authenticated user.
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  sendSuccess(res, { user }, 'User profile retrieved successfully');
});

/**
 * POST /api/v1/auth/logout
 * Protected — stateless JWT logout (client discards token).
 * Server-side: returns confirmation message only.
 */
export const logout = asyncHandler(async (_req, res) => {
  sendSuccess(res, null, 'Logged out successfully');
});
