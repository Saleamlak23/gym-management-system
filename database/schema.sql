-- =============================================================
--  GYM & FITNESS CLUB MANAGEMENT SYSTEM
--  Database Schema — PostgreSQL
--  File: database/schema.sql
--  Run this first before seed.sql or any migrations
-- =============================================================

-- Drop existing tables in reverse dependency order (safe re-run)
DROP TABLE IF EXISTS class_bookings              CASCADE;
DROP TABLE IF EXISTS personal_training_sessions  CASCADE;
DROP TABLE IF EXISTS maintenance_logs            CASCADE;
DROP TABLE IF EXISTS class_schedules             CASCADE;
DROP TABLE IF EXISTS attendance                  CASCADE;
DROP TABLE IF EXISTS equipment                   CASCADE;
DROP TABLE IF EXISTS payments                    CASCADE;
DROP TABLE IF EXISTS subscriptions               CASCADE;
DROP TABLE IF EXISTS staff                       CASCADE;
DROP TABLE IF EXISTS members                     CASCADE;
DROP TABLE IF EXISTS membership_types            CASCADE;
DROP TABLE IF EXISTS classes                     CASCADE;
DROP TABLE IF EXISTS equipment_categories        CASCADE;
DROP TABLE IF EXISTS staff_roles                 CASCADE;
DROP TABLE IF EXISTS branches                    CASCADE;


-- =============================================================
--  LEVEL 1 — No foreign key dependencies
-- =============================================================

CREATE TABLE branches (
    branch_id  SERIAL          PRIMARY KEY,
    name       VARCHAR(100)    NOT NULL,
    address    TEXT            NOT NULL,
    phone      VARCHAR(20)
);

-- ---------------------------------------------------------------

CREATE TABLE staff_roles (
    role_id     SERIAL          PRIMARY KEY,
    role_name   VARCHAR(50)     NOT NULL UNIQUE,
    hourly_rate NUMERIC(10, 2)  NOT NULL CHECK (hourly_rate >= 0)
);

-- ---------------------------------------------------------------

CREATE TABLE membership_types (
    type_id       SERIAL          PRIMARY KEY,
    title         VARCHAR(100)    NOT NULL UNIQUE,
    price         NUMERIC(10, 2)  NOT NULL CHECK (price >= 0),
    duration_days INT             NOT NULL CHECK (duration_days > 0)
);

-- ---------------------------------------------------------------

CREATE TABLE classes (
    class_id    SERIAL          PRIMARY KEY,
    class_name  VARCHAR(100)    NOT NULL,
    description TEXT,
    capacity    INT             NOT NULL CHECK (capacity > 0)
);

-- ---------------------------------------------------------------

CREATE TABLE equipment_categories (
    category_id   SERIAL         PRIMARY KEY,
    category_name VARCHAR(100)   NOT NULL UNIQUE
);


-- =============================================================
--  LEVEL 2 — Depend on Level 1 tables
-- =============================================================

CREATE TABLE members (
    member_id  SERIAL          PRIMARY KEY,
    first_name VARCHAR(50)     NOT NULL,
    last_name  VARCHAR(50)     NOT NULL,
    email      VARCHAR(150)    NOT NULL UNIQUE,
    phone      VARCHAR(20),
    password   VARCHAR(255)    NOT NULL,               -- bcrypt hash (min 8 chars enforced at API layer)
    join_date  DATE            NOT NULL DEFAULT CURRENT_DATE,
    is_active  BOOLEAN         NOT NULL DEFAULT TRUE,  -- soft-delete flag, mirrors staff table

    -- Email must contain @ and at least one dot after it
    CONSTRAINT members_email_format CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),

    -- Phone must be NULL or contain only digits, spaces, hyphens, and + prefix
    CONSTRAINT members_phone_format CHECK (
        phone IS NULL OR phone ~* '^\+?[\d\s\-]{7,20}$'
    )
);

-- ---------------------------------------------------------------

CREATE TABLE staff (
    staff_id   SERIAL       PRIMARY KEY,
    branch_id  INT          NOT NULL REFERENCES branches(branch_id)    ON DELETE RESTRICT,
    role_id    INT          NOT NULL REFERENCES staff_roles(role_id)   ON DELETE RESTRICT,
    first_name VARCHAR(50)  NOT NULL,
    last_name  VARCHAR(50)  NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,               -- bcrypt hash
    is_active  BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------

CREATE TABLE subscriptions (
    subscription_id SERIAL       PRIMARY KEY,
    member_id       INT          NOT NULL REFERENCES members(member_id)          ON DELETE RESTRICT,
    type_id         INT          NOT NULL REFERENCES membership_types(type_id)   ON DELETE RESTRICT,
    start_date      DATE         NOT NULL,
    end_date        DATE         NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'expired', 'cancelled', 'frozen')),
    CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- ---------------------------------------------------------------

CREATE TABLE payments (
    payment_id   SERIAL          PRIMARY KEY,
    member_id    INT             NOT NULL REFERENCES members(member_id)  ON DELETE RESTRICT,
    amount       NUMERIC(10, 2)  NOT NULL CHECK (amount > 0),
    payment_date TIMESTAMP       NOT NULL DEFAULT NOW(),
    method       VARCHAR(30)     NOT NULL
        CHECK (method IN ('cash', 'card', 'bank_transfer', 'mobile_money'))
);

-- ---------------------------------------------------------------

