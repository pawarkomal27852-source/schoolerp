# API Documentation

This folder contains documentation for all SchoolERP REST API endpoints.

## Structure

Each module gets its own file as it is built:

```
docs/api/
├── README.md          This file
├── auth.md            Authentication endpoints (login, register, refresh)
├── students.md        Student CRUD endpoints
├── classes.md         Class management endpoints
├── attendance.md      Attendance endpoints
├── fees.md            Fee structure and collection endpoints
├── payments.md        Payment recording endpoints
├── parents.md         Parent management endpoints
├── timetable.md       Timetable endpoints
└── reports.md         Report generation endpoints
```

## Conventions

All endpoints follow this base path: `/api/v1`

### Response Format

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { } | [ ],
  "pagination": { "total": 0, "page": 1, "limit": 20, "totalPages": 0 }
}
```

### Authentication

Protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

Unauthenticated requests return `401 Unauthorized`.
