-- db/migrations/003_soc_cases.sql
-- Create table for tracking SOC cases/tickets

CREATE TABLE IF NOT EXISTS public.soc_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'closed'
    resolution_type VARCHAR(50), -- 'manual', 'auto', null
    severity VARCHAR(50) NOT NULL DEFAULT 'low',
    assigned_to VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster querying by status and date
CREATE INDEX idx_soc_cases_status ON public.soc_cases(status);
CREATE INDEX idx_soc_cases_created_at ON public.soc_cases(created_at);

-- Create an RPC to quickly get the stats for the executive dashboard
CREATE OR REPLACE FUNCTION get_executive_cases_stats(p_range text DEFAULT '30d')
RETURNS TABLE (
    total_processed_manual bigint,
    total_processed_auto bigint,
    total_closed bigint
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_start_time timestamp with time zone;
BEGIN
    -- Determine the start time based on the range parameter
    IF p_range = '24h' THEN
        v_start_time := now() - interval '24 hours';
    ELSIF p_range = '7d' THEN
        v_start_time := now() - interval '7 days';
    ELSIF p_range = '30d' THEN
        v_start_time := now() - interval '30 days';
    ELSE
        -- Default to 30 days
        v_start_time := now() - interval '30 days';
    END IF;

    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE status = 'in_progress' AND resolution_type = 'manual') AS total_processed_manual,
        COUNT(*) FILTER (WHERE status = 'in_progress' AND resolution_type = 'auto') AS total_processed_auto,
        COUNT(*) FILTER (WHERE status = 'closed') AS total_closed
    FROM public.soc_cases
    WHERE created_at >= v_start_time;
END;
$$;

-- Insert some dummy data to make the dashboard look alive
DO $$ 
DECLARE
    i integer;
BEGIN
    -- Insert 45 'in_progress' manual cases (Processed)
    FOR i IN 1..45 LOOP
        INSERT INTO public.soc_cases (alert_id, title, status, resolution_type, severity, created_at)
        VALUES ('dummy-alert-' || i, 'Suspicious Activity Detected', 'in_progress', 'manual', 'high', now() - (random() * interval '7 days'));
    END LOOP;

    -- Insert 120 'in_progress' auto cases (Processed)
    FOR i IN 46..165 LOOP
        INSERT INTO public.soc_cases (alert_id, title, status, resolution_type, severity, created_at)
        VALUES ('dummy-alert-' || i, 'Known Malware Signature', 'in_progress', 'auto', 'medium', now() - (random() * interval '7 days'));
    END LOOP;

    -- Insert 310 'closed' cases
    FOR i IN 166..475 LOOP
        INSERT INTO public.soc_cases (alert_id, title, status, resolution_type, severity, created_at, closed_at)
        VALUES ('dummy-alert-' || i, 'Failed Login Attempt', 'closed', 'auto', 'low', now() - (random() * interval '30 days'), now() - (random() * interval '10 days'));
    END LOOP;
END $$;
