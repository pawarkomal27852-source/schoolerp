import { body, param } from 'express-validator';

const PHONE_REGEX   = /^(\+?[1-9]\d{6,14})?$/;
const GENDERS       = ['male', 'female', 'other'];
const STATUSES      = ['active', 'inactive', 'graduated', 'transferred', 'suspended'];
const BLOOD_GROUPS  = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''];

export const createStudentValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),

  body('lastName').trim().notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),

  body('dateOfBirth').notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD)'),

  body('gender').notEmpty().withMessage('Gender is required')
    .isIn(GENDERS).withMessage(`Gender must be one of: ${GENDERS.join(', ')}`),

  body('classId').notEmpty().withMessage('Class is required')
    .isMongoId().withMessage('Class ID must be a valid ID'),

  body('parentId').notEmpty().withMessage('Parent is required')
    .isMongoId().withMessage('Parent ID must be a valid ID'),

  body('admissionDate').optional()
    .isISO8601().withMessage('Admission date must be a valid date'),

  body('academicYear').trim().notEmpty().withMessage('Academic year is required')
    .matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be in format YYYY-YYYY'),

  body('email').optional({ checkFalsy: true }).trim()
    .isEmail().withMessage('Please provide a valid email address').normalizeEmail(),

  body('phone').optional({ checkFalsy: true }).trim()
    .matches(PHONE_REGEX).withMessage('Please provide a valid phone number'),

  body('studentId').optional().trim()
    .matches(/^[A-Z0-9-]+$/i).withMessage('Student ID may only contain letters, numbers, and hyphens'),

  body('status').optional()
    .isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),

  body('bloodGroup').optional()
    .isIn(BLOOD_GROUPS).withMessage(`Blood group must be one of: ${BLOOD_GROUPS.filter(Boolean).join(', ')}`),

  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.pincode').optional().trim(),
];

export const updateStudentValidator = [
  body('firstName').optional().trim()
    .isLength({ min: 1, max: 50 }).withMessage('First name cannot exceed 50 characters'),

  body('lastName').optional().trim()
    .isLength({ min: 1, max: 50 }).withMessage('Last name cannot exceed 50 characters'),

  body('dateOfBirth').optional()
    .isISO8601().withMessage('Date of birth must be a valid date'),

  body('gender').optional()
    .isIn(GENDERS).withMessage(`Gender must be one of: ${GENDERS.join(', ')}`),

  body('classId').optional()
    .isMongoId().withMessage('Class ID must be a valid ID'),

  body('parentId').optional()
    .isMongoId().withMessage('Parent ID must be a valid ID'),

  body('academicYear').optional().trim()
    .matches(/^\d{4}-\d{4}$/).withMessage('Academic year must be in format YYYY-YYYY'),

  body('email').optional({ checkFalsy: true }).trim()
    .isEmail().withMessage('Please provide a valid email address').normalizeEmail(),

  body('phone').optional({ checkFalsy: true }).trim()
    .matches(PHONE_REGEX).withMessage('Please provide a valid phone number'),

  body('status').optional()
    .isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),

  body('bloodGroup').optional()
    .isIn(BLOOD_GROUPS).withMessage('Invalid blood group'),

  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.pincode').optional().trim(),
];
