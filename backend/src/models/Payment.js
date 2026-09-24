import mongoose from 'mongoose';

const PAYMENT_METHODS  = ['cash', 'cheque', 'online', 'bank_transfer', 'upi'];
const PAYMENT_STATUSES = ['completed', 'pending', 'failed', 'refunded'];

const paymentSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: [true, 'Receipt number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    feeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fee',
      required: [true, 'Fee structure is required'],
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
      match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [1, 'Payment amount must be at least 1'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: PAYMENT_METHODS,
        message: `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`,
      },
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: PAYMENT_STATUSES,
        message: `Status must be one of: ${PAYMENT_STATUSES.join(', ')}`,
      },
      default: 'completed',
    },
    transactionId: { type: String, trim: true, default: '' },
    remarks:       { type: String, trim: true, maxlength: 500, default: '' },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Collected by user is required'],
    },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────────────────────────────────
paymentSchema.index({ receiptNumber: 1 }, { unique: true });
paymentSchema.index({ studentId: 1 });
paymentSchema.index({ feeId: 1 });
paymentSchema.index({ classId: 1 });
paymentSchema.index({ academicYear: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ status: 1 });

export const PAYMENT_METHODS_LIST  = PAYMENT_METHODS;
export const PAYMENT_STATUSES_LIST = PAYMENT_STATUSES;

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
