// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Authentication Controller
//  File: backend/src/controllers/auth.controller.js
//
//  Handles:
//    register — create a new member account
//    login    — authenticate member or staff, return JWT
//    getMe    — return the current user's profile from the DB
// =============================================================

import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
const { sign } = jwt;

import { query } from '../config/db.js';
import { sendSuccess, sendError, sendServerError } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const SALT_ROUNDS = 12;

// -------------------------------------------------------------
//  signToken
//  Creates a signed JWT containing the user's id, email,
//  role, and branch_id (null for members and enterprise admins).
// -------------------------------------------------------------
const signToken = (payload) => {
  return sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};


export const register = asyncHandler(async (req, res) => {
  const { first_name, last_name, email, password, phone } = req.body;

  // 1. Check whether this email is already registered as a member
  const existing = await query(
    'SELECT member_id FROM members WHERE email = $1',
    [email]
  );

  if (existing.rows.length > 0) {
    return sendError(res, 'An account with this email already exists.', 409);
  }

  // 2. Hash the password before storing
  const hashedPassword = await hash(password, SALT_ROUNDS);

  // 3. Insert the new member
  const { rows } = await query(
    `INSERT INTO members (first_name, last_name, email, phone, password)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING member_id, first_name, last_name, email, phone, join_date`,
    [first_name, last_name, email, phone || null, hashedPassword]
  );

  const member = rows[0];

  // 4. Sign and return the token
  const token = signToken({
    id:        member.member_id,
    email:     member.email,
    role:      'member',
    branch_id: null,
  });

  return sendSuccess(
    res,
    { token, user: { ...member, role: 'member' } },
    201,
    'Account created successfully'
  );
});


export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  let user       = null;
  let role       = null;
  let hashedPass = null;

  // 1. Look up in members table first
  const memberResult = await query(
    `SELECT member_id AS id, first_name, last_name, email, phone, join_date, password
     FROM members
     WHERE LOWER(email) = LOWER($1)`,
    [email]
  );

  if (memberResult.rows.length > 0) {
    user       = memberResult.rows[0];
    hashedPass = user.password;
    role       = 'member';
  }

  // 2. If not a member, look up in staff table
  if (!user) {
    const staffResult = await query(
      `SELECT
         s.staff_id   AS id,
         s.first_name,
         s.last_name,
         s.email,
         s.password,
         s.branch_id,
         s.is_active,
         sr.role_name
       FROM staff s
       JOIN staff_roles sr ON s.role_id = sr.role_id
       WHERE LOWER(s.email) = LOWER($1)`,
      [email]
    );

    if (staffResult.rows.length > 0) {
      const staffMember = staffResult.rows[0];

      // Prevent deactivated staff from logging in
      if (!staffMember.is_active) {
        return sendError(
          res,
          'Your account has been deactivated. Please contact the administrator.',
          403
        );
      }

      user       = staffMember;
      hashedPass = staffMember.password;
      role       = mapRoleName(staffMember.role_name);
    }
  }

  // 3. No matching user in either table — return generic 401
  //    (do not reveal whether the email exists)
  if (!user || !hashedPass) {
    return sendError(res, 'Invalid email or password.', 401);
  }

  // 4. Compare the submitted password against the stored hash
  const isMatch = await compare(password, hashedPass);

  if (!isMatch) {
    return sendError(res, 'Invalid email or password.', 401);
  }

  // 5. Build the JWT payload
  const tokenPayload = {
    id:        user.id,
    email:     user.email,
    role,
    branch_id: user.branch_id || null,
  };

  const token = signToken(tokenPayload);

  // 6. Build the safe user object (strip password before sending)
  const { password: _pw, ...safeUser } = user;

  return sendSuccess(
    res,
    { token, user: { ...safeUser, role } },
    200,
    'Login successful'
  );
});


export const getMe = asyncHandler(async (req, res) => {
  const { id, role } = req.user;

  let result;

  if (role === 'member') {
    result = await query(
      `SELECT member_id AS id, first_name, last_name, email, phone, join_date
       FROM members
       WHERE member_id = $1`,
      [id]
    );
  } else {
    // Staff — include branch name and role name for the frontend header
    result = await query(
      `SELECT
         s.staff_id   AS id,
         s.first_name,
         s.last_name,
         s.email,
         s.branch_id,
         s.is_active,
         sr.role_name,
         b.name AS branch_name
       FROM staff s
       JOIN staff_roles sr ON s.role_id  = sr.role_id
       JOIN branches    b  ON s.branch_id = b.branch_id
       WHERE s.staff_id = $1`,
      [id]
    );
  }

  if (result.rows.length === 0) {
    return sendError(res, 'User not found.', 404);
  }

  const user = result.rows[0];

  return sendSuccess(res, { user: { ...user, role } });
});


// -------------------------------------------------------------
//  mapRoleName
//  Converts a staff_roles.role_name value from the database
//  into one of the application's defined role strings that
//  the JWT and authorize() middleware use.
//
//  DB role_name       → app role
//  ─────────────────────────────
//  'Branch Manager'   → 'branch_manager'
//  'Personal Trainer' → 'trainer'
//  'Group Instructor' → 'trainer'
//  'Receptionist'     → 'staff'
//  'Cleaner'          → 'staff'
// -------------------------------------------------------------
const mapRoleName = (roleName = '') => {
  const name = roleName.toLowerCase();

  if (name.includes('manager'))    return 'branch_manager';
  if (name.includes('trainer'))    return 'trainer';
  if (name.includes('instructor')) return 'trainer';

  return 'staff'; // default for receptionist, cleaner, etc.
};