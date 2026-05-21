// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Attendance Controller
//  File: backend/src/controllers/attendance.controller.js
//
//  Handles:
//    checkIn        — record check-in with active subscription check
//    checkOut       — record check-out against open check-in
//    list           — paginated, filterable attendance records
//    todayByBranch  — today's log for one branch (front-desk view)
//    listByMember   — attendance history for one member
//    heatmap        — 7×24 average check-in grid for peak-hour view
// =============================================================

import { query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.middleware.js';


export const checkIn = asyncHandler(async (req, res) => {
  const { member_id, branch_id } = req.body;

  // 1. Confirm member exists and is active
  const memberResult = await query(
    `SELECT member_id, first_name, last_name
     FROM   members
     WHERE  member_id = $1 AND is_active = true`,
    [member_id]
  );

  if (memberResult.rows.length === 0) {
    return sendError(res, 'Member not found.', 404);
  }

  const member = memberResult.rows[0];

  // 2. Confirm branch exists
  const branchResult = await query(
    'SELECT branch_id, name FROM branches WHERE branch_id = $1',
    [branch_id]
  );

  if (branchResult.rows.length === 0) {
    return sendError(res, 'Branch not found.', 404);
  }

  // 3. Verify active subscription — the core access control rule
  const subResult = await query(
    `SELECT subscription_id, end_date, status
     FROM   subscriptions
     WHERE  member_id = $1
       AND  status    = 'active'
       AND  end_date >= CURRENT_DATE`,
    [member_id]
  );

  if (subResult.rows.length === 0) {
    return sendError(
      res,
      `Access denied. ${member.first_name} ${member.last_name} does not have an active subscription.`,
      403
    );
  }

  const subscription = subResult.rows[0];

  // 4. Check for an already open check-in (no check-out recorded)
  const openCheckIn = await query(
    `SELECT attendance_id
     FROM   attendance
     WHERE  member_id  = $1
       AND  check_out IS NULL`,
    [member_id]
  );

  if (openCheckIn.rows.length > 0) {
    return sendError(
      res,
      `${member.first_name} ${member.last_name} already has an open check-in. Please complete their check-out first.`,
      409
    );
  }

  // 5. All checks passed — record the check-in
  const { rows } = await query(
    `INSERT INTO attendance (member_id, branch_id, check_in)
     VALUES ($1, $2, NOW())
     RETURNING attendance_id, member_id, branch_id, check_in`,
    [member_id, branch_id]
  );

  const attendance = rows[0];

  return sendSuccess(
    res,
    {
      attendance: {
        ...attendance,
        member_name:      `${member.first_name} ${member.last_name}`,
        branch_name:      branchResult.rows[0].name,
        subscription_end: subscription.end_date,
      },
    },
    201,
    `Check-in recorded for ${member.first_name} ${member.last_name}`
  );
});


export const checkOut = asyncHandler(async (req, res) => {
  const { member_id, branch_id } = req.body;

  // Find the open check-in record
  const openRecord = await query(
    `SELECT attendance_id, check_in
     FROM   attendance
     WHERE  member_id  = $1
       AND  branch_id  = $2
       AND  check_out IS NULL
     ORDER BY check_in DESC
     LIMIT 1`,
    [member_id, branch_id]
  );

  if (openRecord.rows.length === 0) {
    return sendError(
      res,
      'No open check-in found for this member at this branch. They may not have checked in yet.',
      404
    );
  }

  const record = openRecord.rows[0];

  // Record the check-out
  const { rows } = await query(
    `UPDATE attendance
     SET    check_out = NOW()
     WHERE  attendance_id = $1
     RETURNING
       attendance_id,
       member_id,
       branch_id,
       check_in,
       check_out,
       EXTRACT(EPOCH FROM (check_out - check_in)) / 60 AS duration_minutes`,
    [record.attendance_id]
  );

  const updated = rows[0];

  // Fetch member name for the response
  const memberResult = await query(
    `SELECT first_name || ' ' || last_name AS member_name
     FROM   members WHERE member_id = $1`,
    [member_id]
  );

  return sendSuccess(
    res,
    {
      attendance: {
        ...updated,
        member_name:      memberResult.rows[0]?.member_name,
        duration_minutes: parseFloat(parseFloat(updated.duration_minutes).toFixed(0)),
      },
    },
    200,
    'Check-out recorded successfully'
  );
});


export const list = asyncHandler(async (req, res) => {
  const branchId  = req.query.branch_id  || '';
  const memberId  = req.query.member_id  || '';
  const date      = req.query.date       || '';
  const startDate = req.query.start_date || '';
  const endDate   = req.query.end_date   || '';
  const page      = Math.max(1, parseInt(req.query.page)  || 1);
  const limit     = Math.min(100, parseInt(req.query.limit) || 20);
  const offset    = (page - 1) * limit;

  const filters = [];
  const params  = [];
  let   pIndex  = 1;

  if (branchId)  { filters.push(`a.branch_id        = $${pIndex++}`); params.push(branchId);  }
  if (memberId)  { filters.push(`a.member_id        = $${pIndex++}`); params.push(memberId);  }
  if (date)      { filters.push(`a.check_in::date   = $${pIndex++}`); params.push(date);      }
  if (startDate) { filters.push(`a.check_in        >= $${pIndex++}`); params.push(startDate); }
  if (endDate)   { filters.push(`a.check_in        <= $${pIndex++}`); params.push(endDate + ' 23:59:59'); }

  const whereClause = filters.length > 0 ? 'WHERE ' + filters.join(' AND ') : '';

  const baseFrom = `
    FROM attendance a
    JOIN members  m ON m.member_id  = a.member_id
    JOIN branches b ON b.branch_id  = a.branch_id
    ${whereClause}
  `;

  const countResult = await query(
    `SELECT COUNT(*) ${baseFrom}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const { rows } = await query(
    `SELECT
       a.attendance_id,
       a.check_in,
       a.check_out,
       CASE
         WHEN a.check_out IS NOT NULL
         THEN EXTRACT(EPOCH FROM (a.check_out - a.check_in)) / 60
         ELSE NULL
       END                                     AS duration_minutes,
       m.member_id,
       m.first_name || ' ' || m.last_name      AS member_name,
       m.email                                 AS member_email,
       b.branch_id,
       b.name                                  AS branch_name
     ${baseFrom}
     ORDER BY a.check_in DESC
     LIMIT  $${pIndex}
     OFFSET $${pIndex + 1}`,
    [...params, limit, offset]
  );

  return sendSuccess(res, {
    attendance: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});


export const todayByBranch = asyncHandler(async (req, res) => {
  const { branchId } = req.params;

  // Confirm branch exists
  const branchCheck = await query(
    'SELECT branch_id, name FROM branches WHERE branch_id = $1',
    [branchId]
  );

  if (branchCheck.rows.length === 0) {
    return sendError(res, 'Branch not found.', 404);
  }

  const { rows } = await query(
    `SELECT
       a.attendance_id,
       a.check_in,
       a.check_out,
       CASE
         WHEN a.check_out IS NOT NULL
         THEN ROUND(EXTRACT(EPOCH FROM (a.check_out - a.check_in)) / 60)
         ELSE NULL
       END                                AS duration_minutes,
       CASE
         WHEN a.check_out IS NULL THEN 'checked_in'
         ELSE 'checked_out'
       END                                AS status,
       m.member_id,
       m.first_name || ' ' || m.last_name AS member_name,
       m.email                            AS member_email,
       m.phone                            AS member_phone
     FROM attendance a
     JOIN members    m ON m.member_id = a.member_id
     WHERE a.branch_id      = $1
       AND a.check_in::date = CURRENT_DATE
     ORDER BY
       -- Currently checked-in members first
       (a.check_out IS NULL) DESC,
       a.check_in DESC`,
    [branchId]
  );

  const currentlyInside = rows.filter(r => r.status === 'checked_in').length;

  return sendSuccess(res, {
    branch: {
      branch_id:   branchCheck.rows[0].branch_id,
      branch_name: branchCheck.rows[0].name,
      date:        new Date().toISOString().split('T')[0],
    },
    currently_inside: currentlyInside,
    total_visits:     rows.length,
    attendance:       rows,
  });
});


export const listByMember = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 30);
  const offset = (page - 1) * limit;

  const memberCheck = await query(
    `SELECT member_id, first_name || ' ' || last_name AS member_name
     FROM members WHERE member_id = $1`,
    [memberId]
  );

  if (memberCheck.rows.length === 0) {
    return sendError(res, 'Member not found.', 404);
  }

  // Visit statistics
  const statsResult = await query(
    `SELECT
       COUNT(*)::int                                     AS total_visits,
       ROUND(AVG(
         CASE WHEN check_out IS NOT NULL
         THEN EXTRACT(EPOCH FROM (check_out - check_in)) / 60
         END
       ))::int                                           AS avg_duration_minutes,
       COUNT(CASE WHEN check_in >= NOW() - INTERVAL '30 days'
             THEN 1 END)::int                            AS visits_last_30_days,
       MAX(check_in)                                     AS last_visit
     FROM attendance
     WHERE member_id = $1`,
    [memberId]
  );

  // Paginated history
  const countResult = await query(
    'SELECT COUNT(*) FROM attendance WHERE member_id = $1',
    [memberId]
  );

  const { rows } = await query(
    `SELECT
       a.attendance_id,
       a.check_in,
       a.check_out,
       CASE
         WHEN a.check_out IS NOT NULL
         THEN ROUND(EXTRACT(EPOCH FROM (a.check_out - a.check_in)) / 60)
         ELSE NULL
       END  AS duration_minutes,
       b.name AS branch_name
     FROM attendance a
     JOIN branches   b ON b.branch_id = a.branch_id
     WHERE a.member_id = $1
     ORDER BY a.check_in DESC
     LIMIT  $2
     OFFSET $3`,
    [memberId, limit, offset]
  );

  const total = parseInt(countResult.rows[0].count, 10);

  return sendSuccess(res, {
    member:     memberCheck.rows[0],
    stats:      statsResult.rows[0],
    attendance: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});


export const heatmap = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const days = parseInt(req.query.days) || 90;

  const branchCheck = await query(
    'SELECT branch_id, name FROM branches WHERE branch_id = $1',
    [branchId]
  );

  if (branchCheck.rows.length === 0) {
    return sendError(res, 'Branch not found.', 404);
  }

  // Aggregate check-ins by day of week and hour
  // EXTRACT(DOW ...) → 0 (Sunday) to 6 (Saturday)
  // EXTRACT(HOUR ...) → 0 to 23
  const { rows } = await query(
    `SELECT
       EXTRACT(DOW  FROM check_in)::int  AS day_of_week,
       EXTRACT(HOUR FROM check_in)::int  AS hour_of_day,
       COUNT(*)::int                     AS total_checkins,
       -- Divide by the number of weeks in the period to get weekly average
       ROUND(COUNT(*) / NULLIF(($2 / 7.0), 0), 1) AS avg_per_week
     FROM attendance
     WHERE branch_id = $1
       AND check_in >= NOW() - ($2 || ' days')::INTERVAL
     GROUP BY
       EXTRACT(DOW  FROM check_in),
       EXTRACT(HOUR FROM check_in)
     ORDER BY
       day_of_week ASC,
       hour_of_day ASC`,
    [branchId, days]
  );

  // Build a complete 7×24 grid, filling missing slots with zero
  // so the frontend always receives a consistent structure
  const grid = [];
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (let day = 0; day < 7; day++) {
    const dayRow = {
      day_of_week: day,
      day_name:    DAY_NAMES[day],
      hours:       [],
    };

    for (let hour = 0; hour < 24; hour++) {
      const match = rows.find(r => r.day_of_week === day && r.hour_of_day === hour);
      dayRow.hours.push({
        hour_of_day:    hour,
        total_checkins: match ? match.total_checkins : 0,
        avg_per_week:   match ? parseFloat(match.avg_per_week) : 0,
      });
    }

    grid.push(dayRow);
  }

  // Find the peak hour across the entire grid for normalisation
  const allValues   = rows.map(r => r.total_checkins);
  const maxCheckins = allValues.length > 0 ? Math.max(...allValues) : 0;

  return sendSuccess(res, {
    branch: {
      branch_id:   branchCheck.rows[0].branch_id,
      branch_name: branchCheck.rows[0].name,
    },
    analysis_period_days: days,
    max_checkins:         maxCheckins,
    grid,
  });
});