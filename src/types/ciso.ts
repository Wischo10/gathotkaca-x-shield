export interface PostureComponent {
  key: string;
  name: string;
  rawValue: number;
  rawUnit?: string;
  normalizedScore: number;
  weight: number;
  contribution: number;
  source: string;
  policyNote?: string;
}

export interface MetricCardValue {
  value: number | null;
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
  /** Scope of the SLA calculation (e.g. 'Critical') */
  scope: string;
  /** SLA policy thresholds used for this calculation */
  policy: VulnerabilitySlaPolicyConfig;
  source: string;
  explanation: string;
}

export interface CisoMetricsData {
  securityPostureScore: MetricCardValue;
  totalRiskScore: MetricCardValue;
  activeIncidents: MetricCardValue;
  criticalVulnerabilities: MetricCardValue;
  complianceScore: MetricCardValue;
  riskTreatmentProgress: MetricCardValue;
  vulnerabilitySla: VulnerabilitySlaOverview;
  vulnerabilitySlaOverview?: VulnerabilitySlaOverview;
  updatedAt: string;
}


