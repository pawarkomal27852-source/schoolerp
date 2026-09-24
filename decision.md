# SchoolERP — Architecture Decision Records (ADR)

This file documents significant architectural and technology decisions made during the project.
Each entry explains the context, options considered, decision made, and the rationale.

---

## ADR-001 — Monorepo Structure

**Date:** 2026-09-24  
**Status:** Accepted

### Context
The project needed a clear separation between the React frontend and the Express backend
while keeping them in a single repository for easier collaboration and versioning.

### Options Considered
1. **Single repo, flat structure** — Frontend and backend files co-exist at root.
2. **Monorepo with workspace subfolders** — `frontend/` and `backend/` as separate app roots.
3. **Separate repositories** — One repo per application.

### Decision
Option 2 — Monorepo with `frontend/` and `backend/` subfolders.

### Rationale
- Single repository makes cloning and onboarding simpler.
- Separate `package.json` files per app ensures independent dependency management.
- Shared documentation at root level keeps project context centralised.
- Separate repos (Option 3) would complicate coordinating breaking API changes.

---

## ADR-002 — Frontend Technology Stack

**Date:** 2026-09-24  
**Status:** Accepted (existing, preserved from original project)

### Context
The frontend was already completed using a specific stack before this restructure.

### Decision
Preserve the existing stack: **React 19 + TypeScript + Vite 8 + Tailwind CSS v4**.

### Rationale
- Frontend is functionally complete — no justification for rewriting.
- React 19 with concurrent features is production-ready.
- Vite 8 provides fast HMR and optimal build output.
- Tailwind CSS v4 with the Vite plugin removes PostCSS configuration overhead.

---

## ADR-003 — State Management: React Context over Redux

**Date:** 2026-09-24  
**Status:** Accepted (existing, preserved from original project)

### Context
The frontend requires shared state for authentication, UI theme, and toast notifications.

### Decision
Use **React Context API** with custom provider components.

### Rationale
- The application has three discrete global state domains (auth, theme, toasts) —
  well-suited to Context without the overhead of Redux.
- Avoids adding Redux boilerplate for a project of this scale.
- If state complexity grows significantly, Zustand is the preferred migration path
  (lightweight, no boilerplate, Context-compatible).

---

## ADR-004 — Backend Architecture: Layered Repository Pattern

**Date:** 2026-09-24  
**Status:** Accepted

### Context
The Express backend needed a clear separation of concerns to keep controllers thin
and business logic testable in isolation.

### Decision
Use a **3-layer architecture**: Repository → Service → Controller.

### Rationale
- **Repository** layer isolates all Mongoose/database logic. Swapping the database
  only requires changes here.
- **Service** layer contains business rules with no HTTP coupling, making it
  unit-testable without spinning up Express.
- **Controller** layer handles only HTTP request parsing and response formatting.
- This pattern is widely understood and scales predictably as the codebase grows.

---

## ADR-005 — Authentication: Stateless JWT

**Date:** 2026-09-24  
**Status:** Accepted

### Context
The platform serves multiple user roles (admin, teacher, student, parent, accountant).
Each role has different data access permissions.

### Decision
Use **JWT (JSON Web Tokens)** for stateless authentication with role claims embedded
in the token payload.

### Rationale
- Stateless auth fits a REST API that may be deployed across multiple instances.
- Roles embedded in the token avoid a database lookup on every protected request.
- `jsonwebtoken` and `bcryptjs` are well-maintained, widely audited packages.
- Trade-off: tokens cannot be invalidated before expiry without a blocklist.
  Accepted for MVP; refresh token rotation will be added in Phase 1.

---

## ADR-006 — API Versioning: URI Prefix `/api/v1`

**Date:** 2026-09-24  
**Status:** Accepted

### Context
The API will evolve over time as new features are added. Frontend and backend
need to be deployable independently.

### Decision
Prefix all API routes with `/api/v1/`.

### Rationale
- URI versioning is the most explicit and widely understood approach.
- Allows introducing `/api/v2/` for breaking changes without impacting
  existing consumers.
- Simple to implement in Express with a single `app.use()` mount.

---

## ADR-007 — Database: MongoDB with Mongoose

**Date:** 2026-09-24  
**Status:** Accepted

### Context
The data model includes students, classes, attendance records, fees, and payments —
a mix of structured and semi-structured data.

### Decision
Use **MongoDB** as the primary database with **Mongoose** as the ODM.

### Rationale
- Flexible schema suits evolving school data requirements (e.g., custom fields per school).
- Mongoose provides schema validation, middleware hooks, and a familiar query API.
- MongoDB Atlas offers a managed cloud deployment path with a generous free tier.
- Well-integrated with the Node.js/Express ecosystem (MERN stack).

---

## ADR-008 — Error Handling: Custom `AppError` Class

**Date:** 2026-09-24  
**Status:** Accepted

### Context
Express needs a consistent way to handle both operational errors (bad input, not found)
and unexpected programming errors.

### Decision
Use a custom `AppError` class with an `isOperational` flag, combined with
a single global error handler middleware.

### Rationale
- Distinguishes known operational errors from programming bugs.
- Centralises all error response formatting in one place.
- `isOperational: true` allows the global handler to send friendly messages to clients
  while still logging unknown errors in full.
