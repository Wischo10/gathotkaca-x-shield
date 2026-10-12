-- Migration: 003_incident_lifecycle.sql
-- Description: Create incident_lifecycle_events table for tracking analyst lifecycle actions on security incidents
-- Strictly REAL DATA: No seed events, no dummy data.

CREATE TABLE IF NOT EXISTS incident_lifecycle_events (
  id VARCHAR(64) PRIMARY KEY,
  incident_id VARCHAR(128) NOT NULL,
  event_type VARCHAR(32) NOT NULL,
  event_timestamp TIMESTAMPTZ NOT NULL,
  actor_id VARCHAR(64) NOT NULL,
  actor_name VARCHAR(255) NOT NULL,
  source VARCHAR(64) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying lifecycle by incident
CREATE INDEX IF NOT EXISTS idx_incident_lifecycle_incident_id 
  ON incident_lifecycle_events(incident_id);

-- Index for querying by event type and timestamp (for KPI calculations over time windows)
CREATE INDEX IF NOT EXISTS idx_incident_lifecycle_type_time 
  ON incident_lifecycle_events(event_type, event_timestamp);

-- Unique constraint to prevent duplicate same-type events for the same incident
CREATE UNIQUE INDEX IF NOT EXISTS idx_incident_lifecycle_unique_event 
  ON incident_lifecycle_events(incident_id, event_type);
