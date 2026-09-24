import mongoose       from 'mongoose';
import Student        from '../models/Student.js';
import Class          from '../models/Class.js';
import Attendance     from '../models/Attendance.js';
import Payment        from '../models/Payment.js';
import Fee            from '../models/Fee.js';
import * as payRepo   from '../repositories/paymentRepository.js';

/**
 * Returns all KPIs for the dashboard in a single optimised call.
 * Uses Promise.all to run independent queries in parallel.
 */
export async function getDashboardStats(academicYear) {
  const yearFilter = academicYear ? { academicYear } : {};

  // Today's date range
  const todayStart = new Date(); todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd   = new Date(); todayEnd.setUTCHours(23, 59, 59, 999);

  const [
    totalStudents,
    activeStudents,
    totalClasses,
    activeClasses,
    todayAttendance,
    recentPayments,
    feeAggregate,
    paymentAggregate,
  ] = await Promise.all([
    // Total students
    Student.countDocuments({ isDeleted: { $ne: true }, ...yearFilter }),

    // Active students
    Student.countDocuments({ isDeleted: { $ne: true }, status: 'active', ...yearFilter }),

    // Total classes
    Class.countDocuments({ isDeleted: { $ne: true } }),

    // Active classes
    Class.countDocuments({ isDeleted: { $ne: true }, isActive: true }),

    // Today's attendance summary
    Attendance.aggregate([
      { $match: { date: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Recent 5 payments
    payRepo.getRecent(5),

    // Total fees defined (sum of all active fee amounts)
    Fee.aggregate([
      { $match: { isDeleted: { $ne: true }, isActive: true, ...yearFilter } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),

    // Total collected
    Payment.aggregate([
      { $match: { status: 'completed', ...yearFilter } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  // Format today's attendance into a map
  const attendanceMap = { present: 0, absent: 0, late: 0, excused: 0 };
  todayAttendance.forEach(({ _id, count }) => { attendanceMap[_id] = count; });
  const totalMarkedToday = Object.values(attendanceMap).reduce((a, b) => a + b, 0);

  const totalFeesAmount    = feeAggregate[0]?.total    || 0;
  const totalCollected     = paymentAggregate[0]?.total || 0;
  const totalPending       = Math.max(0, totalFeesAmount - totalCollected);

  return {
    students: {
      total:  totalStudents,
      active: activeStudents,
    },
    classes: {
      total:  totalClasses,
      active: activeClasses,
    },
    attendance: {
      today: {
        ...attendanceMap,
        total: totalMarkedToday,
        date:  todayStart.toISOString().split('T')[0],
      },
    },
    fees: {
      totalDefined:  totalFeesAmount,
      totalCollected,
      totalPending,
    },
    recentPayments,
  };
}
