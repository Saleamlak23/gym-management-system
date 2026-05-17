// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  API Response Helpers
//  File: backend/src/utils/response.js
//
//  Every controller uses these helpers so the frontend always
//  receives responses in the same shape regardless of which
//  endpoint it is calling.
//
//  Success shape:
//    { success: true, data: <any>, message: <string|optional> }
//
//  Error shape:
//    { success: false, message: <string> }
//
//  Validation error shape:
//    { success: false, message: "Validation failed", errors: [] }
// =============================================================


// -------------------------------------------------------------
//  sendSuccess
//  Sends a 2xx JSON response with the data payload.
//
//  @param {object}  res        - Express response object
//  @param {any}     data       - Payload to send (object, array, null)
//  @param {number}  statusCode - HTTP status code (default 200)
//  @param {string}  message    - Optional human-readable message
//
//  Examples:
//    sendSuccess(res, { member });                          // 200
//    sendSuccess(res, { member }, 201, 'Member created');  // 201
//    sendSuccess(res, null, 204);                          // 204 No Content
// -------------------------------------------------------------
const sendSuccess = (res, data = null, statusCode = 200, message = '') => {
  const body = { success: true };

  if (message)      body.message = message;
  if (data !== null) body.data   = data;

  return res.status(statusCode).json(body);
};


// -------------------------------------------------------------
//  sendError
//  Sends a 4xx or 5xx JSON response with a message.
//
//  @param {object}  res        - Express response object
//  @param {string}  message    - Human-readable error description
//  @param {number}  statusCode - HTTP status code (default 400)
//
//  Common status codes used across this project:
//    400 - Bad Request         (malformed input)
//    401 - Unauthorized        (missing or invalid token)
//    403 - Forbidden           (valid token but wrong role)
//    404 - Not Found           (resource does not exist)
//    409 - Conflict            (business rule violation)
//    422 - Unprocessable       (validation errors — use sendValidationError)
//    500 - Internal Server     (unexpected error — use sendServerError)
//
//  Examples:
//    sendError(res, 'Member not found', 404);
//    sendError(res, 'No active subscription — access denied', 403);
// -------------------------------------------------------------
const sendError = (res, message = 'An error occurred', statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};


// -------------------------------------------------------------
//  sendValidationError
//  Sends a 422 response listing all field-level validation errors.
//  Called by validate.middleware.js after express-validator runs.
//
//  @param {object}  res    - Express response object
//  @param {Array}   errors - Array of { field, message } objects
//
//  Response shape:
//    {
//      success: false,
//      message: "Validation failed",
//      errors: [
//        { field: "email",    message: "Must be a valid email address" },
//        { field: "password", message: "Must be at least 8 characters" }
//      ]
//    }
// -------------------------------------------------------------
const sendValidationError = (res, errors = []) => {
  return res.status(422).json({
    success: false,
    message: 'Validation failed',
    errors,
  });
};


// -------------------------------------------------------------
//  sendServerError
//  Sends a 500 response. In development the actual error message
//  is included to aid debugging. In production only a generic
//  message is returned so internal details are never exposed.
//
//  @param {object} res - Express response object
//  @param {Error}  err - The caught Error object
// -------------------------------------------------------------
const sendServerError = (res, err) => {
  const isDev = process.env.NODE_ENV === 'development';

  console.error('❌  Server error:', err.message);
  if (isDev) console.error(err.stack);

  return res.status(500).json({
    success: false,
    message: isDev ? err.message : 'Internal server error. Please try again later.',
  });
};


export default {
  sendSuccess,
  sendError,
  sendValidationError,
  sendServerError,
};