import api from './api';
import { getStored, setStored, STORAGE_KEYS, INITIAL_PARENTS, INITIAL_STUDENTS } from '../utils/mockData';

export const parentService = {
  async getParents(search = '') {
    try {
      const res = await api.get('/parents', { params: { search } });
      return res.data;
    } catch {
      let parents = getStored(STORAGE_KEYS.PARENTS, INITIAL_PARENTS);
      const students = getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);

      // Attach linked students
      const parentsWithStudents = parents.map((p) => {
        const linked = students.filter((s) => s.parentId === p.id);
        return {
          ...p,
          students: linked,
        };
      });

      if (search) {
        const q = search.toLowerCase();
        return parentsWithStudents.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.phone.includes(q) ||
            p.email.toLowerCase().includes(q)
        );
      }

      return parentsWithStudents;
    }
  },

  async getParentById(id) {
    try {
      const res = await api.get(`/parents/${id}`);
      return res.data;
    } catch {
      const parents = getStored(STORAGE_KEYS.PARENTS, INITIAL_PARENTS);
      const students = getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
      const parent = parents.find((p) => p.id === id);
      if (!parent) throw new Error('Parent not found');
      return {
        ...parent,
        students: students.filter((s) => s.parentId === id),
      };
    }
  },

  async createParent(parentData) {
    try {
      const res = await api.post('/parents', parentData);
      return res.data;
    } catch {
      const parents = getStored(STORAGE_KEYS.PARENTS, INITIAL_PARENTS);
      const newParent = {
        ...parentData,
        id: 'p_' + Date.now(),
      };
      const updated = [newParent, ...parents];
      setStored(STORAGE_KEYS.PARENTS, updated);
      return newParent;
    }
  },

  async updateParent(id, parentData) {
    try {
      const res = await api.put(`/parents/${id}`, parentData);
      return res.data;
    } catch {
      const parents = getStored(STORAGE_KEYS.PARENTS, INITIAL_PARENTS);
      const index = parents.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Parent not found');

      const updated = { ...parents[index], ...parentData };
      parents[index] = updated;
      setStored(STORAGE_KEYS.PARENTS, parents);
      return updated;
    }
  },
};

export default parentService;
