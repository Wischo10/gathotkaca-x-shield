-- Migration 008: Minimal human-governed third-party register and assessment.
-- No vendor or assessment records are inserted by this migration.

BEGIN;

CREATE TABLE IF NOT EXISTS third_party_register (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_code          TEXT NOT NULL UNIQUE,
  vendor_name          TEXT NOT NULL,
  provided_service     TEXT NOT NULL,
  internal_owner       TEXT NOT NULL,
  criticality          TEXT NOT NULL CHECK (criticality IN ('Low', 'Medium', 'High', 'Critical')),
  lifecycle_status     TEXT NOT NULL CHECK (lifecycle_status IN ('active', 'inactive')),
  assessment_status    TEXT NOT NULL DEFAULT 'needs_assessment'
                         CHECK (assessment_status IN ('needs_assessment', 'assessed')),
  likelihood           TEXT CHECK (likelihood IS NULL OR likelihood IN ('Low', 'Medium', 'High', 'Critical')),
  impact               TEXT CHECK (impact IS NULL OR impact IN ('Low', 'Medium', 'High', 'Critical')),
  risk_rating          TEXT CHECK (risk_rating IS NULL OR risk_rating IN ('Low', 'Medium', 'High', 'Critical')),
  assessment_rationale TEXT,
  assessed_at          TIMESTAMPTZ,
  assessed_by          TEXT,
  treatment_strategy   TEXT,
  treatment_status     TEXT CHECK (treatment_status IS NULL OR treatment_status IN ('Planned', 'In Progress', 'Completed')),
  treatment_owner      TEXT,
  treatment_action     TEXT,
  due_date             DATE,
  next_review_date     DATE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_vendor_code CHECK (vendor_code ~ '^TPR-[0-9]{4}-[0-9]{3}$'),
  CONSTRAINT valid_vendor_name CHECK (length(btrim(vendor_name)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_provided_service CHECK (length(btrim(provided_service)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_internal_owner CHECK (length(btrim(internal_owner)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_optional_assessment_text CHECK (
    (assessment_rationale IS NULL OR length(btrim(assessment_rationale)) BETWEEN 1 AND 10000) AND
    (assessed_by IS NULL OR length(btrim(assessed_by)) BETWEEN 1 AND 10000) AND
    (treatment_strategy IS NULL OR length(btrim(treatment_strategy)) BETWEEN 1 AND 10000) AND
    (treatment_owner IS NULL OR length(btrim(treatment_owner)) BETWEEN 1 AND 10000) AND
    (treatment_action IS NULL OR length(btrim(treatment_action)) BETWEEN 1 AND 10000)
  ),
  CONSTRAINT valid_third_party_assessment_lifecycle CHECK (
    (assessment_status = 'needs_assessment' AND
      likelihood IS NULL AND impact IS NULL AND risk_rating IS NULL AND
      assessment_rationale IS NULL AND assessed_at IS NULL AND assessed_by IS NULL AND
      treatment_strategy IS NULL AND treatment_status IS NULL AND treatment_owner IS NULL AND
      treatment_action IS NULL AND due_date IS NULL AND next_review_date IS NULL)
    OR
    (assessment_status = 'assessed' AND
      likelihood IS NOT NULL AND impact IS NOT NULL AND risk_rating IS NOT NULL AND
      assessment_rationale IS NOT NULL AND assessed_at IS NOT NULL AND assessed_by IS NOT NULL AND
      treatment_strategy IS NOT NULL AND treatment_status IS NOT NULL AND treatment_owner IS NOT NULL AND
      treatment_action IS NOT NULL AND due_date IS NOT NULL AND next_review_date IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_third_party_register_status
  ON third_party_register(assessment_status, lifecycle_status, updated_at DESC);

COMMIT;
