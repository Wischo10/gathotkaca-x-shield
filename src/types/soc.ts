// Types describing the shapes the SOC Dashboard consumes.
// These describe OUR API layer's response shape (post-normalization),
// not necessarily the raw Wazuh/Wazuh Indexer response shape.

export type Severity = "critical" | "high" | "medium" | "low";

export interface SocSummary {
  totalEvents: number;
  totalEventsChangePct: number;
  totalAlerts: number;
  totalAlertsChangePct: number;
  incidents: number;
  incidentsChangePct: number;
  criticalAlerts: number;
  criticalAlertsChangePct: number;
  mttdMinutes: number;
  mttdChangePct: number;
  mttrMinutes: number;
  mttrChangePct: number;
}

export interface AlertsBySeverity {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
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
