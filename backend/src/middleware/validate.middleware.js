// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Validation Middleware
//  File: backend/src/middleware/validate.middleware.js
//
//  Works together with express-validator's check() / body()
//  chains defined inside each route file.
//
//  How it works:
//    1. Route defines validation rules using express-validator
//    2. This middleware runs AFTER the rules, BEFORE the controller
//    3. If any rule failed → respond 422 with the error list
//    4. If all rules passed → call next() and reach the controller
//
//  Usage in a route file:
//    const { body } = require('express-validator');
//    const validate  = require('../middleware/validate.middleware');
//
//    router.post(
//      '/register',
//      [
//        body('email').isEmail().withMessage('Must be a valid email address'),
//        body('password').isLength({ min: 8 }).withMessage('Minimum 8 characters'),
//      ],
//      validate,              // ← sits between rules and controller
//      authController.register
//    );
// =============================================================

const { validationResult } = require('express-validator');
const { sendValidationError } = require('../utils/response');

// -------------------------------------------------------------
//  validate
//  Reads the result of all preceding express-validator chains.
//  Maps each error to { field, message } for a clean response.
// -------------------------------------------------------------
const validate = (req, res, next) => {
  const result = validationResult(req);

  // All validation rules passed — proceed to the controller
  if (result.isEmpty()) return next();

  // Map express-validator's error objects to a simpler shape
  // that the frontend can directly use for field-level highlighting
  const errors = result.array().map((err) => ({
    field:   err.path,    // the field name e.g. 'email', 'password'
    message: err.msg,     // the .withMessage() string
  }));

  return sendValidationError(res, errors);
};

module.exports = validate;