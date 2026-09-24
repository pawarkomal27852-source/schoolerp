import { body } from 'express-validator';

export const createClassValidator = [
  body('name')
    .trim().notEmpty().withMessage('Class name is required')
    .isLength({ max: 50 }).withMessage('Class name cannot exceed 50 characters'),

  body('section')
    .trim().notEmpty().withMessage('Section is required')
    .isLength({ max: 10 }).withMessage('Section cannot exceed 10 characters'),

  body('grade')
    .trim().notEmpty().withMessage('Grade is required')
    .isLength({ max: 20 }).withMessage('Grade cannot exceed 20 characters'),

  body('capacity')
    .notEmpty().withMessage('Capacity is required')
    .isInt({ min: 1, max: 200 }).withMessage('Capacity must be between 1 and 200'),

  body('academicYear')
    .trim().notEmpty().withMessage('Academic year is required')
    .matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be in format YYYY-YYYY (e.g., 2025-2026)'),

  body('description')
    .optional().trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

export const updateClassValidator = [
  body('name')
    .optional().trim()
    .isLength({ min: 1, max: 50 }).withMessage('Class name cannot exceed 50 characters'),

  body('section')
    .optional().trim()
    .isLength({ min: 1, max: 10 }).withMessage('Section cannot exceed 10 characters'),

  body('grade')
    .optional().trim()
    .isLength({ min: 1, max: 20 }).withMessage('Grade cannot exceed 20 characters'),

  body('capacity')
    .optional()
    .isInt({ min: 1, max: 200 }).withMessage('Capacity must be between 1 and 200'),

  body('academicYear')
    .optional().trim()
    .matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be in format YYYY-YYYY'),

  body('description')
    .optional().trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];
