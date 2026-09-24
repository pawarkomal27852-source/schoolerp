# SchoolERP — Development Phases

This document tracks the planned development phases for the full MERN stack implementation.
Update this file as phases are completed or adjusted.

---

## Phase 0 — Project Scaffolding ✅

**Status:** Complete
**Completed:** 2026-09-24
**Goal:** Establish the monorepo structure and separate frontend/backend concerns.

### Deliverables
- [x] Move existing React frontend into `frontend/`
- [x] Scaffold Express backend folder structure in `backend/`
- [x] Separate `package.json` files for frontend and backend
- [x] Root-level documentation files created
- [x] `.env.example` files for both apps
- [x] `.gitignore` files configured

---

## Phase 1 — Backend Foundation ✅

**Status:** Complete
**Completed:** 2026-09-24
**Goal:** Set up the Express server, MongoDB connection, all middleware, logger, and global error handling.

### Deliverables
- [x] `package.json` updated — added `cookie-parser`, `express-mongo-sanitize`, `express-rate-limit`
- [x] `src/app.js` — helmet, cors, body-parser, mongoSanitize, rate limiter, morgan, route mounting
- [x] `server.js` — async startup with graceful shutdown (SIGTERM/SIGINT), env validation
- [x] `src/config/database.js` — Mongoose `connectDB()` helper
- [x] `src/utils/logger.js` — structured logger (info/warn/error/debug, colour in dev)
- [x] `src/utils/apiResponse.js` — `sendSuccess`, `sendCreated`, `sendPaginated`, `buildPagination`, `sendError`
- [x] `src/utils/asyncHandler.js` — async controller wrapper
- [x] `src/middleware/errorHandler.js` — `AppError` class + full `globalErrorHandler` (CastError, DuplicateKey, ValidationError, JWT transforms) + `notFound`
- [x] `src/middleware/validate.js` — express-validator error collector (422)
- [x] `src/middleware/rateLimiter.js` — `apiLimiter` (100/15min) + `authLimiter` (10/15min)
- [x] `src/middleware/auth.js` — `protect` + `authorize(...roles)` middleware
- [x] `src/constants/httpStatus.js` — HTTP status constants
- [x] `src/constants/roles.js` — role constants + `ALL_ROLES`
- [x] `src/routes/index.js` — central route loader for all modules
- [x] `GET /api/v1/health` — health check API

---

## Phase 2 — Authentication Module ✅

**Status:** Complete
**Completed:** 2026-09-24
**Goal:** Admin login with JWT, protected routes, current user endpoint, logout.

### Deliverables
- [x] `models/User.js` — schema with bcrypt pre-save hook, `comparePassword()`, `toPublicJSON()`, soft delete, indexes
- [x] `repositories/userRepository.js` — `findByEmailWithPassword`, `findById`, `findByEmail`, `createUser`, `updateLastLogin`
- [x] `services/authService.js` — `login`, `getCurrentUser`, `seedAdminIfEmpty`
- [x] `validators/authValidator.js` — `loginValidator`
- [x] `controllers/authController.js` — `login`, `getMe`, `logout`
- [x] `routes/authRoutes.js` — `authLimiter` on login, audit middleware wired
- [x] `server.js` — calls `seedAdminIfEmpty()` on startup; seeds `admin@schoolerp.com` if DB is empty

### APIs
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/v1/auth/login` | Public | Login with email + password |
| GET  | `/api/v1/auth/me`    | JWT   | Get current user profile |
| POST | `/api/v1/auth/logout` | JWT  | Logout (client discards token) |

---

## Phase 3 — Class Management ✅

**Status:** Complete
**Completed:** 2026-09-24
**Goal:** Full CRUD for class management with pagination, search, and soft delete.

### Deliverables
- [x] `models/Class.js` — compound unique index (name+section+academicYear), text search index, soft delete
- [x] `repositories/classRepository.js` — `findAll`, `findById`, `findOne`, `create`, `updateById`, `softDeleteById`, `countAll`
- [x] `services/classService.js` — CRUD with duplicate detection on create and update
- [x] `validators/classValidator.js` — create + update validators
- [x] `controllers/classController.js`
- [x] `routes/classRoutes.js` — all endpoints protected

### APIs
| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/api/v1/classes` | List with pagination, search, filters |
| POST   | `/api/v1/classes` | Create class |
| GET    | `/api/v1/classes/:id` | Get by ID |
| PUT    | `/api/v1/classes/:id` | Update |
| DELETE | `/api/v1/classes/:id` | Soft delete |

---

## Phase 4 — Parent Management ✅

