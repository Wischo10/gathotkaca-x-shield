-- Migration 002: Compliance frameworks, controls, assessments, and snapshots schema
-- Real compliance data model for Gathotkaca X-Shield.
-- Note: NO fake assessment results or dummy snapshots are inserted here.

CREATE TABLE IF NOT EXISTS compliance_frameworks (
  id          VARCHAR(64) PRIMARY KEY,
  code        VARCHAR(64) NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  version     VARCHAR(32),
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compliance_controls (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id VARCHAR(64) NOT NULL REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  control_code VARCHAR(64) NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  category     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_framework_control UNIQUE (framework_id, control_code)
);

CREATE TABLE IF NOT EXISTS compliance_assessments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id VARCHAR(64) NOT NULL REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  control_id   UUID NOT NULL REFERENCES compliance_controls(id) ON DELETE CASCADE,
  status       VARCHAR(32) NOT NULL CHECK (status IN ('passed', 'failed', 'not_applicable', 'pending')),
  evidence     TEXT,
  assessed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  assessed_by  TEXT,
  source       VARCHAR(64) DEFAULT 'manual', -- 'manual', 'wazuh_sca', 'audit'
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compliance_snapshots (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id       VARCHAR(64) NOT NULL REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  score              NUMERIC(5,2) NOT NULL,
  passed_controls    INTEGER NOT NULL,
  failed_controls    INTEGER NOT NULL,
  evaluated_controls INTEGER NOT NULL,
  status             VARCHAR(32) NOT NULL,
  snapshot_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_compliance_controls_framework ON compliance_controls(framework_id);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_framework ON compliance_assessments(framework_id);
CREATE INDEX IF NOT EXISTS idx_compliance_snapshots_framework_date ON compliance_snapshots(framework_id, snapshot_at DESC);

-- Canonical master framework catalog definitions (metadata only, NO fake scores/assessments)
INSERT INTO compliance_frameworks (id, code, name, version, description)
VALUES
  ('iso27001', 'ISO-27001', 'ISO/IEC 27001:2022', '2022', 'Information Security Management System Standard'),
  ('nist-csf', 'NIST-CSF', 'NIST CSF 2.0', '2.0', 'National Institute of Standards and Technology Cybersecurity Framework'),
  ('uu-pdp', 'UU-PDP', 'UU PDP No. 27/2022', '2022', 'Undang-Undang Pelindungan Data Pribadi Republik Indonesia'),
  ('mitre', 'MITRE-ATTACK', 'MITRE ATT&CK Coverage', 'v14', 'Adversary Tactics, Techniques, and Common Knowledge Coverage'),
  ('cis-v8', 'CIS-V8', 'CIS Controls v8', 'v8', 'Center for Internet Security Critical Security Controls')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  version = EXCLUDED.version,
  description = EXCLUDED.description,
  updated_at = now();
