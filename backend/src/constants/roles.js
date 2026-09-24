/**
 * User role constants used across models, middleware, and services.
 */
export const ROLES = Object.freeze({
  ADMIN: 'admin',
  TEACHER: 'teacher',
  ACCOUNTANT: 'accountant',
  PARENT: 'parent',
  STUDENT: 'student',
});

export const ALL_ROLES = Object.values(ROLES);
