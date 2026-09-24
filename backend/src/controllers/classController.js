import { asyncHandler }           from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/apiResponse.js';
import * as classService           from '../services/classService.js';

export const getAllClasses = asyncHandler(async (req, res) => {
  const { data, pagination } = await classService.getAllClasses(req.query);
  sendPaginated(res, data, pagination, 'Classes retrieved successfully');
});

export const getClassById = asyncHandler(async (req, res) => {
  const cls = await classService.getClassById(req.params.id);
  sendSuccess(res, { class: cls }, 'Class retrieved successfully');
});

export const createClass = asyncHandler(async (req, res) => {
  const cls = await classService.createClass(req.body);
  sendCreated(res, { class: cls }, 'Class created successfully');
});

export const updateClass = asyncHandler(async (req, res) => {
  const cls = await classService.updateClass(req.params.id, req.body);
  sendSuccess(res, { class: cls }, 'Class updated successfully');
});

export const deleteClass = asyncHandler(async (req, res) => {
  await classService.deleteClass(req.params.id);
  sendSuccess(res, null, 'Class deleted successfully');
});
