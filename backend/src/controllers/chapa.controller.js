// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Chapa Payment Controller
//  File: backend/src/controllers/chapa.controller.js
//
//  Handles:
//    initiatePayment   — start a Chapa session, return checkout URL
//    handleWebhook     — process Chapa's server-to-server callback
//    verifyPayment     — member polls this after returning from Chapa
//    getPaymentStatus  — check any payment intent by tx_ref
//    listMemberIntents — all online payment attempts for a member
//    getSupportedBanks — pass through Chapa's bank list
// =============================================================

import { query, transaction } from '../config/db';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../middleware/error.middleware';
import { generateTxRef, initializeTransaction, verifyWebhookSignature, verifyTransaction, getSupportedBanks } from '../services/chapa.service';


export const initiatePayment = asyncHandler(async (req, res) => {
  const { type_id }  = req.body;
  const memberId     = req.user.id;  // logged-in member only

  // 1. Fetch member details (needed for Chapa's name/email fields)
  const memberResult = await query(
    `SELECT member_id, first_name, last_name, email
     FROM members
     WHERE member_id = $1 AND is_active = true`,
    [memberId]
  );

  if (memberResult.rows.length === 0) {
    return sendError(res, 'Member account not found.', 404);
  }

  const member = memberResult.rows[0];

  // 2. Fetch the chosen membership type and its price
  const typeResult = await query(
    'SELECT type_id, title, price, duration_days FROM membership_types WHERE type_id = $1',
    [type_id]
  );

  if (typeResult.rows.length === 0) {
    return sendError(res, 'Membership type not found.', 404);
  }

  const membershipType = typeResult.rows[0];

  // 3. Block if member already has an active subscription
  const activeCheck = await query(
    `SELECT subscription_id FROM subscriptions
     WHERE  member_id = $1 AND status = 'active' AND end_date >= CURRENT_DATE`,
    [memberId]
  );

  if (activeCheck.rows.length > 0) {
    return sendError(
      res,
      'You already have an active subscription. It must expire or be cancelled before purchasing a new one.',
      409
    );
  }

  // 4. Block if there is already a pending (unfinished) payment intent
  //    for this member — prevents double-clicking the pay button
  const pendingIntent = await query(
    `SELECT intent_id, checkout_url FROM payment_intents
     WHERE  member_id  = $1
       AND  status     = 'pending'
       AND  expires_at > NOW()`,
    [memberId]
  );

  if (pendingIntent.rows.length > 0) {
    // Return the existing checkout URL rather than creating a new session
    return sendSuccess(res, {
      checkout_url: pendingIntent.rows[0].checkout_url,
      message:      'A payment session is already open. Use the link to complete your payment.',
    }, 200);
  }

  // 5. Generate a unique transaction reference
  const txRef = generateTxRef(memberId);

  // 6. Build the return and callback URLs
  const clientUrl   = process.env.CLIENT_URL   || 'http://localhost:5173';
  const backendUrl  = process.env.BACKEND_URL  || 'http://localhost:5000';

  const returnUrl   = `${clientUrl}/member/payment/result?tx_ref=${txRef}`;
  const callbackUrl = `${backendUrl}/api/chapa/webhook`;

  // 7. Call Chapa to initialize the transaction
  let chapaResponse;
  try {
    chapaResponse = await initializeTransaction({
      amount:      parseFloat(membershipType.price),
      currency:    'ETB',
      email:       member.email,
      first_name:  member.first_name,
      last_name:   member.last_name,
      tx_ref:      txRef,
      return_url:  returnUrl,
      callback_url: callbackUrl,
      customization: {
        title:       `${membershipType.title} Membership`,
        description: `${membershipType.duration_days}-day gym membership at Gym & Fitness Club`,
      },
    });
  } catch (err) {
    console.error('❌  Chapa initialization failed:', err);
    return sendError(
      res,
      'Payment gateway is temporarily unavailable. Please try cash or card at the front desk.',
      503
    );
  }

  const checkoutUrl = chapaResponse?.data?.checkout_url;

  if (!checkoutUrl) {
    return sendError(res, 'Failed to get payment URL from Chapa. Please try again.', 502);
  }

  // 8. Save the payment intent to the database
  await query(
    `INSERT INTO payment_intents
       (tx_ref, member_id, type_id, amount, currency, checkout_url, status, expires_at)
     VALUES ($1, $2, $3, $4, 'ETB', $5, 'pending', NOW() + INTERVAL '1 hour')`,
    [txRef, memberId, type_id, membershipType.price, checkoutUrl]
  );

  return sendSuccess(res, {
    tx_ref:       txRef,
    checkout_url: checkoutUrl,
    amount:       parseFloat(membershipType.price),
    currency:     'ETB',
    membership:   membershipType.title,
    expires_in:   '1 hour',
  }, 200, 'Payment session created — redirect member to checkout_url');
});


