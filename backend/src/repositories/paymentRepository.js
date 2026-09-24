import mongoose from 'mongoose';
import Payment  from '../models/Payment.js';

const POPULATE = [
  { path: 'studentId',  select: 'firstName lastName studentId' },
  { path: 'feeId',      select: 'category amount academicYear' },
  { path: 'classId',    select: 'name section' },
  { path: 'collectedBy', select: 'name email' },
];

export async function findAll({ filter = {}, skip = 0, limit = 50, sort = { paymentDate: -1 } }) {
  const [data, total] = await Promise.all([
    Payment.find(filter).populate(POPULATE).sort(sort).skip(skip).limit(limit).lean(),
    Payment.countDocuments(filter),
  ]);
  return { data, total };
}

export async function findById(id) {
  return Payment.findById(id).populate(POPULATE);
}

export async function findByReceiptNumber(receiptNumber) {
  return Payment.findOne({ receiptNumber: receiptNumber.toUpperCase() });
}

/** Total amount paid by a student for a specific fee */
export async function getTotalPaidForFee(studentId, feeId) {
  const result = await Payment.aggregate([
    { $match: {
      studentId: new mongoose.Types.ObjectId(studentId),
      feeId:     new mongoose.Types.ObjectId(feeId),
      status:    'completed',
    }},
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result[0]?.total || 0;
}

/** Total collected for a class in an academic year */
export async function getTotalCollectedForClass(classId, academicYear) {
  const result = await Payment.aggregate([
    { $match: {
      classId:      new mongoose.Types.ObjectId(classId),
      academicYear,
      status:       'completed',
    }},
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result[0]?.total || 0;
}

/** Recent payments with limit */
export async function getRecent(limit = 10) {
  return Payment.find({ status: 'completed' })
    .populate(POPULATE)
    .sort({ paymentDate: -1 })
    .limit(limit)
    .lean();
}

export async function create(data) {
  return Payment.create(data);
}

export async function getTotalCollected(filter = {}) {
  const match = { status: 'completed', ...filter };
  const result = await Payment.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result[0]?.total || 0;
}
