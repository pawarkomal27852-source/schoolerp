import { asyncHandler }                             from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/apiResponse.js';
import * as attendanceService                      from '../services/attendanceService.js';

export const markAttendance = asyncHandler(async (req, res) => {
  const record = await attendanceService.markAttendance(req.body, req.user.id);
  sendCreated(res, { record }, 'Attendance marked successfully');
});

export const markBulkAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.markBulkAttendance(req.body, req.user.id);
  sendCreated(res, result, `Attendance marked: ${result.inserted} inserted, ${result.skipped} skipped`);
});

export const updateAttendance = asyncHandler(async (req, res) => {
  const record = await attendanceService.updateAttendance(req.params.id, req.body);
  sendSuccess(res, { record }, 'Attendance updated successfully');
});

export const getAttendanceHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await attendanceService.getAttendanceHistory(req.query);
  sendPaginated(res, data, pagination, 'Attendance history retrieved successfully');
});

export const getTodayClassAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.getTodayClassAttendance(req.params.classId);
  sendSuccess(res, result, 'Today\'s attendance retrieved successfully');
});
