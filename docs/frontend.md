# Frontend Guide

The GymOS frontend is a React 18 single-page application built with Vite and TypeScript. It communicates with the backend REST API via Axios.

---

## Getting started

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev     # Development server (http://localhost:5173)
npm run build   # Production build → dist/
npm run lint    # ESLint
npm run preview # Preview production build
```

---

## Directory structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   ├── ThemeToggle.tsx
│   ├── Table.tsx
│   └── components.css   # Shared component styles
│
├── context/
│   ├── AuthContext.tsx  # Login state, token, logout
│   ├── ThemeContext.tsx # Dark/light theme
│   └── useAuth.ts       # Auth hook
│
├── pages/
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── admin/           # Enterprise admin pages
│   ├── branch/          # Branch manager pages
│   ├── staff/           # Staff/trainer pages
│   └── member/          # Member portal pages
│
├── services/            # API client functions (one file per domain)
├── types/               # TypeScript interfaces
├── utils/               # Formatters, validators
├── index.css            # Global styles and design tokens
├── App.tsx              # Root router
└── main.tsx             # Entry point
```

Path alias: `@/` maps to `src/` (configured in `tsconfig.app.json` and `vite.config.ts`).

---

## Routing

### Public routes

| Path | Component | Description |
|---|---|---|
| `/login` | `Login` | Sign in |
| `/register` | `Register` | Member registration |

Public routes use `PublicLayout`, which renders a floating theme toggle.

### Admin routes (`enterprise_admin`)

| Path | Component |
|---|---|
| `/admin` | AdminDashboard |
| `/admin/members` | MemberList |
| `/admin/members/:id` | MemberDetail |
| `/admin/payments` | Payments |
| `/admin/staff` | StaffList |
| `/admin/branches` | BranchList |
| `/admin/analytics` | Analytics |

### Branch routes (`branch_manager`, `enterprise_admin`)

| Path | Component |
|---|---|
| `/branch` | BranchDashboard |
| `/branch/classes` | ClassSchedule |
| `/branch/attendance` | Attendance |
| `/branch/equipment` | Equipment |

### Staff routes (`staff`, `trainer`)

| Path | Component | Notes |
|---|---|---|
| `/staff` | StaffHome | All staff |
| `/staff/checkin` | CheckIn | All staff |
| `/staff/training` | TrainingSessions | Trainer only |

### Member routes (`member`)

| Path | Component |
|---|---|
| `/member` | MemberPortal |
| `/member/bookings` | MyBookings |
| `/member/sessions` | MySessions |
| `/member/payments` | MyPayments |

### Other

| Path | Component |
|---|---|
| `/unauthorized` | Unauthorized |
| `*` | Redirect to `/login` |

---

## App shell

Authenticated routes render inside `AppShell`:

```
┌──────────┬──────────────────────────────────────┐
│          │  TopBar (menu + theme + user chip)   │
│ Sidebar  ├──────────────────────────────────────┤
│ (nav)    │                                      │
│          │  Page content (via React Router)     │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

- **Sidebar** — role-based navigation links, user info, logout
- **TopBar** — mobile menu toggle, theme switcher, user avatar
- **ProtectedRoute** — guards routes by required roles

---

## Component library

All UI components live in `src/components/` and are exported from `components/index.ts`.

| Component | Purpose |
|---|---|
| `Button` | Primary, neon, secondary, danger, ghost variants |
| `Input` | Form input with label and error display |
| `Card` | Content container with optional title |
| `Table` | Sortable data table with loading/empty states |
| `Badge` | Status labels (active, expired, cancelled, …) |
| `Modal` | Dialog overlay |
| `Spinner` | Loading indicator |
| `StatCard` | KPI metric display |
| `PageWrapper` | Page title, subtitle, and padding |
| `EmptyState` | Placeholder for empty lists |
| `ThemeToggle` | Dark/light mode switcher |
| `ProtectedRoute` | Role-based route guard |
| `ErrorBoundary` | Catches render errors in the app shell |

Styling uses CSS classes in `components.css` with design tokens from `index.css`.

---

## Service layer

Each API domain has a dedicated service file in `src/services/`:

| File | Domain |
|---|---|
| `api.ts` | Axios instance, token injection, error normalization |
| `auth.service.ts` | Login, register |
| `members.service.ts` | Members and subscriptions |
| `staff.service.ts` | Staff management |
| `payments.service.ts` | Payments |
| `classes.service.ts` | Classes, schedules, bookings |
| `training.service.ts` | Personal training |
| `equipment.service.ts` | Equipment and maintenance |
| `attendance.service.ts` | Check-in/out |
| `analytics.service.ts` | Reports and KPIs |

Pages import service functions — they never call Axios directly.

Example:

```typescript
import { getMembers } from '@/services/members.service'

