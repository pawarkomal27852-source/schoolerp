# SchoolERP — Frontend

React + TypeScript single-page application for the SchoolERP school management platform.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI framework |
| TypeScript | 7 | Static typing |
| Vite | 8 | Build tool + dev server |
| Tailwind CSS | v4 | Utility-first styling |
| React Router DOM | v7 | Client-side routing |
| Axios | 1.x | HTTP client |
| Lucide React | 0.5x | Icon library |
| Motion | 12.x | Animations |

---

## Folder Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/        Reusable UI primitives (Button, StatusBadge, GlobalSearchModal)
│   │   ├── layout/        App shell (AppLayout, Header, Sidebar, BottomNav)
│   │   ├── modals/        Dialog components (ConfirmationModal, OnlinePaymentModal, QRAttendanceModal, StudentIdCardModal)
│   │   └── tables/        DataTable component
│   ├── context/
│   │   ├── AuthContext.jsx     Global authentication state
│   │   ├── ThemeContext.jsx    Dark/light mode state
│   │   └── ToastContext.jsx    Notification toast queue
│   ├── pages/
│   │   ├── auth/          Login page
│   │   ├── dashboard/     Overview dashboard
│   │   ├── students/      Student list, add, edit, details
│   │   ├── classes/       Class management
│   │   ├── attendance/    Attendance marking and history
│   │   ├── fees/          Fee structure, collection, pending
│   │   ├── payments/      Payment history
│   │   ├── parents/       Parent directory
│   │   ├── timetable/     Weekly schedule
│   │   ├── reports/       Analytics and reports
│   │   └── settings/      School configuration
│   ├── routes/
│   │   ├── AppRoutes.jsx      Central route definitions
│   │   └── ProtectedRoute.jsx Auth guard component
│   ├── services/
│   │   ├── api.js             Axios instance + interceptors
│   │   ├── authService.js
│   │   ├── studentService.js
│   │   ├── classService.js
│   │   ├── attendanceService.js
│   │   ├── feeService.js
│   │   ├── paymentService.js
│   │   ├── parentService.js
│   │   ├── reportService.js
│   │   ├── timetableService.js
│   │   └── settingsService.js
│   ├── utils/
│   │   ├── formatters.js      Date, currency, string formatters
│   │   ├── exportUtils.js     CSV/PDF export helpers
│   │   └── mockData.js        Temporary mock data (replace with API calls in Phase 8)
│   ├── App.tsx                Root component — wraps providers and router
│   ├── main.tsx               Entry point — renders App into #root
│   └── index.css              Global styles + Tailwind import
├── index.html                 Vite HTML template
├── vite.config.ts             Vite + Tailwind plugin configuration
├── tsconfig.json              TypeScript compiler options
├── package.json               Dependencies and scripts
├── .env.example               Environment variable template
├── .gitignore                 Git exclusion rules
└── README.md                  This file
```

---

## Architecture

### Component Hierarchy

```
App.tsx
└── BrowserRouter
    └── ThemeProvider
        └── AuthProvider
            └── ToastProvider
                └── AppRoutes
                    ├── /login → <Login />
                    └── ProtectedRoute
                        └── AppLayout
                            ├── Header
                            ├── Sidebar
                            ├── BottomNav (mobile)
                            └── <Page />  (outlet)
```

### State Management Strategy

Global state is managed with **React Context API** across three providers:

| Context | Location | Responsibility |
|---------|----------|---------------|
| `AuthContext` | `src/context/AuthContext.jsx` | Current user, login/logout, auth state |
| `ThemeContext` | `src/context/ThemeContext.jsx` | Dark/light mode toggle and persistence |
| `ToastContext` | `src/context/ToastContext.jsx` | Push and dismiss notification toasts |

Local component state uses `useState` and `useReducer`.
No external state library (Redux, Zustand) is used.

### Routing

All routes are defined in `src/routes/AppRoutes.jsx`.
Protected routes are wrapped with `ProtectedRoute` which reads `AuthContext`
and redirects to `/login` if the user is not authenticated.

```
/login                  Public
/                       Protected → Dashboard
/students               Protected → Students list
/students/add           Protected → Add student
/students/:id           Protected → Student details
/students/:id/edit      Protected → Edit student
/classes                Protected → Classes
/attendance             Protected → Mark attendance
/attendance/history     Protected → Attendance history
/fees                   Protected → Fee overview
/fees/structure         Protected → Fee structure
/fees/collection        Protected → Fee collection
/fees/pending           Protected → Pending fees
/payments               Protected → Payment history
/parents                Protected → Parents
/timetable              Protected → Timetable
/reports                Protected → Reports
/settings               Protected → Settings
```

---

## API Service Layer

All HTTP calls are abstracted behind service files in `src/services/`.
Components never call `axios` directly.

### Axios Instance (`src/services/api.js`)

- **Base URL** read from `VITE_API_URL` environment variable.
- **Request interceptor** attaches the JWT token from `localStorage`.
- **Response interceptor** handles 401 (token expired → redirect to login).

### Service File Pattern

```js
// Example: studentService.js
import api from './api';

export const getStudents = (params) => api.get('/students', { params });
export const getStudent  = (id)     => api.get(`/students/${id}`);
export const createStudent = (data) => api.post('/students', data);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id)   => api.delete(`/students/${id}`);
```

---

## Environment Variables

Copy `.env.example` to `.env` before running locally:

```bash
cp .env.example .env
```

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | Yes | Backend REST API base URL | `http://localhost:5000/api/v1` |

> All Vite environment variables **must** be prefixed with `VITE_` to be accessible in the browser.

---

## Development Commands

Run all commands from inside the `frontend/` directory:

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Type-check without emitting files
npm run lint

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Styling Guide

- **Framework:** Tailwind CSS v4 via the official Vite plugin.
- **Import:** `@import "tailwindcss"` in `src/index.css` (no `tailwind.config.js` needed).
- **Approach:** Utility classes only — avoid writing custom CSS.
- **Responsive:** Mobile-first with `sm:`, `md:`, `lg:`, `xl:` breakpoints.
- **Dark mode:** Controlled by `ThemeContext`, uses Tailwind's `dark:` variant.
- **Typography:** Inter (body), Plus Jakarta Sans (headings) — loaded from Google Fonts in `index.html`.

---

## Path Alias

The `@` alias is configured in both `vite.config.ts` and `tsconfig.json` to resolve to `./src`:

```ts
// tsconfig.json
"paths": { "@/*": ["./src/*"] }

// vite.config.ts
alias: { '@': path.resolve(__dirname, './src') }
```

Usage: `import Button from '@/components/common/Button'`
