import { asyncHandler }                             from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/apiResponse.js';
import * as studentService                         from '../services/studentService.js';

export const getAllStudents = asyncHandler(async (req, res) => {
  const { data, pagination } = await studentService.getAllStudents(req.query);
  sendPaginated(res, data, pagination, 'Students retrieved successfully');
});

export const getStudentById = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentById(req.params.id);
  sendSuccess(res, { student }, 'Student retrieved successfully');
});

export const createStudent = asyncHandler(async (req, res) => {
  const student = await studentService.createStudent(req.body);
  sendCreated(res, { student }, 'Student created successfully');
});

export const updateStudent = asyncHandler(async (req, res) => {
  const student = await studentService.updateStudent(req.params.id, req.body);
  sendSuccess(res, { student }, 'Student updated successfully');
});

export const deleteStudent = asyncHandler(async (req, res) => {
  await studentService.deleteStudent(req.params.id);
  sendSuccess(res, null, 'Student deleted successfully');
});

/** GET /api/v1/students/list — lightweight list for dropdowns */
export const getStudentsList = asyncHandler(async (req, res) => {
  const students = await studentService.getStudentsList(req.query.classId);
  sendSuccess(res, { students }, 'Students list retrieved successfully');
});
