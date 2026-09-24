import { body } from 'express-validator';
import { PAYMENT_METHODS_LIST } from '../models/Payment.js';

export const recordPaymentValidator = [
  body('studentId').notEmpty().withMessage('Student is required')
    .isMongoId().withMessage('Student ID must be a valid ID'),

  body('feeId').notEmpty().withMessage('Fee structure is required')
    .isMongoId().withMessage('Fee ID must be a valid ID'),

  body('amount').notEmpty().withMessage('Amount is required')
    .isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),

  body('paymentMethod').notEmpty().withMessage('Payment method is required')
    .isIn(PAYMENT_METHODS_LIST).withMessage(`Payment method must be one of: ${PAYMENT_METHODS_LIST.join(', ')}`),

  body('paymentDate').optional()
    .isISO8601().withMessage('Payment date must be a valid date'),

  body('transactionId').optional().trim(),

  body('remarks').optional().trim()
    .isLength({ max: 500 }).withMessage('Remarks cannot exceed 500 characters'),
];