**Status:** Complete
**Completed:** 2026-09-24
**Goal:** Full CRUD for parent management with phone/email validation, pagination, search.

### Deliverables
- [x] `models/Parent.js` — phone regex validation, fullName virtual, soft delete, text index
- [x] `repositories/parentRepository.js`
- [x] `services/parentService.js` — email uniqueness on create and update
- [x] `validators/parentValidator.js` — phone regex, relationship enum, address fields
- [x] `controllers/parentController.js`
- [x] `routes/parentRoutes.js`

### APIs
| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/api/v1/parents` | List with pagination + search |
| POST   | `/api/v1/parents` | Create parent |
| GET    | `/api/v1/parents/:id` | Get by ID |
| PUT    | `/api/v1/parents/:id` | Update |
| DELETE | `/api/v1/parents/:id` | Soft delete |

---

## Phase 5 — Student Management ✅

**Status:** Complete
**Completed:** 2026-09-24
**Goal:** Full CRUD with auto-generated student IDs, class/parent validation, soft delete, bulk list.

### Deliverables
- [x] `models/Student.js` — unique studentId, classId/parentId refs, status enum, fullName virtual, soft delete
- [x] `repositories/studentRepository.js` — populated queries, `findAllBasic` for dropdowns
- [x] `utils/idGenerator.js` — `generateStudentId()` → `STU-YYYY-NNNN`
- [x] `services/studentService.js` — class/parent validation, auto ID generation, `getStudentsList`
- [x] `validators/studentValidator.js`
- [x] `controllers/studentController.js` — includes `getStudentsList`
- [x] `routes/studentRoutes.js` — audit middleware on create/update/delete

### APIs
| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/api/v1/students` | List with pagination, search, filters |
| POST   | `/api/v1/students` | Create student (auto-generates ID) |
| GET    | `/api/v1/students/list` | Lightweight list for dropdowns |
| GET    | `/api/v1/students/:id` | Get full student profile |
| PUT    | `/api/v1/students/:id` | Update |
| DELETE | `/api/v1/students/:id` | Soft delete |

---

## Phase 6 — Attendance Module ✅

**Status:** Complete
**Completed:** 2026-09-24
**Goal:** Single and bulk attendance marking with duplicate prevention, history, and today summary.

### Deliverables
- [x] `models/Attendance.js` — compound unique index (studentId+date), status enum
- [x] `repositories/attendanceRepository.js` — `findByStudentAndDate`, `bulkCreate`, `getClassAttendanceForDate`, `getStudentHistory`, `getClassSummary`
- [x] `services/attendanceService.js` — `markAttendance`, `markBulkAttendance`, `updateAttendance`, `getAttendanceHistory`, `getTodayClassAttendance`
- [x] `validators/attendanceValidator.js` — single, bulk, update validators
- [x] `controllers/attendanceController.js`
- [x] `routes/attendanceRoutes.js`

### APIs
| Method | Route | Description |
|--------|-------|-------------|
| POST   | `/api/v1/attendance` | Mark single attendance |
| POST   | `/api/v1/attendance/bulk` | Mark bulk (entire class) |
| PUT    | `/api/v1/attendance/:id` | Update existing record |
| GET    | `/api/v1/attendance/history` | History with filters |
| GET    | `/api/v1/attendance/today/:classId` | Today's class attendance |

---

## Phase 7 — Fee Structure ✅

**Status:** Complete
**Completed:** 2026-09-24
**Goal:** CRUD for fee structures, unique per class/category/year.

### Deliverables
- [x] `models/Fee.js` — compound unique index (classId+academicYear+category), FEE_CATEGORIES constant
- [x] `repositories/feeRepository.js` — `findByClass`, `getTotalFeeForClass`
- [x] `services/feeService.js` — duplicate prevention on create and update
- [x] `validators/feeValidator.js`
- [x] `controllers/feeController.js`
- [x] `routes/feeRoutes.js`

