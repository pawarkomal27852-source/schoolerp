import { body } from 'express-validator';

const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;
const RELATIONSHIPS = ['father', 'mother', 'guardian', 'other'];

export const createParentValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),

  body('lastName').trim().notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),

  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone').trim().notEmpty().withMessage('Phone number is required')
    .matches(PHONE_REGEX).withMessage('Please provide a valid phone number (7–15 digits, optional + prefix)'),

  body('alternatePhone').optional({ checkFalsy: true }).trim()
    .matches(PHONE_REGEX).withMessage('Please provide a valid alternate phone number'),

  body('relationship').notEmpty().withMessage('Relationship is required')
    .isIn(RELATIONSHIPS).withMessage(`Relationship must be one of: ${RELATIONSHIPS.join(', ')}`),

  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.pincode').optional().trim(),

  body('occupation').optional().trim()
    .isLength({ max: 100 }).withMessage('Occupation cannot exceed 100 characters'),
];

export const updateParentValidator = [
  body('firstName').optional().trim()
    .isLength({ min: 1, max: 50 }).withMessage('First name cannot exceed 50 characters'),

  body('lastName').optional().trim()
    .isLength({ min: 1, max: 50 }).withMessage('Last name cannot exceed 50 characters'),

  body('email').optional().trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone').optional().trim()
    .matches(PHONE_REGEX).withMessage('Please provide a valid phone number'),

  body('alternatePhone').optional({ checkFalsy: true }).trim()
    .matches(PHONE_REGEX).withMessage('Please provide a valid alternate phone number'),

  body('relationship').optional()
    .isIn(RELATIONSHIPS).withMessage(`Relationship must be one of: ${RELATIONSHIPS.join(', ')}`),

  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),

  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.pincode').optional().trim(),

  body('occupation').optional().trim()
    .isLength({ max: 100 }).withMessage('Occupation cannot exceed 100 characters'),
];
