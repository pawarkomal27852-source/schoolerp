import jwt        from 'jsonwebtoken';
import * as userRepo from '../repositories/userRepository.js';
import { AppError }  from '../middleware/errorHandler.js';

/**
 * Sign a JWT for a given user document.
 * @param {object} user  Mongoose user document
 * @returns {string}     Signed JWT string
 */
function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Login — validate credentials and return JWT + public user profile.
 * @param {string} email
 * @param {string} password
 */
export async function login(email, password) {
  // 1. Find user (include password for comparison)
  const user = await userRepo.findByEmailWithPassword(email);

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  // 2. Check active status
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact admin.', 403);
  }

  // 3. Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  // 4. Update last login timestamp (non-blocking)
  await userRepo.updateLastLogin(user._id);

  // 5. Sign token
  const token = signToken(user);

  return { token, user: user.toPublicJSON() };
}

/**
 * Get current authenticated user profile.
 * @param {string} userId  From req.user.id (decoded JWT)
 */
export async function getCurrentUser(userId) {
  const user = await userRepo.findById(userId);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user.toPublicJSON();
}

/**
 * Seed the first admin user — only runs if no users exist.
 * Called once at server startup.
 */
export async function seedAdminIfEmpty() {
  const { default: User } = await import('../models/User.js');
  const count = await User.countDocuments();
  if (count > 0) return null;

  const admin = await User.create({
    name:     process.env.SEED_ADMIN_NAME     || 'School Admin',
    email:    process.env.SEED_ADMIN_EMAIL    || 'admin@schoolerp.com',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
    role:     'admin',
  });

  return admin.toPublicJSON();
}
