import { body } from 'express-validator';

const STATUSES = ['present', 'absent', 'late', 'excused'];

export const markAttendanceValidator = [
  body('studentId').notEmpty().withMessage('Student ID is required')
    .isMongoId().withMessage('Student ID must be a valid ID'),

  body('classId').notEmpty().withMessage('Class ID is required')
    .isMongoId().withMessage('Class ID must be a valid ID'),

  body('date').notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid date (YYYY-MM-DD)'),

  body('status').notEmpty().withMessage('Status is required')
    .isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),

  body('remarks').optional().trim()
    .isLength({ max: 500 }).withMessage('Remarks cannot exceed 500 characters'),
];

export const bulkAttendanceValidator = [
  body('classId').notEmpty().withMessage('Class ID is required')
    .isMongoId().withMessage('Class ID must be a valid ID'),

  body('date').notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid date'),

  body('records').isArray({ min: 1 }).withMessage('Records must be a non-empty array'),

  body('records.*.studentId').notEmpty().withMessage('Each record must have a studentId')
    .isMongoId().withMessage('Each studentId must be a valid ID'),

  body('records.*.status').notEmpty().withMessage('Each record must have a status')
    .isIn(STATUSES).withMessage(`Each status must be one of: ${STATUSES.join(', ')}`),

  body('records.*.remarks').optional().trim()
    .isLength({ max: 500 }).withMessage('Remarks cannot exceed 500 characters'),
];

export const updateAttendanceValidator = [
  body('status').optional()
    .isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),

  body('remarks').optional().trim()
    .isLength({ max: 500 }).withMessage('Remarks cannot exceed 500 characters'),
];
