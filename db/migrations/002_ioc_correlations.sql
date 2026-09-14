-- Additive Phase 1 read model for Wazuh-observed, AbuseIPDB-enriched IP IOCs.
CREATE TABLE IF NOT EXISTS ioc_correlations (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_type             TEXT NOT NULL CHECK (indicator_type = 'ip'),
  indicator_value            TEXT NOT NULL,
  wazuh_observation_count    BIGINT NOT NULL CHECK (wazuh_observation_count > 0),
  wazuh_first_observed_at    TIMESTAMPTZ NOT NULL,
  wazuh_last_observed_at     TIMESTAMPTZ NOT NULL,
  wazuh_rule_ids             TEXT[] NOT NULL DEFAULT '{}',
  source_window_start        TIMESTAMPTZ NOT NULL,
  source_window_end          TIMESTAMPTZ NOT NULL,
  ti_provider                TEXT NOT NULL CHECK (ti_provider = 'abuseipdb'),
  provider_verdict           TEXT NOT NULL,
  provider_evidence          JSONB NOT NULL DEFAULT '{}'::jsonb,
  enriched_at                TIMESTAMPTZ,
  correlation_status         TEXT NOT NULL CHECK (correlation_status IN ('confirmed_malicious', 'not_confirmed', 'enrichment_error')),
  last_error_code            TEXT,
  last_error_at              TIMESTAMPTZ,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (indicator_type, indicator_value, ti_provider)
);

CREATE INDEX IF NOT EXISTS idx_ioc_correlations_confirmed_last_observed
  ON ioc_correlations (wazuh_last_observed_at DESC)
  WHERE correlation_status = 'confirmed_malicious';

CREATE INDEX IF NOT EXISTS idx_ioc_correlations_observation_count
  ON ioc_correlations (wazuh_observation_count DESC);
