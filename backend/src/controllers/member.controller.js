// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Member Controller
//  File: backend/src/controllers/member.controller.js
//
//  Handles:
//    list                    — paginated, searchable member list
//    getOne                  — single member with active subscription
//    update                  — update member profile fields
//    deactivate              — soft-delete (is_active = false)
//    listSubscriptions       — full subscription history
//    createSubscription      — new subscription with conflict check
//    updateSubscriptionStatus — freeze, cancel, reactivate
// =============================================================

import { query, transaction } from '../config/db.js';
import { sendSuccess, sendError, sendServerError } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.middleware.js';


export const list = asyncHandler(async (req, res) => {
  const search = req.query.search || '';
  const status = req.query.status || '';
  const page   = Math.max(1, parseInt(req.query.page)  || 1);
  const limit  = Math.min(100, parseInt(req.query.limit) || 20);
  const offset = (page - 1) * limit;

  // Base query — joins the most recent subscription for each member
  // so we can show their current status without a second round-trip
  let baseQuery = `
    FROM members m
    LEFT JOIN LATERAL (
      SELECT status, end_date, type_id
      FROM   subscriptions
      WHERE  member_id = m.member_id
      ORDER  BY start_date DESC
      LIMIT  1
    ) latest_sub ON true
    WHERE m.is_active = true
  `;

  const params = [];
  let   pIndex = 1;

  // Optional search filter
  if (search) {
    baseQuery += ` AND (
      m.first_name ILIKE $${pIndex}
      OR m.last_name  ILIKE $${pIndex}
      OR m.email      ILIKE $${pIndex}
    )`;
    params.push(`%${search}%`);
    pIndex++;
  }

  // Optional subscription status filter
  if (status) {
    baseQuery += ` AND latest_sub.status = $${pIndex}`;
    params.push(status);
    pIndex++;
  }

  // Get total count for pagination metadata
  const countResult = await query(
    `SELECT COUNT(*) ${baseQuery}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Get the page of results
  const dataResult = await query(
    `SELECT
       m.member_id,
       m.first_name,
       m.last_name,
       m.email,
       m.phone,
       m.join_date,
       latest_sub.status      AS subscription_status,
       latest_sub.end_date    AS subscription_end_date
     ${baseQuery}
     ORDER BY m.join_date DESC
     LIMIT  $${pIndex}
     OFFSET $${pIndex + 1}`,
    [...params, limit, offset]
  );

  return sendSuccess(res, {
    members: dataResult.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});


export const getOne = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const memberResult = await query(
    `SELECT
       m.member_id,
       m.first_name,
       m.last_name,
       m.email,
       m.phone,
       m.join_date,
       m.is_active,
       -- Active subscription (if any)
       s.subscription_id,
       s.status        AS subscription_status,
       s.start_date    AS subscription_start,
       s.end_date      AS subscription_end,
       mt.title        AS membership_title,
       mt.price        AS membership_price,
       -- Total visits
       (SELECT COUNT(*) FROM attendance WHERE member_id = m.member_id) AS total_visits
     FROM members m
     LEFT JOIN subscriptions  s  ON s.member_id = m.member_id
                                 AND s.status = 'active'
                                 AND s.end_date >= CURRENT_DATE
     LEFT JOIN membership_types mt ON mt.type_id = s.type_id
     WHERE m.member_id = $1`,
    [id]
  );

  if (memberResult.rows.length === 0) {
    return sendError(res, 'Member not found.', 404);
  }

  return sendSuccess(res, { member: memberResult.rows[0] });
});


export const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone } = req.body;

  // Confirm member exists
  const existing = await query(
    'SELECT member_id FROM members WHERE member_id = $1 AND is_active = true',
    [id]
  );

  if (existing.rows.length === 0) {
    return sendError(res, 'Member not found.', 404);
  }

  // If email is being changed, check uniqueness
  if (email) {
    const emailCheck = await query(
      'SELECT member_id FROM members WHERE email = $1 AND member_id != $2',
      [email, id]
    );
    if (emailCheck.rows.length > 0) {
      return sendError(res, 'This email is already registered to another member.', 409);
    }
  }

  // Build dynamic SET clause using only provided fields
  const fields  = [];
  const values  = [];
  let   pIndex  = 1;

  if (first_name !== undefined) { fields.push(`first_name = $${pIndex++}`); values.push(first_name); }
  if (last_name  !== undefined) { fields.push(`last_name  = $${pIndex++}`); values.push(last_name);  }
  if (email      !== undefined) { fields.push(`email      = $${pIndex++}`); values.push(email);      }
  if (phone      !== undefined) { fields.push(`phone      = $${pIndex++}`); values.push(phone);      }

  if (fields.length === 0) {
    return sendError(res, 'No fields provided to update.', 400);
  }

  values.push(id);

  const { rows } = await query(
    `UPDATE members
     SET    ${fields.join(', ')}
     WHERE  member_id = $${pIndex}
     RETURNING member_id, first_name, last_name, email, phone, join_date`,
    values
  );

  return sendSuccess(res, { member: rows[0] }, 200, 'Member updated successfully');
});


export const deactivate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await query(
    'SELECT member_id FROM members WHERE member_id = $1 AND is_active = true',
    [id]
  );

  if (existing.rows.length === 0) {
    return sendError(res, 'Member not found or already deactivated.', 404);
  }

  await transaction(async (client) => {
    // Cancel any active subscriptions
    await client.query(
      `UPDATE subscriptions
       SET    status = 'cancelled'
       WHERE  member_id = $1 AND status = 'active'`,
      [id]
    );

    // Deactivate the member account
    await client.query(
      'UPDATE members SET is_active = false WHERE member_id = $1',
      [id]
    );
  });

  return sendSuccess(res, null, 200, 'Member deactivated successfully');
});


export const listSubscriptions = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // First auto-expire any overdue active subscriptions
  await query(
    `UPDATE subscriptions
     SET    status = 'expired'
     WHERE  member_id = $1
       AND  status    = 'active'
       AND  end_date  < CURRENT_DATE`,
    [id]
  );

  const { rows } = await query(
    `SELECT
       s.subscription_id,
       s.status,
       s.start_date,
       s.end_date,
       mt.title         AS membership_title,
       mt.price         AS membership_price,
       mt.duration_days
     FROM subscriptions   s
     JOIN membership_types mt ON mt.type_id = s.type_id
     WHERE s.member_id = $1
     ORDER BY s.start_date DESC`,
    [id]
  );

  return sendSuccess(res, { subscriptions: rows });
});


export const createSubscription = asyncHandler(async (req, res) => {
  const memberId  = req.params.id;
  const { type_id, start_date } = req.body;

  // 1. Confirm member exists and is active
  const memberCheck = await query(
    'SELECT member_id FROM members WHERE member_id = $1 AND is_active = true',
    [memberId]
  );
  if (memberCheck.rows.length === 0) {
    return sendError(res, 'Member not found.', 404);
  }

  // 2. Confirm membership type exists
  const typeCheck = await query(
    'SELECT type_id, duration_days FROM membership_types WHERE type_id = $1',
    [type_id]
  );
  if (typeCheck.rows.length === 0) {
    return sendError(res, 'Membership type not found.', 404);
  }

  const { duration_days } = typeCheck.rows[0];

  // 3. Check for existing active subscription — reject if found
  const activeCheck = await query(
    `SELECT subscription_id FROM subscriptions
     WHERE  member_id = $1
       AND  status    = 'active'
       AND  end_date >= CURRENT_DATE`,
    [memberId]
  );
  if (activeCheck.rows.length > 0) {
    return sendError(
      res,
      'Member already has an active subscription. Cancel or wait for it to expire before creating a new one.',
      409
    );
  }

  // 4. Calculate end_date from start_date + duration_days
  const { rows } = await query(
    `INSERT INTO subscriptions (member_id, type_id, start_date, end_date, status)
     VALUES (
       $1, $2, $3,
       ($3::date + $4 * INTERVAL '1 day')::date,
       'active'
     )
     RETURNING
       subscription_id,
       member_id,
       type_id,
       start_date,
       end_date,
       status`,
    [memberId, type_id, start_date, duration_days]
  );

  return sendSuccess(res, { subscription: rows[0] }, 201, 'Subscription created successfully');
});


export const updateSubscriptionStatus = asyncHandler(async (req, res) => {
  const { id: memberId, subId } = req.params;
  const { status }              = req.body;

  // Confirm the subscription belongs to this member
  const existing = await query(
    `SELECT subscription_id, status, end_date
     FROM   subscriptions
     WHERE  subscription_id = $1 AND member_id = $2`,
    [subId, memberId]
  );

  if (existing.rows.length === 0) {
    return sendError(res, 'Subscription not found for this member.', 404);
  }

  const current = existing.rows[0];

  // Guard: cannot reactivate a subscription whose end_date is in the past
  if (status === 'active' && new Date(current.end_date) < new Date()) {
    return sendError(
      res,
      'Cannot reactivate an expired subscription. Please create a new subscription instead.',
      409
    );
  }

  // Guard: cannot change a cancelled subscription
  if (current.status === 'cancelled') {
    return sendError(
      res,
      'Cancelled subscriptions cannot be modified. Please create a new subscription.',
      409
    );
  }

  const { rows } = await query(
    `UPDATE subscriptions
     SET    status = $1
     WHERE  subscription_id = $2
     RETURNING subscription_id, member_id, status, start_date, end_date`,
    [status, subId]
  );

  return sendSuccess(
    res,
    { subscription: rows[0] },
    200,
    `Subscription status updated to '${status}'`
  );
});