import mongoose   from 'mongoose';
import Student    from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import Payment    from '../models/Payment.js';
import Fee        from '../models/Fee.js';
import * as classRepo from '../repositories/classRepository.js';
import { AppError }   from '../middleware/errorHandler.js';

// ── Student Summary Report ─────────────────────────────────────────────────
/**
 * Breakdown of students by status, class, gender and academic year.
 */
export async function getStudentSummaryReport(query) {
  const match = { isDeleted: { $ne: true } };
  if (query.academicYear) match.academicYear = query.academicYear;
  if (query.classId) match.classId = new mongoose.Types.ObjectId(query.classId);

  const [byStatus, byGender, byClass, total] = await Promise.all([
    Student.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Student.aggregate([
      { $match: match },
      { $group: { _id: '$gender', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Student.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'class',
        },
      },
      { $unwind: { path: '$class', preserveNullAndEmpty: true } },
      {
        $group: {
          _id: '$classId',
          className: { $first: '$class.name' },
          section:   { $first: '$class.section' },
          count:     { $sum: 1 },
        },
      },
      { $sort: { className: 1 } },
    ]),
    Student.countDocuments(match),
  ]);

  return {
    filters: { academicYear: query.academicYear, classId: query.classId },
    total,
    byStatus:  byStatus.map((r) => ({ status: r._id, count: r.count })),
    byGender:  byGender.map((r) => ({ gender: r._id, count: r.count })),
    byClass:   byClass.map((r) => ({ classId: r._id, name: `${r.className} - ${r.section}`, count: r.count })),
  };
}

// ── Attendance Summary Report ──────────────────────────────────────────────
export async function getAttendanceSummaryReport(query) {
  if (!query.startDate || !query.endDate) {
    throw new AppError('startDate and endDate are required for attendance report.', 400);
  }

  const match = {
    date: { $gte: new Date(query.startDate), $lte: new Date(query.endDate) },
  };
  if (query.classId) match.classId = new mongoose.Types.ObjectId(query.classId);

  const [byStatus, byClass, byDate] = await Promise.all([
    // Total by status
    Attendance.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    // By class summary
    Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id:     '$classId',
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent:  { $sum: { $cond: [{ $eq: ['$status', 'absent'] },  1, 0] } },
          late:    { $sum: { $cond: [{ $eq: ['$status', 'late'] },    1, 0] } },
          excused: { $sum: { $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] } },
          total:   { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'classes', localField: '_id', foreignField: '_id', as: 'class',
        },
      },
      { $unwind: { path: '$class', preserveNullAndEmpty: true } },
      {
        $project: {
          classId: '$_id',
          className: '$class.name',
          section:   '$class.section',
          present: 1, absent: 1, late: 1, excused: 1, total: 1,
        },
      },
      { $sort: { className: 1 } },
    ]),
    // Daily trend
    Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent:  { $sum: { $cond: [{ $eq: ['$status', 'absent'] },  1, 0] } },
          total:   { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const totalRecords = byStatus.reduce((s, r) => s + r.count, 0);
  const presentCount = byStatus.find((r) => r._id === 'present')?.count || 0;
  const attendanceRate = totalRecords ? ((presentCount / totalRecords) * 100).toFixed(2) : '0.00';

  return {
    filters: { startDate: query.startDate, endDate: query.endDate, classId: query.classId },
    summary: { totalRecords, attendanceRate: `${attendanceRate}%` },
    byStatus: byStatus.map((r) => ({ status: r._id, count: r.count })),
    byClass,
    dailyTrend: byDate,
  };
}

// ── Fee Summary Report ─────────────────────────────────────────────────────
export async function getFeeSummaryReport(query) {
  if (!query.academicYear) {
    throw new AppError('academicYear is required for fee report.', 400);
  }

  const feeMatch     = { isDeleted: { $ne: true }, isActive: true, academicYear: query.academicYear };
  const paymentMatch = { status: 'completed', academicYear: query.academicYear };
  if (query.classId) {
    feeMatch.classId     = new mongoose.Types.ObjectId(query.classId);
    paymentMatch.classId = new mongoose.Types.ObjectId(query.classId);
  }

  const [feesByCategory, collectionByMonth, collectionByClass, totalFees, totalCollected] = await Promise.all([
    // Fees defined per category
    Fee.aggregate([
      { $match: feeMatch },
      { $group: { _id: '$category', totalDefined: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    // Monthly collection trend
    Payment.aggregate([
      { $match: paymentMatch },
      {
        $group: {
          _id:   { $dateToString: { format: '%Y-%m', date: '$paymentDate' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    // By class
    Payment.aggregate([
      { $match: paymentMatch },
      {
        $group: {
          _id:   '$classId',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'classes', localField: '_id', foreignField: '_id', as: 'class',
        },
      },
      { $unwind: { path: '$class', preserveNullAndEmpty: true } },
      {
        $project: {
          classId:   '$_id',
          className: '$class.name',
          section:   '$class.section',
          total: 1, count: 1,
        },
      },
      { $sort: { className: 1 } },
    ]),
    // Total fees
    Fee.aggregate([
      { $match: feeMatch },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    // Total collected
    Payment.aggregate([
      { $match: paymentMatch },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const totalFeesAmount    = totalFees[0]?.total    || 0;
  const totalCollectedAmt  = totalCollected[0]?.total || 0;
  const collectionRate     = totalFeesAmount
    ? ((totalCollectedAmt / totalFeesAmount) * 100).toFixed(2)
    : '0.00';

  return {
    filters: { academicYear: query.academicYear, classId: query.classId },
    summary: {
      totalFeesDefined: totalFeesAmount,
      totalCollected:   totalCollectedAmt,
      totalPending:     Math.max(0, totalFeesAmount - totalCollectedAmt),
      collectionRate:   `${collectionRate}%`,
    },
    feesByCategory: feesByCategory.map((r) => ({
      category: r._id, totalDefined: r.totalDefined, count: r.count,
    })),
    collectionByMonth,
    collectionByClass,
  };
}
