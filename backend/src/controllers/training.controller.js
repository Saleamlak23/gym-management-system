// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Personal Training Controller
//  File: backend/src/controllers/training.controller.js
//
//  Handles:
//    list           — paginated list of all sessions with filters
//    mine           — logged-in member's sessions
//    listByTrainer  — all sessions for a specific trainer
//    listByMember   — all sessions for a specific member
//    create         — book a session (trainer conflict check)
//    updateStatus   — move through status workflow
//    cancel         — cancel a session
// =============================================================

import { query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.middleware.js';


// -------------------------------------------------------------
//  Shared session SELECT — reused across all list queries
//  Returns a fully joined session row with member and trainer info
// -------------------------------------------------------------
const SESSION_SELECT = `
  SELECT
    pts.session_id,
    pts.scheduled_at,
    pts.duration_min,
    pts.status,
    -- Member details
    m.member_id,
    m.first_name  || ' ' || m.last_name   AS member_name,
    m.email                               AS member_email,
    m.phone                               AS member_phone,
    -- Trainer details
    s.staff_id                            AS trainer_id,
    s.first_name  || ' ' || s.last_name   AS trainer_name,
    sr.role_name                          AS trainer_role,
    -- Branch details
    b.branch_id,
    b.name                                AS branch_name
  FROM personal_training_sessions pts
  JOIN members    m  ON m.member_id  = pts.member_id
  JOIN staff      s  ON s.staff_id   = pts.trainer_id
  JOIN staff_roles sr ON sr.role_id  = s.role_id
  JOIN branches   b  ON b.branch_id  = s.branch_id
`;


export const list = asyncHandler(async (req, res) => {
  const status    = req.query.status     || '';
  const trainerId = req.query.trainer_id || '';
  const date      = req.query.date       || '';
  const page      = Math.max(1, parseInt(req.query.page)  || 1);
  const limit     = Math.min(100, parseInt(req.query.limit) || 20);
  const offset    = (page - 1) * limit;

  const filters = [];
  const params  = [];
  let   pIndex  = 1;

  if (status)    { filters.push(`pts.status     = $${pIndex++}`); params.push(status);    }
  if (trainerId) { filters.push(`pts.trainer_id = $${pIndex++}`); params.push(trainerId); }
  if (date) {
    filters.push(`pts.scheduled_at::date = $${pIndex++}`);
    params.push(date);
  }

  const whereClause = filters.length > 0 ? 'WHERE ' + filters.join(' AND ') : '';

  const countResult = await query(
    `SELECT COUNT(*) FROM personal_training_sessions pts ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const { rows } = await query(
    `${SESSION_SELECT}
     ${whereClause}
     ORDER BY pts.scheduled_at DESC
     LIMIT  $${pIndex}
     OFFSET $${pIndex + 1}`,
    [...params, limit, offset]
  );

  return sendSuccess(res, {
    sessions: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});


export const mine = asyncHandler(async (req, res) => {
  const memberId = req.user.id;

  const { rows } = await query(
    `${SESSION_SELECT}
     WHERE pts.member_id = $1
     ORDER BY pts.scheduled_at DESC`,
    [memberId]
  );

  const upcoming = rows.filter(s => new Date(s.scheduled_at) > new Date() && s.status !== 'cancelled');
  const past     = rows.filter(s => new Date(s.scheduled_at) <= new Date() || s.status === 'cancelled');

  return sendSuccess(res, { upcoming, past, total: rows.length });
});


export const listByTrainer = asyncHandler(async (req, res) => {
  const { trainerId } = req.params;

  // Confirm trainer exists and is active staff
  const trainerCheck = await query(
    `SELECT s.staff_id, s.first_name || ' ' || s.last_name AS name
     FROM staff s
     WHERE s.staff_id = $1 AND s.is_active = true`,
    [trainerId]
  );

  if (trainerCheck.rows.length === 0) {
    return sendError(res, 'Trainer not found.', 404);
  }

  const { rows } = await query(
    `${SESSION_SELECT}
     WHERE  pts.trainer_id = $1
       AND  pts.status    != 'cancelled'
     ORDER BY pts.scheduled_at ASC`,
    [trainerId]
  );

  const upcoming = rows.filter(s => new Date(s.scheduled_at) > new Date());
  const past     = rows.filter(s => new Date(s.scheduled_at) <= new Date());

  return sendSuccess(res, {
    trainer:  trainerCheck.rows[0],
    upcoming,
    past,
    total: rows.length,
  });
});


export const listByMember = asyncHandler(async (req, res) => {
  const { memberId } = req.params;

  const memberCheck = await query(
    'SELECT member_id, first_name || \' \' || last_name AS name FROM members WHERE member_id = $1',
    [memberId]
  );

  if (memberCheck.rows.length === 0) {
    return sendError(res, 'Member not found.', 404);
  }

  const { rows } = await query(
    `${SESSION_SELECT}
     WHERE  pts.member_id = $1
     ORDER BY pts.scheduled_at DESC`,
    [memberId]
  );

  return sendSuccess(res, {
    member:   memberCheck.rows[0],
    sessions: rows,
    total:    rows.length,
  });
});


export const create = asyncHandler(async (req, res) => {
  const { trainer_id, scheduled_at, duration_min = 60, member_id } = req.body;
  const { id: userId, role } = req.user;

  // Determine the member: members book for themselves,
  // staff/admin can supply a member_id in the body
  let targetMemberId = userId;

  if (role !== 'member') {
    if (!member_id) {
      return sendError(
        res,
        'member_id is required when booking on behalf of a member.',
        400
      );
    }
    targetMemberId = member_id;
  }

  // 1. Confirm trainer exists and is active
  const trainerResult = await query(
    `SELECT
       s.staff_id,
       s.first_name || ' ' || s.last_name AS trainer_name,
       sr.role_name
     FROM staff       s
     JOIN staff_roles sr ON sr.role_id = s.role_id
     WHERE s.staff_id  = $1
       AND s.is_active = true`,
    [trainer_id]
  );

  if (trainerResult.rows.length === 0) {
    return sendError(res, 'Trainer not found or is inactive.', 404);
  }

  const trainer = trainerResult.rows[0];

  // 2. Validate the staff member's role is a trainer or instructor
  const isTrainer =
    trainer.role_name.toLowerCase().includes('trainer') ||
    trainer.role_name.toLowerCase().includes('instructor');

  if (!isTrainer) {
    return sendError(
      res,
      `${trainer.trainer_name} is a ${trainer.role_name} and cannot be assigned as a personal trainer.`,
      400
    );
  }

  // 3. Confirm the member exists and has an active subscription
  const memberResult = await query(
    `SELECT m.member_id, m.first_name || ' ' || m.last_name AS member_name
     FROM members m
     WHERE m.member_id = $1 AND m.is_active = true`,
    [targetMemberId]
  );

  if (memberResult.rows.length === 0) {
    return sendError(res, 'Member not found.', 404);
  }

  const subCheck = await query(
    `SELECT subscription_id FROM subscriptions
     WHERE  member_id = $1
       AND  status    = 'active'
       AND  end_date >= CURRENT_DATE`,
    [targetMemberId]
  );

  if (subCheck.rows.length === 0) {
    return sendError(
      res,
      'This member does not have an active subscription to book personal training.',
      403
    );
  }

  // 4. Check for trainer double-booking
  //    A conflict exists when any existing non-cancelled session for this trainer
  //    overlaps with the requested time window [scheduled_at, scheduled_at + duration]
  const sessionEnd = new Date(
    new Date(scheduled_at).getTime() + duration_min * 60 * 1000
  ).toISOString();

  const conflict = await query(
    `SELECT session_id
     FROM   personal_training_sessions
     WHERE  trainer_id   = $1
       AND  status      != 'cancelled'
       AND  scheduled_at < $3
       AND  (scheduled_at + duration_min * INTERVAL '1 minute') > $2`,
    [trainer_id, scheduled_at, sessionEnd]
  );

  if (conflict.rows.length > 0) {
    return sendError(
      res,
      `${trainer.trainer_name} already has a session booked during that time. Please choose a different time.`,
      409
    );
  }

  // 5. All checks passed — insert the session
  const { rows } = await query(
    `INSERT INTO personal_training_sessions
       (member_id, trainer_id, scheduled_at, duration_min, status)
     VALUES ($1, $2, $3, $4, 'scheduled')
     RETURNING session_id, member_id, trainer_id, scheduled_at, duration_min, status`,
    [targetMemberId, trainer_id, scheduled_at, duration_min]
  );

  return sendSuccess(
    res,
    {
      session: {
        ...rows[0],
        trainer_name: trainer.trainer_name,
        member_name:  memberResult.rows[0].member_name,
      },
    },
    201,
    'Personal training session booked successfully'
  );
});


export const updateStatus = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { status: newStatus } = req.body;
  const { id: userId, role }  = req.user;

  const existing = await query(
    `SELECT pts.session_id, pts.status, pts.trainer_id, pts.member_id,
            pts.scheduled_at
     FROM personal_training_sessions pts
     WHERE pts.session_id = $1`,
    [sessionId]
  );

  if (existing.rows.length === 0) {
    return sendError(res, 'Session not found.', 404);
  }

  const session     = existing.rows[0];
  const currentStatus = session.status;

  // Immutable terminal states
  if (currentStatus === 'completed') {
    return sendError(res, 'Completed sessions cannot be modified.', 409);
  }
  if (currentStatus === 'cancelled') {
    return sendError(res, 'Cancelled sessions cannot be modified.', 409);
  }

  // Trainers can only update sessions assigned to them
  if (role === 'trainer' && session.trainer_id !== userId) {
    return sendError(
      res,
      'You can only update status for sessions assigned to you.',
      403
    );
  }

  // Members can only cancel — not confirm or complete
  if (role === 'member') {
    if (newStatus !== 'cancelled') {
      return sendError(
        res,
        'Members can only cancel sessions. Status changes must be made by your trainer.',
        403
      );
    }
    // Ensure the member owns this session
    if (session.member_id !== userId) {
      return sendError(res, 'You can only cancel your own sessions.', 403);
    }
    // Members cannot cancel a session that has already started
    if (new Date(session.scheduled_at) < new Date()) {
      return sendError(res, 'You cannot cancel a session that has already started.', 409);
    }
  }

  // Validate transition logic
  const validTransitions = {
    scheduled: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
  };

  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    return sendError(
      res,
      `Cannot transition from '${currentStatus}' to '${newStatus}'. ` +
      `Allowed: ${validTransitions[currentStatus]?.join(', ') || 'none'}.`,
      409
    );
  }

  const { rows } = await query(
    `UPDATE personal_training_sessions
     SET    status = $1
     WHERE  session_id = $2
     RETURNING session_id, member_id, trainer_id, scheduled_at, duration_min, status`,
    [newStatus, sessionId]
  );

  return sendSuccess(
    res,
    { session: rows[0] },
    200,
    `Session status updated to '${newStatus}'`
  );
});


export const cancel = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { id: userId, role } = req.user;

  const existing = await query(
    `SELECT session_id, status, member_id, trainer_id, scheduled_at
     FROM personal_training_sessions
     WHERE session_id = $1`,
    [sessionId]
  );

  if (existing.rows.length === 0) {
    return sendError(res, 'Session not found.', 404);
  }

  const session = existing.rows[0];

  // Already in a terminal state
  if (['completed', 'cancelled'].includes(session.status)) {
    return sendError(
      res,
      `Cannot cancel a session that is already '${session.status}'.`,
      409
    );
  }

  // Members can only cancel their own sessions
  if (role === 'member' && session.member_id !== userId) {
    return sendError(res, 'You can only cancel your own sessions.', 403);
  }

  // Trainers can only cancel their own assigned sessions
  if (role === 'trainer' && session.trainer_id !== userId) {
    return sendError(res, 'You can only cancel sessions assigned to you.', 403);
  }

  // Cannot cancel a session that has already started
  if (new Date(session.scheduled_at) < new Date()) {
    return sendError(res, 'Cannot cancel a session that has already started.', 409);
  }

  await query(
    `UPDATE personal_training_sessions
     SET status = 'cancelled'
     WHERE session_id = $1`,
    [sessionId]
  );

  return sendSuccess(res, null, 200, 'Session cancelled successfully');
});