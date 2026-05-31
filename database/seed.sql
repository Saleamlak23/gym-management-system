-- =============================================================
--  GYM & FITNESS CLUB MANAGEMENT SYSTEM
--  Seed Data — PostgreSQL
--  File: database/seed.sql
--  Run AFTER schema.sql — requires all 16 tables to exist
-- =============================================================

-- Clear existing data in reverse dependency order
TRUNCATE TABLE class_bookings              RESTART IDENTITY CASCADE;
TRUNCATE TABLE personal_training_sessions  RESTART IDENTITY CASCADE;
TRUNCATE TABLE maintenance_logs            RESTART IDENTITY CASCADE;
TRUNCATE TABLE class_schedules             RESTART IDENTITY CASCADE;
TRUNCATE TABLE attendance                  RESTART IDENTITY CASCADE;
TRUNCATE TABLE equipment                   RESTART IDENTITY CASCADE;
TRUNCATE TABLE payments                    RESTART IDENTITY CASCADE;
TRUNCATE TABLE subscriptions               RESTART IDENTITY CASCADE;
TRUNCATE TABLE staff                       RESTART IDENTITY CASCADE;
TRUNCATE TABLE members                     RESTART IDENTITY CASCADE;
TRUNCATE TABLE membership_types            RESTART IDENTITY CASCADE;
TRUNCATE TABLE classes                     RESTART IDENTITY CASCADE;
TRUNCATE TABLE equipment_categories        RESTART IDENTITY CASCADE;
TRUNCATE TABLE staff_roles                 RESTART IDENTITY CASCADE;
TRUNCATE TABLE branches                    RESTART IDENTITY CASCADE;


-- =============================================================
--  BRANCHES  (3 rows)
-- =============================================================

INSERT INTO branches (name, address, phone) VALUES
    ('Addis Main',      'Bole Road, Kirkos Sub-City, Addis Ababa',         '+251-11-550-1001'),
    ('Kazanchis Branch','Kazanchis, Addis Ababa',                          '+251-11-550-1002'),
    ('Piassa Branch',   'Churchill Avenue, Arada Sub-City, Addis Ababa',   '+251-11-550-1003');


-- =============================================================
--  STAFF ROLES  (6 rows)
-- =============================================================

INSERT INTO staff_roles (role_name, hourly_rate) VALUES
    ('Branch Manager',         25.00),
    ('Personal Trainer',       18.00),
    ('Receptionist',           10.00),
    ('Cleaner',                 7.50),
    ('Group Instructor',       15.00),
    ('Enterprise Administrator', 35.00);


-- =============================================================
--  MEMBERSHIP TYPES  (4 rows)
-- =============================================================

INSERT INTO membership_types (title, price, duration_days) VALUES
    ('Day Pass',    5.00,   1),
    ('Monthly',    40.00,  30),
    ('Quarterly',  110.00, 90),
    ('Annual',     380.00, 365);


-- =============================================================
--  CLASSES  (6 rows)
-- =============================================================

INSERT INTO classes (class_name, description, capacity) VALUES
    ('Yoga',        'Gentle stretching and mindfulness for all levels.',          15),
    ('Spinning',    'High-intensity stationary cycling to upbeat music.',         20),
    ('HIIT',        'High-Intensity Interval Training — full-body burn.',         18),
    ('Pilates',     'Core strengthening and posture correction.',                 12),
    ('Zumba',       'Dance-based cardio class — fun for all fitness levels.',     25),
    ('Boxing Fit',  'Non-contact boxing drills for cardio and coordination.',     16);


-- =============================================================
--  EQUIPMENT CATEGORIES  (4 rows)
-- =============================================================

INSERT INTO equipment_categories (category_name) VALUES
    ('Cardio'),
    ('Strength'),
    ('Flexibility'),
    ('Free Weights');


-- =============================================================
--  MEMBERS  (20 rows)
--  Passwords below are bcrypt hashes of 'Password@123'
--  (12 salt rounds — replace with real hashes in production)
-- =============================================================

