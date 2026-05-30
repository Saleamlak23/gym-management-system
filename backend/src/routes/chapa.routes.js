// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Chapa Payment Routes
//  File: backend/src/routes/chapa.routes.js
//
//  IMPORTANT — webhook route is PUBLIC (no auth middleware).
//  Security is handled by Chapa's HMAC signature instead.
//
//  Endpoints:
//    POST /api/chapa/initiate          — start a payment session (member)
//    POST /api/chapa/webhook           — Chapa server-to-server callback (public)
//    GET  /api/chapa/verify/:txRef     — check result after returning (member)
//    GET  /api/chapa/status/:txRef     — admin check any payment intent
//    GET  /api/chapa/intents           — list all payment intents (admin)
//    GET  /api/chapa/banks             — supported banks for bank transfer
// =============================================================

import { Router } from 'express';
import { body, param } from 'express-validator';

import validate from '../middleware/validate.middleware';
import { protect, authorize } from '../middleware/auth.middleware';
import { handleWebhook, initiatePayment, verifyPayment, getSupportedBanks, getPaymentStatus, listIntents } from '../controllers/chapa.controller';

const router = Router();


// =============================================================
//  PUBLIC ROUTE — no auth middleware
//  Webhook must be reachable by Chapa's servers without a token.
//  Security is provided by HMAC signature verification inside
//  the controller.
// =============================================================

// -------------------------------------------------------------
//  POST /api/chapa/webhook
//  Chapa calls this after every payment event.
//  express.raw() in index.js captures the raw body for
//  signature verification before express.json() parses it.
// -------------------------------------------------------------
router.post('/webhook', handleWebhook);


// =============================================================
//  PROTECTED ROUTES — valid JWT required below this line
// =============================================================

router.use(protect);


// -------------------------------------------------------------
//  POST /api/chapa/initiate
//  Member initiates an online payment for a subscription plan.
// -------------------------------------------------------------
router.post(
  '/initiate',
  [
    body('type_id')
      .isInt({ min: 1 })
      .withMessage('A valid membership type ID is required'),
  ],
  validate,
  authorize('member'),
  initiatePayment
);


// -------------------------------------------------------------
//  GET /api/chapa/verify/:txRef
//  Member calls this after being redirected back from Chapa
//  to get the final payment status and subscription details.
// -------------------------------------------------------------
router.get(
  '/verify/:txRef',
  [
    param('txRef')
      .notEmpty()
      .withMessage('Transaction reference is required'),
  ],
  validate,
  authorize('member'),
  verifyPayment
);


// -------------------------------------------------------------
//  GET /api/chapa/banks
//  Returns Chapa-supported banks for bank transfer payments.
//  Any authenticated user can fetch this list.
// -------------------------------------------------------------
router.get('/banks', getSupportedBanks);


// -------------------------------------------------------------
//  GET /api/chapa/status/:txRef
//  Admin/staff view — look up any payment intent by tx_ref.
// -------------------------------------------------------------
router.get(
  '/status/:txRef',
  [
    param('txRef')
      .notEmpty()
      .withMessage('Transaction reference is required'),
  ],
  validate,
  authorize('enterprise_admin', 'branch_manager', 'staff'),
  getPaymentStatus
);


// -------------------------------------------------------------
//  GET /api/chapa/intents
//  Admin — paginated list of all online payment intents.
//  Query params: status, member_id, page, limit
// -------------------------------------------------------------
router.get(
  '/intents',
  authorize('enterprise_admin', 'branch_manager'),
  listIntents
);


export default router;