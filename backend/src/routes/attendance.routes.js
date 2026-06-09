// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Attendance Routes
//  File: backend/src/routes/attendance.routes.js
//
//  All routes are protected — valid JWT required.
//
//  Endpoints:
//    POST /api/attendance/checkin            — record a check-in
//    POST /api/attendance/checkout           — record a check-out
//    GET  /api/attendance                    — all records (admin/manager)
//    GET  /api/attendance/today/:branchId    — today's log for a branch
//    GET  /api/attendance/member/:memberId   — history for one member
//    GET  /api/attendance/heatmap/:branchId  — peak-hour heatmap data
// =============================================================

import { Router } from 'express';
import { body, param } from 'express-validator';

import validate from '../middleware/validate.middleware.js';
import { protect, authorize, authorizeSelf } from '../middleware/auth.middleware.js';
import { checkIn, checkOut, list, todayByBranch, heatmap, listByMember } from '../controllers/attendance.controller.js';

const router = Router();

router.use(protect);

// -------------------------------------------------------------
//  POST /api/attendance/checkin
//  Record a member check-in at a branch.
//  Staff operate the front desk — members do not self check-in.
// -------------------------------------------------------------
router.post(
  '/checkin',
  [
    body('member_id')
      .isInt({ min: 1 })
      .withMessage('A valid member ID is required'),

    body('branch_id')
      .isInt({ min: 1 })
      .withMessage('A valid branch ID is required'),
  ],
  validate,
  authorize('enterprise_admin', 'branch_manager', 'staff'),
  checkIn
);

// -------------------------------------------------------------
//  POST /api/attendance/checkout
//  Record a member check-out.
//  Matches the most recent open check-in for the member.
// -------------------------------------------------------------
router.post(
  '/checkout',
  [
    body('member_id')
      .isInt({ min: 1 })
      .withMessage('A valid member ID is required'),

    body('branch_id')
      .isInt({ min: 1 })
      .withMessage('A valid branch ID is required'),
  ],
  validate,
  authorize('enterprise_admin', 'branch_manager', 'staff'),
  checkOut
);

// -------------------------------------------------------------
//  GET /api/attendance
//  All attendance records with optional filters.
//  Query params: branch_id, member_id, date, start_date, end_date
//                page, limit
// -------------------------------------------------------------
router.get(
  '/',
  authorize('enterprise_admin', 'branch_manager'),
  list
);

// -------------------------------------------------------------
//  GET /api/attendance/today/:branchId
//  Today's full attendance log for a specific branch.
//  Must be defined before /:attendanceId variants.
// -------------------------------------------------------------
router.get(
  '/today/:branchId',
  [
    param('branchId')
      .isInt({ min: 1 })
      .withMessage('Branch ID must be a positive integer'),
  ],
  validate,
  authorize('enterprise_admin', 'branch_manager', 'staff'),
  todayByBranch
);

// -------------------------------------------------------------
//  GET /api/attendance/branch/:branchId
//  Alias for /today/:branchId for compatibility.
//  Returns today's attendance log for a specific branch.
// -------------------------------------------------------------
router.get(
  '/branch/:branchId',
  [
    param('branchId')
      .isInt({ min: 1 })
      .withMessage('Branch ID must be a positive integer'),
  ],
  validate,
  authorize('enterprise_admin', 'branch_manager', 'staff'),
  todayByBranch
);

// -------------------------------------------------------------
//  GET /api/attendance/heatmap/:branchId
//  Average check-ins grouped by day of week and hour of day.
//  Returns a 7×24 grid used to render the peak-hours heatmap.
// -------------------------------------------------------------
router.get(
  '/heatmap/:branchId',
  [
    param('branchId')
      .isInt({ min: 1 })
      .withMessage('Branch ID must be a positive integer'),
  ],
  validate,
  authorize('enterprise_admin', 'branch_manager'),
  heatmap
);

// -------------------------------------------------------------
//  GET /api/attendance/member/:memberId
//  Attendance history for a specific member.
//  Member can view their own — staff and above can view anyone's.
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