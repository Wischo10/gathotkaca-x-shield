-- Migration 007: Explicit preliminary-to-assessed risk lifecycle.
-- No risk records or business assessment values are created by this migration.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM risk_register) THEN
    RAISE EXCEPTION 'Migration 007 requires explicit classification of existing risk records; expected an empty risk_register';
  END IF;
END $$;

ALTER TABLE risk_register
  ADD COLUMN assessment_status TEXT NOT NULL DEFAULT 'needs_assessment',
  ALTER COLUMN business_service DROP NOT NULL,
  ALTER COLUMN business_unit DROP NOT NULL,
  ALTER COLUMN likelihood DROP NOT NULL,
  ALTER COLUMN likelihood_rationale DROP NOT NULL,
  ALTER COLUMN impact DROP NOT NULL,
  ALTER COLUMN impact_rationale DROP NOT NULL,
  ALTER COLUMN inherent_risk DROP NOT NULL,
  ALTER COLUMN residual_risk DROP NOT NULL,
  ALTER COLUMN severity DROP NOT NULL,
  ALTER COLUMN risk_owner DROP NOT NULL,
  ALTER COLUMN treatment_strategy DROP NOT NULL,
  ALTER COLUMN treatment_status DROP NOT NULL,
  ALTER COLUMN treatment_owner DROP NOT NULL,
  ALTER COLUMN treatment_action DROP NOT NULL,
  ALTER COLUMN due_date DROP NOT NULL,
  ALTER COLUMN review_date DROP NOT NULL;

ALTER TABLE risk_register
  ADD CONSTRAINT valid_risk_assessment_status
    CHECK (assessment_status IN ('needs_assessment', 'assessed')),
  ADD CONSTRAINT assessed_risk_requires_complete_assessment CHECK (
    assessment_status <> 'assessed' OR (
      business_service IS NOT NULL AND length(btrim(business_service)) > 0 AND
      business_unit IS NOT NULL AND length(btrim(business_unit)) > 0 AND
      likelihood IS NOT NULL AND length(btrim(likelihood)) > 0 AND
      likelihood_rationale IS NOT NULL AND length(btrim(likelihood_rationale)) > 0 AND
      impact IS NOT NULL AND length(btrim(impact)) > 0 AND
      impact_rationale IS NOT NULL AND length(btrim(impact_rationale)) > 0 AND
      inherent_risk IS NOT NULL AND length(btrim(inherent_risk)) > 0 AND
      residual_risk IS NOT NULL AND length(btrim(residual_risk)) > 0 AND
      severity IS NOT NULL AND length(btrim(severity)) > 0 AND
      risk_owner IS NOT NULL AND length(btrim(risk_owner)) > 0 AND
      treatment_strategy IS NOT NULL AND length(btrim(treatment_strategy)) > 0 AND
      treatment_status IS NOT NULL AND length(btrim(treatment_status)) > 0 AND
      treatment_owner IS NOT NULL AND length(btrim(treatment_owner)) > 0 AND
      treatment_action IS NOT NULL AND length(btrim(treatment_action)) > 0 AND
      due_date IS NOT NULL AND review_date IS NOT NULL
    )
  );

CREATE INDEX idx_risk_register_assessment_status
  ON risk_register(assessment_status, updated_at DESC);
