import * as paymentRepo from '../repositories/paymentRepository.js';
import * as feeRepo     from '../repositories/feeRepository.js';
import * as studentRepo from '../repositories/studentRepository.js';
import { AppError }     from '../middleware/errorHandler.js';
import { buildPagination } from '../utils/apiResponse.js';
import { generateReceiptNumber } from '../utils/receiptGenerator.js';

function parseQuery(query) {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 50));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
}

export async function getAllPayments(query) {
  const { page, limit, skip } = parseQuery(query);
  const filter = {};
  if (query.studentId)   filter.studentId   = query.studentId;
  if (query.classId)     filter.classId     = query.classId;
  if (query.academicYear) filter.academicYear = query.academicYear;
  if (query.status)      filter.status      = query.status;
  if (query.startDate || query.endDate) {
    filter.paymentDate = {};
    if (query.startDate) filter.paymentDate.$gte = new Date(query.startDate);
    if (query.endDate)   filter.paymentDate.$lte = new Date(query.endDate);
  }

  const { data, total } = await paymentRepo.findAll({ filter, skip, limit });
  return { data, pagination: buildPagination(total, page, limit) };
}

export async function getPaymentById(id) {
  const payment = await paymentRepo.findById(id);
  if (!payment) throw new AppError('Payment not found.', 404);
  return payment;
}

export async function recordPayment(body, userId) {
  const { studentId, feeId, amount } = body;

  // Validate student
  const student = await studentRepo.findById(studentId);
  if (!student) throw new AppError('Student not found.', 404);

  // Validate fee structure
  const fee = await feeRepo.findById(feeId);
  if (!fee) throw new AppError('Fee structure not found.', 404);

  // Overpayment prevention
  const totalPaid = await paymentRepo.getTotalPaidForFee(studentId, feeId);
  const remaining = fee.amount - totalPaid;

  if (remaining <= 0) {
    throw new AppError(`Fee "${fee.category}" has already been fully paid for this student.`, 409);
  }

  if (amount > remaining) {
    throw new AppError(
      `Payment amount (${amount}) exceeds remaining balance (${remaining}) for fee "${fee.category}".`,
      400
    );
  }

  const receiptNumber = await generateReceiptNumber();

  return paymentRepo.create({
    receiptNumber,
    studentId,
    feeId,
    classId:      body.classId || fee.classId,
    academicYear: body.academicYear || fee.academicYear,
    amount,
    paymentMethod: body.paymentMethod,
    paymentDate:   body.paymentDate || new Date(),
    status:        body.status || 'completed',
    transactionId: body.transactionId || '',
    remarks:       body.remarks || '',
    collectedBy:   userId,
  });
}

export async function getPendingFees(studentId) {
  const student = await studentRepo.findById(studentId);
  if (!student) throw new AppError('Student not found.', 404);

  // Get all fees for this student's class and academic year
  const fees = await feeRepo.findByClass(
    String(student.classId?._id || student.classId),
    student.academicYear
  );

  const result = [];
  for (const fee of fees) {
    const paid      = await paymentRepo.getTotalPaidForFee(studentId, String(fee._id));
    const remaining = fee.amount - paid;
    const isOverdue = new Date(fee.dueDate) < new Date() && remaining > 0;

    result.push({
      fee,
      totalAmount: fee.amount,
      paid,
      remaining,
      isOverdue,
    });
  }

  const totalDue     = result.reduce((s, r) => s + r.totalAmount, 0);
  const totalPaid    = result.reduce((s, r) => s + r.paid, 0);
  const totalPending = result.reduce((s, r) => s + r.remaining, 0);

  return { student: { _id: student._id, name: `${student.firstName} ${student.lastName}`, studentId: student.studentId }, fees: result, summary: { totalDue, totalPaid, totalPending } };
}

export async function getPaymentSummary(query) {
  const filter = {};
  if (query.academicYear) filter.academicYear = query.academicYear;
  if (query.classId)      filter.classId = new (await import('mongoose')).default.Types.ObjectId(query.classId);

  const totalCollected = await paymentRepo.getTotalCollected(filter);
  const recentPayments = await paymentRepo.getRecent(5);

  return { totalCollected, recentPayments };
}