CREATE TABLE equipment (
    equipment_id  SERIAL        PRIMARY KEY,
    branch_id     INT           NOT NULL REFERENCES branches(branch_id)                ON DELETE RESTRICT,
    category_id   INT           NOT NULL REFERENCES equipment_categories(category_id)  ON DELETE RESTRICT,
    model_number  VARCHAR(100)  NOT NULL,
    purchase_date DATE,
    status        VARCHAR(20)   NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'maintenance', 'retired'))
);

-- ---------------------------------------------------------------

CREATE TABLE attendance (
    attendance_id SERIAL     PRIMARY KEY,
    member_id     INT        NOT NULL REFERENCES members(member_id)   ON DELETE RESTRICT,
    branch_id     INT        NOT NULL REFERENCES branches(branch_id)  ON DELETE RESTRICT,
    check_in      TIMESTAMP  NOT NULL DEFAULT NOW(),
    check_out     TIMESTAMP,
    CONSTRAINT valid_checkout CHECK (check_out IS NULL OR check_out > check_in)
);


-- =============================================================
--  LEVEL 3 — Depend on Level 1 and Level 2 tables
-- =============================================================

CREATE TABLE class_schedules (
    schedule_id    SERIAL     PRIMARY KEY,
    class_id       INT        NOT NULL REFERENCES classes(class_id)    ON DELETE RESTRICT,
    branch_id      INT        NOT NULL REFERENCES branches(branch_id)  ON DELETE RESTRICT,
    instructor_id  INT        NOT NULL REFERENCES staff(staff_id)      ON DELETE RESTRICT,
    start_time     TIMESTAMP  NOT NULL,
    end_time       TIMESTAMP  NOT NULL,
    CONSTRAINT valid_schedule_time CHECK (end_time > start_time)
);

-- ---------------------------------------------------------------

CREATE TABLE maintenance_logs (
    log_id        SERIAL          PRIMARY KEY,
    equipment_id  INT             NOT NULL REFERENCES equipment(equipment_id)  ON DELETE RESTRICT,
    service_date  DATE            NOT NULL DEFAULT CURRENT_DATE,
    description   TEXT            NOT NULL,
    cost          NUMERIC(10, 2)  NOT NULL DEFAULT 0 CHECK (cost >= 0)
);

-- ---------------------------------------------------------------

CREATE TABLE personal_training_sessions (
    session_id   SERIAL       PRIMARY KEY,
    member_id    INT          NOT NULL REFERENCES members(member_id)  ON DELETE RESTRICT,
    trainer_id   INT          NOT NULL REFERENCES staff(staff_id)     ON DELETE RESTRICT,
    scheduled_at TIMESTAMP    NOT NULL,
    duration_min INT          NOT NULL DEFAULT 60 CHECK (duration_min > 0),
    status       VARCHAR(20)  NOT NULL DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled'))
);


-- =============================================================
--  LEVEL 4 — Deepest dependency level
-- =============================================================

CREATE TABLE class_bookings (
    booking_id    SERIAL     PRIMARY KEY,
    schedule_id   INT        NOT NULL REFERENCES class_schedules(schedule_id)  ON DELETE RESTRICT,
    member_id     INT        NOT NULL REFERENCES members(member_id)            ON DELETE RESTRICT,
    booking_time  TIMESTAMP  NOT NULL DEFAULT NOW(),
    CONSTRAINT no_duplicate_booking UNIQUE (schedule_id, member_id)
);


-- =============================================================
--  INDEXES — speed up the most common queries
-- =============================================================

-- Members
CREATE INDEX idx_members_email        ON members(email);
CREATE INDEX idx_members_is_active    ON members(is_active);

-- Staff
CREATE INDEX idx_staff_branch         ON staff(branch_id);
CREATE INDEX idx_staff_role           ON staff(role_id);
CREATE INDEX idx_staff_email          ON staff(email);

-- Subscriptions
CREATE INDEX idx_subscriptions_member ON subscriptions(member_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_dates  ON subscriptions(start_date, end_date);

-- Payments
CREATE INDEX idx_payments_member      ON payments(member_id);
CREATE INDEX idx_payments_date        ON payments(payment_date);

-- Attendance
CREATE INDEX idx_attendance_member    ON attendance(member_id);
CREATE INDEX idx_attendance_branch    ON attendance(branch_id);
CREATE INDEX idx_attendance_checkin   ON attendance(check_in);

-- Class schedules
CREATE INDEX idx_schedules_branch     ON class_schedules(branch_id);
CREATE INDEX idx_schedules_instructor ON class_schedules(instructor_id);
CREATE INDEX idx_schedules_start      ON class_schedules(start_time);

-- Class bookings
CREATE INDEX idx_bookings_schedule    ON class_bookings(schedule_id);
CREATE INDEX idx_bookings_member      ON class_bookings(member_id);

-- Equipment
CREATE INDEX idx_equipment_branch     ON equipment(branch_id);
CREATE INDEX idx_equipment_status     ON equipment(status);

-- Maintenance logs
CREATE INDEX idx_maintenance_equip    ON maintenance_logs(equipment_id);
CREATE INDEX idx_maintenance_date     ON maintenance_logs(service_date);

-- Personal training
CREATE INDEX idx_pt_member            ON personal_training_sessions(member_id);
CREATE INDEX idx_pt_trainer           ON personal_training_sessions(trainer_id);
CREATE INDEX idx_pt_scheduled         ON personal_training_sessions(scheduled_at);


-- =============================================================
--  DONE
--  All 16 tables created with constraints and indexes.
--  Next: run database/seed.sql to populate with sample data.
-- =============================================================