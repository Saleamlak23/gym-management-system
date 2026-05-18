// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Class Routes
//  File: backend/src/routes/class.routes.js
//
//  All routes are protected — valid JWT required.
//
//  Class template endpoints:
//    GET    /api/classes                       — list all class templates
//    POST   /api/classes                       — create a class template
//    PUT    /api/classes/:classId              — update a class template
//
//  Schedule endpoints:
//    GET    /api/classes/schedules             — list upcoming schedules
//    POST   /api/classes/schedules             — create a scheduled session
//    DELETE /api/classes/schedules/:scheduleId — cancel a scheduled session
//    GET    /api/classes/schedules/:scheduleId/bookings — bookings for a session
//
//  Booking endpoints:
//    POST   /api/classes/bookings              — book a class session
//    DELETE /api/classes/bookings/:bookingId   — cancel a booking
//    GET    /api/classes/bookings/mine         — logged-in member's bookings
// =============================================================

import { Router } from 'express';
import { body, param, query } from 'express-validator';

import validate from '../middleware/validate.middleware';
import { protect, authorize } from '../middleware/auth.middleware';
import { listClasses, createClass, updateClass, listSchedules, createSchedule, cancelSchedule, listSessionBookings, myBookings, createBooking, cancelBooking } from '../controllers/class.controller';

const router = Router();

router.use(protect);

// =============================================================
//  CLASS TEMPLATES
// =============================================================

// -------------------------------------------------------------
//  GET /api/classes
//  List all class templates — any authenticated user
// -------------------------------------------------------------
router.get('/', listClasses);

// -------------------------------------------------------------
//  POST /api/classes
//  Create a new class template — admin only
// -------------------------------------------------------------
router.post(
  '/',
  [
    body('class_name')
      .trim()
      .notEmpty()
      .withMessage('Class name is required'),

    body('description')
      .optional()
      .trim(),

    body('capacity')
      .isInt({ min: 1 })
      .withMessage('Capacity must be a positive integer'),
  ],
  validate,
  authorize('enterprise_admin'),
  createClass
);

// -------------------------------------------------------------
//  PUT /api/classes/:classId
//  Update a class template — admin only
// -------------------------------------------------------------
router.put(
  '/:classId',
  [
    param('classId')
      .isInt({ min: 1 })
      .withMessage('Class ID must be a positive integer'),

    body('class_name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Class name cannot be empty'),

    body('description')
      .optional()
      .trim(),

    body('capacity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Capacity must be a positive integer'),
  ],
  validate,
  authorize('enterprise_admin'),
  updateClass
);

// =============================================================
//  SCHEDULES
// =============================================================

// -------------------------------------------------------------
//  GET /api/classes/schedules
//  List upcoming scheduled sessions.
//  Query params:
//    branch_id  — filter by branch
//    date       — filter by date (YYYY-MM-DD), defaults to today
//    week       — if 'true', returns the full 7-day week from date
// -------------------------------------------------------------
router.get(
  '/schedules',
  listSchedules
);

// -------------------------------------------------------------
//  POST /api/classes/schedules
//  Create a new scheduled session — admin or branch manager
// -------------------------------------------------------------
router.post(
  '/schedules',
  [
    body('class_id')
      .isInt({ min: 1 })
      .withMessage('A valid class ID is required'),

    body('branch_id')
      .isInt({ min: 1 })
      .withMessage('A valid branch ID is required'),

    body('instructor_id')
      .isInt({ min: 1 })
      .withMessage('A valid instructor (staff) ID is required'),

    body('start_time')
      .isISO8601()
      .withMessage('Start time must be a valid ISO 8601 datetime')
      .toDate(),

    body('end_time')
      .isISO8601()
      .withMessage('End time must be a valid ISO 8601 datetime')
      .toDate()
      .custom((end_time, { req }) => {
        if (new Date(end_time) <= new Date(req.body.start_time)) {
          throw new Error('End time must be after start time');
        }
        return true;
      }),
  ],
  validate,
  authorize('enterprise_admin', 'branch_manager'),
  createSchedule
);

// -------------------------------------------------------------
//  DELETE /api/classes/schedules/:scheduleId
//  Cancel a scheduled session — admin or branch manager
//  Also cancels all bookings for that session
// -------------------------------------------------------------
router.delete(
  '/schedules/:scheduleId',
  [
    param('scheduleId')
      .isInt({ min: 1 })
      .withMessage('Schedule ID must be a positive integer'),
  ],
  validate,
  authorize('enterprise_admin', 'branch_manager'),
  cancelSchedule
);

// -------------------------------------------------------------
//  GET /api/classes/schedules/:scheduleId/bookings
//  List all bookings for a specific session — staff and above
// -------------------------------------------------------------
router.get(
  '/schedules/:scheduleId/bookings',
  [
    param('scheduleId')
      .isInt({ min: 1 })
      .withMessage('Schedule ID must be a positive integer'),
  ],
  validate,
  authorize('enterprise_admin', 'branch_manager', 'staff', 'trainer'),
  listSessionBookings
);

// =============================================================
//  BOOKINGS
// =============================================================

// -------------------------------------------------------------
//  GET /api/classes/bookings/mine
//  Must be defined BEFORE /bookings/:bookingId to avoid conflict
//  Returns the logged-in member's upcoming and past bookings
// -------------------------------------------------------------
router.get('/bookings/mine', myBookings);

// -------------------------------------------------------------
//  POST /api/classes/bookings
//  Book a class session — members only
//  Enforces capacity limit inside a transaction
// -------------------------------------------------------------
router.post(
  '/bookings',
  [
    body('schedule_id')
      .isInt({ min: 1 })
      .withMessage('A valid schedule ID is required'),
  ],
  validate,
  authorize('member'),
  createBooking
);

// -------------------------------------------------------------
//  DELETE /api/classes/bookings/:bookingId
//  Cancel a booking — member cancels their own, admin cancels any
// -------------------------------------------------------------
router.delete(
  '/bookings/:bookingId',
  [
    param('bookingId')
      .isInt({ min: 1 })
      .withMessage('Booking ID must be a positive integer'),
  ],
  validate,
  cancelBooking
);

export default router;