# Setup Guide

This guide walks through setting up the GymOS project on a local development machine.

## Prerequisites

Install the following before you begin:

- [Node.js](https://nodejs.org) v18 or higher
- [PostgreSQL](https://www.postgresql.org/download) v14 or higher
- [pgAdmin 4](https://www.pgadmin.org) (recommended) or `psql` CLI
- Git

Optional: [VS Code](https://code.visualstudio.com), [Postman](https://www.postman.com)

---

## 1. Clone the repository

```bash
git clone <repository-url>
cd gym-management-system
```

---

## 2. Database setup

### Create the database

In pgAdmin or `psql`:

```sql
CREATE DATABASE gym_management;
```

### Run the schema

Execute `database/schema.sql` against the `gym_management` database. This creates all tables, constraints, and indexes.

**pgAdmin:** Query Tool → open `database/schema.sql` → Execute (F5)

**psql:**

```bash
psql -U postgres -d gym_management -f database/schema.sql
```

### Run the seed data

Execute `database/seed.sql` to populate sample branches, staff, members, classes, and transactions.

**Alternative — reseed from the backend:**

```bash
cd backend
node reseed-db.js
```

This script reads both SQL files and applies them in order.

---

## 3. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

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

Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Start the API:

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
```

---

## 4. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

The app opens at **http://localhost:5173**.

---

## 5. Running both services

Open two terminals:

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

---

## Seed data

All seeded users share the password **`Password@123`**.

### Staff accounts

| Name | Email | Role | Branch |
|---|---|---|---|
| Saba Addis | `admin@gym.com` | Enterprise admin | Addis Main |
| Alemayehu Bekele | `alem.bekele@gym.com` | Branch manager | Addis Main |
| Tigabu Wolde | `tigabu.wolde@gym.com` | Trainer | Addis Main |
| Mekdes Girma | `mekdes.girma@gym.com` | Group instructor | Addis Main |
| Yohannes Teklu | `yohannes.teklu@gym.com` | Receptionist | Addis Main |
| Birtukan Alemu | `birtukan.alemu@gym.com` | Branch manager | Kazanchis |
| Tewodros Haile | `tewodros.haile@gym.com` | Branch manager | Piassa |

### Member accounts

20 members are seeded. Example:

| Email |
|---|
| `abebe.girma@email.com` |
| `tigist.haile@email.com` |
| `dawit.tesfaye@email.com` |

See `database/seed.sql` for the complete list.

---

## Environment variables reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: `5000`) |
| `NODE_ENV` | No | `development`, `production`, or `test` |
| `DB_HOST` | Yes* | PostgreSQL host |
| `DB_PORT` | Yes* | PostgreSQL port |
| `DB_NAME` | Yes* | Database name |
| `DB_USER` | Yes* | Database user |
| `DB_PASS` | Yes* | Database password |
| `DATABASE_URL` | Alt | Full connection string (used in production instead of individual `DB_*` vars) |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token lifetime (default: `7d`) |
| `CLIENT_URL` | Yes | Frontend origin for CORS |
| `BCRYPT_SALT_ROUNDS` | No | Password hashing rounds (default: `12`) |
| `EQUIPMENT_OVERDUE_DAYS` | No | Maintenance overdue threshold (default: `90`) |
| `EQUIPMENT_COST_THRESHOLD` | No | High repair cost alert (default: `5000`) |

\* Not required when `DATABASE_URL` is set.

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend API base URL (e.g. `http://localhost:5000/api`) |

---

## Build for production

```bash
# Frontend
cd frontend
npm run build
# Output: frontend/dist/

# Backend
cd backend
npm start
```

---

## Running tests

```bash
cd backend
npm test
```

Tests expect a separate test database. Set `DB_NAME=gym_management_test` in a `.env.test` file before running.

---

## Troubleshooting

### CORS errors in the browser

Ensure `CLIENT_URL` in `backend/.env` exactly matches the frontend URL (`http://localhost:5173` in development).

### `PostgreSQL connected` message missing

- Verify PostgreSQL is running
- Check `DB_*` credentials in `.env`
- Confirm the `gym_management` database exists

### Login returns 401 with seed data

Re-run `database/seed.sql` or `node reseed-db.js`. Seed passwords are bcrypt hashes of `Password@123`.

### Frontend cannot reach API

Confirm `VITE_API_URL` ends with `/api` and the backend is running on the matching host/port.

---

## Deployment overview

| Service | Recommended platform |
|---|---|
| Backend | [Render](https://render.com) |
| Frontend | [Vercel](https://vercel.com) |
| Database | Render PostgreSQL |

Production checklist:

1. Set `NODE_ENV=production` on the backend
2. Use a strong `JWT_SECRET`
3. Set `CLIENT_URL` to the deployed frontend URL
4. Set `VITE_API_URL` to the deployed API URL
5. Run `schema.sql` and optionally `seed.sql` on the production database
