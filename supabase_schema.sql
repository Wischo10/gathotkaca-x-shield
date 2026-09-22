-- Tabel Business Impacts (Executive)
CREATE TABLE IF NOT EXISTS business_impacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  estimated_loss_usd NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Risk Categories (CISO)
CREATE TABLE IF NOT EXISTS risk_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  risk_score NUMERIC DEFAULT 0,
  business_impact_id UUID REFERENCES business_impacts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Controls (SOC 2 / Compliance)
CREATE TABLE IF NOT EXISTS controls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  domain VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  framework VARCHAR DEFAULT 'SOC 2',
  status VARCHAR DEFAULT 'Compliant',
  risk_category_id UUID REFERENCES risk_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Manajemen Kasus/Ekskalasi (Incidents - SOC)
CREATE TABLE IF NOT EXISTS soc_cases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  alert_id VARCHAR NOT NULL UNIQUE,
  title VARCHAR NOT NULL,
  severity VARCHAR NOT NULL,
  assigned_to VARCHAR,
  status VARCHAR DEFAULT 'Open',
  control_id UUID REFERENCES controls(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Catatan Kasus
CREATE TABLE IF NOT EXISTS case_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  alert_id VARCHAR NOT NULL,
  author VARCHAR NOT NULL,
  role VARCHAR,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Audit Trails
CREATE TABLE IF NOT EXISTS audit_trails (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  entity_type VARCHAR NOT NULL, -- e.g., 'Incident', 'Control', 'Risk'
  entity_id UUID NOT NULL,
  action VARCHAR NOT NULL,
  old_value JSONB,
  new_value JSONB,
  performed_by VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Konfigurasi & Jadwal Laporan
CREATE TABLE IF NOT EXISTS reports_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  schedule_cron VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'Active',
  format VARCHAR DEFAULT 'PDF',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_generated_at TIMESTAMP WITH TIME ZONE
);

-- ========================================================
-- PHASE 4: AUTOMATION & ALERTING TRIGGERS
-- ========================================================

-- Trigger to automate Audit Trail logging
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_trails (entity_type, entity_id, action, old_value, new_value, performed_by)
  VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), 'system');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER soc_cases_audit
AFTER INSERT OR UPDATE ON soc_cases
FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER controls_audit
AFTER INSERT OR UPDATE ON controls
FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- Trigger for Cross-Dashboard Notification (Realtime)
-- When a critical incident is inserted, broadcast a payload
CREATE OR REPLACE FUNCTION notify_critical_incident()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.severity = 'critical' AND TG_OP = 'INSERT' THEN
    PERFORM pg_notify('critical_incidents_channel', row_to_json(NEW)::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER critical_incident_alert
AFTER INSERT ON soc_cases
FOR EACH ROW EXECUTE FUNCTION notify_critical_incident();
