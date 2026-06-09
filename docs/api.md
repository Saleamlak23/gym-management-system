# API Reference

Base URL: `http://localhost:5000/api` (development)

All protected endpoints require:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

Import [GymManagementAPI.postman_collection.json](./GymManagementAPI.postman_collection.json) into Postman for interactive testing.

---

## Response format

See [Architecture — API response contract](./architecture.md#api-response-contract).

---

## Health check

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | API status (not under `/api`) |

```json
{
  "status": "API running",
  "environment": "development",
  "timestamp": "2025-06-09T12:00:00.000Z"
}
```

---

## Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new member account |
| POST | `/auth/login` | Public | Login (member or staff) |
| GET | `/auth/me` | Required | Get current user profile |

### POST `/auth/register`

**Body:**

```json
{
  "first_name": "Abebe",
  "last_name": "Girma",
  "email": "abebe@example.com",
  "password": "Password1",
  "phone": "+251-91-123-4567"
}
```

**Validation:**
- Password: min 8 chars, at least one uppercase letter and one number
- Phone: `+251-XX-XXX-XXXX` format

**Response (201):**

```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "id": 1, "first_name": "Abebe", "role": "member", ... }
  }
}
```

### POST `/auth/login`

**Body:**

```json
{
  "email": "admin@gym.com",
  "password": "Password@123"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "id": 2, "email": "admin@gym.com", "role": "enterprise_admin", ... }
  }
}
```

---

## Members

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/members` | admin, branch_manager | List members (`?search=`, `?status=`) |
| GET | `/members/:id` | staff+, self | Get member profile |
| PUT | `/members/:id` | admin | Update member |
| DELETE | `/members/:id` | admin | Deactivate member |
| GET | `/members/:id/subscriptions` | staff+, self | Subscription history |
| POST | `/members/:id/subscriptions` | staff+ | Create subscription |
| PATCH | `/members/:id/subscriptions/:subId` | admin, branch_manager | Update subscription status |

---

## Staff

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/staff` | admin, branch_manager | List all staff |
| POST | `/staff` | admin | Create staff member |
| GET | `/staff/:id` | admin, branch_manager | Get staff profile |
| PUT | `/staff/:id` | admin | Update staff |
| DELETE | `/staff/:id` | admin | Deactivate staff |
| GET | `/staff/:id/schedule` | staff+ | Instructor class schedule |
| GET | `/staff/:id/payroll` | admin | Payroll estimate |
| GET | `/staff/roles` | admin, branch_manager | List staff roles |
| POST | `/staff/roles` | admin | Create role |
| PUT | `/staff/roles/:id` | admin | Update role |

---

## Payments

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/payments` | admin, branch_manager, staff | Record payment |
| GET | `/payments` | admin, branch_manager | List payments |
| GET | `/payments/summary` | admin, branch_manager | Revenue summary |
| GET | `/payments/member/:memberId` | staff+, self | Member payment history |

### POST `/payments`

**Body:**

```json
{
  "member_id": 1,
  "amount": 40.00,
  "method": "cash",
  "payment_date": "2025-06-09T10:00:00.000Z"
}
```

Methods: `cash`, `card`, `bank_transfer`, `mobile_money`

---

## Classes & Bookings

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/classes` | Public | List class templates |
| POST | `/classes` | admin | Create class template |
| PUT | `/classes/:id` | admin | Update class template |
| GET | `/classes/schedules` | Public | Upcoming sessions (`?branch_id=`, `?date=`) |
| POST | `/classes/schedules` | admin, branch_manager | Schedule a session |
| DELETE | `/classes/schedules/:id` | admin, branch_manager | Cancel session |
| GET | `/classes/schedules/:id/bookings` | staff+ | Session bookings |
| GET | `/classes/bookings/mine` | member | My bookings |
| POST | `/classes/bookings` | member | Book a class |
| DELETE | `/classes/bookings/:id` | member, admin | Cancel booking |

---

## Personal Training

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/training` | staff+ | List all sessions |
| GET | `/training/mine` | member | My sessions |
| GET | `/training/trainer/:id` | staff+ | Trainer schedule |
| GET | `/training/member/:id` | staff+, self | Member sessions |
| POST | `/training` | authenticated | Book session |
| PATCH | `/training/:id/status` | trainer, admin | Update status |
| DELETE | `/training/:id` | member, admin | Cancel session |

---

## Equipment

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/equipment/categories` | Public | List categories |
| GET | `/equipment` | staff+ | List equipment (`?branch_id=`, `?status=`) |
| POST | `/equipment` | admin | Add equipment |
| GET | `/equipment/overdue` | admin, branch_manager | Overdue maintenance items |
| PATCH | `/equipment/:id/status` | staff+ | Update status |
| GET | `/equipment/:id/maintenance` | staff+ | Maintenance history |
| POST | `/equipment/:id/maintenance` | staff+ | Log maintenance |

---

## Attendance

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/attendance/checkin` | admin, branch_manager, staff | Record check-in |
| POST | `/attendance/checkout` | admin, branch_manager, staff | Record check-out |
| GET | `/attendance` | admin, branch_manager | All records (filterable) |
| GET | `/attendance/today/:branchId` | staff+ | Today's log |
| GET | `/attendance/branch/:branchId` | staff+ | Alias for today's log |
| GET | `/attendance/member/:memberId` | staff+, self | Member history |
| GET | `/attendance/heatmap/:branchId` | admin, branch_manager | Peak-hour grid |

### POST `/attendance/checkin`

**Body:**

```json
{
  "member_id": 1,
  "branch_id": 1
}
```

---

## Analytics

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/analytics/overview` | admin | Enterprise KPIs |
| GET | `/analytics/branch/:branchId` | admin, branch_manager | Branch KPIs |
| GET | `/analytics/revenue` | admin, branch_manager | Revenue over time |
| GET | `/analytics/members/growth` | admin, branch_manager | Signup trends |
| GET | `/analytics/classes/fillrate` | admin, branch_manager | Class occupancy |

### Query parameters (analytics)

| Endpoint | Params |
|---|---|
| `/analytics/revenue` | `start_date`, `end_date`, `group_by` (day/week/month), `branch_id` |
| `/analytics/members/growth` | `months` (default: 12) |
| `/analytics/classes/fillrate` | `branch_id`, `start_date`, `end_date` |

---

## HTTP status codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 204 | No content |
| 400 | Bad request |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (wrong role) |
| 404 | Not found |
| 409 | Conflict |
| 422 | Validation failed |
| 500 | Server error |

---

## Role shorthand

| Shorthand | Roles |
|---|---|
| Public | No authentication |
| Required | Any authenticated user |
| admin | `enterprise_admin` |
| branch_manager | `branch_manager` |
| staff+ | `enterprise_admin`, `branch_manager`, `staff`, `trainer` |
| self | User accessing their own resource (via `authorizeSelf`) |

Full role documentation: [Authentication & Roles](./authentication-and-roles.md)
