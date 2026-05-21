// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  PostgreSQL Connection Pool
//  File: backend/src/config/db.js
// =============================================================

import { Pool } from 'pg';
import 'dotenv/config';


// -------------------------------------------------------------
//  Build the pool configuration from environment variables.
//  All values come from backend/.env — never hardcode credentials.
// -------------------------------------------------------------
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'gym_management',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASS,

  // Connection pool settings
  max:             10,   // maximum number of clients in the pool
  idleTimeoutMillis: 30000,  // close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // return an error after 2s if no connection available
});

// -------------------------------------------------------------
//  Test the connection on startup.
//  Logs success or a clear error message — does not crash the
//  process so the server can still start and report the issue.
// -------------------------------------------------------------
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌  PostgreSQL connection error:', err.message);
    console.error('    Check your DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS in .env');
    return;
  }
  client.query('SELECT NOW()', (queryErr, result) => {
    release();
    if (queryErr) {
      console.error('❌  PostgreSQL test query failed:', queryErr.message);
    } else {
      console.log('✅  PostgreSQL connected —', result.rows[0].now);
    }
  });
});

// -------------------------------------------------------------
//  Log unexpected pool-level errors so they are visible in
//  the console rather than crashing the Node process silently.
// -------------------------------------------------------------
pool.on('error', (err) => {
  console.error('❌  Unexpected PostgreSQL pool error:', err.message);
});

// -------------------------------------------------------------
//  Helper: run a single query using a pool client.
//  Usage:
//    const { rows } = await query('SELECT * FROM members WHERE member_id = $1', [id]);
// -------------------------------------------------------------
const query = (text, params) => pool.query(text, params);

// -------------------------------------------------------------
//  Helper: run multiple queries inside a single transaction.
//  Automatically rolls back if any query throws.
//  Usage:
//    await transaction(async (client) => {
//      await client.query('INSERT INTO ...', [...]);
//      await client.query('UPDATE ...', [...]);
//    });
// -------------------------------------------------------------
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export default { pool, query, transaction };