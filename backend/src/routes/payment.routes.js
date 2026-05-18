// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Payment Routes
//  File: backend/src/routes/payment.routes.js
//
//  All routes are protected — valid JWT required.
//
//  Endpoints:
//    POST /api/payments                  — record a new payment
//    GET  /api/payments                  — list all payments (admin)
//    GET  /api/payments/summary          — revenue summary report
//    GET  /api/payments/member/:memberId — payments for one member
// =============================================================

import { Router } from 'express';
import { body, param, query } from 'express-validator';

import validate from '../middleware/validate.middleware';
import { protect, authorize, authorizeSelf } from '../middleware/auth.middleware';
import { create, list, summary, listByMember } from '../controllers/payment.controller';

const router = Router();

router.use(protect);

// -------------------------------------------------------------
//  POST /api/payments
//  Record a new payment for a member.
//  Staff, branch managers, and admins only.
// -------------------------------------------------------------
router.post(
  '/',
  [
    body('member_id')
      .isInt({ min: 1 })
      .withMessage('A valid member ID is required'),

    body('amount')
      .isFloat({ gt: 0 })
      .withMessage('Amount must be a number greater than zero'),

    body('method')
      .isIn(['cash', 'card', 'bank_transfer', 'mobile_money'])
      .withMessage('Method must be one of: cash, card, bank_transfer, mobile_money'),

    body('payment_date')
      .optional()
      .isISO8601()
      .withMessage('Payment date must be a valid ISO 8601 datetime')
      .toDate(),
  ],
  validate,
  authorize('enterprise_admin', 'branch_manager', 'staff'),
  create
);

// -------------------------------------------------------------
//  GET /api/payments
//  List all payments across all members.
//  Admin and branch manager only.
//  Query params:
//    start_date  — filter from this date (YYYY-MM-DD)
//    end_date    — filter to this date   (YYYY-MM-DD)
//    method      — filter by payment method
//    member_id   — filter by member
//    page        — page number (default 1)
//    limit       — results per page (default 20)
// -------------------------------------------------------------
router.get(
  '/',
  authorize('enterprise_admin', 'branch_manager'),
  list
);

// -------------------------------------------------------------
//  GET /api/payments/summary
//  Revenue aggregation report.
//  Must be defined BEFORE /:paymentId to avoid route conflict.
//  Query params:
//    start_date  — report period start
//    end_date    — report period end
//    branch_id   — scope to one branch (optional)
// -------------------------------------------------------------
router.get(
  '/summary',
  authorize('enterprise_admin', 'branch_manager'),
  summary
);

// -------------------------------------------------------------
//  GET /api/payments/member/:memberId
//  All payments for a specific member.
//  The member themselves, staff, and admin can access this.
// -------------------------------------------------------------
router.get(
  '/member/:memberId',
  [
    param('memberId')
      .isInt({ min: 1 })
      .withMessage('Member ID must be a positive integer'),
  ],
  validate,
  authorizeSelf('enterprise_admin', 'branch_manager', 'staff'),
  listByMember
);

export default router;