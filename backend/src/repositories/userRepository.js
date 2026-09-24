import User from '../models/User.js';

/**
 * All database operations for the User collection.
 * No business logic — only data access.
 */

/**
 * Find a user by email, including the password field (excluded by default).
 * Used only during login.
 */
export async function findByEmailWithPassword(email) {
  return User.findOne({ email: email.toLowerCase(), isDeleted: { $ne: true } })
    .select('+password');
}

/**
 * Find a user by ID (excludes password and soft-delete fields).
 */
export async function findById(id) {
  return User.findOne({ _id: id, isDeleted: { $ne: true } });
}

/**
 * Find a user by email (no password).
 */
export async function findByEmail(email) {
  return User.findOne({ email: email.toLowerCase(), isDeleted: { $ne: true } });
}

/**
 * Create a new user.
 */
export async function createUser(data) {
  return User.create(data);
}

/**
 * Update lastLogin timestamp.
 */
export async function updateLastLogin(id) {
  return User.findByIdAndUpdate(id, { lastLogin: new Date() }, { new: true });
}
