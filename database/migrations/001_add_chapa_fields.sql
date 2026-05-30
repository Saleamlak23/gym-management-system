-- =============================================================
--  GYM & FITNESS CLUB MANAGEMENT SYSTEM
--  Migration 001 — Add Chapa online payment fields
--  File: database/migrations/001_add_chapa_fields.sql
--
--  Run this ONCE in pgAdmin Query Tool against gym_management.
--  It is safe to re-run — all statements use IF NOT EXISTS.
--
--  What this adds:
--    PAYMENTS table:
--      tx_ref        — unique Chapa transaction reference
--      status        — pending | success | failed | refunded
--      payment_type  — manual | online
--      subscription_id — links payment to the subscription it activates
--      chapa_ref     — Chapa's own internal reference (returned on verify)
--      checkout_url  — the Chapa-hosted payment page URL
--      paid_at       — timestamp when Chapa confirmed payment
--
--  PAYMENT_INTENTS table (new):
--    Tracks initiated-but-not-yet-completed online payments.
--    Chapa webhooks land here first, then promote to PAYMENTS.
-- =============================================================


-- -------------------------------------------------------------
--  Step 1 — Extend the existing PAYMENTS table
-- -------------------------------------------------------------

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS tx_ref          VARCHAR(100) UNIQUE,
  ADD COLUMN IF NOT EXISTS status          VARCHAR(20)  NOT NULL DEFAULT 'success'
    CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  ADD COLUMN IF NOT EXISTS payment_type    VARCHAR(10)  NOT NULL DEFAULT 'manual'
    CHECK (payment_type IN ('manual', 'online')),
  ADD COLUMN IF NOT EXISTS subscription_id INT REFERENCES subscriptions(subscription_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS chapa_ref       VARCHAR(200),
  ADD COLUMN IF NOT EXISTS checkout_url    TEXT,
  ADD COLUMN IF NOT EXISTS paid_at         TIMESTAMP;


-- -------------------------------------------------------------
--  Step 2 — Back-fill existing manual payment rows
--  All rows inserted before this migration have no tx_ref and
--  were recorded manually — mark them as manual + success.
-- -------------------------------------------------------------

UPDATE payments
SET
  status       = 'success',
  payment_type = 'manual',
  paid_at      = payment_date
WHERE tx_ref IS NULL;


-- -------------------------------------------------------------
--  Step 3 — Create indexes for the new columns
-- -------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_payments_tx_ref        ON payments(tx_ref);
CREATE INDEX IF NOT EXISTS idx_payments_status        ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_type          ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_subscription  ON payments(subscription_id);


-- -------------------------------------------------------------
--  Step 4 — Create the PAYMENT_INTENTS table
--
--  Stores an initiated Chapa session before it is confirmed.
--  Once Chapa sends a success webhook, the intent is used to:
--    1. Mark the payment as success
--    2. Activate the linked subscription
--    3. Mark the intent as processed so duplicate webhooks
--       are ignored (idempotency guard)
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS payment_intents (
  intent_id       SERIAL        PRIMARY KEY,
  tx_ref          VARCHAR(100)  NOT NULL UNIQUE,
  member_id       INT           NOT NULL REFERENCES members(member_id)       ON DELETE RESTRICT,
  type_id         INT           NOT NULL REFERENCES membership_types(type_id) ON DELETE RESTRICT,
  amount          NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency        VARCHAR(5)    NOT NULL DEFAULT 'ETB',
  checkout_url    TEXT,
  status          VARCHAR(20)   NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'success', 'failed', 'expired')),
  created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMP     NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
  processed_at    TIMESTAMP,
  payment_id      INT REFERENCES payments(payment_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_intents_tx_ref    ON payment_intents(tx_ref);
CREATE INDEX IF NOT EXISTS idx_intents_member    ON payment_intents(member_id);
CREATE INDEX IF NOT EXISTS idx_intents_status    ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_intents_expires   ON payment_intents(expires_at);


-- =============================================================
--  DONE
--  Run database/migrations/001_add_chapa_fields.sql once.
--  Then restart the backend server.
-- =============================================================