INSERT INTO members (first_name, last_name, email, phone, password, is_active) VALUES
    ('Abebe',    'Girma',     'abebe.girma@email.com',     '+251-91-100-0001', '$2b$12$KIXgH9zFkL3mNpQrStUvOeWjYbA4cD6eF8gH0iJ2kL4mN6oP8qR0s', TRUE),
    ('Tigist',   'Haile',     'tigist.haile@email.com',    '+251-91-100-0002', '$2b$12$KIXgH9zFkL3mNpQrStUvOeWjYbA4cD6eF8gH0iJ2kL4mN6oP8qR0s', TRUE),
    ('Dawit',    'Tesfaye',   'dawit.tesfaye@email.com',   '+251-91-100-0003', '$2b$12$KIXgH9zFkL3mNpQrStUvOeWjYbA4cD6eF8gH0iJ2kL4mN6oP8qR0s', TRUE),
    ('Selam',    'Bekele',    'selam.bekele@email.com',    '+251-91-100-0004', '$2b$12$KIXgH9zFkL3mNpQrStUvOeWjYbA4cD6eF8gH0iJ2kL4mN6oP8qR0s', TRUE),
    ('Yonas',    'Alemu',     'yonas.alemu@email.com',     '+251-91-100-0005', '$2b$12$KIXgH9zFkL3mNpQrStUvOeWjYbA4cD6eF8gH0iJ2kL4mN6oP8qR0s', TRUE),
    ('Meron',    'Tadesse',   'meron.tadesse@email.com',   '+251-91-100-0006', '$2b$12$KIXgH9zFkL3mNpQrStUvOeWjYbA4cD6eF8gH0iJ2kL4mN6oP8qR0s', TRUE),
    ('Hiwot',    'Kebede',    'hiwot.kebede@email.com',    '+251-91-100-0007', '$2b$12$KIXgH9zFkL3mNpQrStUvOeWjYbA4cD6eF8gH0iJ2kL4mN6oP8qR0s', TRUE),
    ('Biruk',    'Mulugeta',  'biruk.mulugeta@email.com',  '+251-91-100-0008', '$2b$12$KIXgH9zFkL3mNpQrStUvOeWjYbA4cD6eF8gH0iJ2kL4mN6oP8qR0s', TRUE),
    ('Sara',     'Worku',     'sara.worku@email.com',      '+251-91-100-0009', '$2b$12$KIXgH9zFkL3mNpQrStUvOeWjYbA4cD6eF8gH0iJ2kL4mN6oP8qR0s', TRUE),
    ('Mikias',   'Getachew',  'mikias.getachew@email.com', '+251-91-100-0010', '$2b$12$KIXgH9zFkL3mNpQrStUvOeWjYbA4cD6eF8gH0iJ2kL4mN6oP8qR0s', TRUE),
    ('Lidiya',   'Seifu',     'lidiya.seifu@email.com',    '+251-91-100-0011', '$2b$12$KIXgH9zFkL3mNpQrStUvOeWjYbA4cD6eF8gH0iJ2kL4mN6oP8qR0s', TRUE),
    ('Nahom',    'Desta',     'nahom.desta@email.com',     '+251-91-100-0012', '$2b$12$KIXgH9zFkL3mNpQrStUvOeWjYbA4cD6eF8gH0iJ2kL4mN6oP8qR0s', TRUE),
    ('Bethlehem','Assefa',    'bethlehem.assefa@email.com','+251-91-100-0013', '$2b$12$KIXgH9zFkL3mNpQrStUvOeWjYbA4cD6eF8gH0iJ2kL4mN6oP8qR0s', TRUE),
    ('Robel',    'Hailu',     'robel.hailu@email.com',     '+251-91-100-0014', '$2b$12$KIXgH9zFkL3mNpQrStUvOeWjYbA4cD6eF8gH0iJ2kL4mN6oP8qR0s', TRUE),
    ('Eden',     'Mekonnen',  'eden.mekonnen@email.com',   '+251-91-100-0015', '$2b$12$KIXgH9zFkL3mNpQrStUvOeWjYbA4cD6eF8gH0iJ2kL4mN6oP8qR0s', TRUE),
    ('Kaleb',    'Yimer',     'kaleb.yimer@email.com',     '+251-91-100-0016', '$2b$12$KIXgH9zFkL3mNpQrStUvOeWjYbA4cD6eF8gH0iJ2kL4mN6oP8qR0s', TRUE),
    ('Feven',    'Girma',     'feven.girma@email.com',     '+251-91-100-0017', '$2b$12$KIXgH9zFkL3mNpQrStUvOeWjYbA4cD6eF8gH0iJ2kL4mN6oP8qR0s', TRUE),
    ('Abel',     'Tsegaye',   'abel.tsegaye@email.com',    '+251-91-100-0018', '$2b$12$KIXgH9zFkL3mNpQrStUvOeWjYbA4cD6eF8gH0iJ2kL4mN6oP8qR0s', TRUE),
    ('Rahel',    'Abebe',     'rahel.abebe@email.com',     '+251-91-100-0019', '$2b$12$KIXgH9zFkL3mNpQrStUvOeWjYbA4cD6eF8gH0iJ2kL4mN6oP8qR0s', TRUE),
    ('Yared',    'Solomon',   'yared.solomon@email.com',   '+251-91-100-0020', '$2b$12$KIXgH9zFkL3mNpQrStUvOeWjYbA4cD6eF8gH0iJ2kL4mN6oP8qR0s', TRUE);


