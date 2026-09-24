import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess }  from '../utils/apiResponse.js';
import * as settingsService from '../services/settingsService.js';

export const getSettings = asyncHandler(async (_req, res) => {
  const settings = await settingsService.getSettings();
  sendSuccess(res, { settings }, 'Settings retrieved successfully');
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateSettings(req.body);
  sendSuccess(res, { settings }, 'Settings updated successfully');
});
