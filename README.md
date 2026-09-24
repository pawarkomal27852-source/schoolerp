# SchoolERP — School Management Platform

A full-stack MERN school management system for handling students, classes,
attendance, fees, payments, reports, and institutional settings.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          MERN Stack                             │
│                                                                 │
│  ┌──────────────────────┐       ┌────────────────────────────┐  │
│  │      FRONTEND        │       │         BACKEND            │  │
│  │                      │       │                            │  │
│  │  React 19 + Vite 8   │──────▶│  Express 4 + Node.js 18+  │  │
│  │  TypeScript          │ HTTP  │  REST API  /api/v1         │  │
│  │  Tailwind CSS v4     │◀──────│  JWT Auth                  │  │
│  │  React Router v7     │  JSON │  Mongoose ODM              │  │
│  │  Axios               │       │  express-validator         │  │
│  └──────────────────────┘       └──────────────┬─────────────┘  │
│         localhost:3000                         │                │
│                                                ▼                │
│                                   ┌────────────────────────┐    │
│                                   │       DATABASE         │    │
│                                   │   MongoDB (Atlas)      │    │
│                                   └────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
SchoolERP/
│
├── frontend/                  React + TypeScript SPA
│   ├── src/
│   │   ├── components/        Reusable UI components
│   │   ├── context/           React Context providers (Auth, Theme, Toast)
│   │   ├── pages/             Page-level components per route
│   │   ├── routes/            Route definitions + ProtectedRoute guard
│   │   ├── services/          Axios service layer (one file per API domain)
│   │   └── utils/             Formatters, export helpers, mock data
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                   Express REST API
│   ├── src/
│   │   ├── config/            DB connection, env validation
│   │   ├── controllers/       HTTP request handlers
│   │   ├── middleware/        Auth, error handling, validation
│   │   ├── models/            Mongoose schemas
│   │   ├── repositories/      Database query layer
│   │   ├── routes/            Express Router definitions
│   │   ├── services/          Business logic layer
│   │   ├── validators/        express-validator rule chains
│   │   ├── utils/             asyncHandler, apiResponse helpers
│   │   ├── constants/         Roles, HTTP status codes
│   │   ├── docs/              OpenAPI / Swagger specs
│   │   └── app.js             Express app setup
│   ├── server.js              Entry point
│   └── package.json
│
├── docs/
│   ├── api/                   API endpoint documentation
│   ├── architecture/          System design diagrams
│   ├── database/              Schema and ER diagrams
│   └── deployment/            Deployment guides
│
├── phases.md                  10-phase development roadmap
├── memory.md                  Project knowledge base
├── rules.md                   Development conventions
├── decision.md                Architecture Decision Records
├── log.md                     Change log
├── README.md                  This file
└── .gitignore                 Root git exclusions
```

---

## Tech Stack

### Frontend
| Technology | Version | Role |
|------------|---------|------|
| React | 19 | UI framework |
| TypeScript | 7 | Type safety |
| Vite | 8 | Build tool |
| Tailwind CSS | v4 | Styling |
| React Router DOM | v7 | Routing |
| Axios | 1.x | HTTP client |
| Lucide React | 0.5x | Icons |
| Motion | 12.x | Animations |

### Backend
| Technology | Version | Role |
|------------|---------|------|
| Node.js | ≥18 | Runtime |
| Express | 4.x | HTTP framework |
| MongoDB | Cloud | Database |
| Mongoose | 8.x | ODM |
| JWT | 9.x | Authentication |
| bcryptjs | 2.x | Password hashing |
| Helmet | 7.x | Security headers |

---

## Feature Modules

| Module | Frontend | Backend |
|--------|----------|---------|
| Authentication | ✅ Complete | 🔲 Phase 1 |
| Dashboard | ✅ Complete | 🔲 Phase 7 |
| Students | ✅ Complete | 🔲 Phase 2 |
| Classes | ✅ Complete | 🔲 Phase 3 |
| Attendance | ✅ Complete | 🔲 Phase 4 |
| Fees | ✅ Complete | 🔲 Phase 5 |
| Payments | ✅ Complete | 🔲 Phase 5 |
| Parents | ✅ Complete | 🔲 Phase 6 |
| Timetable | ✅ Complete | 🔲 Phase 3 |
| Reports | ✅ Complete | 🔲 Phase 7 |
| Settings | ✅ Complete | 🔲 Phase 1 |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18.0.0
- npm ≥ 9 or Bun
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/SchoolERP.git
cd SchoolERP
```

### 2. Set Up the Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env and set VITE_API_URL
npm run dev
```

Frontend runs at: `http://localhost:3000`

### 3. Set Up the Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET (required)
npm run dev
```

Backend runs at: `http://localhost:5000`  
Health check: `http://localhost:5000/health`

---

## Running the Applications

Both apps are independent — run them in separate terminals:

```bash
# Terminal 1 — Frontend
cd frontend && npm run dev

# Terminal 2 — Backend
cd backend && npm run dev
```

---

## Environment Variables

### frontend/.env
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### backend/.env
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/schoolerp
JWT_SECRET=your-super-secret-key-minimum-32-characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

---

## Development Roadmap

See [`phases.md`](./phases.md) for the full 10-phase plan.

| Phase | Scope | Status |
|-------|-------|--------|
| 0 | Project scaffolding + monorepo setup | ✅ Complete |
| 1 | Backend foundation (DB, auth, middleware) | 🔲 Planned |
| 2 | Student module API | 🔲 Planned |
| 3 | Classes + Timetable API | 🔲 Planned |
| 4 | Attendance API | 🔲 Planned |
| 5 | Fees + Payments API | 🔲 Planned |
| 6 | Parents API | 🔲 Planned |
| 7 | Reports API | 🔲 Planned |
| 8 | Frontend ↔ Backend integration | 🔲 Planned |
| 9 | Testing | 🔲 Planned |
| 10 | Deployment | 🔲 Planned |

---

## Deployment Overview

### Frontend
Deploy the Vite build output (`frontend/dist/`) to any static host:
- [Vercel](https://vercel.com) — zero-config, recommended
- [Netlify](https://netlify.com)
- AWS S3 + CloudFront

```bash
cd frontend && npm run build
```

### Backend
Deploy the Express server to any Node.js host:
- [Render](https://render.com) — free tier available
- [Railway](https://railway.app)
- AWS EC2 / Elastic Beanstalk

Set all environment variables in the deployment target's secret manager.

### Database
- [MongoDB Atlas](https://cloud.mongodb.com) — managed cloud MongoDB
- Whitelist the backend server IP in Atlas Network Access settings.

---

## Project Documentation

| File | Purpose |
|------|---------|
| [`phases.md`](./phases.md) | 10-phase development roadmap |
| [`memory.md`](./memory.md) | Project knowledge base and technical context |
| [`rules.md`](./rules.md) | Coding standards and conventions |
| [`decision.md`](./decision.md) | Architecture Decision Records (ADR) |
| [`log.md`](./log.md) | Chronological change log |
| [`frontend/README.md`](./frontend/README.md) | Frontend architecture deep-dive |
| [`backend/README.md`](./backend/README.md) | Backend architecture deep-dive |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit using Conventional Commits: `feat(students): add bulk enrolment`
4. Push and open a Pull Request against `main`
5. Ensure all existing tests pass before requesting review

---

## License

MIT License — see `LICENSE` for details.

---

## Contributors

| Name | Role |
|------|------|
| — | Full Stack Developer |

*Add your name here when you contribute.*
"# schoolerp" 
