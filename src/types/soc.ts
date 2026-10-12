// Types describing the shapes the SOC Dashboard consumes.
// These describe OUR API layer's response shape (post-normalization),
// not necessarily the raw Wazuh/Wazuh Indexer response shape.

export type Severity = "critical" | "high" | "medium" | "low";
export type DataProvenance = "REAL" | "DEMO" | "MIXED" | "NOT_AVAILABLE";
export type DemoAlertStatus = "New" | "In Progress" | "Investigating" | "Resolved" | "Closed";

export interface SocMetric {
  value: number | null;
  source: string;
  provenance?: DataProvenance;
  sourceLabel?: string;
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
  meanTimeToResponseStartMinutes: SocMetric;
  workflowDemo: SocWorkflowDemo | null;
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
  detectionSources: DetectionSources;
}

export interface DetectionSources {
  total: number;
  classified: number;
  unclassified: number;
  coveragePercent: number;
  sources: Array<{ source: string; count: number }>;
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
  lastVerifiedAt: string | null;
  availability: "available" | "stale" | "unavailable";
}

export interface SocWorkflowDemo {
  provenance: "DEMO";
  sourceLabel: "Demo Incident/Ticketing Workflow";
  fixtureIds: string[];
  alertStatuses: Array<{ status: DemoAlertStatus; count: number }>;
  incidentSeverity: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  mttdMinutes: number;
  meanTimeToResponseStartMinutes: number;
  records: Array<{
    id: string;
    status: DemoAlertStatus;
    severity: Severity;
    occurredAt: string;
    detectedAt: string;
    acknowledgedAt: string;
    responseStartedAt: string;
    containedAt: string;
    resolvedAt: string;
  }>;
}

export interface SocIncidentRecord {
  incidentId: string;
  severity: string | null;
  detectedAt: string;
  acknowledgedAt: string | null;
  responseStartedAt: string | null;
  containedAt: string | null;
  resolvedAt: string | null;
  source: "bitdefender_sensor";
  lastVerifiedAt: string;
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

/** Allowlisted investigation record returned by the SOC API; never raw _source. */
export interface SocAlertRecord {
  id: string;
  timestamp: string;
  severity: Severity;
  ruleLevel: number;
  ruleId: string;
  ruleDescription: string;
  agentId: string | null;
  agentName: string | null;
  agentIp: string | null;
  sourceIp: string | null;
  user: string | null;
  destinationUser: string | null;
  location: string | null;
  channel: string | null;
  integration: string | null;
  mitreTactics: string[];
  mitreTechniqueIds: string[];
  detectionSource: string | null;
}

export interface SocAlertDetailResult {
  records: SocAlertRecord[];
  total: number;
  limit: number;
  offset: number;
  range: "7d";
  provenance: "REAL";
  sourceLabel: "Wazuh / OpenSearch";
}

export interface TopAlertingRule {
  ruleName: string;
  count: number;
}

export interface WazuhIpIocCandidate {
  ip: string;
  observationCount: number;
  firstObserved: string;
  lastObserved: string;
  representativeRuleIds: string[];
}

export interface TopIocDetection {
  iocValue: string;
  type: "IP";
  detectionCount: number;
  provider: "abuseipdb";
  enrichedAt: string;
  lastObservedAt: string;
  countryCode?: string | null;
  abuseConfidenceScore?: number | null;
  totalReports?: number | null;
  lastReportedAt?: string | null;
}

export interface AttackCountryDetection {
  countryCode: string;
  countryName: string | null;
  detectionCount: number;
  iocCount?: number;
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
