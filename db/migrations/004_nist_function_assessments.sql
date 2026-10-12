-- Extend existing assessments; no assessment/control records are inserted.
-- Apply after 002_compliance.sql. Record each reassessment as a new row to
-- retain actual historical assessment snapshots; do not overwrite prior scores.
ALTER TABLE compliance_assessments
  ADD COLUMN function_name VARCHAR(16),
  ADD COLUMN score NUMERIC(5,2),
  ADD COLUMN notes TEXT,
  ALTER COLUMN control_id DROP NOT NULL,
  ALTER COLUMN status DROP NOT NULL;

-- Function assessments are not passed/failed control assessments.
-- Only manual_assessment is approved here; telemetry sources cannot assign scores.
ALTER TABLE compliance_assessments ADD CONSTRAINT valid_assessment_scope CHECK (
  (function_name IS NULL AND score IS NULL AND control_id IS NOT NULL AND status IS NOT NULL)
  OR
  (function_name IS NOT NULL AND function_name IN ('Govern', 'Identify', 'Protect', 'Detect', 'Respond', 'Recover')
   AND framework_id = 'nist-csf' AND control_id IS NULL AND status IS NULL
   AND score IS NOT NULL AND score BETWEEN 0 AND 100
   AND assessed_by IS NOT NULL AND length(trim(assessed_by)) > 0
   AND source IS NOT NULL AND source = 'manual_assessment')
);

CREATE INDEX idx_nist_function_assessed_at
  ON compliance_assessments(function_name, assessed_at DESC)
  WHERE framework_id = 'nist-csf' AND function_name IS NOT NULL;
