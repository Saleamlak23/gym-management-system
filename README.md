# Gym & Fitness Club Management System

An enterprise-level web application for managing multi-branch gym and fitness clubs. Handles member registration, subscriptions, class scheduling, personal training, equipment tracking, attendance control, and financial reporting.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React + React Router |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | JSON Web Tokens (JWT) + bcryptjs |
| HTTP Client | Axios |
| DB Driver | pg (node-postgres) |

---

## Team

| Role | Responsibilities |
|---|---|
| **Developer 1** — Frontend | UI pages, components, routing, design system |
| **Developer 2** — Backend | API, database, auth, business logic |

---

## Project Structure

```
gym-management-system/
│
├── frontend/                   # Vite + React (Developer 1)
│   ├── src/
│   │   ├── assets/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # AuthContext
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # One file per route
│   │   ├── services/           # Axios API call functions
│   │   └── utils/              # Helper functions
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
│
├── backend/                    # Express + PostgreSQL (Developer 2)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # PostgreSQL connection pool
│   │   ├── controllers/        # Request handler logic
│   │   ├── middleware/         # Auth, validation, errors
│   │   ├── routes/             # Express route definitions
│   │   ├── utils/              # Response helpers
│   │   └── index.js            # Server entry point
│   ├── .env.example
│   └── package.json
│
├── database/
│   ├── schema.sql              # All 16 CREATE TABLE statements
│   └── seed.sql                # Sample data for development
│
├── docs/
│   └── api.md                  # API endpoint reference
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure the following are installed on your machine:

- [Node.js](https://nodejs.org) v18 or higher
- [PostgreSQL](https://www.postgresql.org/download) v14 or higher
- [pgAdmin 4](https://www.pgadmin.org) (optional but recommended)
- [GitHub Desktop](https://desktop.github.com)
- [VS Code](https://code.visualstudio.com)

---

### 1. Clone the repository

```bash
# In GitHub Desktop:
# File → Clone Repository → GitHub.com → gym-management-system → Clone
```

---

### 2. Set up the database

Open **pgAdmin 4**, connect to your local PostgreSQL server, and run the following steps:

**Create the database:**
```sql
CREATE DATABASE gym_management;
```

**Run the schema** (creates all 16 tables):
```
pgAdmin → gym_management → Query Tool → open database/schema.sql → F5
```

**Run the seed data** (populates sample records):
```
pgAdmin → gym_management → Query Tool → open database/seed.sql → F5
```

---

### 3. Set up the backend

```bash
cd backend

# Install dependencies
npm install

# Copy the environment file and fill in your values
cp .env.example .env
```

Edit `backend/.env` with your local settings:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gym_management
DB_USER=postgres
DB_PASS=your_postgres_password
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Generate a secure `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Start the backend server:
```bash
npm run dev
```

Expected output:
```
═══════════════════════════════════════════
🏋️   Gym Management API
🚀  Server   : http://localhost:5000
🌍  Env      : development
📡  Frontend : http://localhost:5173
═══════════════════════════════════════════
✅  PostgreSQL connected — 2025-05-19T...
```

---

### 4. Set up the frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy the environment file
cp .env.example .env
```

`frontend/.env` should contain:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend dev server:
```bash
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

### 5. Running both simultaneously

Open two terminals in VS Code (`Ctrl + Shift + \``):

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Health check | http://localhost:5000/ |

---

## API Overview

All endpoints are prefixed with `/api`. Protected routes require an `Authorization: Bearer <token>` header.

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new member |
| POST | `/api/auth/login` | Public | Login (member or staff) |
| GET | `/api/auth/me` | Required | Get current user profile |

### Members
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/members` | Admin/Manager | List all members |
| GET | `/api/members/:id` | Staff+ | Get one member |
| PUT | `/api/members/:id` | Admin | Update member |
| DELETE | `/api/members/:id` | Admin | Deactivate member |
| GET | `/api/members/:id/subscriptions` | Staff+ | Subscription history |
| POST | `/api/members/:id/subscriptions` | Staff+ | Create subscription |
| PATCH | `/api/members/:id/subscriptions/:subId` | Manager+ | Update status |

### Payments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/payments` | Staff+ | Record payment |
| GET | `/api/payments` | Manager+ | List all payments |
| GET | `/api/payments/summary` | Manager+ | Revenue report |
| GET | `/api/payments/member/:id` | Staff+/Self | Member payment history |

### Classes & Bookings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/classes` | Any | List class templates |
| POST | `/api/classes` | Admin | Create class template |
| GET | `/api/classes/schedules` | Any | Upcoming sessions |
| POST | `/api/classes/schedules` | Manager+ | Schedule a session |
| DELETE | `/api/classes/schedules/:id` | Manager+ | Cancel session |
| GET | `/api/classes/schedules/:id/bookings` | Staff+ | Session bookings |
| POST | `/api/classes/bookings` | Member | Book a class |
| DELETE | `/api/classes/bookings/:id` | Member/Admin | Cancel booking |
| GET | `/api/classes/bookings/mine` | Member | My bookings |

