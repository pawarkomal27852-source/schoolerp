# SchoolERP — Change Log

Running log of all significant changes.
Format: `YYYY-MM-DD | Type | Scope | Description`

Types: `FEAT` | `FIX` | `REFACTOR` | `DOCS` | `CHORE` | `STYLE` | `TEST` | `DEPLOY`

---

## 2026-09-24 — Phase 0: Project Scaffolding

| Type | Scope | Description |
|------|-------|-------------|
| CHORE | root | Restructured project into MERN monorepo — `frontend/` and `backend/` separation |
| CHORE | frontend | Moved all existing React/Vite files into `frontend/` subfolder |
| CHORE | frontend | Updated `vite.config.ts` — `@` alias now resolves to `./src` |
| CHORE | frontend | Updated `tsconfig.json` — `paths` updated to `./src/*` |
| CHORE | frontend | Renamed `package.json` name from `react-example` to `schoolerp-frontend` |
| CHORE | frontend | Removed backend dependencies from frontend `package.json` |
| CHORE | backend | Initialised Express backend scaffold at `backend/` |
| DOCS | root | Created `phases.md`, `memory.md`, `rules.md`, `decision.md`, `log.md` |
| DOCS | frontend | Created `frontend/README.md` |
| DOCS | backend | Created `backend/README.md` |
| CHORE | root | Created `docs/` folder with api/, architecture/, database/, deployment/ |

---

## 2026-09-24 — Phase 1: Backend Foundation

| Type | Scope | Description |
|------|-------|-------------|
| CHORE | backend | Updated `package.json` — added `cookie-parser`, `express-mongo-sanitize`, `express-rate-limit` |
| FEAT | backend | `src/app.js` — full middleware stack: helmet, cors, mongoSanitize, cookieParser, morgan, rate limiter |
| FEAT | backend | `server.js` — async startup, env validation, graceful SIGTERM/SIGINT shutdown |
| FEAT | backend | `src/utils/logger.js` — structured logger with colour output in dev |
| FEAT | backend | `src/utils/apiResponse.js` — `sendSuccess`, `sendCreated`, `sendPaginated`, `buildPagination`, `sendError` |
| FEAT | backend | `src/utils/asyncHandler.js` — async controller wrapper |
| FEAT | backend | `src/middleware/errorHandler.js` — `AppError` class + full `globalErrorHandler` (Mongoose + JWT error transforms) |
| FEAT | backend | `src/middleware/validate.js` — express-validator result collector (returns 422) |
| FEAT | backend | `src/middleware/rateLimiter.js` — `apiLimiter` (100/15min) + `authLimiter` (10/15min) |
| FEAT | backend | `src/middleware/auth.js` — `protect()` + `authorize(...roles)` |
| FEAT | backend | `src/constants/httpStatus.js` — HTTP status constants |
| FEAT | backend | `src/constants/roles.js` — role constants + `ALL_ROLES` array |
| FEAT | backend | `src/routes/index.js` — central route loader |
| FEAT | backend | `GET /api/v1/health` — health check API |

---

## 2026-09-24 — Phase 2: Authentication Module

| Type | Scope | Description |
|------|-------|-------------|
| FEAT | auth | `models/User.js` — bcrypt pre-save hook, `comparePassword()`, `toPublicJSON()`, soft delete, indexes |
| FEAT | auth | `repositories/userRepository.js` — `findByEmailWithPassword`, `updateLastLogin` |
| FEAT | auth | `services/authService.js` — `login`, `getCurrentUser`, `seedAdminIfEmpty` |
| FEAT | auth | `validators/authValidator.js` — `loginValidator` |
| FEAT | auth | `controllers/authController.js` — `login`, `getMe`, `logout` |
| FEAT | auth | `routes/authRoutes.js` — rate-limited login, audit middleware |
| FEAT | server | `server.js` calls `seedAdminIfEmpty()` on startup — seeds `admin@schoolerp.com` if DB is empty |

---

## 2026-09-24 — Phase 3: Class Management

| Type | Scope | Description |
|------|-------|-------------|
| FEAT | classes | `models/Class.js` — unique index (name+section+academicYear), text search, soft delete |
| FEAT | classes | `repositories/classRepository.js` — full CRUD + `countAll` |
| FEAT | classes | `services/classService.js` — duplicate detection on create and update |
| FEAT | classes | `validators/classValidator.js` — create + update rules |
| FEAT | classes | `controllers/classController.js` |
| FEAT | classes | `routes/classRoutes.js` — all 5 endpoints protected |

---

## 2026-09-24 — Phase 4: Parent Management

| Type | Scope | Description |
|------|-------|-------------|
| FEAT | parents | `models/Parent.js` — phone regex, relationship enum, fullName virtual, soft delete |
| FEAT | parents | `repositories/parentRepository.js` |
| FEAT | parents | `services/parentService.js` — email uniqueness on create and update |
| FEAT | parents | `validators/parentValidator.js` — phone/email/relationship/address validation |
| FEAT | parents | `controllers/parentController.js` |
| FEAT | parents | `routes/parentRoutes.js` |

---

## 2026-09-24 — Phase 5: Student Management

