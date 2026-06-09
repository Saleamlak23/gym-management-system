# GymOS Documentation

Welcome to the documentation for **GymOS** — a multi-branch gym and fitness club management system. This folder contains technical reference material for developers, reviewers, and course evaluators.

## Quick links

| Document | Description |
|---|---|
| [Setup Guide](./setup.md) | Install PostgreSQL, configure environment variables, and run the app locally |
| [Architecture](./architecture.md) | System design, project structure, and request flow |
| [Database](./database.md) | Schema overview, table relationships, and seed data |
| [API Reference](./api.md) | REST endpoints, auth headers, and response format |
| [Authentication & Roles](./authentication-and-roles.md) | JWT flow, user roles, and access control |
| [Frontend Guide](./frontend.md) | React app structure, routing, components, and theming |

## Additional resources

- [Postman Collection](./GymManagementAPI.postman_collection.json) — import into Postman to test API endpoints
- [Root README](../README.md) — project overview and quick start

## Tech stack summary

| Layer | Technology |
|---|---|
| Frontend | Vite, React 18, TypeScript, React Router 6, Axios |
| Backend | Node.js 18+, Express 5, express-validator |
| Database | PostgreSQL 14+ |
| Auth | JWT (jsonwebtoken) + bcryptjs |

## Default local URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Health check | http://localhost:5000/ |

## Seed credentials

After running `database/seed.sql`, all seeded accounts use the password **`Password@123`**.

| Role | Email |
|---|---|
| Enterprise admin | `admin@gym.com` |
| Branch manager | `alem.bekele@gym.com` |
| Trainer | `tigabu.wolde@gym.com` |
| Staff (receptionist) | `yohannes.teklu@gym.com` |
| Member | `abebe.girma@email.com` |

See [Setup Guide](./setup.md#seed-data) for the full list.

---

*Gym & Fitness Club Management System — v1.0*
