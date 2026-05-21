// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Staff Routes
//  File: backend/src/routes/staff.routes.js
//
//  All routes are protected — valid JWT required.
//  All routes restricted to enterprise_admin unless noted.
//
//  Staff endpoints:
//    GET    /api/staff                     — list all staff
//    POST   /api/staff                     — create a staff member
//    GET    /api/staff/:staffId            — get one staff member
//    PUT    /api/staff/:staffId            — update staff profile
//    DELETE /api/staff/:staffId            — deactivate staff
//    GET    /api/staff/:staffId/schedule   — staff class schedule
//    GET    /api/staff/:staffId/payroll    — estimated payroll
//
//  Role endpoints:
//    GET    /api/staff/roles               — list all roles
//    POST   /api/staff/roles               — create a role
//    PUT    /api/staff/roles/:roleId       — update a role
// =============================================================

import { Router } from 'express';
import { body, param } from 'express-validator';

import validate from '../middleware/validate.middleware.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { listRoles, createRole, updateRole, list, create, getOne, update, deactivate, getSchedule, getPayroll } from '../controllers/staff.controller.js';

const router = Router();

router.use(protect);

// =============================================================
//  ROLE ENDPOINTS
//  Defined before /:staffId to avoid route conflicts
// =============================================================

// -------------------------------------------------------------
//  GET /api/staff/roles
//  List all roles with their hourly rates
// -------------------------------------------------------------
router.get(
  '/roles',
  authorize('enterprise_admin', 'branch_manager'),
  listRoles
);

// -------------------------------------------------------------
//  POST /api/staff/roles
//  Create a new staff role — admin only
// -------------------------------------------------------------
router.post(
  '/roles',
  [
    body('role_name')
      .trim()
      .notEmpty()
      .withMessage('Role name is required'),

    body('hourly_rate')
      .isFloat({ min: 0 })
      .withMessage('Hourly rate must be zero or a positive number'),
  ],
  validate,
  authorize('enterprise_admin'),
  createRole
);

// -------------------------------------------------------------
//  PUT /api/staff/roles/:roleId
//  Update a role's name or hourly rate — admin only
// -------------------------------------------------------------
router.put(
  '/roles/:roleId',
  [
    param('roleId')
      .isInt({ min: 1 })
      .withMessage('Role ID must be a positive integer'),

    body('role_name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Role name cannot be empty'),

    body('hourly_rate')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Hourly rate must be zero or a positive number'),
  ],
  validate,
  authorize('enterprise_admin'),
  updateRole
);

// =============================================================
//  STAFF ENDPOINTS
// =============================================================

// -------------------------------------------------------------
//  GET /api/staff
//  List all staff members
//  Query params: branch_id, role_id, is_active
// -------------------------------------------------------------
router.get(
  '/',
  authorize('enterprise_admin', 'branch_manager'),
  list
);

// -------------------------------------------------------------
//  POST /api/staff
//  Create a new staff member — admin only
// -------------------------------------------------------------
router.post(
  '/',
  [
    body('branch_id')
      .isInt({ min: 1 })
      .withMessage('A valid branch ID is required'),

    body('role_id')
      .isInt({ min: 1 })
      .withMessage('A valid role ID is required'),

    body('first_name')
      .trim()
      .notEmpty()
      .withMessage('First name is required'),

    body('last_name')
      .trim()
      .notEmpty()
      .withMessage('Last name is required'),

    body('email')
      .trim()
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),

    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number'),
  ],
  validate,
  authorize('enterprise_admin'),
  create
);

// -------------------------------------------------------------
//  GET /api/staff/:staffId
//  Get a single staff member's full profile
// -------------------------------------------------------------
router.get(
  '/:staffId',
  [
    param('staffId')
      .isInt({ min: 1 })
      .withMessage('Staff ID must be a positive integer'),
  ],
  validate,
  authorize('enterprise_admin', 'branch_manager'),
  getOne
);

// -------------------------------------------------------------
//  PUT /api/staff/:staffId
//  Update a staff member's profile — admin only
// -------------------------------------------------------------
router.put(
  '/:staffId',
  [
    param('staffId')
      .isInt({ min: 1 })
      .withMessage('Staff ID must be a positive integer'),

    body('branch_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Branch ID must be a positive integer'),

    body('role_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Role ID must be a positive integer'),

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
  ],
  validate,
  authorize('enterprise_admin'),
  update
);

// -------------------------------------------------------------
//  DELETE /api/staff/:staffId
//  Deactivate a staff member — admin only (soft delete)
// -------------------------------------------------------------
router.delete(
  '/:staffId',
  [
    param('staffId')
      .isInt({ min: 1 })
      .withMessage('Staff ID must be a positive integer'),
  ],
  validate,
  authorize('enterprise_admin'),
  deactivate
);

// -------------------------------------------------------------
//  GET /api/staff/:staffId/schedule
//  Upcoming class schedule for a staff member
// -------------------------------------------------------------
router.get(
  '/:staffId/schedule',
  [
    param('staffId')
      .isInt({ min: 1 })
      .withMessage('Staff ID must be a positive integer'),
  ],
  validate,
  authorize('enterprise_admin', 'branch_manager', 'staff', 'trainer'),
  getSchedule
);

// -------------------------------------------------------------
//  GET /api/staff/:staffId/payroll
//  Estimated payroll for a staff member over a date range
//  Query params: start_date, end_date
// -------------------------------------------------------------
router.get(
  '/:staffId/payroll',
  [
    param('staffId')
      .isInt({ min: 1 })
      .withMessage('Staff ID must be a positive integer'),
  ],
  validate,
  authorize('enterprise_admin'),
  getPayroll
);

export default router;