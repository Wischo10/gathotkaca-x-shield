// Types describing the shapes the SOC Dashboard consumes.
// These describe OUR API layer's response shape (post-normalization),
// not necessarily the raw Wazuh/Wazuh Indexer response shape.

export type Severity = "critical" | "high" | "medium" | "low";

export interface SocMetric {
  value: number | null;
  source: string;
  availability?: "available" | "stale" | "unavailable";
  lastVerifiedAt?: string | null;
  reason?: string;
  sampleCount?: number;
}

export interface SocMetrics {
  range: "7d";
  totalEvents: SocMetric;
  totalAlerts: SocMetric;
  incidents: SocMetric;
  criticalAlerts: SocMetric;
  mttdMinutes: SocMetric;
  mttrMinutes: SocMetric;
  verification: {
    incidents: { totalDetectedEvents: number; uniqueVerifiedIncidentIds: number; detectedEventsInWindow: number; uniqueVerifiedIncidentIdsInWindow: number; matchingBitdefenderIds: number; lastVerifiedAt: string | null } | null;
    lifecycle: { detectedEvents: number; acknowledgedEvents: number; responseStartedEvents: number; containedEvents: number; validMttrPairs: number } | null;
  };
}

export interface AlertsBySeverity {
  total: number;
  totalAlerts: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  percentages: Record<Severity, number>;
}

export interface SocTelemetry {
  range: "7d";
  observedAt: string;
  totalEvents: number;
  totalAlerts: number;
  criticalAlerts: number;
  severity: AlertsBySeverity;
  trend: Array<{ timestamp: string; critical: number; high: number; medium: number; low: number }>;
  aging: Array<{ bucket: "0-15m" | "15-60m" | "1-4h" | "4-24h" | ">24h"; count: number; percentage: number }>;
  mitre: Array<{ tactic: string; count: number }>;
  topRules: Array<{ id: string; description: string; count: number }>;
  liveEvents: LiveEvent[];
}

export interface IncidentsBySeverity {
  totalIncidents: number;
  classifiedIncidents: number;
  unclassifiedIncidents: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  percentages: Record<Severity, number>;
}

export interface TimeSeriesPoint {
  date: string; // ISO date
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface LiveEvent {
  id: string;
  time: string; // ISO timestamp
  event: string;
  source: string;
  severity: Severity;
  rule: string;
  assetOrUser: string;
}

export interface TopAlertingRule {
  ruleName: string;
  count: number;
}

/**
 * Generic wrapper every internal API route returns so the client can
 * distinguish between "loading", "empty", and "error" states without
 * throwing on non-2xx responses.
 */
export type ApiResult<T> =
  | { status: "ok"; data: T }
  | { status: "empty" }
  | { status: "error"; message: string; code?: string };
