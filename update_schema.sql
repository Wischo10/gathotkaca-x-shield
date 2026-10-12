-- ========================================================
-- UPDATE SCHEMA: PENAMBAHAN TABEL UNTUK LIVE DATA
-- ========================================================

-- 1. Tabel Bukti/IoC Kasus (Investigation Evidences)
-- Menyimpan indikator kompromi (IoC) atau aset yang ditautkan ke suatu kasus SOC.
CREATE TABLE IF NOT EXISTS case_evidences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_id UUID REFERENCES soc_cases(id) ON DELETE CASCADE,
  entity_type VARCHAR NOT NULL, -- e.g., 'IP', 'Domain', 'Hash', 'Asset'
  entity_value VARCHAR NOT NULL,
  description TEXT,
  is_malicious BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Kustom Playbooks (Playbook Creator)
-- Menyimpan rancangan playbook kustom di luar bawaan Wazuh Active Response.
CREATE TABLE IF NOT EXISTS playbooks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR NOT NULL,
  category VARCHAR DEFAULT 'Custom',
  description TEXT,
  trigger_conditions JSONB, -- Kondisi pemicu playbook (severity, rule_id, dsb)
  steps JSONB NOT NULL,     -- Langkah-langkah penanganan (array)
  status VARCHAR DEFAULT 'Draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Riwayat Laporan (Generated Reports History)
-- Menyimpan data riwayat laporan yang sudah benar-benar dihasilkan (PDF/CSV).
CREATE TABLE IF NOT EXISTS reports_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  config_id UUID REFERENCES reports_config(id) ON DELETE SET NULL,
  title VARCHAR NOT NULL,
  report_type VARCHAR DEFAULT 'Ad-hoc', -- 'Scheduled' atau 'Ad-hoc'
  file_url VARCHAR,                     -- Link ke Supabase Storage
  generated_by VARCHAR DEFAULT 'System',
  status VARCHAR DEFAULT 'Completed',   -- 'Pending', 'Completed', 'Failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel Sumber Threat Intelligence (Manage Feeds)
-- Untuk mengelola sumber feed IoC eksternal yang aktif (selain ThreatFox/AbuseIPDB bawaan).
CREATE TABLE IF NOT EXISTS threat_feeds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  feed_name VARCHAR NOT NULL,
  feed_url VARCHAR NOT NULL,
  feed_type VARCHAR, -- 'IP', 'Domain', 'Hash', 'Mixed'
  status VARCHAR DEFAULT 'Active',
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger untuk update waktu pada tabel Playbooks
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW; 
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_playbooks_modtime ON playbooks;
CREATE TRIGGER update_playbooks_modtime
BEFORE UPDATE ON playbooks 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