| Type | Scope | Description |
|------|-------|-------------|
| FEAT | students | `models/Student.js` — unique studentId, class/parent refs, status enum, fullName virtual, soft delete |
| FEAT | students | `repositories/studentRepository.js` — populated queries, `findAllBasic` for dropdowns |
| FEAT | students | `utils/idGenerator.js` — `generateStudentId()` → `STU-YYYY-NNNN` |
| FEAT | students | `services/studentService.js` — class/parent validation, auto ID generation |
| FEAT | students | `validators/studentValidator.js` |
| FEAT | students | `controllers/studentController.js` — includes `getStudentsList` |
| FEAT | students | `routes/studentRoutes.js` — audit middleware on create/update/delete |

---

## 2026-09-24 — Phase 6: Attendance Module

| Type | Scope | Description |
|------|-------|-------------|
| FEAT | attendance | `models/Attendance.js` — compound unique index (studentId+date), status enum |
| FEAT | attendance | `repositories/attendanceRepository.js` — `bulkCreate`, `getClassAttendanceForDate`, `getStudentHistory` |
| FEAT | attendance | `services/attendanceService.js` — single mark, bulk mark, duplicate prevention, history, today summary |
| FEAT | attendance | `validators/attendanceValidator.js` — single, bulk, update validators |
| FEAT | attendance | `controllers/attendanceController.js` |
| FEAT | attendance | `routes/attendanceRoutes.js` |

---

## 2026-09-24 — Phase 7: Fee Structure

| Type | Scope | Description |
|------|-------|-------------|
| FEAT | fees | `models/Fee.js` — unique (classId+academicYear+category), FEE_CATEGORIES constant |
| FEAT | fees | `repositories/feeRepository.js` — `findByClass`, `getTotalFeeForClass` |
| FEAT | fees | `services/feeService.js` — duplicate prevention on create and update |
| FEAT | fees | `validators/feeValidator.js` |
| FEAT | fees | `controllers/feeController.js` |
| FEAT | fees | `routes/feeRoutes.js` |

---

## 2026-09-24 — Phase 8: Payment Module

| Type | Scope | Description |
|------|-------|-------------|
| FEAT | payments | `models/Payment.js` — unique receiptNumber, paymentMethod enum, indexes |
| FEAT | payments | `repositories/paymentRepository.js` — `getTotalPaidForFee`, `getRecent`, `getTotalCollected` |
| FEAT | payments | `utils/receiptGenerator.js` — `generateReceiptNumber()` → `RCP-YYYY-NNNNNN` |
| FEAT | payments | `services/paymentService.js` — overpayment prevention, pending fee calc per student |
| FEAT | payments | `validators/paymentValidator.js` |
| FEAT | payments | `controllers/paymentController.js` |
| FEAT | payments | `routes/paymentRoutes.js` — audit middleware on record payment |

---

## 2026-09-24 — Phase 9: Dashboard

| Type | Scope | Description |
|------|-------|-------------|
| FEAT | dashboard | `services/dashboardService.js` — parallel Promise.all aggregations |
| FEAT | dashboard | `controllers/dashboardController.js` |
| FEAT | dashboard | `routes/dashboardRoutes.js` — `GET /api/v1/dashboard` |

---

## 2026-09-24 — Phase 10: Reports

| Type | Scope | Description |
|------|-------|-------------|
| FEAT | reports | `services/reportService.js` — 3 aggregation pipeline reports (students/attendance/fees) |
| FEAT | reports | `controllers/reportController.js` |
| FEAT | reports | `routes/reportRoutes.js` — 3 GET endpoints |

---

## 2026-09-24 — Phase 11: Settings

| Type | Scope | Description |
|------|-------|-------------|
| FEAT | settings | `models/SchoolSettings.js` — singleton pattern (`singleton: 'default'`) |
| FEAT | settings | `repositories/settingsRepository.js` — `upsertSettings` |
| FEAT | settings | `services/settingsService.js` |
| FEAT | settings | `validators/settingsValidator.js` |
| FEAT | settings | `controllers/settingsController.js` |
| FEAT | settings | `routes/settingsRoutes.js` — PUT restricted to admin role, audit wired |

---

## 2026-09-24 — Phase 12: Audit Logging

| Type | Scope | Description |
|------|-------|-------------|
| FEAT | audit | `models/AuditLog.js` — module/action enums, userId/recordId refs, read-only |
| FEAT | audit | `utils/auditLogger.js` — `createAuditLog()` helper + `auditMiddleware()` Express factory |
| FEAT | audit | Wired into: auth routes (login/logout), student routes (create/update/delete), payment routes (create), settings routes (update) |

---

## Pending Tasks

- [ ] Run `npm install` inside `backend/` to install all dependencies
- [ ] Create `.env` from `.env.example` and fill in `MONGODB_URI` and `JWT_SECRET`
- [ ] Test all endpoints with Postman
- [ ] Phase 8 (Integration): update frontend service layer to call live APIs
- [ ] Phase 9 (Testing): write Jest unit and integration tests
- [ ] Phase 10 (Deployment): deploy backend to Render, frontend to Vercel

<!-- Add future entries above this line -->
