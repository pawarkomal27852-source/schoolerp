import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9-]+$/, 'Student ID may only contain letters, numbers, and hyphens'],
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['male', 'female', 'other'],
        message: 'Gender must be: male, female, or other',
      },
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
      match: [/^(\S+@\S+\.\S+)?$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      match: [/^(\+?[1-9]\d{6,14})?$/, 'Please provide a valid phone number'],
    },
    address: {
      street:  { type: String, trim: true, default: '' },
      city:    { type: String, trim: true, default: '' },
      state:   { type: String, trim: true, default: '' },
      pincode: { type: String, trim: true, default: '' },
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent',
      required: [true, 'Parent/Guardian is required'],
    },
    admissionDate: {
      type: Date,
      required: [true, 'Admission date is required'],
      default: Date.now,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
      match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'],
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'graduated', 'transferred', 'suspended'],
        message: 'Status must be: active, inactive, graduated, transferred, or suspended',
      },
      default: 'active',
    },
    bloodGroup: {
      type: String,
      enum: { values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''], message: 'Invalid blood group' },
      default: '',
    },
    photo: { type: String, default: '' },
    notes:  { type: String, trim: true, maxlength: [1000, 'Notes cannot exceed 1000 characters'], default: '' },

    // Soft delete
    isDeleted: { type: Boolean, default: false, select: false },
    deletedAt: { type: Date,    default: null,  select: false },
  },
  { timestamps: true }
);

// ── Virtuals ───────────────────────────────────────────────────────────────
studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});
studentSchema.set('toJSON',   { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

// ── Indexes ────────────────────────────────────────────────────────────────
studentSchema.index({ studentId: 1 }, { unique: true });
studentSchema.index({ classId: 1 });
studentSchema.index({ parentId: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ academicYear: 1 });
studentSchema.index({ isDeleted: 1 });
studentSchema.index({ firstName: 'text', lastName: 'text', studentId: 'text', email: 'text' });

const Student = mongoose.model('Student', studentSchema);
export default Student;
