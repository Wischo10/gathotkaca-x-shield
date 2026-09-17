-- Migration 010: normalized regulatory-reference metadata for compliance controls.
-- This migration creates no assessments, evidence, findings, remediations, scores,
-- inventory records, or breach records.
BEGIN;

CREATE TABLE IF NOT EXISTS compliance_control_regulatory_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id UUID NOT NULL REFERENCES compliance_controls(id) ON DELETE CASCADE,
  regulation_code VARCHAR(64) NOT NULL,
  regulation_name TEXT NOT NULL,
  reference_identifier TEXT,
  relationship_type VARCHAR(32) NOT NULL CHECK (relationship_type IN (
    'DIRECT', 'SUPPORTING', 'INTERNAL_IMPLEMENTATION', 'NO_DIRECT_MAPPING'
  )),
  implementation_summary TEXT NOT NULL,
  authoritative_source_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_control_regulation UNIQUE (control_id, regulation_code)
);

CREATE INDEX IF NOT EXISTS idx_control_regulatory_references_regulation
  ON compliance_control_regulatory_references(regulation_code, relationship_type);

INSERT INTO compliance_control_regulatory_references (
  control_id, regulation_code, regulation_name, reference_identifier,
  relationship_type, implementation_summary, authoritative_source_url
)
SELECT c.id, 'UU-27-2022',
  'UU Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi',
  m.reference_identifier, m.relationship_type, m.implementation_summary,
  'https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022'
FROM compliance_controls c
JOIN (VALUES
  ('PDP-DG-01', 'Pasal 31; Pasal 47', 'SUPPORTING', 'An accountable inventory supports the duties to record all personal-data processing activities and demonstrate accountability.'),
  ('PDP-DG-02', 'Pasal 4; Pasal 21 ayat (1) huruf c', 'SUPPORTING', 'Recording data categories supports classification under the Law and disclosure of the types and relevance of personal data processed on the basis of consent.'),
  ('PDP-DG-03', NULL, 'INTERNAL_IMPLEMENTATION', 'Assigning a data owner is an internal accountability mechanism; the Law does not expressly require this control title or role for each data asset.'),
  ('PDP-DG-04', 'Pasal 21 ayat (1) huruf b; Pasal 28', 'DIRECT', 'Controllers must communicate the processing purpose when relying on consent and process personal data in accordance with its purpose.'),
  ('PDP-DG-05', 'Pasal 31; Pasal 55; Pasal 56', 'SUPPORTING', 'Documented data flows support processing-activity records and governance of domestic and cross-border transfers.'),
  ('PDP-DG-06', 'Pasal 21 ayat (1) huruf d; Pasal 42 ayat (1) huruf a; Pasal 44 ayat (1) huruf a', 'DIRECT', 'The Law requires retention-period information and termination or destruction when applicable retention periods expire.'),
  ('PDP-DG-07', 'Pasal 56', 'SUPPORTING', 'Recording processing location supports determining whether cross-border transfer safeguards apply; the Law does not require a universal location register in these terms.'),
  ('PDP-SC-01', 'Pasal 39 ayat (1) dan ayat (2)', 'DIRECT', 'Controllers must prevent unauthorized access using reliable, secure, and responsible security systems.'),
  ('PDP-SC-02', 'Pasal 35; Pasal 39', 'SUPPORTING', 'Encryption can support the broader duties to apply technical and operational protection and prevent unauthorized access, but is not expressly named.'),
  ('PDP-SC-03', 'Pasal 31', 'SUPPORTING', 'Relevant logging supports the express duty to record all personal-data processing activities; the Law does not prescribe this specific security-log control.'),
  ('PDP-SC-04', 'Pasal 37; Pasal 54 ayat (1) huruf b', 'SUPPORTING', 'Monitoring supports oversight of parties under the controller and the data-protection function’s compliance-monitoring duty.'),
  ('PDP-SC-05', 'Pasal 16 ayat (2) huruf e; Pasal 35', 'INTERNAL_IMPLEMENTATION', 'Backup and recovery are internal measures supporting protection against personal-data loss and broader security duties; backup is not expressly prescribed.'),
  ('PDP-SC-06', 'Pasal 35; Pasal 46', 'SUPPORTING', 'Incident-response procedures support security protection and the handling, recovery, and notification duties arising from a personal-data protection failure.'),
  ('PDP-PC-01', 'Pasal 54 ayat (1) huruf b', 'INTERNAL_IMPLEMENTATION', 'An approved privacy policy is an internal governance mechanism; the Law refers to monitoring controller or processor policies but does not prescribe this control as written.'),
  ('PDP-PC-02', 'Pasal 20 sampai dengan Pasal 24', 'DIRECT', 'Controllers must establish a lawful processing basis and, where consent is used, meet the statutory information, form, validity, and proof requirements.'),
  ('PDP-PC-03', 'Pasal 5 sampai dengan Pasal 15; Pasal 30; Pasal 32; Pasal 40 sampai dengan Pasal 45', 'DIRECT', 'The Law establishes data-subject rights and corresponding controller duties for correction, access, withdrawal, restriction, termination, deletion, and destruction.'),
  ('PDP-PC-04', 'Pasal 16 ayat (2) huruf g; Pasal 21 ayat (1) huruf d; Pasal 42 sampai dengan Pasal 45', 'DIRECT', 'The Law addresses retention disclosure and requires termination, deletion, destruction, and notification under specified conditions.'),
  ('PDP-PC-05', 'Pasal 18; Pasal 55; Pasal 56', 'SUPPORTING', 'Sharing governance supports statutory requirements for joint controllers and domestic or cross-border personal-data transfers.'),
  ('PDP-PC-06', 'Pasal 51; Pasal 52', 'SUPPORTING', 'Third-party processing governance supports controller instructions, written approval for another processor, responsibility allocation, and processor duties.'),
  ('PDP-PB-01', 'Pasal 46 ayat (2) huruf b', 'DIRECT', 'Breach notification must state when and how personal data was disclosed.'),
  ('PDP-PB-02', 'Pasal 46 ayat (2) huruf c', 'SUPPORTING', 'Impact assessment supports determining and communicating appropriate handling and recovery efforts, though a distinct impact field is not expressly prescribed.'),
  ('PDP-PB-03', 'Pasal 46 ayat (2) huruf a', 'DIRECT', 'Breach notification must identify the personal data that was disclosed.'),
  ('PDP-PB-04', 'Pasal 46 ayat (1) huruf a', 'SUPPORTING', 'Determining affected data subjects supports the duty to notify data subjects, although a separate affected-subjects register is not expressly prescribed.'),
  ('PDP-PB-05', 'Pasal 46 ayat (2) huruf c', 'SUPPORTING', 'Tracking response status supports the duty to communicate handling and recovery efforts after a personal-data protection failure.'),
  ('PDP-PB-06', 'Pasal 46 ayat (1) sampai dengan ayat (3)', 'DIRECT', 'The Law establishes written notification duties to data subjects and the institution within three days and, in certain cases, notification to the public.')
) AS m(control_code, reference_identifier, relationship_type, implementation_summary)
  ON c.framework_id = 'uu-pdp' AND c.control_code = m.control_code
ON CONFLICT (control_id, regulation_code) DO UPDATE SET
  regulation_name = EXCLUDED.regulation_name,
  reference_identifier = EXCLUDED.reference_identifier,
  relationship_type = EXCLUDED.relationship_type,
  implementation_summary = EXCLUDED.implementation_summary,
  authoritative_source_url = EXCLUDED.authoritative_source_url,
  updated_at = NOW();

COMMIT;
