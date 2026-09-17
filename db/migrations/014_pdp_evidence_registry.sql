-- Migration 014: Add review/audit metadata to the shared UU PDP evidence registry.
-- No evidence, assessment, finding, remediation, or other business records are inserted.
BEGIN;

ALTER TABLE compliance_evidence
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'registered'
    CHECK (review_status IN ('registered','pending_review','verified','rejected')),
  ADD COLUMN IF NOT EXISTS reviewed_by TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_notes TEXT,
  ADD COLUMN IF NOT EXISTS updated_by TEXT,
  ADD CONSTRAINT valid_evidence_review_audit CHECK (
    (review_status IN ('registered','pending_review') AND reviewed_by IS NULL AND reviewed_at IS NULL)
    OR (review_status IN ('verified','rejected') AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL)
  );

ALTER TABLE compliance_findings
  ADD COLUMN IF NOT EXISTS evidence_id UUID REFERENCES compliance_evidence(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_compliance_evidence_review
  ON compliance_evidence(review_status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_findings_evidence
  ON compliance_findings(evidence_id) WHERE evidence_id IS NOT NULL;

COMMIT;
