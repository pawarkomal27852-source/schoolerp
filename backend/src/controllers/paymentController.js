import { asyncHandler }                             from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/apiResponse.js';
import * as paymentService                         from '../services/paymentService.js';

export const getAllPayments = asyncHandler(async (req, res) => {
  const { data, pagination } = await paymentService.getAllPayments(req.query);
  sendPaginated(res, data, pagination, 'Payments retrieved successfully');
});

export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.id);
  sendSuccess(res, { payment }, 'Payment retrieved successfully');
});

export const recordPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.recordPayment(req.body, req.user.id);
  sendCreated(res, { payment }, 'Payment recorded successfully');
});

export const getPendingFees = asyncHandler(async (req, res) => {
  const data = await paymentService.getPendingFees(req.params.studentId);
  sendSuccess(res, data, 'Pending fees retrieved successfully');
});

export const getPaymentSummary = asyncHandler(async (req, res) => {
  const data = await paymentService.getPaymentSummary(req.query);
  sendSuccess(res, data, 'Payment summary retrieved successfully');
});
