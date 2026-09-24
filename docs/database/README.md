# Database Documentation

This folder contains MongoDB schema definitions, ER diagrams, and data model documentation.

## Contents

```
docs/database/
├── README.md          This file
├── erd.md             Entity Relationship Diagram
├── schemas/
│   ├── user.md        User collection schema
│   ├── student.md     Student collection schema
│   ├── class.md       Class collection schema
│   ├── attendance.md  Attendance collection schema
│   ├── fee.md         Fee structure and collection schemas
│   ├── payment.md     Payment collection schema
│   └── parent.md      Parent collection schema
└── indexes.md         Index strategy per collection
```

## Database

- **Provider:** MongoDB Atlas
- **ODM:** Mongoose 8.x
- **Database Name:** `schoolerp`

## Naming Conventions

| Rule | Example |
|------|---------|
| Collection names | Plural, lowercase | `students`, `classes` |
| Field names | camelCase | `firstName`, `enrollmentDate` |
| References (ObjectId) | `modelName` + `Id` suffix | `classId`, `studentId` |
| Timestamps | Always include `createdAt`, `updatedAt` via `{ timestamps: true }` |

## Schema Strategy

- All models use `{ timestamps: true }` for automatic `createdAt` / `updatedAt`.
- All `_id` fields are MongoDB `ObjectId` (auto-generated).
- Soft deletes: use `isDeleted: Boolean` + `deletedAt: Date` rather than removing documents.
- Validation: enforce at both Mongoose schema level and express-validator request level.
