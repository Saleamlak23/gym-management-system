// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Analytics Routes
//  File: backend/src/routes/analytics.routes.js
//
//  All routes are protected — valid JWT required.
//  All routes restricted to admin and branch_manager roles.
//
//  Endpoints:
//    GET /api/analytics/overview           — enterprise KPIs (all branches)
//    GET /api/analytics/branch/:branchId   — KPIs for one branch
//    GET /api/analytics/revenue            — revenue over time
//    GET /api/analytics/members/growth     — new member signups per month
//    GET /api/analytics/classes/fillrate   — class fill rate per branch
// =============================================================

import { Router } from 'express';
import { param } from 'express-validator';

import validate from '../middleware/validate.middleware';
import { protect, authorize } from '../middleware/auth.middleware';
import { overview, branchOverview, revenue, memberGrowth, classFillRate } from '../controllers/analytics.controller';

const router = Router();

router.use(protect);

// -------------------------------------------------------------
//  GET /api/analytics/overview
//  Enterprise-level KPIs across all branches.
//  Admin only — branch managers see only their own branch.
// -------------------------------------------------------------
router.get(
  '/overview',
  authorize('enterprise_admin'),
  overview
);

// -------------------------------------------------------------
//  GET /api/analytics/branch/:branchId
//  KPIs scoped to a single branch.
//  Branch managers can only access their own branch_id.
// -------------------------------------------------------------
router.get(
  '/branch/:branchId',
  [
    param('branchId')
      .isInt({ min: 1 })
      .withMessage('Branch ID must be a positive integer'),
  ],
  validate,
  authorize('enterprise_admin', 'branch_manager'),
  branchOverview
);

// -------------------------------------------------------------
//  GET /api/analytics/revenue
//  Revenue aggregated over time with flexible grouping.
//  Query params:
//    start_date — period start  (default: 12 months ago)
//    end_date   — period end    (default: today)
//    group_by   — 'day' | 'week' | 'month' (default: month)
//    branch_id  — scope to one branch (optional)
// -------------------------------------------------------------
router.get(
  '/revenue',
  authorize('enterprise_admin', 'branch_manager'),
  revenue
);

// -------------------------------------------------------------
//  GET /api/analytics/members/growth
//  New member signups grouped by month for the past 12 months.
//  Query params:
//    months    — number of months to look back (default: 12)
//    branch_id — not applicable (members are not branch-scoped)
// -------------------------------------------------------------
router.get(
  '/members/growth',
  authorize('enterprise_admin', 'branch_manager'),
  memberGrowth
);

// -------------------------------------------------------------
//  GET /api/analytics/classes/fillrate
//  Average fill rate per class type and branch.
//  Query params:
//    branch_id  — scope to one branch (optional)
//    start_date — period start (default: 30 days ago)
//    end_date   — period end   (default: today)
// -------------------------------------------------------------
router.get(
  '/classes/fillrate',
  authorize('enterprise_admin', 'branch_manager'),
  classFillRate
);

export default router;