-- Migration 005: Human-governed Risk Register storage.
-- This schema stores explicit assessor-entered values only. It defines no
-- scoring formula and inserts no risk, assessment, treatment, or seed data.

CREATE TABLE IF NOT EXISTS risk_register (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_code               TEXT NOT NULL UNIQUE,
  title                   TEXT NOT NULL,
  scenario_description    TEXT NOT NULL,
  business_service        TEXT NOT NULL,
  business_unit           TEXT NOT NULL,
  threat_narrative        TEXT NOT NULL,
  vulnerability_narrative TEXT NOT NULL,
  likelihood              TEXT NOT NULL,
  likelihood_rationale    TEXT NOT NULL,
  impact                  TEXT NOT NULL,
  impact_rationale        TEXT NOT NULL,
  inherent_risk           TEXT NOT NULL,
  residual_risk           TEXT NOT NULL,
  severity                TEXT NOT NULL,
  risk_owner              TEXT NOT NULL,
  treatment_strategy      TEXT NOT NULL,
  treatment_status        TEXT NOT NULL,
  treatment_owner         TEXT NOT NULL,
  treatment_action        TEXT NOT NULL,
  due_date                DATE NOT NULL,
  review_date             DATE NOT NULL,
  notes                   TEXT,
  assessment_source       TEXT NOT NULL DEFAULT 'manual_risk_assessment',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_risk_code CHECK (length(btrim(risk_code)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_risk_title CHECK (length(btrim(title)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_risk_scenario CHECK (length(btrim(scenario_description)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_risk_business_service CHECK (length(btrim(business_service)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_risk_business_unit CHECK (length(btrim(business_unit)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_risk_threat CHECK (length(btrim(threat_narrative)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_risk_vulnerability CHECK (length(btrim(vulnerability_narrative)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_risk_likelihood CHECK (length(btrim(likelihood)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_risk_likelihood_rationale CHECK (length(btrim(likelihood_rationale)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_risk_impact CHECK (length(btrim(impact)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_risk_impact_rationale CHECK (length(btrim(impact_rationale)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_risk_inherent CHECK (length(btrim(inherent_risk)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_risk_residual CHECK (length(btrim(residual_risk)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_risk_severity CHECK (length(btrim(severity)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_risk_owner CHECK (length(btrim(risk_owner)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_risk_treatment_strategy CHECK (length(btrim(treatment_strategy)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_risk_treatment_status CHECK (length(btrim(treatment_status)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_risk_treatment_owner CHECK (length(btrim(treatment_owner)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_risk_treatment_action CHECK (length(btrim(treatment_action)) BETWEEN 1 AND 10000),
  CONSTRAINT valid_risk_notes CHECK (notes IS NULL OR length(notes) <= 10000),
  CONSTRAINT valid_risk_assessment_source CHECK (assessment_source = 'manual_risk_assessment')
);

-- Supports: ORDER BY updated_at DESC, risk_code ASC
CREATE INDEX IF NOT EXISTS idx_risk_register_updated_code
  ON risk_register(updated_at DESC, risk_code ASC);