// -------------------------------------------------------------
//  POST /api/chapa/webhook
//
//  Chapa calls this endpoint after every payment event.
//  This route must be PUBLIC (no auth middleware).
//  The body must be read as raw text for signature verification.
//
//  Flow:
//    1. Verify the webhook signature (reject forged requests)
//    2. Find the matching payment intent by tx_ref
//    3. Call Chapa verify API to double-check the status
//    4. If success:
//       a. Create a new payment row (status: success)
//       b. Create a new subscription for the member
//       c. Mark the intent as processed
//    5. If failed: mark intent as failed
//    6. Return 200 immediately (Chapa retries if it gets non-200)
// -------------------------------------------------------------
export async function handleWebhook(req, res) {
  // Always return 200 immediately — Chapa interprets anything
  // else as a failure and will retry the webhook up to 5 times.
  // All processing happens after this response is sent.
  res.status(200).json({ received: true });

  try {
    // 1. Verify the signature
    const signature = req.headers['x-chapa-signature'];
    const rawBody   = req.rawBody; // set by express.raw() middleware (see index.js)

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error('❌  Webhook signature verification failed — possible forgery');
      return;
    }

    const { tx_ref, status: chapaStatus } = req.body;

    if (!tx_ref) {
      console.error('❌  Webhook missing tx_ref');
      return;
    }

    // 2. Find the payment intent
    const intentResult = await query(
      `SELECT * FROM payment_intents WHERE tx_ref = $1`,
      [tx_ref]
    );

    if (intentResult.rows.length === 0) {
      console.error(`❌  Webhook: no intent found for tx_ref ${tx_ref}`);
      return;
    }

    const intent = intentResult.rows[0];

    // 3. Idempotency guard — ignore if already processed
    if (intent.status !== 'pending') {
      console.log(`ℹ️  Webhook: intent ${tx_ref} already processed (${intent.status}) — skipping`);
      return;
    }

    // 4. Verify the payment with Chapa (never trust webhooks blindly)
    let verifyResult;
    try {
      verifyResult = await verifyTransaction(tx_ref);
    } catch (err) {
      console.error(`❌  Chapa verify failed for ${tx_ref}:`, err);
      return;
    }

    const paymentStatus = verifyResult?.data?.status;

    // 5a. Payment succeeded
    if (paymentStatus === 'success') {
      await transaction(async (client) => {
        // Get the membership type for duration calculation
        const typeResult = await client.query(
          'SELECT type_id, duration_days FROM membership_types WHERE type_id = $1',
          [intent.type_id]
        );
        const { duration_days } = typeResult.rows[0];

        // Insert into PAYMENTS table
        const paymentResult = await client.query(
          `INSERT INTO payments
             (member_id, amount, payment_date, method, tx_ref, status,
              payment_type, chapa_ref, paid_at)
           VALUES ($1, $2, NOW(), 'online', $3, 'success', 'online', $4, NOW())
           RETURNING payment_id`,
          [
            intent.member_id,
            intent.amount,
            tx_ref,
            verifyResult.data?.reference || null,
          ]
        );

        const paymentId = paymentResult.rows[0].payment_id;

        // Create the subscription
        const subResult = await client.query(
          `INSERT INTO subscriptions
             (member_id, type_id, start_date, end_date, status)
           VALUES (
             $1, $2, CURRENT_DATE,
             (CURRENT_DATE + $3 * INTERVAL '1 day')::date,
             'active'
           )
           RETURNING subscription_id`,
          [intent.member_id, intent.type_id, duration_days]
        );

        const subscriptionId = subResult.rows[0].subscription_id;

        // Link the payment to the subscription
        await client.query(
          'UPDATE payments SET subscription_id = $1 WHERE payment_id = $2',
          [subscriptionId, paymentId]
        );

        // Mark the intent as processed
        await client.query(
          `UPDATE payment_intents
           SET status = 'success', processed_at = NOW(), payment_id = $1
           WHERE tx_ref = $2`,
          [paymentId, tx_ref]
        );

        console.log(
          `✅  Webhook: payment ${tx_ref} success — payment_id ${paymentId}, subscription_id ${subscriptionId}`
        );
      });
    }

    // 5b. Payment failed
    if (paymentStatus === 'failed') {
      await query(
        `UPDATE payment_intents
         SET status = 'failed', processed_at = NOW()
         WHERE tx_ref = $1`,
        [tx_ref]
      );

      await query(
        `INSERT INTO payments
           (member_id, amount, payment_date, method, tx_ref, status, payment_type)
         VALUES ($1, $2, NOW(), 'online', $3, 'failed', 'online')`,
        [intent.member_id, intent.amount, tx_ref]
      );

      console.log(`❌  Webhook: payment ${tx_ref} failed`);
    }

  } catch (err) {
    console.error('❌  Webhook processing error:', err.message);
  }
}


