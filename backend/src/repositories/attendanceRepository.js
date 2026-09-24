import Attendance from '../models/Attendance.js';

const STUDENT_POPULATE = { path: 'studentId', select: 'firstName lastName studentId' };
const CLASS_POPULATE   = { path: 'classId',   select: 'name section' };
const USER_POPULATE    = { path: 'markedBy',  select: 'name email' };

export async function findAll({ filter = {}, skip = 0, limit = 50, sort = { date: -1 } }) {
  const [data, total] = await Promise.all([
    Attendance.find(filter)
      .populate([STUDENT_POPULATE, CLASS_POPULATE, USER_POPULATE])
      .sort(sort).skip(skip).limit(limit).lean(),
    Attendance.countDocuments(filter),
  ]);
  return { data, total };
}

export async function findOne(filter) {
  return Attendance.findOne(filter);
}

export async function findByStudentAndDate(studentId, date) {
  const start = new Date(date); start.setUTCHours(0, 0, 0, 0);
  const end   = new Date(date); end.setUTCHours(23, 59, 59, 999);
  return Attendance.findOne({ studentId, date: { $gte: start, $lte: end } });
}

export async function create(data) {
  return Attendance.create(data);
}

/** Bulk insert — insertMany with ordered:false allows partial success */
export async function bulkCreate(records) {
  return Attendance.insertMany(records, { ordered: false });
}

export async function updateById(id, data) {
  return Attendance.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
    .populate([STUDENT_POPULATE, CLASS_POPULATE]);
}

export async function updateByStudentAndDate(studentId, date, data) {
  const start = new Date(date); start.setUTCHours(0, 0, 0, 0);
  const end   = new Date(date); end.setUTCHours(23, 59, 59, 999);
  return Attendance.findOneAndUpdate(
    { studentId, date: { $gte: start, $lte: end } },
    { $set: data },
    { new: true, runValidators: true }
  );
}

export async function getClassAttendanceForDate(classId, date) {
  const start = new Date(date); start.setUTCHours(0, 0, 0, 0);
  const end   = new Date(date); end.setUTCHours(23, 59, 59, 999);
  return Attendance.find({ classId, date: { $gte: start, $lte: end } })
    .populate(STUDENT_POPULATE).lean();
}

export async function getStudentHistory({ studentId, startDate, endDate, skip, limit }) {
  const filter = { studentId };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate)   filter.date.$lte = new Date(endDate);
  }
  const [data, total] = await Promise.all([
    Attendance.find(filter)
      .populate([CLASS_POPULATE])
      .sort({ date: -1 }).skip(skip).limit(limit).lean(),
    Attendance.countDocuments(filter),
  ]);
  return { data, total };
}

/** Summary: count per status for a class in a date range */
export async function getClassSummary(classId, startDate, endDate) {
  return Attendance.aggregate([
    {
      $match: {
        classId: new (await import('mongoose')).default.Types.ObjectId(classId),
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      },
    },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
}