### APIs
| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/api/v1/fees` | List all fees |
| POST   | `/api/v1/fees` | Create fee structure |
| GET    | `/api/v1/fees/class/:classId` | Get all fees for a class |
| GET    | `/api/v1/fees/:id` | Get by ID |
| PUT    | `/api/v1/fees/:id` | Update |
| DELETE | `/api/v1/fees/:id` | Soft delete |

---

## Phase 8 — Payment Module ✅

**Status:** Complete
**Completed:** 2026-09-24
**Goal:** Record payments, generate receipts, calculate pending fees, prevent overpayment.

### Deliverables
- [x] `models/Payment.js` — receiptNumber (unique), paymentMethod enum, status enum, indexes
- [x] `repositories/paymentRepository.js` — `getTotalPaidForFee`, `getTotalCollectedForClass`, `getRecent`, `getTotalCollected`
- [x] `utils/receiptGenerator.js` — `generateReceiptNumber()` → `RCP-YYYY-NNNNNN`
- [x] `services/paymentService.js` — overpayment prevention, pending fee calculation per student, summary
- [x] `validators/paymentValidator.js`
- [x] `controllers/paymentController.js`
- [x] `routes/paymentRoutes.js` — audit middleware on record

### APIs
| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/api/v1/payments` | List with filters |
| POST   | `/api/v1/payments` | Record payment |
| GET    | `/api/v1/payments/summary` | Totals summary |
| GET    | `/api/v1/payments/pending/:studentId` | Pending fees for student |
| GET    | `/api/v1/payments/:id` | Get by ID |

---

## Phase 9 — Dashboard ✅

**Status:** Complete
**Completed:** 2026-09-24
**Goal:** Aggregated KPIs in a single optimised API call.

### Deliverables
- [x] `services/dashboardService.js` — parallel aggregation queries (Promise.all)
- [x] `controllers/dashboardController.js`
- [x] `routes/dashboardRoutes.js`

### APIs
| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/api/v1/dashboard` | All KPIs: students, classes, attendance, fees, recent payments |

### Response includes
- Total/active students
- Total/active classes
- Today's attendance summary (present/absent/late/excused)
- Fee totals (defined/collected/pending)
- 5 most recent payments

---

## Phase 10 — Reports ✅

**Status:** Complete
**Completed:** 2026-09-24
**Goal:** Aggregation pipeline reports for students, attendance, and fees.

### Deliverables
- [x] `services/reportService.js` — `getStudentSummaryReport`, `getAttendanceSummaryReport`, `getFeeSummaryReport`
- [x] `controllers/reportController.js`
- [x] `routes/reportRoutes.js`

### APIs
| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/api/v1/reports/students` | Students by status/gender/class |
| GET    | `/api/v1/reports/attendance` | Attendance by status/class/daily trend (requires startDate+endDate) |
| GET    | `/api/v1/reports/fees` | Fee collection by category/month/class (requires academicYear) |

---

## Phase 11 — Settings ✅

**Status:** Complete
**Completed:** 2026-09-24
**Goal:** Single-document school settings with admin-only update.

### Deliverables
- [x] `models/SchoolSettings.js` — singleton pattern (`singleton: 'default'`), upsert-safe
- [x] `repositories/settingsRepository.js` — `getSettings`, `upsertSettings`
- [x] `services/settingsService.js`
- [x] `validators/settingsValidator.js`
- [x] `controllers/settingsController.js`
- [x] `routes/settingsRoutes.js` — PUT restricted to `admin` role, audit middleware wired

### APIs
| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/api/v1/settings` | Get school settings |
| PUT    | `/api/v1/settings` | Update settings (admin only) |

---

## Phase 12 — Audit Logging ✅

**Status:** Complete
**Completed:** 2026-09-24
**Goal:** Automatic audit trail for all significant actions.

### Deliverables
- [x] `models/AuditLog.js` — module/action enums, userId/recordId refs, indexes
- [x] `utils/auditLogger.js` — `createAuditLog()` async helper + `auditMiddleware()` Express factory
- [x] Wired into: `auth` (login/logout), `student` (create/update/delete), `payment` (create), `settings` (update)

### Logged Events
| Module | Actions |
|--------|---------|
| auth | login, logout |
| student | create, update, delete |
| payment | create |
| settings | update |

---

## Phase 8 (Integration) — Frontend ↔ Backend Integration

**Status:** Planned
**Goal:** Replace all frontend mock data with live API calls.

### Deliverables
- [ ] Axios instance configured with base URL + interceptors
- [ ] Auth token stored and sent with every request
- [ ] API service layer updated for all modules
- [ ] Loading, error, and empty states handled in UI
- [ ] `VITE_API_URL` wired to deployed backend URL

---

## Phase 9 (Testing) — Testing

**Status:** Planned
**Goal:** Unit and integration test coverage for critical paths.

### Deliverables
- [ ] Backend unit tests (Jest) for services and utilities
- [ ] Integration tests for auth and student API routes
- [ ] CI pipeline configured (GitHub Actions)

---

## Phase 10 (Deployment) — Deployment

**Status:** Planned
**Goal:** Production-ready deployment.

### Deliverables
- [ ] MongoDB Atlas production cluster
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Environment variables configured
- [ ] Custom domain and SSL
