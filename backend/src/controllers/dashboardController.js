import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess }  from '../utils/apiResponse.js';
import * as dashboardService from '../services/dashboardService.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats(req.query.academicYear);
  sendSuccess(res, stats, 'Dashboard data retrieved successfully');
});