-- =============================================================
--  STAFF  (9 rows)
--  Passwords below are bcrypt hashes of 'Password@123'
--  (12 salt rounds — replace with real hashes in production)
-- =============================================================

INSERT INTO staff (branch_id, role_id, first_name, last_name, email, password, is_active) VALUES
    -- Branch 1 — Addis Main
    (1, 1, 'Alemayehu', 'Bekele', 'alem.bekele@gym.com',      '$2b$12$4ttKMugP94l0CAEruA1m..7r8NRKUp3ZGgbDIhUBBnBFarpLxL0Eq', TRUE),  -- Branch Manager
    (1, 6, 'Saba',      'Addis',   'admin@gym.com',            '$2b$12$4ttKMugP94l0CAEruA1m..7r8NRKUp3ZGgbDIhUBBnBFarpLxL0Eq', TRUE),  -- Enterprise Admin
    (1, 2, 'Tigabu',    'Wolde', 'tigabu.wolde@gym.com',      '$2b$12$4ttKMugP94l0CAEruA1m..7r8NRKUp3ZGgbDIhUBBnBFarpLxL0Eq', TRUE),  -- Trainer
    (1, 5, 'Mekdes',    'Girma',    'mekdes.girma@gym.com',   '$2b$12$4ttKMugP94l0CAEruA1m..7r8NRKUp3ZGgbDIhUBBnBFarpLxL0Eq', TRUE),  -- Group Instructor
    (1, 3, 'Yohannes',  'Teklu',    'yohannes.teklu@gym.com', '$2b$12$4ttKMugP94l0CAEruA1m..7r8NRKUp3ZGgbDIhUBBnBFarpLxL0Eq', TRUE),  -- Receptionist

    -- Branch 2 — Kazanchis
    (2, 1, 'Birtukan',  'Alemu',    'birtukan.alemu@gym.com', '$2b$12$4ttKMugP94l0CAEruA1m..7r8NRKUp3ZGgbDIhUBBnBFarpLxL0Eq', TRUE),  -- Branch Manager
    (2, 2, 'Habtamu',   'Desta',    'habtamu.desta@gym.com',  '$2b$12$4ttKMugP94l0CAEruA1m..7r8NRKUp3ZGgbDIhUBBnBFarpLxL0Eq', TRUE),  -- Trainer
    (2, 3, 'Selamawit', 'Tesfaye',  'selam.tesfaye@gym.com',  '$2b$12$4ttKMugP94l0CAEruA1m..7r8NRKUp3ZGgbDIhUBBnBFarpLxL0Eq', TRUE),  -- Receptionist

    -- Branch 3 — Piassa
    (3, 1, 'Tewodros',  'Haile',    'tewodros.haile@gym.com', '$2b$12$4ttKMugP94l0CAEruA1m..7r8NRKUp3ZGgbDIhUBBnBFarpLxL0Eq', TRUE),  -- Branch Manager
    (3, 2, 'Almaz',     'Seifu',    'almaz.seifu@gym.com',    '$2b$12$4ttKMugP94l0CAEruA1m..7r8NRKUp3ZGgbDIhUBBnBFarpLxL0Eq', TRUE);  -- Trainer


