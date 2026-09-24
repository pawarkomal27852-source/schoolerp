import mongoose from 'mongoose';

const FEE_CATEGORIES = ['tuition', 'transport', 'library', 'laboratory', 'sports', 'examination', 'miscellaneous'];

const feeSchema = new mongoose.Schema(
  {
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
    category: {
      type: String,
      required: [true, 'Fee category is required'],
      enum: {
        values: FEE_CATEGORIES,
        message: `Category must be one of: ${FEE_CATEGORIES.join(', ')}`,
      },
    },
    amount: {
      type: Number,
      required: [true, 'Fee amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    isActive: { type: Boolean, default: true },
    // Soft delete
    isDeleted: { type: Boolean, default: false, select: false },
    deletedAt: { type: Date,    default: null,  select: false },
  },
  { timestamps: true }
);

// ── Unique: one fee category per class per academic year ───────────────────
feeSchema.index({ classId: 1, academicYear: 1, category: 1 }, { unique: true });
feeSchema.index({ academicYear: 1 });
feeSchema.index({ classId: 1 });
feeSchema.index({ isDeleted: 1 });

export const FEE_CATEGORIES_LIST = FEE_CATEGORIES;

const Fee = mongoose.model('Fee', feeSchema);
export default Fee;
