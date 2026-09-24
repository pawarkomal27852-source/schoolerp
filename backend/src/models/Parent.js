import mongoose from 'mongoose';

const parentSchema = new mongoose.Schema(
  {
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
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\+?[1-9]\d{6,14}$/, 'Please provide a valid phone number'],
    },
    alternatePhone: {
      type: String,
      trim: true,
      default: '',
      match: [/^(\+?[1-9]\d{6,14})?$/, 'Please provide a valid alternate phone number'],
    },
    relationship: {
      type: String,
      required: [true, 'Relationship is required'],
      enum: {
        values: ['father', 'mother', 'guardian', 'other'],
        message: 'Relationship must be: father, mother, guardian, or other',
      },
    },
    address: {
      street:  { type: String, trim: true, default: '' },
      city:    { type: String, trim: true, default: '' },
      state:   { type: String, trim: true, default: '' },
      pincode: { type: String, trim: true, default: '' },
    },
    occupation: {
      type: String,
      trim: true,
      maxlength: [100, 'Occupation cannot exceed 100 characters'],
      default: '',
    },
    isActive: { type: Boolean, default: true },
    // Soft delete
    isDeleted: { type: Boolean, default: false, select: false },
    deletedAt: { type: Date,    default: null,  select: false },
  },
  { timestamps: true }
);

// ── Virtual: full name ─────────────────────────────────────────────────────
parentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

parentSchema.set('toJSON',   { virtuals: true });
parentSchema.set('toObject', { virtuals: true });

// ── Indexes ────────────────────────────────────────────────────────────────
parentSchema.index({ email: 1 });
parentSchema.index({ phone: 1 });
parentSchema.index({ isActive: 1 });
parentSchema.index({ isDeleted: 1 });
parentSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

const Parent = mongoose.model('Parent', parentSchema);
export default Parent;