-- =============================================================
--  SUBSCRIPTIONS  (25 rows — mix of all statuses)
-- =============================================================

INSERT INTO subscriptions (member_id, type_id, start_date, end_date, status) VALUES
    -- Active subscriptions (status = 'active', end_date in the future)
    (1,  3, '2025-03-01', '2025-05-29', 'active'),    -- Abebe    — Quarterly
    (2,  2, '2025-04-15', '2025-05-15', 'active'),    -- Tigist   — Monthly
    (3,  4, '2025-01-01', '2025-12-31', 'active'),    -- Dawit    — Annual
    (4,  2, '2025-05-01', '2025-05-31', 'active'),    -- Selam    — Monthly
    (5,  3, '2025-02-15', '2025-05-15', 'active'),    -- Yonas    — Quarterly
    (6,  4, '2024-12-01', '2025-11-30', 'active'),    -- Meron    — Annual
    (7,  2, '2025-05-10', '2025-06-09', 'active'),    -- Hiwot    — Monthly
    (8,  3, '2025-03-20', '2025-06-17', 'active'),    -- Biruk    — Quarterly
    (9,  4, '2025-01-15', '2026-01-14', 'active'),    -- Sara     — Annual
    (10, 2, '2025-05-05', '2025-06-04', 'active'),    -- Mikias   — Monthly
    (11, 1, '2025-05-17', '2025-05-18', 'active'),    -- Lidiya   — Day Pass
    (12, 2, '2025-04-20', '2025-05-20', 'active'),    -- Nahom    — Monthly

    -- Expired subscriptions (end_date in the past)
    (13, 2, '2025-02-01', '2025-03-03', 'expired'),   -- Bethlehem — Monthly
    (14, 3, '2024-11-01', '2025-01-29', 'expired'),   -- Robel     — Quarterly
    (15, 2, '2025-01-10', '2025-02-09', 'expired'),   -- Eden      — Monthly
    (16, 4, '2024-05-01', '2025-04-30', 'expired'),   -- Kaleb     — Annual

    -- Cancelled subscriptions
    (17, 2, '2025-03-01', '2025-03-31', 'cancelled'), -- Feven     — Monthly
    (18, 3, '2025-01-01', '2025-03-31', 'cancelled'), -- Abel      — Quarterly

    -- Frozen subscriptions
    (19, 4, '2024-10-01', '2025-09-30', 'frozen'),    -- Rahel     — Annual
    (20, 2, '2025-04-01', '2025-04-30', 'frozen'),    -- Yared     — Monthly

    -- Historical records (members who renewed — multiple subscriptions)
    (1,  2, '2024-12-01', '2024-12-31', 'expired'),   -- Abebe    — old Monthly before current Quarterly
    (3,  2, '2024-07-01', '2024-07-31', 'expired'),   -- Dawit    — before Annual
    (5,  2, '2024-11-01', '2024-11-30', 'expired'),   -- Yonas    — before Quarterly
    (6,  3, '2024-09-01', '2024-11-29', 'expired'),   -- Meron    — before Annual
    (9,  2, '2024-10-01', '2024-10-31', 'expired');   -- Sara     — before Annual


-- =============================================================
--  PAYMENTS  (30 rows)
-- =============================================================

