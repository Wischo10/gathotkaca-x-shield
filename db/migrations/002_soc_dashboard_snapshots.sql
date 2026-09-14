-- 002_soc_dashboard_snapshots.sql
-- Snapshot tables for Executive Dashboard (Caching from Elasticsearch)

CREATE TABLE IF NOT EXISTS soc_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    range_label VARCHAR(50) NOT NULL, -- e.g., '24h', '7d', '30d'
    status VARCHAR(20) DEFAULT 'completed'
);

CREATE TABLE IF NOT EXISTS soc_board_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID REFERENCES soc_snapshots(id) ON DELETE CASCADE,
    security_score INTEGER NOT NULL,
    active_agents INTEGER NOT NULL,
    total_agents INTEGER NOT NULL,
    critical_vulnerabilities INTEGER NOT NULL,
    high_vulnerabilities INTEGER NOT NULL,
    total_vulnerabilities INTEGER NOT NULL,
    compliance_pct INTEGER NOT NULL,
    total_compliance_events INTEGER NOT NULL,
    high_risk_domains INTEGER NOT NULL,
    quarter VARCHAR(20),
    top_attack_method VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS soc_alerts_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID REFERENCES soc_snapshots(id) ON DELETE CASCADE,
    critical INTEGER NOT NULL DEFAULT 0,
    high INTEGER NOT NULL DEFAULT 0,
    medium INTEGER NOT NULL DEFAULT 0,
    low INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS soc_alerts_trend (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID REFERENCES soc_snapshots(id) ON DELETE CASCADE,
    trend_date DATE NOT NULL,
    critical INTEGER NOT NULL DEFAULT 0,
    high INTEGER NOT NULL DEFAULT 0,
    medium INTEGER NOT NULL DEFAULT 0,
    low INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS soc_attack_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID REFERENCES soc_snapshots(id) ON DELETE CASCADE,
    method_name VARCHAR(100) NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    color VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS soc_top_victims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID REFERENCES soc_snapshots(id) ON DELETE CASCADE,
    victim_name VARCHAR(100) NOT NULL,
    alert_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS soc_top_risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID REFERENCES soc_snapshots(id) ON DELETE CASCADE,
    domain VARCHAR(100) NOT NULL,
    level VARCHAR(20) NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    alert_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS soc_attack_heatmap (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID REFERENCES soc_snapshots(id) ON DELETE CASCADE,
    country_name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    magnitude INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS soc_recent_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID REFERENCES soc_snapshots(id) ON DELETE CASCADE,
    incident_name VARCHAR(200) NOT NULL,
    endpoint VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    creation_time TIMESTAMP WITH TIME ZONE NOT NULL
);

-- =========================================================================
-- Views & RPCs for Frontend API
-- =========================================================================

-- Function to get the latest snapshot ID for a given range
CREATE OR REPLACE FUNCTION get_latest_snapshot_id(p_range VARCHAR)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    SELECT id INTO v_id FROM soc_snapshots WHERE range_label = p_range ORDER BY created_at DESC LIMIT 1;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- RPC: Get Alerts By Severity
CREATE OR REPLACE FUNCTION get_executive_alerts_severity(p_range VARCHAR)
RETURNS JSON AS $$
DECLARE
    v_snapshot_id UUID;
    v_result JSON;
BEGIN
    v_snapshot_id := get_latest_snapshot_id(p_range);
    
    SELECT row_to_json(t) INTO v_result
    FROM (
        SELECT critical, high, medium, low, total
        FROM soc_alerts_summary
        WHERE snapshot_id = v_snapshot_id
        LIMIT 1
    ) t;
    
    RETURN COALESCE(v_result, '{}'::JSON);
END;
$$ LANGUAGE plpgsql;

-- RPC: Get Alerts Trend
CREATE OR REPLACE FUNCTION get_executive_alerts_trend(p_range VARCHAR)
RETURNS JSON AS $$
DECLARE
    v_snapshot_id UUID;
    v_result JSON;
BEGIN
    v_snapshot_id := get_latest_snapshot_id(p_range);
    
    SELECT json_agg(row_to_json(t)) INTO v_result
    FROM (
        SELECT trend_date as date, critical, high, medium, low
        FROM soc_alerts_trend
        WHERE snapshot_id = v_snapshot_id
        ORDER BY trend_date ASC
    ) t;
    
    RETURN COALESCE(v_result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql;

-- RPC: Get Top Risks
CREATE OR REPLACE FUNCTION get_executive_top_risks(p_range VARCHAR)
RETURNS JSON AS $$
DECLARE
    v_snapshot_id UUID;
    v_result JSON;
BEGIN
    v_snapshot_id := get_latest_snapshot_id(p_range);
    
    SELECT json_agg(row_to_json(t)) INTO v_result
    FROM (
        SELECT domain, level, score, alert_count as "alertCount"
        FROM soc_top_risks
        WHERE snapshot_id = v_snapshot_id
        ORDER BY score DESC
    ) t;
    
    RETURN COALESCE(v_result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql;

-- RPC: Get Heatmap
CREATE OR REPLACE FUNCTION get_executive_heatmap(p_range VARCHAR)
RETURNS JSON AS $$
DECLARE
    v_snapshot_id UUID;
    v_result JSON;
BEGIN
    v_snapshot_id := get_latest_snapshot_id(p_range);
    
    SELECT json_agg(row_to_json(t)) INTO v_result
    FROM (
        SELECT latitude as lat, longitude as lng, magnitude
        FROM soc_attack_heatmap
        WHERE snapshot_id = v_snapshot_id
    ) t;
    
    RETURN COALESCE(v_result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql;

-- RPC: Get Board Report (Always latest regardless of range)
CREATE OR REPLACE FUNCTION get_executive_board_report()
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT row_to_json(t) INTO v_result
    FROM (
        SELECT 
            br.security_score as "securityScore",
            br.active_agents as "activeAgents",
            br.total_agents as "totalAgents",
            br.critical_vulnerabilities as "criticalVulnerabilities",
            br.high_vulnerabilities as "highVulnerabilities",
            br.total_vulnerabilities as "totalVulnerabilities",
            br.compliance_pct as "compliancePct",
            br.total_compliance_events as "totalComplianceEvents",
            br.high_risk_domains as "highRiskDomains",
            br.quarter,
            br.top_attack_method as "topAttackMethod",
            br.created_at as "generatedAt"
        FROM soc_board_reports br
        JOIN soc_snapshots s ON br.snapshot_id = s.id
        ORDER BY s.created_at DESC
        LIMIT 1
    ) t;
    
    RETURN COALESCE(v_result, '{}'::JSON);
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- Insert Dummy Data for Testing
-- =========================================================================
DO $$
DECLARE
    v_snapshot_id UUID;
BEGIN
    -- Create a snapshot for '24h'
    INSERT INTO soc_snapshots (range_label) VALUES ('24h') RETURNING id INTO v_snapshot_id;

    -- Dummy Board Report
    INSERT INTO soc_board_reports (snapshot_id, security_score, active_agents, total_agents, critical_vulnerabilities, high_vulnerabilities, total_vulnerabilities, compliance_pct, total_compliance_events, high_risk_domains, quarter, top_attack_method)
    VALUES (v_snapshot_id, 82, 142, 150, 3, 12, 145, 92, 1024, 1, 'Q3 2026', 'Brute Force');

    -- Dummy Alerts Summary
    INSERT INTO soc_alerts_summary (snapshot_id, critical, high, medium, low, total)
    VALUES (v_snapshot_id, 12, 45, 120, 850, 1027);

    -- Dummy Trends
    INSERT INTO soc_alerts_trend (snapshot_id, trend_date, critical, high, medium, low) VALUES
    (v_snapshot_id, CURRENT_DATE - 4, 2, 10, 20, 150),
    (v_snapshot_id, CURRENT_DATE - 3, 5, 15, 25, 200),
    (v_snapshot_id, CURRENT_DATE - 2, 1, 8, 15, 120),
    (v_snapshot_id, CURRENT_DATE - 1, 3, 20, 40, 180),
    (v_snapshot_id, CURRENT_DATE, 1, 12, 20, 200);

    -- Dummy Attack Methods
    INSERT INTO soc_attack_methods (snapshot_id, method_name, count, color) VALUES
    (v_snapshot_id, 'Brute Force', 450, '#3b82f6'),
    (v_snapshot_id, 'Malware', 230, '#ef4444'),
    (v_snapshot_id, 'Phishing', 120, '#f97316'),
    (v_snapshot_id, 'DDoS', 85, '#a855f7');

    -- Dummy Top Victims
    INSERT INTO soc_top_victims (snapshot_id, victim_name, alert_count) VALUES
    (v_snapshot_id, 'WEB-SERVER-01', 320),
    (v_snapshot_id, 'DB-PROD-MSTR', 210),
    (v_snapshot_id, 'VPN-GATEWAY', 150),
    (v_snapshot_id, 'HR-FILE-SHARE', 95);

    -- Dummy Top Risks
    INSERT INTO soc_top_risks (snapshot_id, domain, level, score, alert_count) VALUES
    (v_snapshot_id, 'Network', 'critical', 85, 450),
    (v_snapshot_id, 'Endpoint', 'high', 72, 320),
    (v_snapshot_id, 'Identity', 'medium', 55, 150),
    (v_snapshot_id, 'Application', 'high', 68, 85),
    (v_snapshot_id, 'Compliance', 'low', 30, 22);

    -- Dummy Heatmap
    INSERT INTO soc_attack_heatmap (snapshot_id, country_name, latitude, longitude, magnitude) VALUES
    (v_snapshot_id, 'China', 35.8617, 104.1954, 500),
    (v_snapshot_id, 'Russia', 61.5240, 105.3188, 320),
    (v_snapshot_id, 'USA', 37.0902, -95.7129, 210),
    (v_snapshot_id, 'Indonesia', -0.7893, 113.9213, 150);

    -- Dummy Critical Incidents
    INSERT INTO soc_recent_incidents (snapshot_id, incident_name, endpoint, status, creation_time) VALUES
    (v_snapshot_id, 'Ransomware Activity Detected', 'FILE-SERVER-02', 'Investigating', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
    (v_snapshot_id, 'Multiple Failed VPN Logins', 'VPN-GATEWAY', 'In Progress', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
    (v_snapshot_id, 'Unauthorized Database Access', 'DB-PROD-MSTR', 'Resolved', CURRENT_TIMESTAMP - INTERVAL '12 hours');

END $$;
