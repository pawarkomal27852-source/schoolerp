# Architecture Documentation

This folder contains system design diagrams and architecture documentation for SchoolERP.

## Contents

```
docs/architecture/
├── README.md              This file
├── overview.md            High-level system architecture
├── frontend-architecture.md   React component and data-flow diagrams
├── backend-architecture.md    Express layered architecture
└── security-model.md          Authentication and authorization design
```

## Key Design Decisions

See [`decision.md`](../../decision.md) at the project root for Architecture Decision Records (ADRs).

### ADR Summary

| ADR | Decision |
|-----|---------|
| ADR-001 | Monorepo with frontend/ and backend/ subfolders |
| ADR-002 | React 19 + TypeScript + Vite 8 (preserved from original) |
| ADR-003 | React Context API for global state (no Redux) |
| ADR-004 | Repository → Service → Controller layered pattern |
| ADR-005 | Stateless JWT authentication with role claims |
| ADR-006 | URI versioning at /api/v1 |
| ADR-007 | MongoDB + Mongoose ODM |
| ADR-008 | Custom AppError class + global error handler |
