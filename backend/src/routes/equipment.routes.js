// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Equipment Routes
//  File: backend/src/routes/equipment.routes.js
//
//  All routes are protected — valid JWT required.
//
//  Equipment endpoints:
//    GET    /api/equipment                          — list all equipment
//    GET    /api/equipment/overdue                  — items overdue for service
//    GET    /api/equipment/categories               — list all categories
//    POST   /api/equipment/categories               — create a category
//    GET    /api/equipment/:equipmentId             — single equipment item
//    POST   /api/equipment                          — add new equipment
//    PATCH  /api/equipment/:equipmentId/status      — update status
//
//  Maintenance endpoints:
//    GET    /api/equipment/:equipmentId/maintenance — maintenance history
//    POST   /api/equipment/:equipmentId/maintenance — log a maintenance event
// =============================================================

import { Router } from 'express';
import { body, param } from 'express-validator';

import validate from '../middleware/validate.middleware.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { listCategories, createCategory, listOverdue, list, create, getOne, updateStatus, listMaintenance, logMaintenance } from '../controllers/equipment.controller.js';

const router = Router();

router.use(protect);

// =============================================================
//  EQUIPMENT CATEGORIES
// =============================================================

// -------------------------------------------------------------
//  GET /api/equipment/categories
//  List all equipment categories — any authenticated user
//  Must be defined before /:equipmentId to avoid route conflict
// -------------------------------------------------------------
router.get('/categories', listCategories);

// -------------------------------------------------------------
//  POST /api/equipment/categories
//  Create a new equipment category — admin only
// -------------------------------------------------------------
router.post(
  '/categories',
  [
    body('category_name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required'),
  ],
  validate,
  authorize('enterprise_admin'),
  createCategory
);

// =============================================================
//  EQUIPMENT OVERVIEW
// =============================================================

// -------------------------------------------------------------
//  GET /api/equipment/overdue
//  Items overdue for service or exceeding cost threshold
//  Must be defined before /:equipmentId
// -------------------------------------------------------------
router.get(
  '/overdue',
  authorize('enterprise_admin', 'branch_manager'),
  listOverdue
);

// =============================================================
//  EQUIPMENT CRUD
// =============================================================

// -------------------------------------------------------------
//  GET /api/equipment
//  List all equipment with optional filters
//  Query params: branch_id, category_id, status
// -------------------------------------------------------------
router.get(
  '/',
  authorize('enterprise_admin', 'branch_manager', 'staff'),
  list
);

// -------------------------------------------------------------
//  POST /api/equipment
//  Add a new equipment item — admin only
// -------------------------------------------------------------
router.post(
  '/',
  [
    body('branch_id')
      .isInt({ min: 1 })
      .withMessage('A valid branch ID is required'),

    body('category_id')
      .isInt({ min: 1 })
      .withMessage('A valid category ID is required'),

    body('model_number')
      .trim()
      .notEmpty()
      .withMessage('Model number is required'),

    body('purchase_date')
      .optional()
      .isISO8601()
      .withMessage('Purchase date must be a valid date (YYYY-MM-DD)')
      .toDate(),

    body('status')
      .optional()
      .isIn(['active', 'maintenance', 'retired'])
      .withMessage('Status must be one of: active, maintenance, retired'),
  ],
  validate,
  authorize('enterprise_admin'),
  create
);

// -------------------------------------------------------------
//  GET /api/equipment/:equipmentId
//  Get a single equipment item with its maintenance summary
// -------------------------------------------------------------
router.get(
  '/:equipmentId',
  [
    param('equipmentId')
      .isInt({ min: 1 })
      .withMessage('Equipment ID must be a positive integer'),
  ],
  validate,
  authorize('enterprise_admin', 'branch_manager', 'staff'),
  getOne
);

// -------------------------------------------------------------
//  PATCH /api/equipment/:equipmentId/status
//  Update equipment status — staff and above
// -------------------------------------------------------------
router.patch(
  '/:equipmentId/status',
  [
    param('equipmentId')
      .isInt({ min: 1 })
      .withMessage('Equipment ID must be a positive integer'),

    body('status')
      .isIn(['active', 'maintenance', 'retired'])
      .withMessage('Status must be one of: active, maintenance, retired'),
  ],
  validate,
  authorize('enterprise_admin', 'branch_manager', 'staff'),
  updateStatus
);

// =============================================================
//  MAINTENANCE LOGS
// =============================================================

// -------------------------------------------------------------
//  GET /api/equipment/:equipmentId/maintenance
//  Full maintenance history for one equipment item
// -------------------------------------------------------------
router.get(
  '/:equipmentId/maintenance',
  [
    param('equipmentId')
      .isInt({ min: 1 })
      .withMessage('Equipment ID must be a positive integer'),
  ],
  validate,
  authorize('enterprise_admin', 'branch_manager', 'staff'),
  listMaintenance
);

// -------------------------------------------------------------
//  POST /api/equipment/:equipmentId/maintenance
//  Log a new maintenance event for an equipment item
// -------------------------------------------------------------
router.post(
  '/:equipmentId/maintenance',
  [
    param('equipmentId')
      .isInt({ min: 1 })
      .withMessage('Equipment ID must be a positive integer'),

    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description of the maintenance work is required'),

    body('cost')
      .isFloat({ min: 0 })
      .withMessage('Cost must be zero or a positive number'),

    body('service_date')
      .optional()
      .isISO8601()
      .withMessage('Service date must be a valid date (YYYY-MM-DD)')
      .toDate(),
  ],
  validate,
  authorize('enterprise_admin', 'branch_manager', 'staff'),
  logMaintenance
);

export default router;