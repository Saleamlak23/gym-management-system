// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Global Error Handler Middleware
//  File: backend/src/middleware/error.middleware.js
//
//  This is the LAST middleware registered in index.js.
//  Express recognises it as an error handler because it has
//  four parameters: (err, req, res, next).
//
//  Any controller or middleware that calls next(err) — or throws
//  inside an async function wrapped by asyncHandler — lands here.
//
//  Responsibilities:
//    - Log the error server-side with context (method, URL, user)
//    - Map known error types to the correct HTTP status codes
//    - Return a consistent JSON error shape to the client
//    - Never expose stack traces or internal details in production
//
//  Registration in index.js (must be last):
//    app.use(errorHandler);
// =============================================================

import { sendError } from '../utils/response';

// -------------------------------------------------------------
//  errorHandler
//  Central error processing for the entire Express application.
// -------------------------------------------------------------
const errorHandler = (err, req, res, next) => {  // eslint-disable-line no-unused-vars
  const isDev = process.env.NODE_ENV === 'development';

  // Always log the full error server-side for debugging
  console.error('─────────────────────────────────────────');
  console.error(`❌  ${req.method} ${req.originalUrl}`);
  console.error(`    User   : ${req.user ? `id=${req.user.id} role=${req.user.role}` : 'unauthenticated'}`);
  console.error(`    Error  : ${err.message}`);
  if (isDev) console.error(`    Stack  : ${err.stack}`);
  console.error('─────────────────────────────────────────');

  // ------------------------------------------------------------------
  //  Map known error types to appropriate HTTP status codes
  // ------------------------------------------------------------------

  // PostgreSQL unique constraint violation (e.g. duplicate email)
  // Error code 23505 = unique_violation
  if (err.code === '23505') {
    const field = extractPgField(err.detail);
    return sendError(
      res,
      `A record with this ${field} already exists.`,
      409
    );
  }

  // PostgreSQL foreign key violation (e.g. referencing a non-existent branch)
  // Error code 23503 = foreign_key_violation
  if (err.code === '23503') {
    return sendError(
      res,
      'Referenced record does not exist. Check your input and try again.',
      400
    );
  }

  // PostgreSQL not-null constraint violation
  // Error code 23502 = not_null_violation
  if (err.code === '23502') {
    return sendError(
      res,
      `Required field "${err.column}" is missing.`,
      400
    );
  }

  // PostgreSQL check constraint violation (e.g. negative price, invalid status)
  // Error code 23514 = check_violation
  if (err.code === '23514') {
    return sendError(
      res,
      'The submitted value violates a database constraint. Check your input.',
      400
    );
  }

  // JWT errors (should be caught in auth.middleware, but catch here as fallback)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return sendError(res, 'Invalid or expired token. Please log in again.', 401);
  }

  // Custom application errors thrown with a statusCode property
  // Usage in controllers: const err = new Error('Not found'); err.statusCode = 404; throw err;
  if (err.statusCode) {
    return sendError(res, err.message, err.statusCode);
  }

  // ------------------------------------------------------------------
  //  Fallback: unexpected 500 error
  // ------------------------------------------------------------------
  return res.status(500).json({
    success: false,
    message: isDev
      ? err.message
      : 'An unexpected error occurred. Please try again later.',
  });
};


// -------------------------------------------------------------
//  asyncHandler
//  Wraps async controller functions so that any thrown error
//  is automatically forwarded to the global error handler via
//  next(err) — without needing try/catch in every controller.
//
//  Usage in a controller:
//    const { asyncHandler } = require('../middleware/error.middleware');
//
//    exports.list = asyncHandler(async (req, res) => {
//      const { rows } = await query('SELECT * FROM members');
//      sendSuccess(res, { members: rows });
//    });
//
//  Without asyncHandler you would need:
//    exports.list = async (req, res, next) => {
//      try {
//        const { rows } = await query('SELECT * FROM members');
//        sendSuccess(res, { members: rows });
//      } catch (err) {
//        next(err);
//      }
//    };
// -------------------------------------------------------------
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};


// -------------------------------------------------------------
//  notFound
//  Catches requests to routes that do not exist and returns a
//  clean 404 instead of Express's default HTML error page.
//
//  Registration in index.js (after all routes, before errorHandler):
//    app.use(notFound);
//    app.use(errorHandler);
// -------------------------------------------------------------
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};


// -------------------------------------------------------------
//  extractPgField
//  Parses the detail string from a PostgreSQL unique_violation
//  error to extract the conflicting field name for the response.
//
//  Input:  'Key (email)=(test@test.com) already exists.'
//  Output: 'email'
// -------------------------------------------------------------
const extractPgField = (detail = '') => {
  const match = detail.match(/Key \((.+?)\)=/);
  return match ? match[1] : 'value';
};


export default { errorHandler, asyncHandler, notFound };