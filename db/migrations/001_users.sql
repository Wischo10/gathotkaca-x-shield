-- Migration 001: users table for DB-based authentication.
-- Run manually against DATABASE_URL, e.g.:
--   psql "$DATABASE_URL" -f db/migrations/001_users.sql

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'analyst'
                CHECK (role IN ('admin', 'ciso', 'analyst', 'executive', 'mssp_admin')),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Note: pgcrypto's gen_random_uuid() requires the pgcrypto extension.
-- If unavailable, run: CREATE EXTENSION IF NOT EXISTS pgcrypto;
