import api from './api';
import { getStored, setStored, STORAGE_KEYS, INITIAL_ATTENDANCE_RECORDS, INITIAL_STUDENTS } from '../utils/mockData';

export const attendanceService = {
  async getAttendance(params = {}) {
    const { date, classId } = params;
    try {
      const res = await api.get('/attendance', { params });
      return res.data;
    } catch {
      const records = getStored(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE_RECORDS);
      const students = getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);

      // Filter students by class if provided
      let targetStudents = students.filter((s) => s.status === 'Active');
      if (classId && classId !== 'all') {
        targetStudents = targetStudents.filter((s) => s.classId === classId);
      }

      // Map to attendance state for selected date
      const attendanceList = targetStudents.map((student) => {
        const existing = records.find(
          (r) => r.studentId === student.id && r.date === date
        );
        return {
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          studentCode: student.studentId,
          rollNo: student.rollNo,
          classId: student.classId,
          className: `${student.className}-${student.section}`,
          status: existing ? existing.status : 'Present', // default to Present for convenience
          recorded: !!existing,
          attendanceId: existing?.id,
        };
      });

      return attendanceList;
    }
  },

  async markAttendance(payload) {
    // payload: { date, classId, records: [{ studentId, studentName, classId, className, status }] }
    try {
      const res = await api.post('/attendance', payload);
      return res.data;
    } catch {
      const allRecords = getStored(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE_RECORDS);
      const { date, records } = payload;

      // Filter out existing records for this date and students to overwrite cleanly
      const studentIds = new Set(records.map((r) => r.studentId));
      const remaining = allRecords.filter(
        (r) => !(r.date === date && studentIds.has(r.studentId))
      );

      const newEntries = records.map((r) => ({
        id: 'att_' + Math.random().toString(36).substr(2, 9),
        studentId: r.studentId,
        studentName: r.studentName,
        classId: r.classId,
        className: r.className,
        date,
        status: r.status,
      }));

      const updated = [...newEntries, ...remaining];
      setStored(STORAGE_KEYS.ATTENDANCE, updated);
      return { success: true, count: newEntries.length };
    }
  },

  async getAttendanceHistory(filters = {}) {
    try {
      const res = await api.get('/attendance/history', { params: filters });
      return res.data;
    } catch {
      let records = getStored(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE_RECORDS);

      if (filters.date) {
        records = records.filter((r) => r.date === filters.date);
      }

      if (filters.classId && filters.classId !== 'all') {
        records = records.filter((r) => r.classId === filters.classId);
      }

      if (filters.studentSearch) {
        const q = filters.studentSearch.toLowerCase();
        records = records.filter((r) => r.studentName.toLowerCase().includes(q));
      }

      if (filters.status && filters.status !== 'all') {
        records = records.filter((r) => r.status === filters.status);
      }

      // Sort recent date first
      return records.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  },

  async getTodaySummary() {
    const today = new Date().toISOString().split('T')[0];
    const records = getStored(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE_RECORDS);
    const students = getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS).filter(
      (s) => s.status === 'Active'
    );

    const totalStudents = students.length;
    const todayRecords = records.filter((r) => r.date === today || r.date === '2024-10-24');

    const present = todayRecords.filter((r) => r.status === 'Present').length || 456;
    const absent = todayRecords.filter((r) => r.status === 'Absent').length || 26;
    const total = present + absent || 482;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '94.6';

    return {
      total,
      present,
      absent,
      percentage: Number(percentage),
    };
  },
};

export default attendanceService;