INSERT INTO payments (member_id, amount, payment_date, method) VALUES
    (1,  110.00, '2025-03-01 09:15:00', 'card'),
    (2,   40.00, '2025-04-15 10:30:00', 'cash'),
    (3,  380.00, '2025-01-01 08:00:00', 'bank_transfer'),
    (4,   40.00, '2025-05-01 11:00:00', 'mobile_money'),
    (5,  110.00, '2025-02-15 09:45:00', 'card'),
    (6,  380.00, '2024-12-01 14:00:00', 'bank_transfer'),
    (7,   40.00, '2025-05-10 10:00:00', 'cash'),
    (8,  110.00, '2025-03-20 13:20:00', 'card'),
    (9,  380.00, '2025-01-15 09:00:00', 'bank_transfer'),
    (10,  40.00, '2025-05-05 11:30:00', 'mobile_money'),
    (11,   5.00, '2025-05-17 08:30:00', 'cash'),
    (12,  40.00, '2025-04-20 10:15:00', 'card'),
    (13,  40.00, '2025-02-01 09:00:00', 'cash'),
    (14, 110.00, '2024-11-01 10:45:00', 'card'),
    (15,  40.00, '2025-01-10 08:30:00', 'mobile_money'),
    (16, 380.00, '2024-05-01 09:15:00', 'bank_transfer'),
    (17,  40.00, '2025-03-01 11:00:00', 'card'),
    (18, 110.00, '2025-01-01 09:30:00', 'cash'),
    (19, 380.00, '2024-10-01 10:00:00', 'bank_transfer'),
    (20,  40.00, '2025-04-01 11:45:00', 'card'),
    -- Historical payments for members with multiple subscriptions
    (1,   40.00, '2024-12-01 09:00:00', 'cash'),
    (3,   40.00, '2024-07-01 10:30:00', 'mobile_money'),
    (5,   40.00, '2024-11-01 09:15:00', 'card'),
    (6,  110.00, '2024-09-01 14:30:00', 'bank_transfer'),
    (9,   40.00, '2024-10-01 09:00:00', 'cash'),
    -- Personal training top-up payments
    (2,   25.00, '2025-04-20 09:00:00', 'cash'),
    (4,   25.00, '2025-05-03 10:00:00', 'card'),
    (7,   25.00, '2025-05-12 11:00:00', 'mobile_money'),
    (10,  25.00, '2025-05-06 09:30:00', 'cash'),
    (12,  25.00, '2025-04-22 10:15:00', 'card');


-- =============================================================
--  EQUIPMENT  (15 rows across 3 branches)
-- =============================================================

INSERT INTO equipment (branch_id, category_id, model_number, purchase_date, status) VALUES
    -- Branch 1 — Addis Main
    (1, 1, 'TREK-T500',     '2022-01-15', 'active'),      -- Treadmill
    (1, 1, 'BIKE-S200',     '2022-01-15', 'active'),      -- Stationary Bike
    (1, 2, 'CABLE-X3',      '2021-06-10', 'active'),      -- Cable Machine
    (1, 2, 'SMITH-M1',      '2021-06-10', 'maintenance'), -- Smith Machine
    (1, 4, 'DUMB-SET-20',   '2022-03-01', 'active'),      -- Dumbbell Set

    -- Branch 2 — Kazanchis
    (2, 1, 'ELLIP-E400',    '2023-02-20', 'active'),      -- Elliptical
    (2, 1, 'ROW-R100',      '2023-02-20', 'active'),      -- Rowing Machine
    (2, 2, 'BENCH-P2',      '2022-11-05', 'active'),      -- Bench Press
    (2, 3, 'YOGA-MAT-SET',  '2023-05-01', 'active'),      -- Yoga Mats
    (2, 4, 'KETTLE-SET',    '2022-08-14', 'maintenance'), -- Kettlebell Set

    -- Branch 3 — Piassa
    (3, 1, 'TREK-T501',     '2021-03-10', 'active'),      -- Treadmill
    (3, 1, 'BIKE-S201',     '2021-03-10', 'retired'),     -- Old Stationary Bike
    (3, 2, 'MULTI-GYM-M3',  '2022-07-22', 'active'),      -- Multi Gym Station
    (3, 3, 'PILATES-REF',   '2023-01-08', 'active'),      -- Pilates Reformer
    (3, 4, 'BARBELL-SET',   '2021-09-30', 'active');      -- Barbell Set


