// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Personal Training Routes
//  File: backend/src/routes/training.routes.js
//
//  All routes are protected — valid JWT required.
//
//  Endpoints:
//    GET    /api/training                    — list all sessions (staff+)
//    GET    /api/training/mine               — logged-in member's sessions
//    GET    /api/training/trainer/:trainerId — a trainer's schedule
//    GET    /api/training/member/:memberId   — a member's sessions (staff+)
//    POST   /api/training                    — book a new session
//    PATCH  /api/training/:sessionId/status  — update session status
//    DELETE /api/training/:sessionId         — cancel a session
// =============================================================

import { Router } from 'express';
import { body, param } from 'express-validator';

import validate from '../middleware/validate.middleware.js';
import { protect, authorize, authorizeSelf } from '../middleware/auth.middleware.js';
import { list, mine, listByTrainer, listByMember, create, updateStatus, cancel } from '../controllers/training.controller.js';

const router = Router();

router.use(protect);

// -------------------------------------------------------------
//  GET /api/training
//  List all sessions — staff, trainers, and admins only
//  Query params:
//    status      — filter by status
//    trainer_id  — filter by trainer
//    date        — filter by date (YYYY-MM-DD)
//    page, limit — pagination
// -------------------------------------------------------------
router.get(
  '/',
  authorize('enterprise_admin', 'branch_manager', 'staff', 'trainer'),
  list
);

// -------------------------------------------------------------
//  GET /api/training/mine
//  Logged-in member's own sessions — must be before /:sessionId
// -------------------------------------------------------------
router.get('/mine', authorize('member'), mine);

// -------------------------------------------------------------
//  GET /api/training/trainer/:trainerId
//  A specific trainer's full schedule
// -------------------------------------------------------------
router.get(
  '/trainer/:trainerId',
  [
    param('trainerId')
      .isInt({ min: 1 })
      .withMessage('Trainer ID must be a positive integer'),
  ],
  validate,
  authorize('enterprise_admin', 'branch_manager', 'staff', 'trainer'),
  listByTrainer
);

// -------------------------------------------------------------
//  GET /api/training/member/:memberId
//  All sessions for a specific member — staff+ or self
// -------------------------------------------------------------
router.get(
  '/member/:memberId',
  [
    param('memberId')
      .isInt({ min: 1 })
      .withMessage('Member ID must be a positive integer'),
  ],
  validate,
  authorizeSelf('enterprise_admin', 'branch_manager', 'staff', 'trainer'),
  listByMember
);

// -------------------------------------------------------------
//  POST /api/training
//  Book a new personal training session
//  Members book for themselves — staff can book on behalf of members
// -------------------------------------------------------------
router.post(
  '/',
  [
    body('trainer_id')
      .isInt({ min: 1 })
      .withMessage('A valid trainer ID is required'),

    body('scheduled_at')
      .isISO8601()
      .withMessage('Scheduled time must be a valid ISO 8601 datetime')
      .toDate()
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error('Session must be scheduled in the future');
        }
        return true;
      }),

    body('duration_min')
      .optional()
      .isInt({ min: 30, max: 180 })
      .withMessage('Duration must be between 30 and 180 minutes'),

    // member_id is required when staff books on behalf of a member
    body('member_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Member ID must be a positive integer'),
  ],
  validate,
  create
);

// -------------------------------------------------------------
//  PATCH /api/training/:sessionId/status
//  Update session status — trainers update their own sessions
//  Admins and managers can update any session
// -------------------------------------------------------------
router.patch(
  '/:sessionId/status',
  [
    param('sessionId')
      .isInt({ min: 1 })
      .withMessage('Session ID must be a positive integer'),

    body('status')
      .isIn(['scheduled', 'confirmed', 'completed', 'cancelled'])
      .withMessage('Status must be one of: scheduled, confirmed, completed, cancelled'),
  ],
  validate,
  updateStatus
);

// -------------------------------------------------------------
//  DELETE /api/training/:sessionId
//  Cancel a session — member cancels their own, admin cancels any
// -------------------------------------------------------------
router.delete(
  '/:sessionId',
  [
    param('sessionId')
      .isInt({ min: 1 })
      .withMessage('Session ID must be a positive integer'),
  ],
  validate,
  cancel
);

export default router;