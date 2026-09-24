import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
      maxlength: [50, 'Class name cannot exceed 50 characters'],
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
      uppercase: true,
      maxlength: [10, 'Section cannot exceed 10 characters'],
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
      trim: true,
      maxlength: [20, 'Grade cannot exceed 20 characters'],
    },
    capacity: {
      type: Number,
      required: [true, 'Class capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [200, 'Capacity cannot exceed 200'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
      match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY (e.g., 2025-2026)'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Soft delete
    isDeleted: { type: Boolean, default: false, select: false },
    deletedAt: { type: Date,    default: null,  select: false },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────────────────────────────────
classSchema.index({ name: 1, section: 1, academicYear: 1 }, { unique: true });
classSchema.index({ academicYear: 1 });
classSchema.index({ isActive: 1 });
classSchema.index({ isDeleted: 1 });
classSchema.index({ name: 'text', section: 'text', grade: 'text' });

const Class = mongoose.model('Class', classSchema);
export default Class;
