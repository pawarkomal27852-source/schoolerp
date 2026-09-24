# SchoolERP — Project Memory

This file serves as a persistent knowledge base for the project.
Record important decisions, gotchas, environment notes, and any context
that future sessions or new team members need to understand.

---

## Project Identity

| Key | Value |
|-----|-------|
| Project Name | SchoolERP — School Management Platform |
| Architecture | MERN (MongoDB, Express, React, Node.js) |
| Frontend Framework | React 19 + TypeScript + Vite 8 |
| Styling | Tailwind CSS v4 (Vite plugin, no PostCSS config needed) |
| State Management | React Context API (AuthContext, ThemeContext, ToastContext) |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| Backend Framework | Express 4 |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Backend Language | JavaScript ES Modules (not TypeScript) |

---

## Monorepo Structure

```
SchoolERP/
├── frontend/   React + Vite SPA (complete)
├── backend/    Express REST API (complete — Phases 1–12)
├── docs/       Architecture, API, DB, Deployment docs
└── *.md        Project management files
```

Frontend and backend are completely independent — separate `package.json`,
separate `node_modules`, separate environment files.

---

## Backend Architecture

### Pattern: Repository → Service → Controller

```
HTTP Request
  → Middleware stack (helmet, cors, mongoSanitize, morgan, rateLimiter)
  → Router (src/routes/index.js → module routes)
  → protect() / authorize() middleware
  → validator chain (express-validator)
  → validate() middleware (collects errors → 422)
  → auditMiddleware() (wraps res.json to log after success)
  → asyncHandler(controller)
    → Service (business logic)
      → Repository (Mongoose queries)
    → sendSuccess() / sendCreated() / sendPaginated()
  → globalErrorHandler (AppError + Mongoose/JWT transform)
```

### Layer Responsibilities
| Layer | File Pattern | Responsibility |
|-------|-------------|----------------|
| Model | `models/Foo.js` | Mongoose schema, indexes, virtuals, instance methods |
| Repository | `repositories/fooRepository.js` | All DB queries — no business logic |
| Service | `services/fooService.js` | Business logic, validation, throws AppError |
| Validator | `validators/fooValidator.js` | express-validator rule arrays |
| Controller | `controllers/fooController.js` | Parse req → call service → sendSuccess |
| Route | `routes/fooRoutes.js` | Router, middleware wiring |

---

## Backend File Inventory

### `src/`
```
app.js                      Express app setup
config/
  database.js               connectDB() — Mongoose connection
  env.js                    Centralised env access (legacy, superseded by server.js validation)
constants/
  httpStatus.js             HTTP.OK, HTTP.CREATED etc.
  roles.js                  ROLES.ADMIN, ROLES.TEACHER etc. + ALL_ROLES
controllers/
  authController.js         login, getMe, logout
  classController.js        getAllClasses, getClassById, createClass, updateClass, deleteClass
  parentController.js       getAllParents, getParentById, createParent, updateParent, deleteParent
  studentController.js      getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent, getStudentsList
  attendanceController.js   markAttendance, markBulkAttendance, updateAttendance, getAttendanceHistory, getTodayClassAttendance
  feeController.js          getAllFees, getFeeById, getFeesByClass, createFee, updateFee, deleteFee
  paymentController.js      getAllPayments, getPaymentById, recordPayment, getPendingFees, getPaymentSummary
  dashboardController.js    getDashboard
  reportController.js       getStudentSummaryReport, getAttendanceSummaryReport, getFeeSummaryReport
  settingsController.js     getSettings, updateSettings
middleware/
  auth.js                   protect(), authorize(...roles)
  errorHandler.js           AppError class, globalErrorHandler, notFound
  rateLimiter.js            apiLimiter (100/15min), authLimiter (10/15min)
  validate.js               express-validator result collector → 422
models/
  User.js                   admin/teacher/accountant/parent/student roles, bcrypt, soft delete
  Class.js                  unique(name+section+academicYear), soft delete
  Parent.js                 phone regex, fullName virtual, soft delete
  Student.js                unique studentId, classId+parentId refs, fullName virtual, soft delete
  Attendance.js             unique(studentId+date), present/absent/late/excused
  Fee.js                    unique(classId+academicYear+category), amount, dueDate
  Payment.js                unique receiptNumber, feeId+studentId refs, overpayment logic in service
  SchoolSettings.js         singleton(singleton:'default'), upsert pattern
  AuditLog.js               module/action enums, userId/recordId, immutable
repositories/
  userRepository.js
  classRepository.js
  parentRepository.js
  studentRepository.js      findAllBasic() for dropdown lists
  attendanceRepository.js   bulkCreate(), getClassAttendanceForDate(), getStudentHistory()
  feeRepository.js          findByClass(), getTotalFeeForClass()
  paymentRepository.js      getTotalPaidForFee(), getRecent(), getTotalCollected()
  settingsRepository.js     upsertSettings()
routes/
  index.js                  Central mount: all module routes at /api/v1/*
  authRoutes.js
  classRoutes.js
  parentRoutes.js
  studentRoutes.js
  attendanceRoutes.js
  feeRoutes.js
  paymentRoutes.js
  dashboardRoutes.js
  reportRoutes.js
  settingsRoutes.js
services/
  authService.js            login, getCurrentUser, seedAdminIfEmpty
  classService.js
  parentService.js
  studentService.js
  attendanceService.js
  feeService.js
  paymentService.js         overpayment prevention, pending fee calc, receipt generation
  dashboardService.js       parallel Promise.all aggregations
  reportService.js          3 aggregation pipeline reports
  settingsService.js
utils/
  asyncHandler.js           asyncHandler(fn) — wraps async controllers
  apiResponse.js            sendSuccess, sendCreated, sendPaginated, buildPagination, sendError
  logger.js                 info/warn/error/debug — colour in dev, plain in prod
  idGenerator.js            generateStudentId() → STU-YYYY-NNNN
  receiptGenerator.js       generateReceiptNumber() → RCP-YYYY-NNNNNN
  auditLogger.js            createAuditLog(), auditMiddleware() factory
validators/
  authValidator.js
  classValidator.js
  parentValidator.js
  studentValidator.js
  attendanceValidator.js
  feeValidator.js
  paymentValidator.js
  settingsValidator.js
docs/                       Empty — OpenAPI specs to be added per module
```

