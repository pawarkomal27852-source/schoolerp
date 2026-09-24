import { asyncHandler }                              from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated }  from '../utils/apiResponse.js';
import * as parentService                           from '../services/parentService.js';

export const getAllParents = asyncHandler(async (req, res) => {
  const { data, pagination } = await parentService.getAllParents(req.query);
  sendPaginated(res, data, pagination, 'Parents retrieved successfully');
});

export const getParentById = asyncHandler(async (req, res) => {
  const parent = await parentService.getParentById(req.params.id);
  sendSuccess(res, { parent }, 'Parent retrieved successfully');
});

export const createParent = asyncHandler(async (req, res) => {
  const parent = await parentService.createParent(req.body);
  sendCreated(res, { parent }, 'Parent created successfully');
});

export const updateParent = asyncHandler(async (req, res) => {
  const parent = await parentService.updateParent(req.params.id, req.body);
  sendSuccess(res, { parent }, 'Parent updated successfully');
});

export const deleteParent = asyncHandler(async (req, res) => {
  await parentService.deleteParent(req.params.id);
  sendSuccess(res, null, 'Parent deleted successfully');
});
