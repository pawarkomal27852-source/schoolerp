# SchoolERP — Development Rules

These rules govern how all code in this project must be written and reviewed.
All contributors (human and AI) must follow these conventions.

---

## 1. Project Structure Rules

- **Never** mix frontend and backend code in the same folder.
- All new frontend features go inside `frontend/src/`.
- All new backend features go inside `backend/src/`.
- The root folder contains only documentation and configuration — no source code.
- Each app must remain independently runnable with its own `package.json`.

---

## 2. Naming Conventions

### Files & Folders
| Context | Convention | Example |
|---------|-----------|---------|
| React components | PascalCase | `StudentDetails.jsx` |
| Hooks | camelCase with `use` prefix | `useAuth.js` |
| Services (frontend) | camelCase + `Service` suffix | `studentService.js` |
| Utilities | camelCase | `formatters.js` |
| Backend controllers | camelCase + `Controller` suffix | `studentController.js` |
| Backend models | PascalCase singular | `Student.js` |
| Backend routes | camelCase + `Routes` suffix | `studentRoutes.js` |
| Backend services | camelCase + `Service` suffix | `studentService.js` |
| Backend repositories | camelCase + `Repository` suffix | `studentRepository.js` |
| Backend validators | camelCase + `Validator` suffix | `studentValidator.js` |

### Variables & Functions
- Use `camelCase` for variables and functions.
- Use `PascalCase` for classes and React components.
- Use `SCREAMING_SNAKE_CASE` for constants (e.g., `MAX_FILE_SIZE`).
- Avoid single-letter variable names except in trivial loop counters.

---

## 3. Frontend Rules

### Component Rules
- One component per file.
- Keep components under ~200 lines; split into sub-components if larger.
- Props must be destructured in the function signature.
- Use functional components only — no class components.

### State Management
- Use React Context for global state (auth, theme, toasts).
- Use `useState` / `useReducer` for local component state.
- Do **not** introduce Redux or Zustand without team discussion.

### API Calls
- All HTTP calls must go through the service layer (`src/services/`).
- Never call `axios` directly inside a component.
- Handle loading, success, and error states for every API call.
- Use the `VITE_API_URL` environment variable — never hard-code the API URL.

### Routing
- All routes are defined in `src/routes/AppRoutes.jsx`.
- Protected routes must use the `ProtectedRoute` wrapper.
- Use `react-router-dom` v7 APIs only.

### Styling
- Use Tailwind CSS utility classes only.
- Do not write custom CSS unless absolutely necessary.
- Keep the existing color palette — do not introduce new brand colors without design review.
- Responsive breakpoints: mobile-first (`sm`, `md`, `lg`, `xl`).

---

## 4. Backend Rules

### Architecture
- Follow the **Repository → Service → Controller** layered pattern.
- Controllers handle HTTP only (parse request, call service, send response).
- Services contain business logic — no `req`/`res` objects.
- Repositories handle all database queries — no Mongoose calls outside repositories.

### Error Handling
- Always `throw new AppError(message, statusCode)` in services/controllers.
- Always wrap async controllers with `asyncHandler`.
- Never `console.error` in production — use a proper logger.
- Never leak stack traces or internal details in production responses.

### Security
- Sanitise and validate all incoming request data with `express-validator`.
- Use `helmet()` for HTTP security headers.
- Never store plain-text passwords — always hash with `bcryptjs`.
- Never commit `.env` files — use `.env.example` as the template.
- Use parameterised queries (Mongoose handles this by default).

### API Design
- All routes are versioned: `/api/v1/resource`.
- Use correct HTTP verbs: `GET` (read), `POST` (create), `PUT/PATCH` (update), `DELETE` (remove).
- Return consistent JSON: `{ success, message, data }`.
- Paginated endpoints return: `{ success, message, data, pagination }`.
- Use plural nouns for resource names: `/students`, not `/student`.

### Authentication
- All protected routes require `Authorization: Bearer <token>` header.
- Use the `protect` middleware for authentication.
- Use the `authorize(...roles)` middleware for role-based access.

---

## 5. Git Rules

- Branch naming: `feature/`, `fix/`, `chore/`, `docs/` prefixes.
- Commit message format: `type(scope): short description` (Conventional Commits).
  - Examples: `feat(students): add bulk enrolment endpoint`
  - Examples: `fix(auth): correct token expiry check`
- Never commit directly to `main` — use pull requests.
- PRs require at least one review before merging.
- Delete merged feature branches.

---

## 6. Documentation Rules

- Update `memory.md` when a significant decision is made.
- Update `phases.md` when a task or phase is completed.
- Log every major change in `log.md`.
- All new API endpoints must be documented in `docs/api/`.
- Complex logic must have inline JSDoc comments.

---

## 7. Environment Rules

- All secrets go in `.env` files — never in source code.
- `.env` files are gitignored — use `.env.example` to share required keys.
- Frontend env variables must start with `VITE_` to be exposed to the browser.
- Backend env variables must be loaded via `dotenv` before any other imports.
