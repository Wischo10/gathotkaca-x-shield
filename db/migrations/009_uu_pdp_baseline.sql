-- Migration 009: UU PDP baseline traceability and operational records.
-- Static controls are framework configuration only. No assessments, evidence,
-- findings, remediations, inventory entries, breaches, or scores are seeded.
BEGIN;

ALTER TABLE compliance_assessments DROP CONSTRAINT IF EXISTS compliance_assessments_status_check;
ALTER TABLE compliance_assessments ADD CONSTRAINT compliance_assessments_status_check
  CHECK (status IN ('passed', 'partial', 'failed', 'not_applicable', 'pending'));

INSERT INTO compliance_controls (framework_id, control_code, title, description, category)
SELECT 'uu-pdp', control_code, title, description, category
FROM (VALUES
  ('PDP-DG-01','Data Inventory','Maintain an accountable inventory of personal-data processing assets.','Data Governance'),
  ('PDP-DG-02','Personal Data Category','Record the personal-data categories processed.','Data Governance'),
  ('PDP-DG-03','Data Owner','Assign an accountable owner for personal-data processing.','Data Governance'),
  ('PDP-DG-04','Processing Purpose','Document the purpose of personal-data processing.','Data Governance'),
  ('PDP-DG-05','Data Flow','Document relevant personal-data flows and references.','Data Governance'),
  ('PDP-DG-06','Retention','Define and review personal-data retention requirements.','Data Governance'),
  ('PDP-DG-07','Processing Location','Record where personal data is processed or stored.','Data Governance'),
  ('PDP-SC-01','Access Control','Apply access controls appropriate to personal data.','Security Controls'),
  ('PDP-SC-02','Encryption','Protect personal data with appropriate encryption controls.','Security Controls'),
  ('PDP-SC-03','Logging','Maintain relevant access and security logs.','Security Controls'),
  ('PDP-SC-04','Monitoring','Monitor relevant personal-data security controls.','Security Controls'),
  ('PDP-SC-05','Backup','Maintain appropriate backup and recovery controls.','Security Controls'),
  ('PDP-SC-06','Incident Response','Maintain response procedures for incidents involving personal data.','Security Controls'),
  ('PDP-PC-01','Privacy Policy','Maintain an approved personal-data protection policy.','Privacy Controls'),
  ('PDP-PC-02','Lawful Basis / Consent','Record lawful basis or consent where applicable.','Privacy Controls'),
  ('PDP-PC-03','Data Subject Rights','Support handling of applicable data-subject rights.','Privacy Controls'),
  ('PDP-PC-04','Retention / Deletion','Apply retention and deletion requirements.','Privacy Controls'),
  ('PDP-PC-05','Data Sharing','Govern and record personal-data sharing.','Privacy Controls'),
  ('PDP-PC-06','Third-Party Processing','Govern third parties processing personal data.','Privacy Controls'),
  ('PDP-PB-01','Incident Timeline','Record the verified timeline of a personal-data breach.','Personal Data Breach'),
  ('PDP-PB-02','Impact','Assess and record verified breach impact.','Personal Data Breach'),
  ('PDP-PB-03','Affected Data','Record verified personal-data categories affected.','Personal Data Breach'),
  ('PDP-PB-04','Affected Subjects','Record the known affected data-subject scope.','Personal Data Breach'),
  ('PDP-PB-05','Response Status','Track response status for a confirmed personal-data breach.','Personal Data Breach'),
  ('PDP-PB-06','Notification Status','Track the applicable breach-notification status.','Personal Data Breach')
) AS baseline(control_code,title,description,category)
WHERE EXISTS (SELECT 1 FROM compliance_frameworks WHERE id='uu-pdp')
ON CONFLICT (framework_id, control_code) DO UPDATE SET
  title=EXCLUDED.title, description=EXCLUDED.description, category=EXCLUDED.category;

CREATE TABLE IF NOT EXISTS compliance_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), control_id UUID NOT NULL REFERENCES compliance_controls(id) ON DELETE CASCADE,
  title TEXT NOT NULL, evidence_type TEXT NOT NULL, reference_location TEXT NOT NULL, owner TEXT NOT NULL,
  collected_at TIMESTAMPTZ NOT NULL, notes TEXT, created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), control_id UUID NOT NULL REFERENCES compliance_controls(id) ON DELETE RESTRICT,
  title TEXT NOT NULL, description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Low','Medium','High','Critical')),
  status TEXT NOT NULL CHECK (status IN ('Open','In Progress','Resolved','Accepted')),
  owner TEXT NOT NULL, due_date DATE, created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_remediations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), finding_id UUID NOT NULL REFERENCES compliance_findings(id) ON DELETE CASCADE,
  action TEXT NOT NULL, owner TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Planned','In Progress','Completed')),
  target_date DATE, completed_at TIMESTAMPTZ, notes TEXT, created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_remediation_completion CHECK ((status='Completed' AND completed_at IS NOT NULL) OR (status<>'Completed' AND completed_at IS NULL))
);

CREATE TABLE IF NOT EXISTS pdp_data_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), data_asset TEXT NOT NULL, personal_data_category TEXT NOT NULL,
  data_owner TEXT NOT NULL, processing_purpose TEXT NOT NULL, data_flow_reference TEXT,
  retention TEXT NOT NULL, processing_location TEXT NOT NULL,
  data_hub_entity_id TEXT, created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pdp_breaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL,
  explicitly_classified_personal_data BOOLEAN NOT NULL DEFAULT FALSE CHECK (explicitly_classified_personal_data=TRUE),
  timeline TEXT NOT NULL, impact TEXT NOT NULL, affected_data TEXT NOT NULL, affected_subjects TEXT NOT NULL,
  response_status TEXT NOT NULL CHECK (response_status IN ('Open','Investigating','Contained','Resolved')),
  notification_status TEXT NOT NULL CHECK (notification_status IN ('Not Assessed','Not Required','Pending','Notified')),
  occurred_at TIMESTAMPTZ, detected_at TIMESTAMPTZ, created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_evidence_control ON compliance_evidence(control_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_findings_control ON compliance_findings(control_id, status, due_date);
CREATE INDEX IF NOT EXISTS idx_compliance_remediations_finding ON compliance_remediations(finding_id, status);
CREATE INDEX IF NOT EXISTS idx_pdp_inventory_data_hub ON pdp_data_inventory(data_hub_entity_id) WHERE data_hub_entity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pdp_breaches_status ON pdp_breaches(response_status, created_at DESC);
COMMIT;
