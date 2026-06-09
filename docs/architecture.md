# Architecture

## Overview

GymOS is a three-tier web application:

```
┌─────────────┐     HTTP/JSON      ┌─────────────┐     SQL       ┌─────────────┐
│   Frontend  │ ◄──────────────► │   Backend   │ ◄───────────► │  PostgreSQL │
│  React/Vite │   Bearer JWT     │   Express   │   node-pg     │  Database   │
└─────────────┘                  └─────────────┘               └─────────────┘
```

The frontend is a single-page application (SPA). The backend exposes a REST API under `/api`. All persistent data lives in PostgreSQL.

---

## Repository structure

```
gym-management-system/
├── frontend/                 # React SPA (TypeScript)
│   └── src/
│       ├── components/       # Reusable UI (Button, Table, Sidebar, …)
│       ├── context/          # AuthContext, ThemeContext
│       ├── hooks/            # Custom React hooks
│       ├── pages/            # Route-level page components
│       ├── services/         # Axios API client functions
│       ├── types/            # Shared TypeScript interfaces
│       └── utils/            # Formatters, validators, helpers
│
├── backend/                  # Express API (JavaScript ESM)
│   └── src/
│       ├── config/           # Database connection pool
│       ├── controllers/      # Business logic per domain
│       ├── middleware/       # Auth, validation, error handling
│       ├── routes/           # Express route definitions
│       └── utils/            # Response helpers
│
├── database/
│   ├── schema.sql            # Table definitions
│   └── seed.sql              # Development sample data
│
└── docs/                     # Project documentation
```

---

## Request lifecycle

```
Browser
  │
  ├─► React Router matches URL → renders page component
  │
  ├─► Page calls service function (e.g. getMembers())
  │
  ├─► Axios interceptor attaches JWT from AuthContext
  │
  └─► HTTP request → Express
                        │
                        ├─► CORS check (CLIENT_URL)
                        ├─► JSON body parser
                        ├─► Route matcher
                        ├─► protect middleware (JWT verify)
                        ├─► authorize middleware (role check)
                        ├─► express-validator + validate
                        ├─► Controller (SQL via pg pool)
                        └─► sendSuccess / sendError JSON response
```

---

## Backend design

### Layered structure

| Layer | Responsibility |
|---|---|
| **Routes** | URL mapping, input validation rules, middleware chain |
| **Controllers** | Business logic, SQL queries, HTTP status codes |
| **Middleware** | Cross-cutting concerns (auth, validation, errors) |
| **Config** | Database pool, environment variables |

### Route modules

| Prefix | Module | Domain |
|---|---|---|
| `/api/auth` | `auth.routes.js` | Registration, login, profile |
| `/api/members` | `member.routes.js` | Members and subscriptions |
| `/api/staff` | `staff.routes.js` | Staff CRUD, roles, payroll |
| `/api/payments` | `payment.routes.js` | Payment recording and reports |
| `/api/classes` | `class.routes.js` | Class templates, schedules, bookings |
| `/api/training` | `training.routes.js` | Personal training sessions |
| `/api/equipment` | `equipment.routes.js` | Equipment and maintenance |
| `/api/attendance` | `attendance.routes.js` | Check-in/out, heatmaps |
| `/api/analytics` | `analytics.routes.js` | KPIs and reporting |

### API response contract

All endpoints return a consistent JSON shape:

**Success:**

```json
{
  "success": true,
  "data": { },
  "message": "Optional human-readable message"
}
```

**Error:**

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

**Validation error (422):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Must be a valid email address" }
  ]
}
```

---

## Frontend design

### Architecture patterns

- **Context API** — global auth state (`AuthContext`) and theme preference (`ThemeContext`)
- **Service layer** — one file per API domain; pages never call Axios directly
- **Protected routes** — `ProtectedRoute` component checks JWT role before rendering
- **CSS design tokens** — all colors/spacing via CSS custom properties in `index.css`

### Role-based routing

After login, users are redirected to their role home:

| Role | Default route |
|---|---|
| `enterprise_admin` | `/admin` |
| `branch_manager` | `/branch` |
| `staff` / `trainer` | `/staff` |
| `member` | `/member` |

See [Frontend Guide](./frontend.md) for the full route map.

---

## Authentication flow

```
1. User submits email + password on /login
2. POST /api/auth/login
3. Backend checks members table, then staff table
4. bcrypt.compare() validates password
5. JWT signed with { id, email, role, branch_id }
6. Frontend stores token + user in sessionStorage
7. Axios interceptor attaches Authorization: Bearer <token>
8. Protected routes read role from AuthContext
```

Details: [Authentication & Roles](./authentication-and-roles.md)

---

## Database access

The backend uses a shared connection pool (`backend/src/config/db.js`):

- Local dev: individual `DB_*` environment variables
- Production: `DATABASE_URL` connection string (Render, etc.)
- All queries use parameterized `$1, $2, …` placeholders to prevent SQL injection

---

## Error handling

| HTTP code | When |
|---|---|
| 400 | Malformed request |
| 401 | Missing or invalid JWT |
| 403 | Valid token but insufficient role |
| 404 | Resource not found |
| 409 | Business rule conflict (e.g. duplicate booking) |
| 422 | Validation failed |
| 500 | Unexpected server error |

In development, 500 responses include the error message. In production, a generic message is returned.

---

## Git workflow

```
main          ← production (PRs from dev only)
  └── dev     ← integration branch
        ├── feat/theme-switcher
        ├── feat/member-management-ui
        └── feat/auth-api
```

Commit message prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `test:`
