-- Dedicated authorization/accountability identities for CISO assessments.
-- This table is not an authentication provider and stores no credentials.
BEGIN;

CREATE TABLE IF NOT EXISTS ciso_assessors (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  full_name  TEXT NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('admin', 'ciso')),
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
