import * as attendanceRepo from '../repositories/attendanceRepository.js';
import * as studentRepo    from '../repositories/studentRepository.js';
import * as classRepo      from '../repositories/classRepository.js';
import { AppError }        from '../middleware/errorHandler.js';
import { buildPagination } from '../utils/apiResponse.js';

function normalizeDate(dateInput) {
  const d = new Date(dateInput);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function parseQuery(query) {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(200, Math.max(1, parseInt(query.limit) || 50));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Mark attendance for a single student.
 */
export async function markAttendance(body, userId) {
  const { studentId, classId, date, status, remarks } = body;

  const student = await studentRepo.findById(studentId);
  if (!student) throw new AppError('Student not found.', 404);

  const cls = await classRepo.findById(classId);
  if (!cls) throw new AppError('Class not found.', 404);

  // Duplicate prevention
  const existing = await attendanceRepo.findByStudentAndDate(studentId, date);
  if (existing) {
    throw new AppError(
      `Attendance for this student on ${new Date(date).toDateString()} is already marked. Use PUT to update.`,
      409
    );
  }

  return attendanceRepo.create({
    studentId,
    classId,
    date: normalizeDate(date),
    status,
    remarks: remarks || '',
    markedBy: userId,
  });
}

/**
 * Bulk mark attendance for an entire class on a date.
 * Body: { classId, date, records: [{ studentId, status, remarks }] }
 */
export async function markBulkAttendance(body, userId) {
  const { classId, date, records } = body;

  const cls = await classRepo.findById(classId);
  if (!cls) throw new AppError('Class not found.', 404);

  const normalizedDate = normalizeDate(date);

  // Check for existing records on this date for this class
  const existing = await attendanceRepo.getClassAttendanceForDate(classId, date);
  const markedIds = new Set(existing.map((a) => String(a.studentId._id || a.studentId)));

  const toInsert = [];
  const skipped  = [];

  for (const rec of records) {
    if (markedIds.has(String(rec.studentId))) {
      skipped.push(rec.studentId);
    } else {
      toInsert.push({
        studentId: rec.studentId,
        classId,
        date: normalizedDate,
        status: rec.status,
        remarks: rec.remarks || '',
        markedBy: userId,
      });
    }
  }

  let inserted = [];
  if (toInsert.length > 0) {
    inserted = await attendanceRepo.bulkCreate(toInsert);
  }

  return { inserted: inserted.length, skipped: skipped.length, skippedIds: skipped };
}

/**
 * Update an existing attendance record.
 */
export async function updateAttendance(id, body) {
  const record = await attendanceRepo.findOne({ _id: id });
  if (!record) throw new AppError('Attendance record not found.', 404);

  const allowed = ['status', 'remarks'];
  const update  = {};
  allowed.forEach((k) => { if (body[k] !== undefined) update[k] = body[k]; });

  return attendanceRepo.updateById(id, update);
}

/**
 * Get attendance history — supports class+date or student+date-range filters.
 */
export async function getAttendanceHistory(query) {
  const { page, limit, skip } = parseQuery(query);

  const filter = {};
  if (query.classId)   filter.classId   = query.classId;
  if (query.studentId) filter.studentId = query.studentId;
  if (query.status)    filter.status    = query.status;
  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate)   filter.date.$lte = new Date(query.endDate);
  }
  if (query.date) {
    const d = normalizeDate(query.date);
    const e = new Date(d); e.setUTCHours(23, 59, 59, 999);
    filter.date = { $gte: d, $lte: e };
  }

  const { data, total } = await attendanceRepo.findAll({ filter, skip, limit });
  return { data, pagination: buildPagination(total, page, limit) };
}

/**
 * Get today's attendance summary for a class.
 */
export async function getTodayClassAttendance(classId) {
  const cls = await classRepo.findById(classId);
  if (!cls) throw new AppError('Class not found.', 404);

  const today = new Date();
  const records = await attendanceRepo.getClassAttendanceForDate(classId, today);

  const summary = { present: 0, absent: 0, late: 0, excused: 0, total: records.length };
  records.forEach((r) => { if (summary[r.status] !== undefined) summary[r.status]++; });

  return { date: today.toDateString(), classId, summary, records };
}
