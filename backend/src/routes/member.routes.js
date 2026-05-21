// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Member Routes
//  File: backend/src/routes/member.routes.js
//
//  All routes are protected — valid JWT required.
//
//  Member endpoints:
//    GET    /api/members                        — list all members
//    GET    /api/members/:id                    — get one member
//    PUT    /api/members/:id                    — update member profile
//    DELETE /api/members/:id                    — deactivate a member
//
//  Subscription endpoints:
//    GET    /api/members/:id/subscriptions      — subscription history
//    POST   /api/members/:id/subscriptions      — create new subscription
//    PATCH  /api/members/:id/subscriptions/:subId — update subscription status
// =============================================================

import { Router } from 'express';
import { body, param, query } from 'express-validator';

import validate from '../middleware/validate.middleware.js';
import { protect, authorize, authorizeSelf } from '../middleware/auth.middleware.js';
import { list, getOne, update, deactivate, listSubscriptions, createSubscription, updateSubscriptionStatus } from '../controllers/member.controller.js';

const router = Router();

// All routes below require a valid JWT
router.use(protect);

// -------------------------------------------------------------
//  GET /api/members
//  List all members — admin and branch manager only
//  Supports: ?search=name_or_email  ?status=active|expired
// -------------------------------------------------------------
router.get(
  '/',
  authorize('enterprise_admin', 'branch_manager'),
  list
);

// -------------------------------------------------------------
//  GET /api/members/:id
//  Get one member's full profile
//  Staff and above — or the member themselves
// -------------------------------------------------------------
router.get(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Member ID must be a positive integer'),
  ],
  validate,
  authorizeSelf('enterprise_admin', 'branch_manager', 'staff', 'trainer'),
  getOne
);

// -------------------------------------------------------------
//  PUT /api/members/:id
//  Update a member's profile (name, email, phone)
//  Admin only — members update their own via member portal (future)
// -------------------------------------------------------------
router.put(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Member ID must be a positive integer'),

    body('first_name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('First name cannot be empty'),

    body('last_name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Last name cannot be empty'),

    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),

    body('phone')
      .optional({ nullable: true })
      .trim()
      .isMobilePhone()
      .withMessage('Must be a valid phone number'),
  ],
  validate,
  authorize('enterprise_admin'),
  update
);

// -------------------------------------------------------------
//  DELETE /api/members/:id
//  Deactivate a member (soft delete — sets is_active = false)
//  Admin only
// -------------------------------------------------------------
router.delete(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Member ID must be a positive integer'),
  ],
  validate,
  authorize('enterprise_admin'),
  deactivate
);

// =============================================================
//  SUBSCRIPTION SUB-ROUTES  /api/members/:id/subscriptions
// =============================================================

// -------------------------------------------------------------
//  GET /api/members/:id/subscriptions
//  Full subscription history for one member
// -------------------------------------------------------------
router.get(
  '/:id/subscriptions',
  [
    param('id').isInt({ min: 1 }).withMessage('Member ID must be a positive integer'),
  ],
  validate,
  authorizeSelf('enterprise_admin', 'branch_manager', 'staff'),
  listSubscriptions
);

// -------------------------------------------------------------
//  POST /api/members/:id/subscriptions
//  Create a new subscription for a member
// -------------------------------------------------------------
router.post(
  '/:id/subscriptions',
  [
    param('id').isInt({ min: 1 }).withMessage('Member ID must be a positive integer'),

    body('type_id')
      .isInt({ min: 1 })
      .withMessage('A valid membership type is required'),

    body('start_date')
      .isISO8601()
      .withMessage('Start date must be a valid date (YYYY-MM-DD)')
      .toDate(),
  ],
  validate,
  authorize('enterprise_admin', 'branch_manager', 'staff'),
  createSubscription
);

// -------------------------------------------------------------
//  PATCH /api/members/:id/subscriptions/:subId
//  Update subscription status (freeze, cancel, reactivate)
// -------------------------------------------------------------
router.patch(
  '/:id/subscriptions/:subId',
  [
    param('id').isInt({ min: 1 }).withMessage('Member ID must be a positive integer'),
    param('subId').isInt({ min: 1 }).withMessage('Subscription ID must be a positive integer'),

    body('status')
      .isIn(['active', 'expired', 'cancelled', 'frozen'])
      .withMessage('Status must be one of: active, expired, cancelled, frozen'),
  ],
  validate,
  authorize('enterprise_admin', 'branch_manager'),
  updateSubscriptionStatus
);

export default router;