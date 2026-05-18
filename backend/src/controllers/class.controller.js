// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Class Controller
//  File: backend/src/controllers/class.controller.js
//
//  Handles:
//    listClasses          — all class templates
//    createClass          — new class template
//    updateClass          — update class template fields
//    listSchedules        — upcoming sessions with booking counts
//    createSchedule       — new scheduled session
//    cancelSchedule       — cancel session + cascade cancel bookings
//    listSessionBookings  — all bookings for one session
//    createBooking        — book a session (capacity enforced in TX)
//    cancelBooking        — cancel a booking
//    myBookings           — logged-in member's bookings
// =============================================================

import { query, transaction } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../middleware/error.middleware';


export const listClasses = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT
       c.class_id,
       c.class_name,
       c.description,
       c.capacity,
       COUNT(cs.schedule_id) AS upcoming_sessions
     FROM classes c
     LEFT JOIN class_schedules cs ON cs.class_id    = c.class_id
                                  AND cs.start_time >= NOW()
     GROUP BY c.class_id
     ORDER BY c.class_name ASC`
  );

  return sendSuccess(res, { classes: rows });
});


export const createClass = asyncHandler(async (req, res) => {
  const { class_name, description, capacity } = req.body;

  const { rows } = await query(
    `INSERT INTO classes (class_name, description, capacity)
     VALUES ($1, $2, $3)
     RETURNING class_id, class_name, description, capacity`,
    [class_name, description || null, capacity]
  );

  return sendSuccess(res, { class: rows[0] }, 201, 'Class created successfully');
});


export const updateClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { class_name, description, capacity } = req.body;

  const existing = await query(
    'SELECT class_id FROM classes WHERE class_id = $1',
    [classId]
  );

  if (existing.rows.length === 0) {
    return sendError(res, 'Class not found.', 404);
  }

  const fields = [];
  const values = [];
  let   pIndex = 1;

  if (class_name   !== undefined) { fields.push(`class_name   = $${pIndex++}`); values.push(class_name);   }
  if (description  !== undefined) { fields.push(`description  = $${pIndex++}`); values.push(description);  }
  if (capacity     !== undefined) { fields.push(`capacity     = $${pIndex++}`); values.push(capacity);     }

  if (fields.length === 0) {
    return sendError(res, 'No fields provided to update.', 400);
  }

  values.push(classId);

  const { rows } = await query(
    `UPDATE classes
     SET    ${fields.join(', ')}
     WHERE  class_id = $${pIndex}
     RETURNING class_id, class_name, description, capacity`,
    values
  );

  return sendSuccess(res, { class: rows[0] }, 200, 'Class updated successfully');
});


export const listSchedules = asyncHandler(async (req, res) => {
  const branchId = req.query.branch_id || '';
  const dateFrom = req.query.date      || new Date().toISOString().split('T')[0];
  const isWeek   = req.query.week      === 'true';

  const dateTo = isWeek
    ? new Date(new Date(dateFrom).setDate(new Date(dateFrom).getDate() + 7))
        .toISOString().split('T')[0]
    : dateFrom;

  const params  = [dateFrom, dateTo + ' 23:59:59'];
  const filters = ['cs.start_time >= $1', 'cs.start_time <= $2'];
  let   pIndex  = 3;

  if (branchId) {
    filters.push(`cs.branch_id = $${pIndex++}`);
    params.push(branchId);
  }

  const { rows } = await query(
    `SELECT
       cs.schedule_id,
       cs.start_time,
       cs.end_time,
       c.class_id,
       c.class_name,
       c.description,
       c.capacity,
       b.branch_id,
       b.name                              AS branch_name,
       s.staff_id                          AS instructor_id,
       s.first_name || ' ' || s.last_name  AS instructor_name,
       sr.role_name                        AS instructor_role,
       COUNT(cb.booking_id)::int           AS bookings_count,
       (c.capacity - COUNT(cb.booking_id)::int) AS spots_remaining
     FROM class_schedules  cs
     JOIN classes          c  ON c.class_id    = cs.class_id
     JOIN branches         b  ON b.branch_id   = cs.branch_id
     JOIN staff            s  ON s.staff_id    = cs.instructor_id
     JOIN staff_roles      sr ON sr.role_id    = s.role_id
     LEFT JOIN class_bookings cb ON cb.schedule_id = cs.schedule_id
     WHERE ${filters.join(' AND ')}
     GROUP BY
       cs.schedule_id, cs.start_time, cs.end_time,
       c.class_id, c.class_name, c.description, c.capacity,
       b.branch_id, b.name,
       s.staff_id, s.first_name, s.last_name,
       sr.role_name
     ORDER BY cs.start_time ASC`,
    params
  );

  return sendSuccess(res, { schedules: rows });
});


export const createSchedule = asyncHandler(async (req, res) => {
  const { class_id, branch_id, instructor_id, start_time, end_time } = req.body;

  // 1. Confirm class exists
  const classCheck = await query(
    'SELECT class_id FROM classes WHERE class_id = $1',
    [class_id]
  );
  if (classCheck.rows.length === 0) {
    return sendError(res, 'Class not found.', 404);
  }

  // 2. Confirm branch exists
  const branchCheck = await query(
    'SELECT branch_id FROM branches WHERE branch_id = $1',
    [branch_id]
  );
  if (branchCheck.rows.length === 0) {
    return sendError(res, 'Branch not found.', 404);
  }

  // 3. Confirm instructor is an active staff member
  const staffCheck = await query(
    'SELECT staff_id FROM staff WHERE staff_id = $1 AND is_active = true',
    [instructor_id]
  );
  if (staffCheck.rows.length === 0) {
    return sendError(res, 'Instructor not found or is inactive.', 404);
  }

  // 4. Check instructor is not double-booked at this time
  const conflict = await query(
    `SELECT schedule_id
     FROM   class_schedules
     WHERE  instructor_id = $1
       AND  start_time    <  $3
       AND  end_time      >  $2`,
    [instructor_id, start_time, end_time]
  );

  if (conflict.rows.length > 0) {
    return sendError(
      res,
      'This instructor already has a class scheduled during that time slot.',
      409
    );
  }

  // 5. Create the schedule
  const { rows } = await query(
    `INSERT INTO class_schedules
       (class_id, branch_id, instructor_id, start_time, end_time)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING
       schedule_id, class_id, branch_id, instructor_id, start_time, end_time`,
    [class_id, branch_id, instructor_id, start_time, end_time]
  );

  return sendSuccess(res, { schedule: rows[0] }, 201, 'Session scheduled successfully');
});


export const cancelSchedule = asyncHandler(async (req, res) => {
  const { scheduleId } = req.params;

  const existing = await query(
    'SELECT schedule_id, start_time FROM class_schedules WHERE schedule_id = $1',
    [scheduleId]
  );

  if (existing.rows.length === 0) {
    return sendError(res, 'Schedule not found.', 404);
  }

  if (new Date(existing.rows[0].start_time) < new Date()) {
    return sendError(res, 'Cannot cancel a session that has already started or passed.', 409);
  }

  await transaction(async (client) => {
    // Remove all bookings first (FK constraint)
    await client.query(
      'DELETE FROM class_bookings WHERE schedule_id = $1',
      [scheduleId]
    );
    // Then remove the schedule
    await client.query(
      'DELETE FROM class_schedules WHERE schedule_id = $1',
      [scheduleId]
    );
  });

  return sendSuccess(res, null, 200, 'Session and all its bookings have been cancelled');
});


export const listSessionBookings = asyncHandler(async (req, res) => {
  const { scheduleId } = req.params;

  const scheduleCheck = await query(
    `SELECT cs.schedule_id, c.class_name, c.capacity, cs.start_time
     FROM class_schedules cs
     JOIN classes c ON c.class_id = cs.class_id
     WHERE cs.schedule_id = $1`,
    [scheduleId]
  );

  if (scheduleCheck.rows.length === 0) {
    return sendError(res, 'Schedule not found.', 404);
  }

  const session = scheduleCheck.rows[0];

  const { rows } = await query(
    `SELECT
       cb.booking_id,
       cb.booking_time,
       m.member_id,
       m.first_name || ' ' || m.last_name AS member_name,
       m.email                            AS member_email,
       m.phone                            AS member_phone
     FROM class_bookings cb
     JOIN members        m ON m.member_id = cb.member_id
     WHERE cb.schedule_id = $1
     ORDER BY cb.booking_time ASC`,
    [scheduleId]
  );

  return sendSuccess(res, {
    session: {
      schedule_id:  session.schedule_id,
      class_name:   session.class_name,
      start_time:   session.start_time,
      capacity:     session.capacity,
      booked:       rows.length,
      available:    session.capacity - rows.length,
    },
    bookings: rows,
  });
});


export const createBooking = asyncHandler(async (req, res) => {
  const { schedule_id } = req.body;
  const memberId        = req.user.id;

  const booking = await transaction(async (client) => {

    // 1. Lock and fetch the session + capacity info
    const sessionResult = await client.query(
      `SELECT
         cs.schedule_id,
         cs.start_time,
         c.capacity,
         c.class_name,
         COUNT(cb.booking_id)::int AS current_bookings
       FROM class_schedules  cs
       JOIN classes          c  ON c.class_id     = cs.class_id
       LEFT JOIN class_bookings cb ON cb.schedule_id = cs.schedule_id
       WHERE cs.schedule_id = $1
       GROUP BY cs.schedule_id, cs.start_time, c.capacity, c.class_name
       FOR UPDATE OF cs`,
      [schedule_id]
    );

    if (sessionResult.rows.length === 0) {
      const err = new Error('Session not found.'); err.statusCode = 404; throw err;
    }

    const session = sessionResult.rows[0];

    // 2. Session must be in the future
    if (new Date(session.start_time) < new Date()) {
      const err = new Error('This session has already started or passed.'); err.statusCode = 409; throw err;
    }

    // 3. Member must have an active subscription
    const subCheck = await client.query(
      `SELECT subscription_id FROM subscriptions
       WHERE  member_id = $1 AND status = 'active' AND end_date >= CURRENT_DATE`,
      [memberId]
    );

    if (subCheck.rows.length === 0) {
      const err = new Error('You do not have an active subscription to book classes.'); err.statusCode = 403; throw err;
    }

    // 4. Member must not have already booked this session
    const dupCheck = await client.query(
      'SELECT booking_id FROM class_bookings WHERE schedule_id = $1 AND member_id = $2',
      [schedule_id, memberId]
    );

    if (dupCheck.rows.length > 0) {
      const err = new Error('You have already booked this session.'); err.statusCode = 409; throw err;
    }

    // 5. Enforce capacity limit
    if (session.current_bookings >= session.capacity) {
      const err = new Error(`This session is full (${session.capacity}/${session.capacity} spots taken).`); err.statusCode = 409; throw err;
    }

    // 6. All checks passed — insert the booking
    const result = await client.query(
      `INSERT INTO class_bookings (schedule_id, member_id, booking_time)
       VALUES ($1, $2, NOW())
       RETURNING booking_id, schedule_id, member_id, booking_time`,
      [schedule_id, memberId]
    );

    return { booking: result.rows[0], class_name: session.class_name, start_time: session.start_time };
  });

  return sendSuccess(res, booking, 201, 'Class booked successfully');
});


export const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { id: userId, role } = req.user;

  const existing = await query(
    `SELECT cb.booking_id, cb.member_id, cs.start_time
     FROM class_bookings  cb
     JOIN class_schedules cs ON cs.schedule_id = cb.schedule_id
     WHERE cb.booking_id = $1`,
    [bookingId]
  );

  if (existing.rows.length === 0) {
    return sendError(res, 'Booking not found.', 404);
  }

  const booking = existing.rows[0];

  // Members can only cancel their own bookings
  if (role === 'member' && booking.member_id !== userId) {
    return sendError(res, 'You can only cancel your own bookings.', 403);
  }

  // Cannot cancel a booking for a session that has already started
  if (new Date(booking.start_time) < new Date()) {
    return sendError(res, 'Cannot cancel a booking for a session that has already started.', 409);
  }

  await query(
    'DELETE FROM class_bookings WHERE booking_id = $1',
    [bookingId]
  );

  return sendSuccess(res, null, 200, 'Booking cancelled successfully');
});


export const myBookings = asyncHandler(async (req, res) => {
  const memberId = req.user.id;

  const { rows } = await query(
    `SELECT
       cb.booking_id,
       cb.booking_time,
       cs.schedule_id,
       cs.start_time,
       cs.end_time,
       c.class_name,
       c.description,
       b.name                             AS branch_name,
       s.first_name || ' ' || s.last_name AS instructor_name,
       CASE WHEN cs.start_time > NOW() THEN 'upcoming' ELSE 'past' END AS status
     FROM class_bookings  cb
     JOIN class_schedules cs ON cs.schedule_id = cb.schedule_id
     JOIN classes          c ON c.class_id     = cs.class_id
     JOIN branches         b ON b.branch_id    = cs.branch_id
     JOIN staff            s ON s.staff_id     = cs.instructor_id
     WHERE cb.member_id = $1
     ORDER BY cs.start_time DESC`,
    [memberId]
  );

  const upcoming = rows.filter(b => b.status === 'upcoming');
  const past     = rows.filter(b => b.status === 'past');

  return sendSuccess(res, { upcoming, past, total: rows.length });
});