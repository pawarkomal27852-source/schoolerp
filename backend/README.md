# SchoolERP — Backend

Express.js REST API for the SchoolERP school management platform.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | ≥18.0 | Runtime |
| Express | 4.x | HTTP framework |
| MongoDB | Cloud (Atlas) | Database |
| Mongoose | 8.x | ODM |
| jsonwebtoken | 9.x | JWT signing/verification |
| bcryptjs | 2.x | Password hashing |
| express-validator | 7.x | Request validation |
| helmet | 7.x | HTTP security headers |
| cors | 2.x | Cross-origin resource sharing |
| morgan | 1.x | HTTP request logging |
| dotenv | 16.x | Environment variable loading |

---

## Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js        Mongoose connection helper
│   │   └── env.js             Centralised env access + startup validation
│   ├── controllers/           HTTP handlers — parse req, call service, send res
│   ├── middleware/
│   │   ├── auth.js            JWT protect + authorize(roles) middleware
│   │   ├── errorHandler.js    AppError class + global error handler
│   │   └── validate.js        express-validator result collector
│   ├── models/                Mongoose schema + model definitions
│   ├── repositories/          All database queries (no Mongoose outside here)
│   ├── routes/                Express Router definitions per resource
│   ├── services/              Business logic (no req/res objects)
│   ├── validators/            express-validator rule arrays per endpoint
│   ├── utils/
│   │   ├── asyncHandler.js    Wraps async controllers to forward errors
│   │   └── apiResponse.js     Standardised JSON response helpers
│   ├── constants/
│   │   ├── roles.js           User role constants
│   │   └── httpStatus.js      HTTP status code constants
│   ├── docs/                  OpenAPI / Swagger specs per module
│   └── app.js                 Express app setup (middleware stack + route mounting)
├── server.js                  Entry point — connects DB, starts HTTP server
├── package.json               Dependencies and scripts
├── .env.example               Environment variable template
├── .gitignore                 Git exclusion rules
└── README.md                  This file
```

---

## Architecture

### Layered Pattern

Every domain module follows a strict 3-layer architecture:

```
HTTP Request
     │
     ▼
┌──────────────┐
│  Controller  │  Parses req, validates input, calls service, sends res
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Service    │  Business logic, orchestration, throws AppError on failure
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Repository  │  Mongoose queries — only layer that touches the DB
└──────────────┘
```

**Rule:** Nothing outside `repositories/` may import a Mongoose model or query the database directly.

### Request Lifecycle

```
Client Request
  → cors()
  → helmet()
  → morgan()
  → express.json()
  → Router match
    → protect()         (if protected route)
    → authorize()       (if role-restricted)
    → validator chain   (express-validator rules)
    → validate()        (collects errors → 422 if any)
    → asyncHandler(controller)
      → Service method
        → Repository query
        → AppError thrown on failure
      → sendSuccess() / sendPaginated()
  → globalErrorHandler (catches AppError + unexpected errors)
```

---

## Middleware Stack

| Middleware | File | Purpose |
|-----------|------|---------|
| `helmet()` | built-in | Sets security HTTP headers |
| `cors()` | built-in | Restricts origins to `CLIENT_URL` |
| `morgan()` | built-in | Logs HTTP requests |
| `express.json()` | built-in | Parses JSON request bodies |
| `protect` | `middleware/auth.js` | Verifies JWT Bearer token |
| `authorize(...roles)` | `middleware/auth.js` | Checks user role |
| validator chains | `validators/*.js` | express-validator rules |
| `validate` | `middleware/validate.js` | Collects validation errors |
| `asyncHandler` | `utils/asyncHandler.js` | Wraps async controllers |
| `globalErrorHandler` | `middleware/errorHandler.js` | Last-resort error formatter |

---

## JWT Authentication Flow

```
1. Client POSTs credentials to POST /api/v1/auth/login
2. Server verifies email + bcrypt password hash
3. Server signs JWT: { id, role, email } with JWT_SECRET, expires JWT_EXPIRES_IN
4. Client stores token (localStorage or httpOnly cookie)
5. Client sends token on every protected request:
   Authorization: Bearer <token>
6. protect() middleware verifies token, attaches decoded payload to req.user
7. authorize('admin') middleware checks req.user.role
8. Controller proceeds with req.user.id for scoped data access
```

---

## Error Handling Strategy

All errors flow through a single `globalErrorHandler` middleware.

### Throwing Errors in Services/Controllers

```js
import { AppError } from '../middleware/errorHandler.js';

// Known operational error → friendly message sent to client
throw new AppError('Student not found', 404);

// Programming errors (unhandled) → caught by globalErrorHandler
// → "Internal Server Error" in production (stack hidden)
// → full stack in development
```

### Response Shape on Error

```json
{
  "success": false,
  "message": "Student not found",
  "stack": "..."   // development only
}
```

---

## API Conventions

### Base URL
```
/api/v1
```

### Standard Response — Success
```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": [ ... ]
}
```

### Standard Response — Paginated
```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "total": 120,
    "page": 1,
    "limit": 20,
    "totalPages": 6
  }
}
```

### Standard Response — Error
```json
{
  "success": false,
  "message": "Student not found"
}
```

### HTTP Verb Conventions
| Verb | Usage |
|------|-------|
| `GET` | Fetch resource(s) |
| `POST` | Create resource |
| `PUT` | Full update |
| `PATCH` | Partial update |
| `DELETE` | Remove resource |

### Resource Naming
- Plural nouns: `/students`, `/classes`, `/payments`
- Nested: `/students/:id/attendance`

---

## Environment Variables

Copy `.env.example` to `.env` before running locally:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | HTTP server port |
| `MONGODB_URI` | **Yes** | — | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Secret key for JWT signing (min 32 chars) |
| `JWT_EXPIRES_IN` | No | `7d` | JWT token TTL |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed CORS origin |
| `NODE_ENV` | No | `development` | Runtime environment |

---

## Development Commands

Run all commands from inside the `backend/` directory:

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Lint source files
npm run lint
```

The server starts on `http://localhost:5000` by default.  
Health check endpoint: `GET http://localhost:5000/health`

---

## Adding a New Module

Follow this checklist for every new resource (e.g., `Subject`):

1. `src/models/Subject.js` — Mongoose schema
2. `src/repositories/subjectRepository.js` — DB queries
3. `src/services/subjectService.js` — business logic
4. `src/controllers/subjectController.js` — HTTP handlers
5. `src/validators/subjectValidator.js` — express-validator chains
6. `src/routes/subjectRoutes.js` — Router + middleware wiring
7. `src/app.js` — mount `app.use('/api/v1/subjects', subjectRoutes)`
8. `src/docs/subjects.yaml` — OpenAPI spec for the new routes
