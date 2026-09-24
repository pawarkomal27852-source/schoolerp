import api from './api';
import { getStored, STORAGE_KEYS, INITIAL_STUDENTS, INITIAL_CLASSES, INITIAL_PAYMENTS, INITIAL_ATTENDANCE_RECORDS } from '../utils/mockData';

export const reportService = {
  async getStudentReport() {
    try {
      const res = await api.get('/reports/students');
      return res.data;
    } catch {
      const students = getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
      const classes = getStored(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);

      const activeStudents = students.filter((s) => s.status === 'Active');
      const inactiveStudents = students.filter((s) => s.status === 'Inactive');

      const byClass = classes
        .filter((c) => c.status === 'Active')
        .map((c) => {
          const classStudents = activeStudents.filter(
            (s) => s.classId === c.id || (s.className === c.name && s.section === c.section)
          );
          const male = classStudents.filter((s) => s.gender === 'Male').length;
          const female = classStudents.filter((s) => s.gender === 'Female').length;
          return {
            classId: c.id,
            className: `${c.name} - ${c.section}`,
            total: classStudents.length,
            male,
            female,
            capacity: c.capacity,
            teacher: c.teacher,
          };
        });

      return {
        totalStudents: students.length,
        activeStudents: activeStudents.length,
        inactiveStudents: inactiveStudents.length,
        classesCount: classes.filter((c) => c.status === 'Active').length,
        byClass,
      };
    }
  },

  async getAttendanceReport(params = {}) {
    const targetDate = params.date || '2024-10-24';
    try {
      const res = await api.get('/reports/attendance', { params });
      return res.data;
    } catch {
      const records = getStored(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE_RECORDS);
      const classes = getStored(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);

      const dateRecords = records.filter((r) => r.date === targetDate);
      const presentCount = dateRecords.filter((r) => r.status === 'Present').length;
      const absentCount = dateRecords.filter((r) => r.status === 'Absent').length;
      const totalCount = dateRecords.length;
      const rate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0;

      const classBreakdown = classes.map((c) => {
        const classRecords = dateRecords.filter(
          (r) => r.classId === c.id || r.className?.startsWith(c.name)
        );
        const p = classRecords.filter((r) => r.status === 'Present').length;
        const a = classRecords.filter((r) => r.status === 'Absent').length;
        const tot = p + a;
        return {
          className: `${c.name} - ${c.section}`,
          present: p,
          absent: a,
          total: tot,
          percentage: tot > 0 ? ((p / tot) * 100).toFixed(1) : 0,
        };
      });

      return {
        date: targetDate,
        total: totalCount,
        present: presentCount,
        absent: absentCount,
        attendanceRate: rate,
        classBreakdown,
      };
    }
  },

  async getFeeReport() {
    try {
      const res = await api.get('/reports/fees');
      return res.data;
    } catch {
      const students = getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
      const payments = getStored(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
      const classes = getStored(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);

      let totalExpected = 0;
      let totalCollected = 0;

      students.forEach((s) => {
        totalExpected += Number(s.totalFee) || 0;
        totalCollected += Number(s.paidFee) || 0;
      });

      const totalPending = Math.max(0, totalExpected - totalCollected);
      const collectionRate = totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(1) : 0;

      // Mode breakdown
      const modeBreakdown = payments.reduce((acc, curr) => {
        acc[curr.mode] = (acc[curr.mode] || 0) + curr.amount;
        return acc;
      }, {});

      // Class-wise summary
      const classSummary = classes
        .filter((c) => c.status === 'Active')
        .map((c) => {
          const classStudents = students.filter(
            (s) => s.classId === c.id || (s.className === c.name && s.section === c.section)
          );
          const exp = classStudents.reduce((sum, s) => sum + (Number(s.totalFee) || 0), 0);
          const col = classStudents.reduce((sum, s) => sum + (Number(s.paidFee) || 0), 0);
          return {
            className: `${c.name} - ${c.section}`,
            students: classStudents.length,
            expected: exp,
            collected: col,
            pending: Math.max(0, exp - col),
            rate: exp > 0 ? ((col / exp) * 100).toFixed(1) : 0,
          };
        });

      return {
        totalExpected,
        totalCollected,
        totalPending,
        collectionRate,
        modeBreakdown,
        classSummary,
      };
    }
  },
};

export default reportService;
