import { body } from 'express-validator';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const updateSettingsValidator = [
  body('schoolName').optional().trim()
    .isLength({ min: 1, max: 200 }).withMessage('School name cannot exceed 200 characters'),

  body('email').optional({ checkFalsy: true }).trim()
    .isEmail().withMessage('Please provide a valid email address').normalizeEmail(),

  body('phone').optional().trim(),

  body('website').optional().trim()
    .isURL({ require_protocol: false }).withMessage('Please provide a valid website URL'),

  body('currentAcademicYear').optional().trim()
    .matches(/^(\d{4}-\d{4})?$/).withMessage('Academic year must be in format YYYY-YYYY'),

  body('workingDays').optional()
    .isArray().withMessage('workingDays must be an array')
    .custom((days) => {
      const invalid = days.filter((d) => !DAYS.includes(d.toLowerCase()));
      if (invalid.length > 0) throw new Error(`Invalid working days: ${invalid.join(', ')}`);
      return true;
    }),

  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.country').optional().trim(),
  body('address.pincode').optional().trim(),
];
