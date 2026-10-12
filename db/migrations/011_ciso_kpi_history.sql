-- Real daily observations only. This migration deliberately creates no rows.
BEGIN;

CREATE TABLE IF NOT EXISTS ciso_kpi_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_key VARCHAR(128) NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit VARCHAR(32) NOT NULL,
  source_status VARCHAR(32) NOT NULL CHECK (source_status = 'available'),
  source TEXT NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL,
  observation_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_ciso_kpi_daily UNIQUE (metric_key, observation_date)
);

CREATE INDEX IF NOT EXISTS idx_ciso_kpi_metric_observed
  ON ciso_kpi_snapshots(metric_key, observed_at DESC);

-- Keep the established formal-compliance history table and make its cadence
-- deterministic. Supporting counts are nullable for score-only frameworks such
-- as NIST's six-function assessment.
ALTER TABLE compliance_snapshots
  ALTER COLUMN passed_controls DROP NOT NULL,
  ALTER COLUMN failed_controls DROP NOT NULL,
  ALTER COLUMN evaluated_controls DROP NOT NULL;

ALTER TABLE compliance_snapshots
  ADD COLUMN IF NOT EXISTS source_status VARCHAR(32) NOT NULL DEFAULT 'available'
    CHECK (source_status = 'available'),
  ADD COLUMN IF NOT EXISTS observed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS observation_date DATE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE compliance_snapshots
SET observed_at = snapshot_at,
    observation_date = (snapshot_at AT TIME ZONE 'UTC')::date
WHERE observed_at IS NULL OR observation_date IS NULL;

ALTER TABLE compliance_snapshots
  ALTER COLUMN observed_at SET NOT NULL,
  ALTER COLUMN observation_date SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_compliance_snapshot_daily
  ON compliance_snapshots(framework_id, observation_date);

COMMIT;
