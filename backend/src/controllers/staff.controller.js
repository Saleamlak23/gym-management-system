// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Staff Controller
//  File: backend/src/controllers/staff.controller.js
//
//  Handles:
//    listRoles    — all roles with staff counts
//    createRole   — new role
//    updateRole   — update role name or hourly rate
//    list         — all staff with filters
//    getOne       — single staff member with full profile
//    create       — create a new staff member
//    update       — update staff profile fields
//    deactivate   — soft-delete a staff member
//    getSchedule  — upcoming class sessions for a staff member
//    getPayroll   — estimated payroll based on scheduled hours
// =============================================================

import { hash } from 'bcryptjs';
import { query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const SALT_ROUNDS = 12;


export const listRoles = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT
       sr.role_id,
       sr.role_name,
       sr.hourly_rate,
       COUNT(s.staff_id)::int AS staff_count
     FROM staff_roles sr
     LEFT JOIN staff s ON s.role_id = sr.role_id AND s.is_active = true
     GROUP BY sr.role_id
     ORDER BY sr.role_name ASC`
  );

  return sendSuccess(res, { roles: rows });
});


export const createRole = asyncHandler(async (req, res) => {
  const { role_name, hourly_rate } = req.body;

  const existing = await query(
    'SELECT role_id FROM staff_roles WHERE LOWER(role_name) = LOWER($1)',
    [role_name]
  );

  if (existing.rows.length > 0) {
    return sendError(res, 'A role with this name already exists.', 409);
  }

  const { rows } = await query(
    `INSERT INTO staff_roles (role_name, hourly_rate)
     VALUES ($1, $2)
     RETURNING role_id, role_name, hourly_rate`,
    [role_name, hourly_rate]
  );

  return sendSuccess(res, { role: rows[0] }, 201, 'Role created successfully');
});


export const updateRole = asyncHandler(async (req, res) => {
  const { roleId }                 = req.params;
  const { role_name, hourly_rate } = req.body;

  const existing = await query(
    'SELECT role_id FROM staff_roles WHERE role_id = $1',
    [roleId]
  );

  if (existing.rows.length === 0) {
    return sendError(res, 'Role not found.', 404);
  }

  const fields = [];
  const values = [];
  let   pIndex = 1;

  if (role_name   !== undefined) { fields.push(`role_name   = $${pIndex++}`); values.push(role_name);   }
  if (hourly_rate !== undefined) { fields.push(`hourly_rate = $${pIndex++}`); values.push(hourly_rate); }

  if (fields.length === 0) {
    return sendError(res, 'No fields provided to update.', 400);
  }

  values.push(roleId);

  const { rows } = await query(
    `UPDATE staff_roles
     SET    ${fields.join(', ')}
     WHERE  role_id = $${pIndex}
     RETURNING role_id, role_name, hourly_rate`,
    values
  );

  return sendSuccess(res, { role: rows[0] }, 200, 'Role updated successfully');
});


export const list = asyncHandler(async (req, res) => {
  const branchId = Number(req.query.branch_id);
  const roleId   = Number(req.query.role_id);
  const isActive = req.query.is_active !== 'false'; // defaults to active only

  const filters = [`s.is_active = $1`];
  const params  = [isActive];
  let   pIndex  = 2;

  if (Number.isInteger(branchId) && branchId > 0) {
    filters.push(`s.branch_id = $${pIndex++}`)
    params.push(branchId)
  }

  if (Number.isInteger(roleId) && roleId > 0) {
    filters.push(`s.role_id   = $${pIndex++}`)
    params.push(roleId)
  }

  const { rows } = await query(
    `SELECT
       s.staff_id,
       s.first_name,
       s.last_name,
       s.email,
       s.is_active,
       sr.role_id,
       sr.role_name,
       sr.hourly_rate,
       b.branch_id,
       b.name  AS branch_name
     FROM staff        s
     JOIN staff_roles  sr ON sr.role_id   = s.role_id
     JOIN branches     b  ON b.branch_id  = s.branch_id
     WHERE ${filters.join(' AND ')}
     ORDER BY b.name ASC, sr.role_name ASC, s.last_name ASC`,
    params
  );

  return sendSuccess(res, { staff: rows, total: rows.length });
});


export const getOne = asyncHandler(async (req, res) => {
  const { staffId } = req.params;

  const { rows } = await query(
    `SELECT
       s.staff_id,
       s.first_name,
       s.last_name,
       s.email,
       s.is_active,
       sr.role_id,
       sr.role_name,
       sr.hourly_rate,
       b.branch_id,
       b.name    AS branch_name,
       b.address AS branch_address,
       -- Upcoming class count
       (
         SELECT COUNT(*)
         FROM   class_schedules
         WHERE  instructor_id = s.staff_id
           AND  start_time   >= NOW()
       )::int    AS upcoming_classes,
       -- Upcoming training sessions count
       (
         SELECT COUNT(*)
         FROM   personal_training_sessions
         WHERE  trainer_id = s.staff_id
           AND  status NOT IN ('cancelled', 'completed')
           AND  scheduled_at >= NOW()
       )::int    AS upcoming_training_sessions
     FROM staff       s
     JOIN staff_roles sr ON sr.role_id  = s.role_id
     JOIN branches    b  ON b.branch_id = s.branch_id
     WHERE s.staff_id = $1`,
    [staffId]
  );

  if (rows.length === 0) {
    return sendError(res, 'Staff member not found.', 404);
  }

  return sendSuccess(res, { staff: rows[0] });
});


export const create = asyncHandler(async (req, res) => {
  const { branch_id, role_id, first_name, last_name, email, password } = req.body;

  // Check email uniqueness across both staff and members tables
  const staffEmailCheck = await query(
    'SELECT staff_id FROM staff WHERE email = $1',
    [email]
  );
  if (staffEmailCheck.rows.length > 0) {
    return sendError(res, 'A staff account with this email already exists.', 409);
  }

  const memberEmailCheck = await query(
    'SELECT member_id FROM members WHERE email = $1',
    [email]
  );
  if (memberEmailCheck.rows.length > 0) {
    return sendError(
      res,
      'This email is already registered as a member account.',
      409
    );
  }

  // Confirm branch exists
  const branchCheck = await query(
    'SELECT branch_id FROM branches WHERE branch_id = $1',
    [branch_id]
  );
  if (branchCheck.rows.length === 0) {
    return sendError(res, 'Branch not found.', 404);
  }

  // Confirm role exists
  const roleCheck = await query(
    'SELECT role_id FROM staff_roles WHERE role_id = $1',
    [role_id]
  );
  if (roleCheck.rows.length === 0) {
    return sendError(res, 'Role not found.', 404);
  }

  const hashedPassword = await hash(password, SALT_ROUNDS);

  const { rows } = await query(
    `INSERT INTO staff (branch_id, role_id, first_name, last_name, email, password)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING staff_id, branch_id, role_id, first_name, last_name, email, is_active`,
    [branch_id, role_id, first_name, last_name, email, hashedPassword]
  );

  return sendSuccess(res, { staff: rows[0] }, 201, 'Staff member created successfully');
});


export const update = asyncHandler(async (req, res) => {
  const { staffId }                                   = req.params;
  const { branch_id, role_id, first_name, last_name, email } = req.body;

  const existing = await query(
    'SELECT staff_id FROM staff WHERE staff_id = $1 AND is_active = true',
    [staffId]
  );

  if (existing.rows.length === 0) {
    return sendError(res, 'Staff member not found.', 404);
  }

  // Validate email uniqueness if being changed
  if (email) {
    const emailCheck = await query(
      'SELECT staff_id FROM staff WHERE email = $1 AND staff_id != $2',
      [email, staffId]
    );
    if (emailCheck.rows.length > 0) {
      return sendError(res, 'This email is already used by another staff member.', 409);
    }
  }

  // Validate branch and role if being changed
  if (branch_id) {
    const branchCheck = await query('SELECT branch_id FROM branches WHERE branch_id = $1', [branch_id]);
    if (branchCheck.rows.length === 0) return sendError(res, 'Branch not found.', 404);
  }
  if (role_id) {
    const roleCheck = await query('SELECT role_id FROM staff_roles WHERE role_id = $1', [role_id]);
    if (roleCheck.rows.length === 0) return sendError(res, 'Role not found.', 404);
  }

  const fields = [];
  const values = [];
  let   pIndex = 1;

  if (branch_id  !== undefined) { fields.push(`branch_id  = $${pIndex++}`); values.push(branch_id);  }
  if (role_id    !== undefined) { fields.push(`role_id    = $${pIndex++}`); values.push(role_id);    }
  if (first_name !== undefined) { fields.push(`first_name = $${pIndex++}`); values.push(first_name); }
  if (last_name  !== undefined) { fields.push(`last_name  = $${pIndex++}`); values.push(last_name);  }
  if (email      !== undefined) { fields.push(`email      = $${pIndex++}`); values.push(email);      }

  if (fields.length === 0) {
    return sendError(res, 'No fields provided to update.', 400);
  }

  values.push(staffId);

  const { rows } = await query(
    `UPDATE staff
     SET    ${fields.join(', ')}
     WHERE  staff_id = $${pIndex}
     RETURNING staff_id, branch_id, role_id, first_name, last_name, email, is_active`,
    values
  );

  return sendSuccess(res, { staff: rows[0] }, 200, 'Staff member updated successfully');
});


export const deactivate = asyncHandler(async (req, res) => {
  const { staffId } = req.params;

  const existing = await query(
    'SELECT staff_id FROM staff WHERE staff_id = $1 AND is_active = true',
    [staffId]
  );

  if (existing.rows.length === 0) {
    return sendError(res, 'Staff member not found or already deactivated.', 404);
  }

  await query(
    'UPDATE staff SET is_active = false WHERE staff_id = $1',
    [staffId]
  );

  return sendSuccess(res, null, 200, 'Staff member deactivated successfully');
});


export const getSchedule = asyncHandler(async (req, res) => {
  const { staffId } = req.params;

  const staffCheck = await query(
    `SELECT staff_id, first_name || ' ' || last_name AS name
     FROM staff WHERE staff_id = $1`,
    [staffId]
  );

  if (staffCheck.rows.length === 0) {
    return sendError(res, 'Staff member not found.', 404);
  }

  const { rows } = await query(
    `SELECT
       cs.schedule_id,
       cs.start_time,
       cs.end_time,
       c.class_name,
       c.description,
       c.capacity,
       b.name                         AS branch_name,
       COUNT(cb.booking_id)::int      AS bookings_count,
       EXTRACT(EPOCH FROM (cs.end_time - cs.start_time)) / 3600 AS duration_hours
     FROM class_schedules  cs
     JOIN classes          c  ON c.class_id     = cs.class_id
     JOIN branches         b  ON b.branch_id    = cs.branch_id
     LEFT JOIN class_bookings cb ON cb.schedule_id = cs.schedule_id
     WHERE cs.instructor_id = $1
       AND cs.start_time   >= NOW()
     GROUP BY
       cs.schedule_id, cs.start_time, cs.end_time,
       c.class_name, c.description, c.capacity, b.name
     ORDER BY cs.start_time ASC`,
    [staffId]
  );

  return sendSuccess(res, {
    staff:    staffCheck.rows[0],
    schedule: rows,
    total:    rows.length,
  });
});


export const getPayroll = asyncHandler(async (req, res) => {
  const { staffId } = req.params;

  // Default to current calendar month
  const now       = new Date();
  const endDate   = req.query.end_date   || now.toISOString().split('T')[0];
  const startDate = req.query.start_date ||
    new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  // Confirm staff member exists
  const staffResult = await query(
    `SELECT
       s.staff_id,
       s.first_name || ' ' || s.last_name AS name,
       s.email,
       sr.role_name,
       sr.hourly_rate,
       b.name AS branch_name
     FROM staff       s
     JOIN staff_roles sr ON sr.role_id  = s.role_id
     JOIN branches    b  ON b.branch_id = s.branch_id
     WHERE s.staff_id = $1`,
    [staffId]
  );

  if (staffResult.rows.length === 0) {
    return sendError(res, 'Staff member not found.', 404);
  }

  const staff = staffResult.rows[0];

  // Sum all scheduled class hours in the period
  const scheduleResult = await query(
    `SELECT
       COUNT(schedule_id)::int                                          AS class_count,
       COALESCE(
         SUM(
           EXTRACT(EPOCH FROM (end_time - start_time)) / 3600
         ), 0
       )                                                                AS total_hours,
       -- Breakdown by class for the detailed view
       JSON_AGG(
         JSON_BUILD_OBJECT(
           'schedule_id', schedule_id,
           'class_name',  c.class_name,
           'start_time',  cs.start_time,
           'end_time',    cs.end_time,
           'hours',       ROUND(
             EXTRACT(EPOCH FROM (cs.end_time - cs.start_time)) / 3600
           ::numeric, 2)
         )
         ORDER BY cs.start_time ASC
       ) AS sessions
     FROM class_schedules cs
     JOIN classes         c ON c.class_id = cs.class_id
     WHERE cs.instructor_id = $1
       AND cs.start_time   >= $2
       AND cs.start_time   <= $3`,
    [staffId, startDate, endDate + ' 23:59:59']
  );

  const { class_count, total_hours, sessions } = scheduleResult.rows[0];
  const hourlyRate    = parseFloat(staff.hourly_rate);
  const estimatedPay  = parseFloat((total_hours * hourlyRate).toFixed(2));

  return sendSuccess(res, {
    staff: {
      staff_id:    staff.staff_id,
      name:        staff.name,
      email:       staff.email,
      role_name:   staff.role_name,
      branch_name: staff.branch_name,
    },
    period: {
      start_date: startDate,
      end_date:   endDate,
    },
    payroll: {
      class_count:   class_count,
      total_hours:   parseFloat(parseFloat(total_hours).toFixed(2)),
      hourly_rate:   hourlyRate,
      estimated_pay: estimatedPay,
    },
    sessions: sessions || [],
  });
});