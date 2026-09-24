import { asyncHandler }                             from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/apiResponse.js';
import * as feeService                             from '../services/feeService.js';

export const getAllFees = asyncHandler(async (req, res) => {
  const { data, pagination } = await feeService.getAllFees(req.query);
  sendPaginated(res, data, pagination, 'Fee structures retrieved successfully');
});

export const getFeeById = asyncHandler(async (req, res) => {
  const fee = await feeService.getFeeById(req.params.id);
  sendSuccess(res, { fee }, 'Fee structure retrieved successfully');
});

export const getFeesByClass = asyncHandler(async (req, res) => {
  const fees = await feeService.getFeesByClass(req.params.classId, req.query.academicYear);
  sendSuccess(res, { fees }, 'Class fees retrieved successfully');
});

export const createFee = asyncHandler(async (req, res) => {
  const fee = await feeService.createFee(req.body);
  sendCreated(res, { fee }, 'Fee structure created successfully');
});

export const updateFee = asyncHandler(async (req, res) => {
  const fee = await feeService.updateFee(req.params.id, req.body);
  sendSuccess(res, { fee }, 'Fee structure updated successfully');
});

export const deleteFee = asyncHandler(async (req, res) => {
  await feeService.deleteFee(req.params.id);
  sendSuccess(res, null, 'Fee structure deleted successfully');
});
