import { body } from 'express-validator';
import { FEE_CATEGORIES_LIST } from '../models/Fee.js';

export const createFeeValidator = [
  body('classId').notEmpty().withMessage('Class is required')
    .isMongoId().withMessage('Class ID must be a valid ID'),

  body('academicYear').trim().notEmpty().withMessage('Academic year is required')
    .matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be in format YYYY-YYYY'),

  body('category').notEmpty().withMessage('Category is required')
    .isIn(FEE_CATEGORIES_LIST).withMessage(`Category must be one of: ${FEE_CATEGORIES_LIST.join(', ')}`),

  body('amount').notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0 }).withMessage('Amount must be a non-negative number'),

  body('dueDate').notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Due date must be a valid date'),

  body('description').optional().trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

export const updateFeeValidator = [
  body('category').optional()
    .isIn(FEE_CATEGORIES_LIST).withMessage(`Category must be one of: ${FEE_CATEGORIES_LIST.join(', ')}`),

  body('amount').optional()
    .isFloat({ min: 0 }).withMessage('Amount must be a non-negative number'),

  body('dueDate').optional()
    .isISO8601().withMessage('Due date must be a valid date'),

  body('description').optional().trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('isActive').optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];
