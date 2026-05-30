// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Payment Controller
//  File: backend/src/controllers/payment.controller.js
//
//  Handles:
//    create        — record a new payment
//    list          — paginated list with filters
//    listByMember  — payment history for one member
//    summary       — revenue aggregation for reports/dashboard
// =============================================================

import { query } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.middleware.js';


export const create = asyncHandler(async (req, res) => {
  const { member_id, amount, method, payment_date } = req.body;

  // 1. Confirm the member exists and is active
  const memberCheck = await query(
    'SELECT member_id, first_name, last_name FROM members WHERE member_id = $1 AND is_active = true',
    [member_id]
  );

  if (memberCheck.rows.length === 0) {
    return sendError(res, 'Member not found.', 404);
  }

  // 2. Insert the payment
  const { rows } = await query(
    `INSERT INTO payments (member_id, amount, method, payment_date)
     VALUES ($1, $2, $3, $4)
     RETURNING
       payment_id,
       member_id,
       amount,
       method,
       payment_date`,
    [
      member_id,
      amount,
      method,
      payment_date || new Date(),
    ]
  );

  const payment = rows[0];
  const member  = memberCheck.rows[0];

  return sendSuccess(
    res,
    {
      payment: {
        ...payment,
        member_name: `${member.first_name} ${member.last_name}`,
      },
    },
    201,
    'Payment recorded successfully'
  );
});


export const list = asyncHandler(async (req, res) => {
  const startDate = req.query.start_date || '';
  const endDate   = req.query.end_date   || '';
  const method    = req.query.method     || '';
  const memberId  = req.query.member_id  || '';
  const page      = Math.max(1, parseInt(req.query.page)  || 1);
  const limit     = Math.min(100, parseInt(req.query.limit) || 20);
  const offset    = (page - 1) * limit;

  const params  = [];
  const filters = [];
  let   pIndex  = 1;

  if (startDate) {
    filters.push(`p.payment_date >= $${pIndex++}`);
    params.push(startDate);
  }
  if (endDate) {
    filters.push(`p.payment_date <= $${pIndex++}`);
    params.push(endDate + ' 23:59:59');
  }
  if (method) {
    filters.push(`p.method = $${pIndex++}`);
    params.push(method);
  }
  if (memberId) {
    filters.push(`p.member_id = $${pIndex++}`);
    params.push(memberId);
  }

  const whereClause = filters.length > 0
    ? 'WHERE ' + filters.join(' AND ')
    : '';

  const baseFrom = `
    FROM payments p
    JOIN members  m ON m.member_id = p.member_id
    ${whereClause}
  `;

  // Total count for pagination
  const countResult = await query(
    `SELECT COUNT(*) ${baseFrom}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Page of results
  const dataResult = await query(
    `SELECT
       p.payment_id,
       p.amount,
       p.method,
       p.payment_date,
       p.member_id,
       m.first_name || ' ' || m.last_name AS member_name,
       m.email AS member_email
     ${baseFrom}
     ORDER BY p.payment_date DESC
     LIMIT  $${pIndex}
     OFFSET $${pIndex + 1}`,
    [...params, limit, offset]
  );

  return sendSuccess(res, {
    payments: dataResult.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});


export const listByMember = asyncHandler(async (req, res) => {
  const { memberId } = req.params;

  // Confirm member exists
  const memberCheck = await query(
    'SELECT member_id, first_name, last_name FROM members WHERE member_id = $1',
    [memberId]
  );

  if (memberCheck.rows.length === 0) {
    return sendError(res, 'Member not found.', 404);
  }

  const { rows } = await query(
    `SELECT
       payment_id,
       amount,
       method,
       payment_date
     FROM payments
     WHERE member_id = $1
     ORDER BY payment_date DESC`,
    [memberId]
  );

  // Calculate total spend in the same query result
  const totalSpend = rows.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const member = memberCheck.rows[0];

  return sendSuccess(res, {
    member: {
      member_id:   member.member_id,
      member_name: `${member.first_name} ${member.last_name}`,
    },
    total_spend: parseFloat(totalSpend.toFixed(2)),
    payments:    rows,
  });
});


export const summary = asyncHandler(async (req, res) => {
  const endDate   = req.query.end_date   || new Date().toISOString().split('T')[0];
  const startDate = req.query.start_date ||
    new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      .toISOString().split('T')[0];

  const params  = [startDate, endDate + ' 23:59:59'];
  const filter  = `WHERE p.payment_date BETWEEN $1 AND $2`;

  // Grand total
  const totalResult = await query(
    `SELECT COALESCE(SUM(amount), 0) AS total_revenue
     FROM payments p
     ${filter}`,
    params
  );

  // Breakdown by payment method
  const byMethodResult = await query(
    `SELECT
       method,
       COUNT(*)          AS transaction_count,
       SUM(amount)       AS total,
       ROUND(AVG(amount), 2) AS average
     FROM payments p
     ${filter}
     GROUP BY method
     ORDER BY total DESC`,
    params
  );

  // Monthly totals — last 12 months, with zero-fill for empty months
  const byMonthResult = await query(
    `SELECT
       TO_CHAR(DATE_TRUNC('month', payment_date), 'YYYY-MM') AS month,
       COUNT(*)    AS transaction_count,
       SUM(amount) AS total
     FROM payments p
     ${filter}
     GROUP BY DATE_TRUNC('month', payment_date)
     ORDER BY DATE_TRUNC('month', payment_date) ASC`,
    params
  );

  // Top paying members for the period
  const topMembersResult = await query(
    `SELECT
       p.member_id,
       m.first_name || ' ' || m.last_name AS member_name,
       COUNT(*)    AS payment_count,
       SUM(amount) AS total_paid
     FROM payments p
     JOIN members m ON m.member_id = p.member_id
     ${filter}
     GROUP BY p.member_id, m.first_name, m.last_name
     ORDER BY total_paid DESC
     LIMIT 5`,
    params
  );

  return sendSuccess(res, {
    period: { start_date: startDate, end_date: endDate },
    total_revenue: parseFloat(totalResult.rows[0].total_revenue),
    by_method:     byMethodResult.rows,
    by_month:      byMonthResult.rows,
    top_members:   topMembersResult.rows,
  });
});