-- Migration 013: Extend the UU PDP inventory into a processing-activity/RoPA workspace.
-- No inventory, assessment, evidence, or other business records are inserted.
BEGIN;

ALTER TABLE pdp_data_inventory
  ALTER COLUMN personal_data_category DROP NOT NULL,
  ALTER COLUMN data_owner DROP NOT NULL,
  ALTER COLUMN processing_purpose DROP NOT NULL,
  ALTER COLUMN retention DROP NOT NULL,
  ALTER COLUMN processing_location DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS business_unit TEXT,
  ADD COLUMN IF NOT EXISTS data_subject_categories TEXT,
  ADD COLUMN IF NOT EXISTS sensitive_data_status TEXT NOT NULL DEFAULT 'not_recorded'
    CHECK (sensitive_data_status IN ('yes','no','not_recorded')),
  ADD COLUMN IF NOT EXISTS lawful_basis TEXT,
  ADD COLUMN IF NOT EXISTS personal_data_source TEXT,
  ADD COLUMN IF NOT EXISTS storage_location TEXT,
  ADD COLUMN IF NOT EXISTS cross_border_transfer TEXT NOT NULL DEFAULT 'not_recorded'
    CHECK (cross_border_transfer IN ('yes','no','not_recorded')),
  ADD COLUMN IF NOT EXISTS transfer_destination TEXT,
  ADD COLUMN IF NOT EXISTS shared_with_third_parties TEXT NOT NULL DEFAULT 'not_recorded'
    CHECK (shared_with_third_parties IN ('yes','no','not_recorded')),
  ADD COLUMN IF NOT EXISTS third_party_id UUID REFERENCES third_party_register(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deletion_approach TEXT,
  ADD COLUMN IF NOT EXISTS record_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (record_status IN ('draft','active','retired')),
  ADD COLUMN IF NOT EXISTS updated_by TEXT,
  ADD COLUMN IF NOT EXISTS next_review_at DATE;

CREATE INDEX IF NOT EXISTS idx_pdp_inventory_status_review
  ON pdp_data_inventory(record_status, next_review_at, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_pdp_inventory_third_party
  ON pdp_data_inventory(third_party_id) WHERE third_party_id IS NOT NULL;

COMMIT;