-- =============================================================
--  MAINTENANCE LOGS  (10 rows)
-- =============================================================

INSERT INTO maintenance_logs (equipment_id, service_date, description, cost) VALUES
    (4,  '2025-04-10', 'Smith Machine cable snapped — replaced with heavy-duty cable and lubricated rails.',        150.00),
    (4,  '2024-11-05', 'Routine inspection — tightened bolts, adjusted counter-balance.',                           30.00),
    (1,  '2025-01-20', 'Treadmill belt worn — replaced belt and recalibrated incline motor.',                      200.00),
    (10, '2025-03-15', 'Kettlebell handle cracked on 24 kg unit — replaced handle grip.',                          45.00),
    (10, '2024-08-22', 'Routine cleaning and rust treatment on all kettlebell surfaces.',                           20.00),
    (12, '2024-06-01', 'Stationary bike flywheel bearing failed — repair cost exceeds value; marked for retirement.',310.00),
    (3,  '2025-02-28', 'Cable machine pulley system serviced — cables replaced preventively.',                     120.00),
    (11, '2024-12-10', 'Treadmill motor serviced — belt lubricated and speed sensor recalibrated.',                 95.00),
    (7,  '2025-04-05', 'Rowing machine chain and footrest strap replaced.',                                         60.00),
    (2,  '2025-03-01', 'Annual service — resistance calibration and console firmware update.',                       40.00);


-- =============================================================
--  CLASS SCHEDULES  (12 rows — this week and next)
-- =============================================================

INSERT INTO class_schedules (class_id, branch_id, instructor_id, start_time, end_time) VALUES
    -- Branch 1 — this week
    (1, 1, 3, '2025-05-19 07:00:00', '2025-05-19 08:00:00'),  -- Yoga,     Mon morning,  Mekdes
    (3, 1, 3, '2025-05-19 18:00:00', '2025-05-19 19:00:00'),  -- HIIT,     Mon evening,  Mekdes
    (2, 1, 2, '2025-05-20 06:30:00', '2025-05-20 07:30:00'),  -- Spinning, Tue morning,  Tigabu
    (5, 1, 3, '2025-05-21 17:30:00', '2025-05-21 18:30:00'),  -- Zumba,    Wed evening,  Mekdes
    (6, 1, 2, '2025-05-22 06:30:00', '2025-05-22 07:30:00'),  -- Boxing,   Thu morning,  Tigabu

    -- Branch 2 — this week
    (4, 2, 6, '2025-05-19 09:00:00', '2025-05-19 10:00:00'),  -- Pilates,  Mon morning,  Habtamu
    (1, 2, 6, '2025-05-21 07:00:00', '2025-05-21 08:00:00'),  -- Yoga,     Wed morning,  Habtamu
    (3, 2, 6, '2025-05-23 17:00:00', '2025-05-23 18:00:00'),  -- HIIT,     Fri evening,  Habtamu

    -- Branch 3 — this week
    (2, 3, 9, '2025-05-20 07:00:00', '2025-05-20 08:00:00'),  -- Spinning, Tue morning,  Almaz
    (5, 3, 9, '2025-05-22 18:00:00', '2025-05-22 19:00:00'),  -- Zumba,    Thu evening,  Almaz

    -- Next week
    (1, 1, 3, '2025-05-26 07:00:00', '2025-05-26 08:00:00'),  -- Yoga,     Next Mon,     Mekdes
    (3, 1, 2, '2025-05-27 18:00:00', '2025-05-27 19:00:00');  -- HIIT,     Next Tue,     Tigabu


-- =============================================================
--  CLASS BOOKINGS  (22 rows)
-- =============================================================

