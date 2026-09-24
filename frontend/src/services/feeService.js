import api from './api';
import { getStored, setStored, STORAGE_KEYS, INITIAL_FEE_STRUCTURES, INITIAL_STUDENTS } from '../utils/mockData';

export const feeService = {
  async getFeeStructures() {
    try {
      const res = await api.get('/fees/structures');
      return res.data;
    } catch {
      return getStored(STORAGE_KEYS.FEES, INITIAL_FEE_STRUCTURES);
    }
  },

  async createFeeStructure(data) {
    try {
      const res = await api.post('/fees/structures', data);
      return res.data;
    } catch {
      const structures = getStored(STORAGE_KEYS.FEES, INITIAL_FEE_STRUCTURES);
      const newStructure = {
        ...data,
        id: 'fs_' + Date.now(),
        annualFee: Number(data.annualFee),
        termFee: Number(data.termFee) || Math.round(Number(data.annualFee) / 2),
        status: data.status || 'Active',
      };
      const updated = [...structures, newStructure];
      setStored(STORAGE_KEYS.FEES, updated);
      return newStructure;
    }
  },

  async updateFeeStructure(id, data) {
    try {
      const res = await api.put(`/fees/structures/${id}`, data);
      return res.data;
    } catch {
      const structures = getStored(STORAGE_KEYS.FEES, INITIAL_FEE_STRUCTURES);
      const index = structures.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Fee structure not found');

      const updated = {
        ...structures[index],
        ...data,
        annualFee: Number(data.annualFee),
        termFee: Number(data.termFee) || Math.round(Number(data.annualFee) / 2),
      };
      structures[index] = updated;
      setStored(STORAGE_KEYS.FEES, structures);
      return updated;
    }
  },

  async getPendingFees(filters = {}) {
    try {
      const res = await api.get('/fees/pending', { params: filters });
      return res.data;
    } catch {
      const students = getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);

      let pendingList = students
        .map((s) => {
          const total = Number(s.totalFee) || 0;
          const paid = Number(s.paidFee) || 0;
          const pending = Math.max(0, total - paid);
          return {
            studentId: s.id,
            studentName: `${s.firstName} ${s.lastName}`,
            studentCode: s.studentId,
            classId: s.classId,
            className: s.section ? `${s.className}-${s.section}` : s.className,
            rollNo: s.rollNo,
            parentName: s.parentName,
            parentPhone: s.parentPhone,
            totalFee: total,
            paidFee: paid,
            pendingFee: pending,
            status: s.status,
            avatar: s.avatar,
          };
        })
        .filter((item) => item.pendingFee > 0 && item.status === 'Active');

      if (filters.search) {
        const q = filters.search.toLowerCase();
        pendingList = pendingList.filter(
          (p) =>
            p.studentName.toLowerCase().includes(q) ||
            p.studentCode.toLowerCase().includes(q) ||
            p.parentName?.toLowerCase().includes(q)
        );
      }

      if (filters.classId && filters.classId !== 'all') {
        pendingList = pendingList.filter((p) => p.classId === filters.classId);
      }

      const totalPendingAmount = pendingList.reduce((acc, curr) => acc + curr.pendingFee, 0);

      return {
        students: pendingList,
        totalCount: pendingList.length,
        totalAmount: totalPendingAmount,
      };
    }
  },
};

export default feeService;
