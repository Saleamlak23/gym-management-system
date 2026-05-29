// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Authentication & Authorization Middleware
//  File: backend/src/middleware/auth.middleware.js
//
//  Two exports:
//
//  1. protect
//     Verifies the JWT in the Authorization header.
//     Attaches the decoded user payload to req.user.
//     Returns 401 if the token is missing or invalid.
//
//  2. authorize(...roles)
//     Factory that returns a middleware accepting only users
//     whose role is in the provided list.
//     Returns 403 if the user's role is not allowed.
//     Must be used AFTER protect in the middleware chain.
//
//  Usage in a route file:
//    const { protect, authorize } = require('../middleware/auth.middleware');
//
//    // Any authenticated user
//    router.get('/me', protect, authController.getMe);
//
//    // Only admins
//    router.post('/branches', protect, authorize('enterprise_admin'), branchController.create);
//
//    // Admins or branch managers
//    router.get('/members', protect, authorize('enterprise_admin', 'branch_manager'), memberController.list);
//
//  Token payload shape (set during login):
//    {
//      id:         <int>     member_id or staff_id
//      email:      <string>
//      role:       <string>  'enterprise_admin' | 'branch_manager' |
//                            'staff' | 'trainer' | 'member'
//      branch_id:  <int|null> null for members and enterprise admins
//    }
// =============================================================

import jwt from 'jsonwebtoken';
const { verify } = jwt;
import { sendError } from '../utils/response.js';

// -------------------------------------------------------------
//  protect
//  Reads and verifies the Bearer token from the Authorization header.
// -------------------------------------------------------------
const protect = (req, res, next) => {
  // 1. Extract the token from the header
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(
      res,
      'Access denied. No token provided. Please log in.',
      401
    );
  }

  const token = authHeader.split(' ')[1];

  // 2. Verify the token using the secret from .env
  try {
    const decoded = verify(token, process.env.JWT_SECRET);

    // 3. Attach the decoded payload to req so controllers can
    //    read req.user.id, req.user.role, req.user.branch_id etc.
    req.user = decoded;

    next();
  } catch (err) {
    // Handle specific JWT errors with clear messages
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Session expired. Please log in again.', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token. Please log in again.', 401);
    }
    return sendError(res, 'Authentication failed.', 401);
  }
};


// -------------------------------------------------------------
//  authorize
//  Returns a middleware that checks req.user.role against the
//  allowed roles list. Must run after protect (needs req.user).
//
//  @param  {...string} roles - One or more allowed role strings
//  @return {function}        - Express middleware
// -------------------------------------------------------------
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      // Should not happen if protect always runs first, but guard anyway
      return sendError(res, 'Not authenticated.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}.`,
        403
      );
    }

    next();
  };
};


// -------------------------------------------------------------
//  authorizeSelf
//  Allows a user to access their OWN resource only, unless they
//  also hold one of the override roles (e.g. admin can access any).
//
//  Compares req.user.id against the :id param in the route URL.
//
//  Usage:
//    // Member can view own payments; admin can view anyone's
//    router.get(
//      '/members/:id/payments',
//      protect,
//      authorizeSelf('enterprise_admin', 'branch_manager'),
//      paymentController.listByMember
//    );
//
//  @param  {...string} overrideRoles - Roles that bypass the self-check
//  @return {function}                - Express middleware
// -------------------------------------------------------------
const authorizeSelf = (...overrideRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Not authenticated.', 401);
    }

    // Override roles skip the self check entirely
    if (overrideRoles.includes(req.user.role)) {
      return next();
    }

    // For regular users, the URL :id must match their own id
    const resourceId = parseInt(req.params.id, 10);

    if (req.user.id !== resourceId) {
      return sendError(
        res,
        'Access denied. You can only access your own data.',
        403
      );
    }

    next();
  };
};


// -------------------------------------------------------------
//  authorizeBranch
//  Ensures a branch manager can only access data for their
//  own branch. Enterprise admins bypass this check.
//
//  Compares req.user.branch_id against the :branchId param
//  or a branch_id field in the request body.
//
//  Usage:
//    router.get(
//      '/attendance/branch/:branchId',
//      protect,
//      authorizeBranch,
//      attendanceController.listByBranch
//    );
// -------------------------------------------------------------
const authorizeBranch = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated.', 401);
  }

  // Enterprise admins can access any branch
  if (req.user.role === 'enterprise_admin') {
    return next();
  }

  // For everyone else, the branch in the route must match theirs
  const requestedBranchId = parseInt(
    req.params.branchId || req.params.branch_id || req.body.branch_id,
    10
  );

  if (!requestedBranchId) {
    return next(); // no branch param present — let the controller decide
  }

  if (req.user.branch_id !== requestedBranchId) {
    return sendError(
      res,
      'Access denied. You can only access data for your own branch.',
      403
    );
  }

  next();
};


export { protect, authorize, authorizeSelf, authorizeBranch };
export default { protect, authorize, authorizeSelf, authorizeBranch };