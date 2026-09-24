import mongoose from 'mongoose';

/**
 * Single-document collection — only ever one record in the DB.
 * Use findOneAndUpdate with upsert: true to always get/update it.
 */
const schoolSettingsSchema = new mongoose.Schema(
  {
    // Singleton sentinel — always "default"
    singleton: { type: String, default: 'default', unique: true },

    schoolName: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
      maxlength: [200, 'School name cannot exceed 200 characters'],
    },
    tagline:   { type: String, trim: true, maxlength: 300, default: '' },
    email:     {
      type: String, trim: true, lowercase: true, default: '',
      match: [/^(\S+@\S+\.\S+)?$/, 'Please provide a valid email address'],
    },
    phone:     { type: String, trim: true, default: '' },
    website:   { type: String, trim: true, default: '' },
    logo:      { type: String, trim: true, default: '' },

    address: {
      street:  { type: String, trim: true, default: '' },
      city:    { type: String, trim: true, default: '' },
      state:   { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: 'India' },
      pincode: { type: String, trim: true, default: '' },
    },

    currentAcademicYear: {
      type: String,
      trim: true,
      match: [/^(\d{4}-\d{4})?$/, 'Academic year must be in format YYYY-YYYY'],
      default: '',
    },

    currency:     { type: String, trim: true, default: 'INR' },
    timezone:     { type: String, trim: true, default: 'Asia/Kolkata' },
    dateFormat:   { type: String, trim: true, default: 'DD/MM/YYYY' },
    workingDays:  {
      type: [String],
      default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    },
  },
  { timestamps: true }
);

const SchoolSettings = mongoose.model('SchoolSettings', schoolSettingsSchema);
export default SchoolSettings;
