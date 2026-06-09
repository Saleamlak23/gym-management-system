# Database

GymOS uses PostgreSQL with 15 tables organized in four dependency levels. Schema definitions live in `database/schema.sql`; sample data in `database/seed.sql`.

---

## Entity relationship overview

```
branches ─────────────┬── staff ──────────┬── class_schedules ── class_bookings
                      │                   └── personal_training_sessions
                      ├── equipment ── maintenance_logs
                      └── attendance

members ──┬── subscriptions ── membership_types
          ├── payments
          ├── attendance
          ├── class_bookings
          └── personal_training_sessions

staff_roles ── staff
classes ── class_schedules
equipment_categories ── equipment
```

---

## Tables by dependency level

### Level 1 — Independent tables

| Table | Purpose | Key columns |
|---|---|---|
| `branches` | Gym locations | `branch_id`, `name`, `address`, `phone` |
| `staff_roles` | Job titles and pay rates | `role_id`, `role_name`, `hourly_rate` |
| `membership_types` | Subscription plans | `type_id`, `title`, `price`, `duration_days` |
| `classes` | Class templates (Yoga, HIIT, …) | `class_id`, `class_name`, `capacity` |
| `equipment_categories` | Equipment groupings | `category_id`, `category_name` |

### Level 2 — Depend on Level 1

| Table | Purpose | Foreign keys |
|---|---|---|
| `members` | Registered gym members | — |
| `staff` | Employees | → `branches`, `staff_roles` |
| `subscriptions` | Member membership periods | → `members`, `membership_types` |
| `payments` | Financial transactions | → `members` |
| `equipment` | Branch equipment inventory | → `branches`, `equipment_categories` |
| `attendance` | Check-in/out records | → `members`, `branches` |

### Level 3 — Depend on Level 1 + 2

| Table | Purpose | Foreign keys |
|---|---|---|
| `class_schedules` | Scheduled class sessions | → `classes`, `branches`, `staff` (instructor) |
| `maintenance_logs` | Equipment service history | → `equipment` |
| `personal_training_sessions` | 1-on-1 training bookings | → `members`, `staff` (trainer) |

### Level 4 — Deepest dependency

| Table | Purpose | Foreign keys |
|---|---|---|
| `class_bookings` | Member reservations for classes | → `class_schedules`, `members` |

---

## Key constraints

### Members

- Email must be unique and match format `^[^@]+@[^@]+\.[^@]+$`
- Phone optional; if provided must match `^\+?[\d\s\-]{7,20}$`
- Password stored as bcrypt hash (never plain text)
- `is_active` flag for soft deletion

### Subscriptions

- Status: `active`, `expired`, `cancelled`, `frozen`
- `end_date` must be after `start_date`

### Payments

- Amount must be > 0
- Method: `cash`, `card`, `bank_transfer`, `mobile_money`

### Attendance

- `check_out` must be after `check_in` (if present)

### Class bookings

- Unique constraint on `(schedule_id, member_id)` — no duplicate bookings

### Equipment

- Status: `active`, `maintenance`, `retired`

### Personal training

- Status: `scheduled`, `confirmed`, `completed`, `cancelled`

---

## Indexes

The schema includes indexes on frequently queried columns:

- Member email and active status
- Staff branch, role, and email
- Subscription member, status, and date range
- Payment member and date
- Attendance member, branch, and check-in time
- Class schedule branch, instructor, and start time
- Equipment branch and status

See `database/schema.sql` for the full index list.

---

## Seed data summary

Running `database/seed.sql` populates:

| Entity | Count |
|---|---|
| Branches | 3 (Addis Main, Kazanchis, Piassa) |
| Staff roles | 6 |
| Membership types | 4 (Day Pass, Monthly, Quarterly, Annual) |
| Classes | 6 |
| Equipment categories | 4 |
| Members | 20 |
| Staff | 10 |
| Subscriptions | Multiple active/expired |
| Payments | Sample transactions |
| Class schedules & bookings | Upcoming and past sessions |
| Attendance | Historical check-ins |
| Equipment & maintenance | Per-branch inventory |
| Training sessions | Scheduled PT sessions |

All seeded passwords are bcrypt hashes of **`Password@123`**.

---

## Common queries

### Active members with current subscription

```sql
SELECT m.member_id, m.first_name, m.last_name, s.status, mt.title
FROM members m
JOIN subscriptions s ON s.member_id = m.member_id
JOIN membership_types mt ON mt.type_id = s.type_id
WHERE s.status = 'active' AND m.is_active = TRUE;
```

### Today's attendance for a branch

```sql
SELECT a.*, m.first_name, m.last_name
FROM attendance a
JOIN members m ON m.member_id = a.member_id
WHERE a.branch_id = 1
  AND a.check_in::date = CURRENT_DATE
ORDER BY a.check_in DESC;
```

### Class fill rate

```sql
SELECT cs.schedule_id, c.class_name, c.capacity,
       COUNT(cb.booking_id) AS booked
FROM class_schedules cs
JOIN classes c ON c.class_id = cs.class_id
LEFT JOIN class_bookings cb ON cb.schedule_id = cs.schedule_id
GROUP BY cs.schedule_id, c.class_name, c.capacity;
```

---

## Maintenance

### Full reset (development)

```bash
cd backend
node reseed-db.js
```

This drops and recreates all tables, then re-inserts seed data.

### Manual reset

1. Run `database/schema.sql` (drops and recreates tables)
2. Run `database/seed.sql` (inserts sample data)

---

## Notes

- Members are **not** branch-scoped; they can visit any branch
- Staff are assigned to a specific `branch_id`
- Enterprise admins have `branch_id = null` in their JWT payload
- The schema comment references 16 tables in some places; the actual schema defines **15 tables** (members is Level 2, not Level 1)