### Personal Training
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/training` | Staff+ | List all sessions |
| GET | `/api/training/mine` | Member | My sessions |
| GET | `/api/training/trainer/:id` | Staff+ | Trainer schedule |
| POST | `/api/training` | Any | Book session |
| PATCH | `/api/training/:id/status` | Trainer/Admin | Update status |
| DELETE | `/api/training/:id` | Member/Admin | Cancel session |

### Equipment
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/equipment` | Staff+ | List equipment |
| POST | `/api/equipment` | Admin | Add equipment |
| GET | `/api/equipment/overdue` | Manager+ | Overdue items |
| GET | `/api/equipment/categories` | Any | List categories |
| PATCH | `/api/equipment/:id/status` | Staff+ | Update status |
| GET | `/api/equipment/:id/maintenance` | Staff+ | Maintenance history |
| POST | `/api/equipment/:id/maintenance` | Staff+ | Log maintenance |

### Staff
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/staff` | Manager+ | List all staff |
| POST | `/api/staff` | Admin | Create staff member |
| GET | `/api/staff/:id` | Manager+ | Get staff profile |
| PUT | `/api/staff/:id` | Admin | Update staff |
| DELETE | `/api/staff/:id` | Admin | Deactivate staff |
| GET | `/api/staff/:id/schedule` | Staff+ | Class schedule |
| GET | `/api/staff/:id/payroll` | Admin | Payroll estimate |
| GET | `/api/staff/roles` | Manager+ | List all roles |
| POST | `/api/staff/roles` | Admin | Create role |
| PUT | `/api/staff/roles/:id` | Admin | Update role |

### Attendance
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/attendance/checkin` | Staff+ | Record check-in |
| POST | `/api/attendance/checkout` | Staff+ | Record check-out |
| GET | `/api/attendance` | Manager+ | All records |
| GET | `/api/attendance/today/:branchId` | Staff+ | Today's log |
| GET | `/api/attendance/member/:id` | Staff+/Self | Member history |
| GET | `/api/attendance/heatmap/:branchId` | Manager+ | Peak-hour grid |

### Analytics
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/analytics/overview` | Admin | Enterprise KPIs |
| GET | `/api/analytics/branch/:id` | Manager+ | Branch KPIs |
| GET | `/api/analytics/revenue` | Manager+ | Revenue over time |
| GET | `/api/analytics/members/growth` | Manager+ | Signup trends |
| GET | `/api/analytics/classes/fillrate` | Manager+ | Class occupancy |

---

## User Roles

| Role | Description |
|---|---|
| `enterprise_admin` | Full access to all branches and settings |
| `branch_manager` | Access scoped to their own branch |
| `trainer` | Manages personal training sessions and class schedules |
| `staff` | Front-desk operations — check-in, payments, bookings |
| `member` | Self-service portal — bookings, sessions, history |

---

## Git Workflow

```
main          ← production only (PRs from dev, reviewed by both devs)
  └── dev     ← integration branch (all features merge here first)
        ├── feat/member-management-ui     (Developer 1)
        ├── feat/auth-api                 (Developer 2)
        └── feat/class-schedule-ui        (Developer 1)
```

### Daily workflow

```bash
# 1. Always start by pulling the latest dev
git checkout dev && git pull origin dev

# 2. Create a feature branch
git checkout -b feat/your-task-name

# 3. Work, commit often
git add .
git commit -m "feat: short description of what you built"

# 4. Push and open a pull request into dev
git push -u origin feat/your-task-name
# → GitHub Desktop: Branch → Create Pull Request
```

### Commit message format

```
feat:  add member list page with search filter
fix:   prevent double-booking for same trainer slot
chore: update .env.example with new variables
docs:  add API reference for payments module
test:  add integration tests for auth endpoints
```

---

## Running Tests

```bash
cd backend
npm test
```

Tests use a separate test database. Set `DB_NAME=gym_management_test` in a `.env.test` file before running.

---

## Deployment

| Service | Platform |
|---|---|
| Backend | [Render](https://render.com) |
| Frontend | [Vercel](https://vercel.com) |
| Database | Render PostgreSQL |

See `docs/setup.md` for full production deployment steps.

---

## Database Schema

16 tables across 4 dependency levels:

```
Level 1 (no deps):   branches · staff_roles · membership_types
                     classes · equipment_categories · members

Level 2 (→ L1):      staff · subscriptions · payments
                     equipment · attendance

Level 3 (→ L1+L2):   class_schedules · maintenance_logs
                     personal_training_sessions

Level 4 (→ L3):      class_bookings
```

---

*Gym & Fitness Club Management System — v1.0*