---

## API Endpoint Reference

All routes prefixed: `/api/v1`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | Public | Server health check |
| POST | `/auth/login` | Public | Login |
| GET  | `/auth/me` | JWT | Current user |
| POST | `/auth/logout` | JWT | Logout |
| GET  | `/classes` | JWT | List classes |
| POST | `/classes` | JWT | Create class |
| GET  | `/classes/:id` | JWT | Get class |
| PUT  | `/classes/:id` | JWT | Update class |
| DELETE | `/classes/:id` | JWT | Delete class |
| GET  | `/parents` | JWT | List parents |
| POST | `/parents` | JWT | Create parent |
| GET  | `/parents/:id` | JWT | Get parent |
| PUT  | `/parents/:id` | JWT | Update parent |
| DELETE | `/parents/:id` | JWT | Delete parent |
| GET  | `/students` | JWT | List students |
| POST | `/students` | JWT | Create student |
| GET  | `/students/list` | JWT | Dropdown list |
| GET  | `/students/:id` | JWT | Get student |
| PUT  | `/students/:id` | JWT | Update student |
| DELETE | `/students/:id` | JWT | Delete student |
| POST | `/attendance` | JWT | Mark attendance |
| POST | `/attendance/bulk` | JWT | Bulk mark |
| PUT  | `/attendance/:id` | JWT | Update record |
| GET  | `/attendance/history` | JWT | History |
| GET  | `/attendance/today/:classId` | JWT | Today summary |
| GET  | `/fees` | JWT | List fees |
| POST | `/fees` | JWT | Create fee |
| GET  | `/fees/class/:classId` | JWT | Class fees |
| GET  | `/fees/:id` | JWT | Get fee |
| PUT  | `/fees/:id` | JWT | Update fee |
| DELETE | `/fees/:id` | JWT | Delete fee |
| GET  | `/payments` | JWT | List payments |
| POST | `/payments` | JWT | Record payment |
| GET  | `/payments/summary` | JWT | Totals |
| GET  | `/payments/pending/:studentId` | JWT | Pending fees |
| GET  | `/payments/:id` | JWT | Get payment |
| GET  | `/dashboard` | JWT | All KPIs |
| GET  | `/reports/students` | JWT | Student report |
| GET  | `/reports/attendance` | JWT | Attendance report |
| GET  | `/reports/fees` | JWT | Fee report |
| GET  | `/settings` | JWT | Get settings |
| PUT  | `/settings` | JWT + admin | Update settings |

---

## Business Rules Implemented

| Rule | Location |
|------|----------|
| One attendance record per student per date | `Attendance` model unique index + `attendanceService.markAttendance` |
| Overpayment prevention | `paymentService.recordPayment` — checks `getTotalPaidForFee` |
| Unique fee per class/category/year | `Fee` model unique index + `feeService.createFee` |
| Unique class per name+section+year | `Class` model unique index + `classService.createClass` |
| Auto-generate student ID | `utils/idGenerator.generateStudentId()` → `STU-YYYY-NNNN` |
| Auto-generate receipt number | `utils/receiptGenerator.generateReceiptNumber()` → `RCP-YYYY-NNNNNN` |
| Admin-only settings update | `settingsRoutes.js` — `authorize('admin')` |
| Seed first admin on empty DB | `authService.seedAdminIfEmpty()` called from `server.js` |
| Soft delete (never hard delete) | All models have `isDeleted + deletedAt` fields |
| All routes require JWT | `router.use(protect)` at top of each module router |

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Express server port |
| `NODE_ENV` | No | `development` | Runtime environment |
| `MONGODB_URI` | **Yes** | — | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | JWT signing key (min 32 chars) |
| `JWT_EXPIRES_IN` | No | `7d` | Token TTL |
| `CLIENT_URL` | No | `http://localhost:3000` | CORS allowed origin |
| `SEED_ADMIN_NAME` | No | `School Admin` | Default admin name |
| `SEED_ADMIN_EMAIL` | No | `admin@schoolerp.com` | Default admin email |
| `SEED_ADMIN_PASSWORD` | No | `Admin@12345` | Default admin password (CHANGE IN PRODUCTION) |

### Frontend (`frontend/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API base URL, e.g. `http://localhost:5000/api/v1` |

---

## Known Issues / Gotchas

- `node_modules` for the backend does not exist yet — run `npm install` inside `backend/` first.
- The `attendanceRepository.getClassSummary` uses a dynamic `import('mongoose')` for ObjectId — safe but consider importing at top of file when refactoring.
- `paymentService.getPaymentSummary` dynamically imports mongoose for ObjectId — same note.
- `authService.seedAdminIfEmpty` uses a dynamic import of the User model to avoid circular imports — intentional.
- Audit logs are fire-and-forget (`createAuditLog` never throws) — failures are logged via `logger.warn` only.
- The `SchoolSettings` singleton uses `singleton: 'default'` as a sentinel field; never pass `singleton` in update payloads.

---

## Session Log

| Date | Action |
|------|--------|
| 2026-09-24 | Initial project scaffolding — monorepo structure created |
| 2026-09-24 | Backend Phases 1–12 implemented — full MVP backend complete |
