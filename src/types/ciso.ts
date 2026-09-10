export const NIST_FUNCTIONS = ["Govern", "Identify", "Protect", "Detect", "Respond", "Recover"] as const;
export interface NistFunctionAssessment {
  name: typeof NIST_FUNCTIONS[number];
  score: number | null;
  assessedAt: string | null;
  assessedBy: string | null;
  source: string | null;
  evidence: string | null;
  notes: string | null;
  trend30d: number | null; // Percentage-point change, not relative percent change.
  previousScore: number | null;
  previousAssessedAt: string | null;
}
export interface NistPostureAssessment {
  status: "available" | "unavailable";
  domains: NistFunctionAssessment[];
  overallScore: number | null;
  explanation: string;
}

export interface PostureComponent {
  key: string;
  name: string;
  rawValue: number | null;
  rawUnit?: string;
  normalizedScore: number | null;
  weight: number;
  contribution: number | null;
  source: string;
  policyNote?: string;
}

export interface MetricCardValue {
  availability?: {
    status: "available" | "unavailable";
    checkedAt: string;
    fetchedAt: string | null;
    cached: boolean;
    error?: { code: string; message: string };
  };
  value: number | null;
  category?: string;
  eligibleCount?: number;
  completedCount?: number;
  plannedCount?: number;
  inProgressCount?: number;
  max?: number;
  trend30d: number | null;
  trendAvailable: boolean;
  unit?: string;
  source: string;
  components?: PostureComponent[];
  details?: {
    current?: number | null;
    previous30d?: number | null;
    explanation?: string;
    criticalAffectedAssets?: number;
    totalAssets?: number;
    criticalFindings?: number;
    uniqueCriticalCVEs?: number;
    agentsActive?: number;
    agentsDisconnected?: number;
    agentsNeverConnected?: number;
    agentsPending?: number;
    agentsTotal?: number;
  };
}

export interface VulnerabilitySlaCategory {
  count: number;
  percentage: number;
}

export interface VulnerabilitySlaPolicyConfig {
  criticalSlaDays: number | null;
  dueSoonThresholdDays: number | null;
  thresholds?: Record<string, number>;
  dueSoonThresholdPct?: number;
  policyNote?: string;
}

export interface VulnerabilitySlaOverview {
  /** Whether the SLA data could be computed from available sources */
  available: boolean;
  dataAvailable: boolean;
  /** Total Critical unique CVEs in scope */
  total: number | null;
  totalCritical: number | null;
  /** Vulns older than SLA threshold for their severity */
  overdue: number | null;
  overduePct?: number | null;
  /** Vulns approaching SLA threshold */
  dueSoon: number | null;
  dueSoonPct?: number | null;
  /** Remediation/treatment workflow in progress (null when source unavailable) */
  inProgress: number | null;
  inProgressPct?: number | null;
  /** Vulns compliant with SLA */
  compliant: number | null;
  compliantPct?: number | null;
  /** Unique CVEs whose worst-case age cannot be established. */
  unclassified: number | null;
  unclassifiedPct: number | null;
  ageField: "vulnerability.detected_at";
  asOf: string;
  /** Scope of the SLA calculation (e.g. 'Critical') */
  scope: string;
  /** SLA policy thresholds used for this calculation */
  policy: VulnerabilitySlaPolicyConfig;
  source: string;
  explanation: string;
}

export type IncidentLifecycleEventType =
  | "detected"
  | "acknowledged"
  | "response_started"
  | "response_completed"
  | "contained"
  | "closed";

export interface IncidentLifecycleEvent {
  id: string;
  incidentId: string;
  eventType: IncidentLifecycleEventType;
  eventTimestamp: string;
  actorId: string;
  actorName: string;
  source: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface IncidentLifecycleActionResult {
  success: boolean;
  event?: IncidentLifecycleEvent;
  error?: string;
  message?: string;
}

export interface IncidentKpiItem {
  value: number | null;
  unit: "minutes";
  trend30d: number | null;
  trendAvailable: boolean;
  sampleSize: number;
  eligibleIncidents?: number;
  excludedIncidents?: number;
  source: string;
  calculationMethod?: string;
  timestampFieldsUsed?: string;
  explanation?: string;
}

export interface IncidentKpiOverview {
  period: "last_30_days";
  mttd: IncidentKpiItem;
  mtta: IncidentKpiItem;
  mttr: IncidentKpiItem;
  mttc: IncidentKpiItem;
  dataAvailable: boolean;
  explanation: string;
}

export interface CisoMetricsData {
  nistPosture: NistPostureAssessment;
  securityPostureScore: MetricCardValue;
  totalRiskScore: MetricCardValue;
  activeIncidents: MetricCardValue;
  criticalVulnerabilities: MetricCardValue;
  complianceScore: MetricCardValue;
  riskTreatmentProgress: MetricCardValue;
  vulnerabilitySla: VulnerabilitySlaOverview;
  vulnerabilitySlaOverview?: VulnerabilitySlaOverview;
  incidentKpi: IncidentKpiOverview;
  updatedAt: string;
}

export interface BitdefenderIncidentListItem {
  id: string;
  name: string;
  detectionName?: string | null;
  endpoint?: string | null;
  attackTypes?: string[];
  severity: string;
  status: string;
  detectedAt: string | null;
  alertCount: number;
  mainAction?: string;
  acknowledgedAt?: string | null;
  respondedAt?: string | null;
  containedAt?: string | null;
  latestEvent?: IncidentLifecycleEventType | null;
  lifecycleStatus: "detected" | "acknowledged" | "responding" | "contained" | "unhandled";
}

export interface IncidentListResponse {
  total: number;
  items: BitdefenderIncidentListItem[];
}