export const verifyPayment = asyncHandler(async (req, res) => {
  const { txRef }  = req.params;
  const memberId   = req.user.id;

  // Find the intent — must belong to the logged-in member
  const intentResult = await query(
    `SELECT
       pi.intent_id,
       pi.tx_ref,
       pi.status,
       pi.amount,
       pi.created_at,
       pi.processed_at,
       pi.payment_id,
       mt.title AS membership_title,
       mt.duration_days,
       s.subscription_id,
       s.start_date,
       s.end_date
     FROM payment_intents pi
     JOIN membership_types mt ON mt.type_id = pi.type_id
     LEFT JOIN payments p ON p.payment_id = pi.payment_id
     LEFT JOIN subscriptions s ON s.subscription_id = p.subscription_id
     WHERE pi.tx_ref    = $1
       AND pi.member_id = $2`,
    [txRef, memberId]
  );

  if (intentResult.rows.length === 0) {
    return sendError(res, 'Payment session not found.', 404);
  }

  const intent = intentResult.rows[0];

  // If still pending and not yet expired, poll Chapa directly
  if (intent.status === 'pending' && !intent.processed_at) {
    try {
      const verifyResult = await verifyTransaction(txRef);
      if (verifyResult?.data?.status === 'success') {
        // Webhook may not have arrived yet — return optimistic pending
        return sendSuccess(res, {
          status:  'processing',
          message: 'Payment received — activating your subscription. Please wait a moment.',
          tx_ref:  txRef,
        });
      }
    } catch {
      // Chapa verify failed — just return the DB state
    }
  }

  return sendSuccess(res, {
    tx_ref:           intent.tx_ref,
    status:           intent.status,
    amount:           parseFloat(intent.amount),
    currency:         'ETB',
    membership:       intent.membership_title,
    duration_days:    intent.duration_days,
    subscription_id:  intent.subscription_id   || null,
    start_date:       intent.start_date         || null,
    end_date:         intent.end_date           || null,
    processed_at:     intent.processed_at       || null,
  });
});


export const getPaymentStatus = asyncHandler(async (req, res) => {
  const { txRef } = req.params;

  const { rows } = await query(
    `SELECT
       pi.*,
       m.first_name || ' ' || m.last_name AS member_name,
       m.email                             AS member_email,
       mt.title                            AS membership_title
     FROM payment_intents pi
     JOIN members          m  ON m.member_id  = pi.member_id
     JOIN membership_types mt ON mt.type_id   = pi.type_id
     WHERE pi.tx_ref = $1`,
    [txRef]
  );

  if (rows.length === 0) {
    return sendError(res, 'Payment intent not found.', 404);
  }

  return sendSuccess(res, { intent: rows[0] });
});


export const listIntents = asyncHandler(async (req, res) => {
  const status   = req.query.status    || '';
  const memberId = req.query.member_id || '';
  const page     = Math.max(1, parseInt(req.query.page)  || 1);
  const limit    = Math.min(100, parseInt(req.query.limit) || 20);
  const offset   = (page - 1) * limit;

  const filters = [];
  const params  = [];
  let   pIndex  = 1;

  if (status)   { filters.push(`pi.status    = $${pIndex++}`); params.push(status);   }
  if (memberId) { filters.push(`pi.member_id = $${pIndex++}`); params.push(memberId); }

  const whereClause = filters.length > 0 ? 'WHERE ' + filters.join(' AND ') : '';

  const countResult = await query(
    `SELECT COUNT(*) FROM payment_intents pi ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const { rows } = await query(
    `SELECT
       pi.intent_id,
       pi.tx_ref,
       pi.status,
       pi.amount,
       pi.currency,
       pi.created_at,
       pi.processed_at,
       pi.expires_at,
       m.first_name || ' ' || m.last_name AS member_name,
       mt.title                           AS membership_title
     FROM payment_intents pi
     JOIN members          m  ON m.member_id = pi.member_id
     JOIN membership_types mt ON mt.type_id  = pi.type_id
     ${whereClause}
     ORDER BY pi.created_at DESC
     LIMIT  $${pIndex}
     OFFSET $${pIndex + 1}`,
    [...params, limit, offset]
  );

  return sendSuccess(res, {
    intents: rows,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});


export const getSupportedBanks = asyncHandler(async (req, res) => {
  try {
    const result = await getSupportedBanks();
    return sendSuccess(res, { banks: result.data });
  } catch (err) {
    return sendError(res, 'Could not fetch bank list. Please try again.', 503);
  }
});