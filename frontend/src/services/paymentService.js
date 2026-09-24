import api from './api';
import { getStored, setStored, STORAGE_KEYS, INITIAL_PAYMENTS, INITIAL_STUDENTS } from '../utils/mockData';

export const paymentService = {
  async getPayments(filters = {}) {
    try {
      const res = await api.get('/payments', { params: filters });
      return res.data;
    } catch {
      let payments = getStored(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);

      if (filters.search) {
        const q = filters.search.toLowerCase();
        payments = payments.filter(
          (p) =>
            p.studentName.toLowerCase().includes(q) ||
            p.receiptNo.toLowerCase().includes(q) ||
            (p.referenceNo && p.referenceNo.toLowerCase().includes(q))
        );
      }

      if (filters.studentId && filters.studentId !== 'all') {
        payments = payments.filter((p) => p.studentId === filters.studentId);
      }

      if (filters.mode && filters.mode !== 'all') {
        payments = payments.filter((p) => p.mode.toLowerCase() === filters.mode.toLowerCase());
      }

      if (filters.date) {
        payments = payments.filter((p) => p.date.startsWith(filters.date));
      }

      // Sort newest first
      return payments.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  },

  async createPayment(paymentData) {
    // paymentData: { studentId, amount, mode, paymentDate, referenceNo, remarks, receiptNo }
    try {
      const res = await api.post('/payments', paymentData);
      return res.data;
    } catch {
      const students = getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
      const student = students.find((s) => s.id === paymentData.studentId);
      if (!student) throw new Error('Selected student does not exist');

      const amountToPay = Number(paymentData.amount);
      if (isNaN(amountToPay) || amountToPay <= 0) {
        throw new Error('Please enter a valid positive payment amount');
      }

      const currentPaid = Number(student.paidFee) || 0;
      const totalFee = Number(student.totalFee) || 0;
      const currentPending = Math.max(0, totalFee - currentPaid);

      // Business Rule: Amount cannot exceed Pending fee
      if (amountToPay > currentPending) {
        throw new Error(
          `Payment amount (₹${amountToPay.toLocaleString('en-IN')}) cannot exceed pending balance of ₹${currentPending.toLocaleString('en-IN')}.`
        );
      }

      // Generate receipt number
      const existingPayments = getStored(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
      const nextNum = existingPayments.length + 91;
      const autoReceipt = paymentData.receiptNo || `REC-2024-${String(nextNum).padStart(3, '0')}`;

      const newPayment = {
        id: 'pay_' + Date.now(),
        receiptNo: autoReceipt,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        className: student.section ? `${student.className}-${student.section}` : student.className,
        amount: amountToPay,
        date: paymentData.paymentDate || new Date().toISOString(),
        mode: paymentData.mode || 'UPI',
        referenceNo: paymentData.referenceNo || `REF-${Date.now().toString().slice(-6)}`,
        status: 'Completed',
        remarks: paymentData.remarks || 'Institutional fee collection',
      };

      // Update student's paidFee
      student.paidFee = currentPaid + amountToPay;
      setStored(STORAGE_KEYS.STUDENTS, students);

      // Add to payments ledger
      const updatedPayments = [newPayment, ...existingPayments];
      setStored(STORAGE_KEYS.PAYMENTS, updatedPayments);

      return newPayment;
    }
  },

  async getRecentCollections(limit = 4) {
    const payments = await this.getPayments();
    return payments.slice(0, limit);
  },
};

export default paymentService;