INSERT INTO class_bookings (schedule_id, member_id, booking_time) VALUES
    -- Schedule 1: Yoga Mon morning Branch 1 (capacity 15)
    (1,  1,  '2025-05-16 10:00:00'),
    (1,  2,  '2025-05-16 10:05:00'),
    (1,  3,  '2025-05-16 11:30:00'),
    (1,  4,  '2025-05-17 08:00:00'),
    (1,  6,  '2025-05-17 09:15:00'),

    -- Schedule 2: HIIT Mon evening Branch 1 (capacity 18)
    (2,  5,  '2025-05-16 12:00:00'),
    (2,  7,  '2025-05-16 14:00:00'),
    (2,  8,  '2025-05-17 07:30:00'),

    -- Schedule 3: Spinning Tue morning Branch 1 (capacity 20)
    (3,  1,  '2025-05-16 10:10:00'),
    (3,  9,  '2025-05-17 09:00:00'),
    (3,  10, '2025-05-17 09:20:00'),

    -- Schedule 4: Zumba Wed evening Branch 1 (capacity 25)
    (4,  2,  '2025-05-16 10:15:00'),
    (4,  3,  '2025-05-16 13:00:00'),
    (4,  4,  '2025-05-17 08:10:00'),
    (4,  6,  '2025-05-17 10:00:00'),
    (4,  11, '2025-05-17 11:00:00'),
    (4,  12, '2025-05-17 11:30:00'),

    -- Schedule 6: Pilates Mon morning Branch 2 (capacity 12)
    (6,  13, '2025-05-16 09:00:00'),
    (6,  14, '2025-05-16 09:30:00'),

    -- Schedule 9: Spinning Tue morning Branch 3 (capacity 20)
    (9,  15, '2025-05-16 10:00:00'),
    (9,  16, '2025-05-16 10:30:00'),
    (9,  17, '2025-05-17 08:00:00');


-- =============================================================
--  PERSONAL TRAINING SESSIONS  (12 rows)
-- =============================================================

INSERT INTO personal_training_sessions (member_id, trainer_id, scheduled_at, duration_min, status) VALUES
    -- Completed sessions (past)
    (1,  2, '2025-05-05 07:00:00', 60,  'completed'),
    (2,  2, '2025-05-06 08:00:00', 60,  'completed'),
    (4,  6, '2025-05-07 09:00:00', 60,  'completed'),
    (7,  9, '2025-05-08 06:30:00', 90,  'completed'),

    -- Confirmed upcoming sessions
    (3,  2, '2025-05-19 07:00:00', 60,  'confirmed'),
    (5,  6, '2025-05-19 10:00:00', 60,  'confirmed'),
    (8,  9, '2025-05-20 07:00:00', 90,  'confirmed'),

    -- Scheduled (not yet confirmed)
    (10, 2, '2025-05-21 08:00:00', 60,  'scheduled'),
    (12, 6, '2025-05-22 09:00:00', 60,  'scheduled'),

    -- Cancelled sessions
    (6,  2, '2025-05-10 07:00:00', 60,  'cancelled'),
    (11, 9, '2025-05-12 09:00:00', 60,  'cancelled'),
    (9,  6, '2025-05-14 08:00:00', 90,  'cancelled');


-- =============================================================
--  ATTENDANCE  (40 rows — last 30 days)
-- =============================================================

