import * as studentRepo  from '../repositories/studentRepository.js';
import * as classRepo    from '../repositories/classRepository.js';
import * as parentRepo   from '../repositories/parentRepository.js';
import { AppError }      from '../middleware/errorHandler.js';
import { buildPagination } from '../utils/apiResponse.js';
import { generateStudentId } from '../utils/idGenerator.js';

function parseQuery(query) {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
}

export async function getAllStudents(query) {
  const { page, limit, skip } = parseQuery(query);

  const filter = {};
  if (query.status)       filter.status       = query.status;
  if (query.classId)      filter.classId      = query.classId;
  if (query.academicYear) filter.academicYear = query.academicYear;
  if (query.search) {
    filter.$or = [
      { firstName: { $regex: query.search, $options: 'i' } },
      { lastName:  { $regex: query.search, $options: 'i' } },
      { studentId: { $regex: query.search, $options: 'i' } },
      { email:     { $regex: query.search, $options: 'i' } },
    ];
  }

  const { data, total } = await studentRepo.findAll({ filter, skip, limit });
  return { data, pagination: buildPagination(total, page, limit) };
}

export async function getStudentById(id) {
  const student = await studentRepo.findById(id);
  if (!student) throw new AppError('Student not found.', 404);
  return student;
}

export async function createStudent(body) {
  // Validate class exists
  const cls = await classRepo.findById(body.classId);
  if (!cls) throw new AppError('Class not found.', 404);

  // Validate parent exists
  const parent = await parentRepo.findById(body.parentId);
  if (!parent) throw new AppError('Parent not found.', 404);

  // Handle student ID
  let { studentId } = body;
  if (studentId) {
    // Check uniqueness of provided ID
    const exists = await studentRepo.findByStudentId(studentId);
    if (exists) throw new AppError(`Student ID "${studentId.toUpperCase()}" is already in use.`, 409);
  } else {
    studentId = await generateStudentId();
  }

  return studentRepo.create({ ...body, studentId });
}

export async function updateStudent(id, body) {
  const student = await studentRepo.findById(id);
  if (!student) throw new AppError('Student not found.', 404);

  // If classId changes, validate new class
  if (body.classId && String(body.classId) !== String(student.classId?._id || student.classId)) {
    const cls = await classRepo.findById(body.classId);
    if (!cls) throw new AppError('Class not found.', 404);
  }

  // If parentId changes, validate new parent
  if (body.parentId && String(body.parentId) !== String(student.parentId?._id || student.parentId)) {
    const parent = await parentRepo.findById(body.parentId);
    if (!parent) throw new AppError('Parent not found.', 404);
  }

  // Cannot update studentId
  delete body.studentId;

  return studentRepo.updateById(id, body);
}

export async function deleteStudent(id) {
  const student = await studentRepo.findById(id);
  if (!student) throw new AppError('Student not found.', 404);
  return studentRepo.softDeleteById(id);
}

/** Returns lightweight list of all active students — for bulk/dropdown use */
export async function getStudentsList(classId) {
  const filter = classId ? { classId } : {};
  return studentRepo.findAllBasic(filter);
}
