import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess }  from '../utils/apiResponse.js';
import * as reportService from '../services/reportService.js';

export const getStudentSummaryReport = asyncHandler(async (req, res) => {
  const report = await reportService.getStudentSummaryReport(req.query);
  sendSuccess(res, report, 'Student summary report generated successfully');
});

export const getAttendanceSummaryReport = asyncHandler(async (req, res) => {
  const report = await reportService.getAttendanceSummaryReport(req.query);
  sendSuccess(res, report, 'Attendance summary report generated successfully');
});

export const getFeeSummaryReport = asyncHandler(async (req, res) => {
  const report = await reportService.getFeeSummaryReport(req.query);
  sendSuccess(res, report, 'Fee summary report generated successfully');
});