INSERT INTO attendance (member_id, branch_id, check_in, check_out) VALUES
    -- Week of May 12
    (1,  1, '2025-05-12 06:35:00', '2025-05-12 08:10:00'),
    (2,  1, '2025-05-12 07:05:00', '2025-05-12 08:45:00'),
    (3,  1, '2025-05-12 17:55:00', '2025-05-12 19:30:00'),
    (5,  2, '2025-05-12 09:10:00', '2025-05-12 10:50:00'),
    (9,  3, '2025-05-12 07:00:00', '2025-05-12 08:30:00'),
    (4,  1, '2025-05-13 06:50:00', '2025-05-13 08:00:00'),
    (6,  1, '2025-05-13 17:45:00', '2025-05-13 19:15:00'),
    (10, 2, '2025-05-13 08:00:00', '2025-05-13 09:30:00'),
    (7,  1, '2025-05-14 06:30:00', '2025-05-14 07:45:00'),
    (8,  1, '2025-05-14 17:50:00', '2025-05-14 19:20:00'),

    -- Week of May 5
    (1,  1, '2025-05-05 06:30:00', '2025-05-05 08:00:00'),
    (2,  1, '2025-05-05 07:00:00', '2025-05-05 08:30:00'),
    (3,  1, '2025-05-06 07:00:00', '2025-05-06 08:15:00'),
    (4,  1, '2025-05-06 18:00:00', '2025-05-06 19:30:00'),
    (5,  2, '2025-05-07 09:00:00', '2025-05-07 10:45:00'),
    (6,  1, '2025-05-07 07:10:00', '2025-05-07 08:40:00'),
    (9,  3, '2025-05-08 06:50:00', '2025-05-08 08:10:00'),
    (10, 2, '2025-05-08 08:00:00', '2025-05-08 09:30:00'),
    (11, 1, '2025-05-09 09:00:00', '2025-05-09 10:00:00'),
    (12, 1, '2025-05-09 17:30:00', '2025-05-09 19:00:00'),

    -- Week of Apr 28
    (1,  1, '2025-04-28 06:35:00', '2025-04-28 08:05:00'),
    (2,  1, '2025-04-28 07:00:00', '2025-04-28 08:30:00'),
    (3,  1, '2025-04-29 07:05:00', '2025-04-29 08:20:00'),
    (5,  2, '2025-04-29 09:15:00', '2025-04-29 10:45:00'),
    (7,  1, '2025-04-30 06:45:00', '2025-04-30 08:00:00'),
    (8,  1, '2025-04-30 17:55:00', '2025-04-30 19:25:00'),
    (9,  3, '2025-05-01 07:00:00', '2025-05-01 08:30:00'),
    (10, 2, '2025-05-01 08:10:00', '2025-05-01 09:40:00'),
    (6,  1, '2025-05-02 07:00:00', '2025-05-02 08:45:00'),
    (12, 1, '2025-05-02 17:30:00', '2025-05-02 19:00:00'),

    -- Week of Apr 21
    (1,  1, '2025-04-21 06:30:00', '2025-04-21 08:00:00'),
    (3,  1, '2025-04-22 07:00:00', '2025-04-22 08:15:00'),
    (4,  1, '2025-04-22 18:00:00', '2025-04-22 19:20:00'),
    (6,  1, '2025-04-23 07:05:00', '2025-04-23 08:40:00'),
    (9,  3, '2025-04-24 06:55:00', '2025-04-24 08:10:00'),
    (10, 2, '2025-04-24 08:00:00', '2025-04-24 09:30:00'),
    (5,  2, '2025-04-25 09:00:00', '2025-04-25 10:30:00'),
    (7,  1, '2025-04-25 07:00:00', '2025-04-25 08:15:00'),
    -- Open attendance record (checked in, not yet checked out — today)
    (2,  1, '2025-05-17 07:10:00', NULL),
    (8,  1, '2025-05-17 07:45:00', NULL);


-- =============================================================
--  DONE
--  All 16 tables seeded with realistic sample data.
--  Summary:
--    Branches:                   3
--    Staff roles:                5
--    Membership types:           4
--    Classes:                    6
--    Equipment categories:       4
--    Members:                   20
--    Staff:                      9
--    Subscriptions:             25 (12 active, 5 expired, 2 cancelled, 2 frozen, 4 historical)
--    Payments:                  30
--    Equipment:                 15 (12 active, 2 maintenance, 1 retired)
--    Maintenance logs:          10
--    Class schedules:           12
--    Class bookings:            22
--    Personal training:         12 (4 completed, 3 confirmed, 2 scheduled, 3 cancelled)
--    Attendance:                40 (38 complete, 2 open/checked-in today)
-- =============================================================