// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Authentication Routes
//  File: backend/src/routes/auth.routes.js
//
//  Public endpoints (no token required):
//    POST /api/auth/register   — new member self-registration
//    POST /api/auth/login      — member or staff login
//
//  Protected endpoints (token required):
//    GET  /api/auth/me         — get current logged-in user profile
// =============================================================

import { Router } from 'express';
import { body } from 'express-validator';

import validate from '../middleware/validate.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import { register, login, getMe } from '../controllers/auth.controller.js';

const router = Router();

// -------------------------------------------------------------
//  POST /api/auth/register
//  Public — new member creates their own account
// -------------------------------------------------------------
router.post(
  '/register',
  [
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

    body('phone')
      .optional()
      .trim()
      .isMobilePhone()
      .withMessage('Must be a valid phone number'),
  ],
  validate,
  register
);

// -------------------------------------------------------------
//  POST /api/auth/login
//  Public — members and staff both use this endpoint
// -------------------------------------------------------------
router.post(
  '/login',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),

    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  validate,
  login
);

// -------------------------------------------------------------
//  GET /api/auth/me
//  Protected — returns the current user's full profile
// -------------------------------------------------------------
router.get('/me', protect, getMe);

export default router;