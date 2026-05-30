// =============================================================
//  GYM & FITNESS CLUB MANAGEMENT SYSTEM
//  Chapa Payment Gateway Service
//  File: backend/src/services/chapa.service.js
//
//  Wraps all communication with the Chapa API.
//  Chapa docs: https://developer.chapa.co
//
//  Two environments:
//    Sandbox  → base URL: https://api.chapa.co/v1  (test keys)
//    Live     → base URL: https://api.chapa.co/v1  (live keys)
//    The only difference is the CHAPA_SECRET_KEY prefix:
//      CHASECK_test_... → sandbox
//      CHASECK_live_... → production
//
//  Required .env variables:
//    CHAPA_SECRET_KEY     — from Chapa dashboard
//    CHAPA_WEBHOOK_SECRET — from Chapa dashboard (for verification)
//    CLIENT_URL           — frontend base URL (for return_url)
//    BACKEND_URL          — backend base URL  (for callback_url)
// =============================================================

import { request } from 'https';
import { randomBytes, createHmac, timingSafeEqual } from 'crypto';
import 'dotenv/config';

const CHAPA_BASE_URL    = 'https://api.chapa.co/v1';
const CHAPA_SECRET_KEY  = process.env.CHAPA_SECRET_KEY;
const CHAPA_WEBHOOK_SECRET = process.env.CHAPA_WEBHOOK_SECRET;


// -------------------------------------------------------------
//  Internal helper — makes an authenticated HTTPS request
//  to the Chapa API and resolves with parsed JSON.
//  Rejects with a structured error object on failure.
// -------------------------------------------------------------
const chapaRequest = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    if (!CHAPA_SECRET_KEY) {
      return reject(new Error('CHAPA_SECRET_KEY is not set in .env'));
    }

    const payload   = body ? JSON.stringify(body) : null;
    const options   = {
      hostname: 'api.chapa.co',
      path:     `/v1${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
        'Content-Type':  'application/json',
        ...(payload && { 'Content-Length': Buffer.byteLength(payload) }),
      },
    };

    const req = request(options, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject({
              statusCode: res.statusCode,
              message:    parsed.message || 'Chapa API error',
              data:       parsed,
            });
          }
        } catch {
          reject({ statusCode: res.statusCode, message: 'Invalid JSON from Chapa' });
        }
      });
    });

    req.on('error', (err) => reject({ message: err.message }));
    if (payload) req.write(payload);
    req.end();
  });
};


// -------------------------------------------------------------
//  generateTxRef
//  Produces a unique transaction reference for each payment.
//  Format: GYM-<memberId>-<timestamp>-<random4>
//  Example: GYM-7-1716384000000-a3f2
//  Must be unique across all Chapa transactions for your account.
// -------------------------------------------------------------
const generateTxRef = (memberId) => {
  const ts     = Date.now();
  const random = randomBytes(2).toString('hex');
  return `GYM-${memberId}-${ts}-${random}`;
};


// -------------------------------------------------------------
//  initializeTransaction
//  Starts a new Chapa payment session.
//
//  @param {object} params
//    amount       {number}  — in ETB, e.g. 380.00
//    currency     {string}  — 'ETB' (default)
//    email        {string}  — member's email
//    first_name   {string}  — member's first name
//    last_name    {string}  — member's last name
//    tx_ref       {string}  — unique reference from generateTxRef()
//    return_url   {string}  — where browser goes after payment
//    callback_url {string}  — where Chapa POSTs the webhook
//    customization {object} — optional { title, description }
//
//  @returns {object}
//    status       — 'success'
//    data.checkout_url — redirect the member here
// -------------------------------------------------------------
const initializeTransaction = async ({
  amount,
  currency = 'ETB',
  email,
  first_name,
  last_name,
  tx_ref,
  return_url,
  callback_url,
  customization = {},
}) => {
  const body = {
    amount:       amount.toFixed(2),
    currency,
    email,
    first_name,
    last_name,
    tx_ref,
    return_url,
    callback_url,
    customization: {
      title:       customization.title       || 'Gym Membership Payment',
      description: customization.description || 'Gym & Fitness Club membership subscription',
    },
  };

  return chapaRequest('POST', '/transaction/initialize', body);
};


// -------------------------------------------------------------
//  verifyTransaction
//  Confirms a completed payment by querying Chapa.
//  Call this AFTER receiving a webhook to double-check
//  the payment actually succeeded before activating anything.
//
//  @param {string} tx_ref — the transaction reference
//
//  @returns {object}
//    status     — 'success'
//    data.status — 'success' | 'failed' | 'pending'
//    data.amount
//    data.currency
//    data.reference  — Chapa's own internal reference
// -------------------------------------------------------------
const verifyTransaction = async (tx_ref) => {
  return chapaRequest('GET', `/transaction/verify/${tx_ref}`);
};


// -------------------------------------------------------------
//  verifyWebhookSignature
//  Validates that an incoming webhook was genuinely sent by
//  Chapa and not forged by a third party.
//
//  Chapa signs webhooks with HMAC-SHA256 using your
//  CHAPA_WEBHOOK_SECRET. The signature is in the header:
//    x-chapa-signature: sha256=<hex_digest>
//
//  @param {string} rawBody   — the raw request body string
//  @param {string} signature — value of x-chapa-signature header
//
//  @returns {boolean} — true if valid, false if invalid/forged
// -------------------------------------------------------------
const verifyWebhookSignature = (rawBody, signature) => {
  if (!CHAPA_WEBHOOK_SECRET) {
    console.warn('⚠️  CHAPA_WEBHOOK_SECRET not set — skipping signature check');
    return true; // allow in dev if not configured
  }

  if (!signature) return false;

  // Chapa sends: "sha256=<hex>"
  const sigValue = signature.startsWith('sha256=')
    ? signature.slice(7)
    : signature;

  const expected = createHmac('sha256', CHAPA_WEBHOOK_SECRET)
    .update(rawBody, 'utf8')
    .digest('hex');

  // Constant-time comparison prevents timing attacks
  try {
    return timingSafeEqual(
      Buffer.from(sigValue,  'hex'),
      Buffer.from(expected,  'hex')
    );
  } catch {
    return false;
  }
};


// -------------------------------------------------------------
//  getSupportedBanks
//  Returns the list of banks available for direct bank transfer
//  through Chapa. Used to show bank options in the frontend.
// -------------------------------------------------------------
const getSupportedBanks = async () => {
  return chapaRequest('GET', '/banks');
};


export default {
  generateTxRef,
  initializeTransaction,
  verifyTransaction,
  verifyWebhookSignature,
  getSupportedBanks,
};