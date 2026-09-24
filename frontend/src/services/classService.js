import api from './api';
import { getStored, setStored, STORAGE_KEYS, INITIAL_CLASSES, INITIAL_STUDENTS } from '../utils/mockData';

export const classService = {
  async getClasses(filters = {}) {
    try {
      const res = await api.get('/classes', { params: filters });
      return res.data;
    } catch {
      let classes = getStored(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
      const students = getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);

      // Compute live student counts
      const enriched = classes.map((c) => {
        const classStudents = students.filter(
          (s) => s.classId === c.id || (s.className === c.name && s.section === c.section)
        );
        return {
          ...c,
          studentCount: classStudents.length,
        };
      });

      if (filters.status && filters.status !== 'all') {
        return enriched.filter((c) => c.status === filters.status);
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        return enriched.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.section.toLowerCase().includes(q) ||
            c.teacher.toLowerCase().includes(q)
        );
      }

      return enriched;
    }
  },

  async getClassById(id) {
    try {
      const res = await api.get(`/classes/${id}`);
      return res.data;
    } catch {
      const classes = getStored(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
      const students = getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
      const cls = classes.find((c) => c.id === id);
      if (!cls) throw new Error('Class not found');
      const classStudents = students.filter(
        (s) => s.classId === id || (s.className === cls.name && s.section === cls.section)
      );
      return {
        ...cls,
        studentCount: classStudents.length,
        students: classStudents,
      };
    }
  },

  async createClass(classData) {
    try {
      const res = await api.post('/classes', classData);
      return res.data;
    } catch {
      const classes = getStored(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
      const newClass = {
        ...classData,
        id: 'c_' + Date.now(),
        status: classData.status || 'Active',
      };
      const updated = [...classes, newClass];
      setStored(STORAGE_KEYS.CLASSES, updated);
      return newClass;
    }
  },

  async updateClass(id, classData) {
    try {
      const res = await api.put(`/classes/${id}`, classData);
      return res.data;
    } catch {
      const classes = getStored(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
      const index = classes.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Class not found');

      const updated = { ...classes[index], ...classData };
      classes[index] = updated;
      setStored(STORAGE_KEYS.CLASSES, classes);
      return updated;
    }
  },

  async deactivateClass(id) {
    try {
      const res = await api.patch(`/classes/${id}/deactivate`);
      return res.data;
    } catch {
      const classes = getStored(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
      const index = classes.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Class not found');

      classes[index].status = 'Inactive';
      setStored(STORAGE_KEYS.CLASSES, classes);
      return classes[index];
    }
  },

  async activateClass(id) {
    const classes = getStored(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    const index = classes.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Class not found');

    classes[index].status = 'Active';
    setStored(STORAGE_KEYS.CLASSES, classes);
    return classes[index];
  },
};

export default classService;
