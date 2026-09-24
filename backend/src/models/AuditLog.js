import mongoose from 'mongoose';

const AUDIT_MODULES = ['auth', 'student', 'parent', 'class', 'attendance', 'fee', 'payment', 'settings', 'user'];
const AUDIT_ACTIONS = ['create', 'update', 'delete', 'login', 'logout', 'login_failed'];

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for unauthenticated events (e.g., failed login)
    },
    module: {
      type: String,
      required: [true, 'Module is required'],
      enum: { values: AUDIT_MODULES, message: `Module must be one of: ${AUDIT_MODULES.join(', ')}` },
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: { values: AUDIT_ACTIONS, message: `Action must be one of: ${AUDIT_ACTIONS.join(', ')}` },
    },
    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    metadata:  { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    // Audit logs should NEVER be updated or deleted — read only
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ module: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ recordId: 1 });
auditLogSchema.index({ createdAt: -1 });

export const AUDIT_MODULES_LIST = AUDIT_MODULES;
export const AUDIT_ACTIONS_LIST = AUDIT_ACTIONS;

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
