// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Analytics Controller
//  File: backend/src/controllers/analytics.controller.js
//
//  Handles:
//    overview       — enterprise KPIs across all branches
//    branchOverview — KPIs scoped to one branch
//    revenue        — revenue over time with grouping options
//    memberGrowth   — new member signups per month
//    classFillRate  — average class occupancy per class and branch
//
//  All queries use Cache-Control headers to reduce repeated
//  expensive aggregation calls from the dashboard.
// =============================================================

import { query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.middleware.js';

// Cache for 60 seconds — dashboards refresh frequently
const CACHE_HEADER = 'public, max-age=60';


export const overview = asyncHandler(async (req, res) => {
  res.setHeader('Cache-Control', CACHE_HEADER);

  // Run all KPI queries in parallel for speed
  const [
    membersResult,
    subscriptionsResult,
    checkinsResult,
    revenueResult,
    classesResult,
    equipmentResult,
    expiringResult,
    branchesResult,
  ] = await Promise.all([

    // Total active members
    query(`SELECT COUNT(*)::int AS total
           FROM members WHERE is_active = true`),

    // Active subscriptions right now
    query(`SELECT COUNT(*)::int AS total
           FROM subscriptions
           WHERE status = 'active' AND end_date >= CURRENT_DATE`),

    // Today's total check-ins across all branches
    query(`SELECT COUNT(*)::int AS total
           FROM attendance
           WHERE check_in::date = CURRENT_DATE`),

    // Revenue this calendar month
    query(`SELECT COALESCE(SUM(amount), 0) AS total
           FROM payments
           WHERE DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', NOW())`),

    // Class sessions scheduled this week
    query(`SELECT COUNT(*)::int AS total
           FROM class_schedules
           WHERE start_time >= DATE_TRUNC('week', NOW())
             AND start_time <  DATE_TRUNC('week', NOW()) + INTERVAL '7 days'`),

    // Equipment currently under maintenance
    query(`SELECT COUNT(*)::int AS total
           FROM equipment WHERE status = 'maintenance'`),

    // Subscriptions expiring in the next 7 days
    query(`SELECT COUNT(*)::int AS total
           FROM subscriptions
           WHERE status   = 'active'
             AND end_date >= CURRENT_DATE
             AND end_date <= CURRENT_DATE + INTERVAL '7 days'`),

    // Per-branch summary
    query(`SELECT
             b.branch_id,
             b.name,
             -- Active members who have attended this branch
             COUNT(DISTINCT a.member_id) FILTER (
               WHERE s.status = 'active' AND s.end_date >= CURRENT_DATE
             )::int                                   AS active_subscriptions,
             -- Today's check-ins at this branch
             COUNT(DISTINCT a.attendance_id) FILTER (
               WHERE a.check_in::date = CURRENT_DATE
             )::int                                   AS today_checkins,
             -- This month's revenue (approximated via payments — no branch_id on payments)
             -- We use member attendance at the branch as a proxy for branch activity
             (
               SELECT COALESCE(SUM(p.amount), 0)
               FROM payments p
               JOIN members  m2 ON m2.member_id = p.member_id
               JOIN attendance a2 ON a2.member_id = m2.member_id
                                  AND a2.branch_id = b.branch_id
               WHERE DATE_TRUNC('month', p.payment_date) = DATE_TRUNC('month', NOW())
             )                                        AS monthly_revenue_estimate
           FROM branches    b
           LEFT JOIN attendance    a ON a.branch_id = b.branch_id
           LEFT JOIN subscriptions s ON s.member_id = a.member_id
           GROUP BY b.branch_id, b.name
           ORDER BY b.name ASC`),
  ]);

  return sendSuccess(res, {
    total_members:               membersResult.rows[0].total,
    active_subscriptions:        subscriptionsResult.rows[0].total,
    today_checkins:              checkinsResult.rows[0].total,
    monthly_revenue:             parseFloat(revenueResult.rows[0].total),
    classes_this_week:           classesResult.rows[0].total,
    equipment_under_maintenance: equipmentResult.rows[0].total,
    subscriptions_expiring_soon: expiringResult.rows[0].total,
    branches:                    branchesResult.rows,
  });
});


export const branchOverview = asyncHandler(async (req, res) => {
  const { branchId }    = req.params;
  const { role, branch_id: userBranchId } = req.user;

  // Branch managers can only view their own branch
  if (role === 'branch_manager' && userBranchId !== parseInt(branchId)) {
    return sendError(res, 'You can only view analytics for your own branch.', 403);
  }

  res.setHeader('Cache-Control', CACHE_HEADER);

  const branchCheck = await query(
    'SELECT branch_id, name FROM branches WHERE branch_id = $1',
    [branchId]
  );

  if (branchCheck.rows.length === 0) {
    return sendError(res, 'Branch not found.', 404);
  }

  const [
    checkinsResult,
    activeSubsResult,
    revenueResult,
    classesResult,
    equipmentResult,
    topClassResult,
    recentAttendanceResult,
  ] = await Promise.all([

    // Today's check-ins at this branch
    query(`SELECT COUNT(*)::int AS total
           FROM attendance
           WHERE branch_id  = $1
             AND check_in::date = CURRENT_DATE`,
      [branchId]),

    // Members with active subscriptions who have visited this branch
    query(`SELECT COUNT(DISTINCT a.member_id)::int AS total
           FROM attendance  a
           JOIN subscriptions s ON s.member_id = a.member_id
                                AND s.status   = 'active'
                                AND s.end_date >= CURRENT_DATE
           WHERE a.branch_id = $1`,
      [branchId]),

    // This month's payments (global — payments have no branch_id)
    query(`SELECT COALESCE(SUM(amount), 0) AS total
           FROM payments
           WHERE DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', NOW())`),

    // Sessions at this branch this week
    query(`SELECT COUNT(*)::int AS total
           FROM class_schedules
           WHERE branch_id  = $1
             AND start_time >= DATE_TRUNC('week', NOW())
             AND start_time <  DATE_TRUNC('week', NOW()) + INTERVAL '7 days'`,
      [branchId]),

    // Equipment issues at this branch
    query(`SELECT
             COUNT(*) FILTER (WHERE status = 'maintenance')::int AS under_maintenance,
             COUNT(*) FILTER (WHERE status = 'active')::int      AS active,
             COUNT(*) FILTER (WHERE status = 'retired')::int     AS retired
           FROM equipment WHERE branch_id = $1`,
      [branchId]),

    // Most booked class at this branch in the last 30 days
    query(`SELECT
             c.class_name,
             COUNT(cb.booking_id)::int AS total_bookings
           FROM class_bookings  cb
           JOIN class_schedules cs ON cs.schedule_id = cb.schedule_id
           JOIN classes         c  ON c.class_id     = cs.class_id
           WHERE cs.branch_id  = $1
             AND cs.start_time >= NOW() - INTERVAL '30 days'
           GROUP BY c.class_name
           ORDER BY total_bookings DESC
           LIMIT 1`,
      [branchId]),

    // Attendance count for each of the last 7 days
    query(`SELECT
             check_in::date          AS date,
             COUNT(*)::int           AS checkins
           FROM attendance
           WHERE branch_id  = $1
             AND check_in  >= NOW() - INTERVAL '7 days'
           GROUP BY check_in::date
           ORDER BY date ASC`,
      [branchId]),
  ]);

  return sendSuccess(res, {
    branch: branchCheck.rows[0],
    today_checkins:        checkinsResult.rows[0].total,
    active_members:        activeSubsResult.rows[0].total,
    monthly_revenue:       parseFloat(revenueResult.rows[0].total),
    classes_this_week:     classesResult.rows[0].total,
    equipment:             equipmentResult.rows[0],
    top_class:             topClassResult.rows[0] || null,
    daily_attendance_week: recentAttendanceResult.rows,
  });
});


export const revenue = asyncHandler(async (req, res) => {
  const now       = new Date();
  const endDate   = req.query.end_date   || now.toISOString().split('T')[0];
  const startDate = req.query.start_date ||
    new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split('T')[0];
  const groupBy   = ['day', 'week', 'month'].includes(req.query.group_by)
    ? req.query.group_by
    : 'month';

  res.setHeader('Cache-Control', CACHE_HEADER);

  // Build the date truncation expression based on group_by
  const truncExpr = `DATE_TRUNC('${groupBy}', payment_date)`;
  const labelExpr = groupBy === 'day'
    ? `TO_CHAR(${truncExpr}, 'YYYY-MM-DD')`
    : groupBy === 'week'
      ? `TO_CHAR(${truncExpr}, 'IYYY-IW')`
      : `TO_CHAR(${truncExpr}, 'YYYY-MM')`;

  const { rows } = await query(
    `SELECT
       ${labelExpr}        AS period,
       COUNT(*)::int       AS transaction_count,
       SUM(amount)         AS total_revenue,
       ROUND(AVG(amount), 2) AS avg_transaction,
       JSON_OBJECT_AGG(method, method_total) AS by_method
     FROM (
       SELECT
         payment_date,
         amount,
         method,
         SUM(amount) OVER (PARTITION BY ${truncExpr}, method) AS method_total
       FROM payments
       WHERE payment_date BETWEEN $1 AND $2
     ) sub
     GROUP BY ${truncExpr}
     ORDER BY ${truncExpr} ASC`,
    [startDate, endDate + ' 23:59:59']
  );

  // Grand total for the period
  const grandTotal = rows.reduce(
    (sum, r) => sum + parseFloat(r.total_revenue), 0
  );

  return sendSuccess(res, {
    period:       { start_date: startDate, end_date: endDate, group_by: groupBy },
    grand_total:  parseFloat(grandTotal.toFixed(2)),
    data_points:  rows.length,
    revenue:      rows,
  });
});


export const memberGrowth = asyncHandler(async (req, res) => {
  const months = Math.min(24, parseInt(req.query.months) || 12);

  res.setHeader('Cache-Control', CACHE_HEADER);

  const { rows } = await query(
    `SELECT
       TO_CHAR(DATE_TRUNC('month', join_date), 'YYYY-MM') AS month,
       COUNT(*)::int                                       AS new_members,
       -- Running cumulative total
       SUM(COUNT(*)) OVER (
         ORDER BY DATE_TRUNC('month', join_date) ASC
       )::int                                              AS cumulative_total
     FROM members
     WHERE join_date >= NOW() - ($1 || ' months')::INTERVAL
       AND is_active  = true
     GROUP BY DATE_TRUNC('month', join_date)
     ORDER BY DATE_TRUNC('month', join_date) ASC`,
    [months]
  );

  const totalNewInPeriod = rows.reduce((sum, r) => sum + r.new_members, 0);

  return sendSuccess(res, {
    period_months:        months,
    total_new_members:    totalNewInPeriod,
    monthly_growth:       rows,
  });
});


export const classFillRate = asyncHandler(async (req, res) => {
  const now       = new Date();
  const endDate   = req.query.end_date   || now.toISOString().split('T')[0];
  const startDate = req.query.start_date ||
    new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];
  const branchId  = req.query.branch_id  || '';

  res.setHeader('Cache-Control', CACHE_HEADER);

  const params  = [startDate, endDate + ' 23:59:59'];
  const filters = ['cs.start_time BETWEEN $1 AND $2'];
  let   pIndex  = 3;

  if (branchId) {
    filters.push(`cs.branch_id = $${pIndex++}`);
    params.push(branchId);
  }

  const { rows } = await query(
    `SELECT
       c.class_id,
       c.class_name,
       c.capacity,
       b.branch_id,
       b.name                              AS branch_name,
       COUNT(DISTINCT cs.schedule_id)::int AS sessions_count,
       COUNT(cb.booking_id)::int           AS total_bookings,
       ROUND(
         COUNT(cb.booking_id)::numeric /
         NULLIF(COUNT(DISTINCT cs.schedule_id) * c.capacity, 0) * 100
       , 1)                                AS avg_fill_rate_pct,
       -- Peak session (highest booking count)
       MAX(session_bookings.booking_count)::int AS peak_bookings
     FROM class_schedules cs
     JOIN classes         c  ON c.class_id     = cs.class_id
     JOIN branches        b  ON b.branch_id    = cs.branch_id
     LEFT JOIN class_bookings cb ON cb.schedule_id = cs.schedule_id
     -- Subquery: booking count per session for peak calculation
     LEFT JOIN (
       SELECT schedule_id, COUNT(*)::int AS booking_count
       FROM class_bookings
       GROUP BY schedule_id
     ) session_bookings ON session_bookings.schedule_id = cs.schedule_id
     WHERE ${filters.join(' AND ')}
     GROUP BY
       c.class_id, c.class_name, c.capacity,
       b.branch_id, b.name
     ORDER BY avg_fill_rate_pct DESC NULLS LAST`,
    params
  );

  return sendSuccess(res, {
    period:     { start_date: startDate, end_date: endDate },
    classes:    rows,
    total:      rows.length,
  });
});