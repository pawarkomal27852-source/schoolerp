import api from './api';
import { getStored, setStored, STORAGE_KEYS, INITIAL_STUDENTS } from '../utils/mockData';

export const studentService = {
  async getStudents(filters = {}) {
    try {
      const res = await api.get('/students', { params: filters });
      return res.data;
    } catch {
      let students = getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);

      if (filters.search) {
        const q = filters.search.toLowerCase();
        students = students.filter(
          (s) =>
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
            s.studentId.toLowerCase().includes(q) ||
            (s.parentName && s.parentName.toLowerCase().includes(q)) ||
            (s.parentPhone && s.parentPhone.includes(q))
        );
      }

      if (filters.classId && filters.classId !== 'all') {
        students = students.filter((s) => s.classId === filters.classId);
      }

      if (filters.status && filters.status !== 'all') {
        students = students.filter((s) => s.status === filters.status);
      }

      return students;
    }
  },

  async getStudentById(id) {
    try {
      const res = await api.get(`/students/${id}`);
      return res.data;
    } catch {
      const students = getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
      const student = students.find((s) => s.id === id);
      if (!student) throw new Error('Student not found');
      return student;
    }
  },

  async createStudent(studentData) {
    try {
      const res = await api.post('/students', studentData);
      return res.data;
    } catch {
      const students = getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);

      // Unique Student ID check
      const duplicate = students.find(
        (s) => s.studentId.trim().toLowerCase() === studentData.studentId.trim().toLowerCase()
      );
      if (duplicate) {
        throw new Error(`Student ID "${studentData.studentId}" is already assigned to another student.`);
      }

      const newStudent = {
        ...studentData,
        id: 's_' + Date.now(),
        status: studentData.status || 'Active',
        totalFee: Number(studentData.totalFee) || 25000,
        paidFee: 0,
        attendanceRate: 100,
      };

      const updated = [newStudent, ...students];
      setStored(STORAGE_KEYS.STUDENTS, updated);
      return newStudent;
    }
  },

  async updateStudent(id, studentData) {
    try {
      const res = await api.put(`/students/${id}`, studentData);
      return res.data;
    } catch {
      const students = getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
      const index = students.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Student not found');

      // Check unique student ID if changed
      if (studentData.studentId) {
        const dup = students.find(
          (s) =>
            s.id !== id &&
            s.studentId.trim().toLowerCase() === studentData.studentId.trim().toLowerCase()
        );
        if (dup) {
          throw new Error(`Student ID "${studentData.studentId}" is already in use.`);
        }
      }

      const updatedStudent = { ...students[index], ...studentData };
      students[index] = updatedStudent;
      setStored(STORAGE_KEYS.STUDENTS, students);
      return updatedStudent;
    }
  },

  async deactivateStudent(id) {
    try {
      const res = await api.patch(`/students/${id}/deactivate`);
      return res.data;
    } catch {
      const students = getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
      const index = students.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Student not found');

      students[index].status = 'Inactive';
      setStored(STORAGE_KEYS.STUDENTS, students);
      return students[index];
    }
  },

  async activateStudent(id) {
    const students = getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Student not found');
    students[index].status = 'Active';
    setStored(STORAGE_KEYS.STUDENTS, students);
    return students[index];
  },
};

export default studentService;