const members = await getMembers({ search: 'abebe', status: 'active' })
```

Errors from the API are normalized to plain `Error` objects with a `.message` string.

---

## State management

### AuthContext

Provides: `user`, `token`, `loading`, `login()`, `logout()`, `getToken()`

```typescript
import { useAuth } from '@/context/useAuth'

const { user, logout } = useAuth()
```

### ThemeContext

Provides: `theme`, `setTheme()`, `toggleTheme()`

```typescript
import { useTheme } from '@/context/useTheme'

const { theme, toggleTheme } = useTheme()
// theme: 'dark' | 'light'
```

Theme preference is persisted in `localStorage` under key `gymos_theme`.

---

## Theming

GymOS supports **dark** (default) and **light** themes using CSS custom properties.

### How it works

1. Design tokens are defined in `index.css` under `:root` (dark) and `[data-theme='light']`
2. `ThemeProvider` sets `data-theme` on the `<html>` element
3. An inline script in `index.html` applies the saved theme before React loads (prevents flash)
4. `ThemeToggle` button switches between themes

### Toggle locations

- **Authenticated pages** — top bar (next to user info)
- **Login / Register** — fixed button in top-right corner

### Adding theme-aware styles

Use CSS variables instead of hardcoded colors:

```css
.my-component {
  background: var(--bg-card);
  color: var(--text-1);
  border: 1px solid var(--border);
}
```

Available tokens include `--bg-base`, `--bg-card`, `--neon`, `--text-1`, `--text-2`, `--success`, `--danger`, and others. See `index.css` for the full list.

---

## TypeScript types

Shared interfaces in `src/types/index.ts` mirror the database schema:

- `AuthUser`, `UserRole`
- `Member`, `Subscription`, `Payment`
- `Staff`, `GymClass`, `ClassSchedule`, `ClassBooking`
- `TrainingSession`, `Equipment`, `AttendanceRecord`
- `OverviewAnalytics`, `BranchAnalytics`

Import with:

```typescript
import type { Member, UserRole } from '@/types'
```

---

## Utilities

| File | Purpose |
|---|---|
| `utils/formatters.ts` | Date, currency, name formatting |
| `utils/validators.ts` | Form validation (email, password, phone) |
| `utils/status-helpers.ts` | Badge variant mapping for statuses |

---

## Design system

**Aesthetic:** Iron & Neon — dark metallic surfaces with neon lime accents.

| Token | Dark value | Usage |
|---|---|---|
| `--neon` | `#aaff00` | Brand accent, CTAs |
| `--bg-base` | `#080808` | Page background |
| `--bg-card` | `#181818` | Card surfaces |
| `--text-1` | `#f0f0f0` | Primary text |
| `--font-display` | Bebas Neue | Headings, logo |
| `--font-body` | Manrope | Body text |
| `--font-mono` | JetBrains Mono | Code, timestamps |

Light theme overrides adjust backgrounds to light grays/white while keeping the neon brand color (slightly darkened for contrast).

---

## Error handling

- API errors are caught in page components and displayed via `alert alert--danger` banners
- `ErrorBoundary` wraps the authenticated app shell to catch unexpected render errors
- Form validation runs client-side before API calls using `utils/validators.ts`

---

## Environment

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

Vite exposes env vars prefixed with `VITE_` to the client bundle.

---

## Build output

```bash
npm run build
```

Runs TypeScript compilation (`tsc -b`) then Vite production build. Output is written to `frontend/dist/` and can be deployed to Vercel, Netlify, or any static host. Point `VITE_API_URL` to the production API URL at build time.
