export const SECURITY_DATA_CATEGORIES = [
  "Network Security",
  "Endpoint Security",
  "Identity & Access",
  "Cloud Security",
  "Application Security",
  "Threat Intelligence",
  "Other",
] as const;

export const SECURITY_DATA_STATUSES = ["Active", "Warning", "Error", "Inactive"] as const;

export const SECURITY_EVENT_TYPES = [
  "Security Alert",
  "Authentication",
  "Access",
  "Network Traffic",
  "System",
  "Configuration",
  "Malware",
  "Vulnerability",
  "DNS",
  "Other",
] as const;

export type DataSourceCategory = (typeof SECURITY_DATA_CATEGORIES)[number];
export type DataSourceStatus = (typeof SECURITY_DATA_STATUSES)[number];
export type SecurityEventType = (typeof SECURITY_EVENT_TYPES)[number];
export type IntegrationAlertSeverity = "Critical" | "Warning" | "Info" | "Success";
export type DataSourceEnvironment = "On-Premise" | "Cloud" | "Hybrid";
export type IngestionRecordStatus = "Received" | "Delayed" | "Failed";
export type IntegrationHealthStatus = "Healthy" | "Warning" | "Failed" | "Disabled";
export type IntegrationActivityType = "SUCCESS" | "WARNING" | "FAILED" | "RECOVERED";
export type DataQualityDimension = "Completeness" | "Accuracy" | "Consistency" | "Timeliness" | "Uniqueness";
export type DataQualityIssueSeverity = "Critical" | "High" | "Medium" | "Low";
export type DataQualityRuleStatus = "Passed" | "Warning" | "Failed";
export type AnalyticsUseCaseStatus = "Active" | "Paused" | "Draft";
export type AnalyticsUseCasePriority = "Critical" | "High" | "Medium" | "Low";
export type AnalyticsIncidentSeverity = "Critical" | "High" | "Medium" | "Low";
export type AnalyticsIncidentStatus = "Investigating" | "Closed" | "Monitoring";

export interface SecurityAnalyticsUseCase {
  readonly id: `DEMO-UC-${string}`;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly status: AnalyticsUseCaseStatus;
  readonly priority: AnalyticsUseCasePriority;
  readonly ownerTeam: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly lastTriggeredAt: string | null;
  readonly sourceIds: readonly DataSource["id"][];
  readonly alerts7d: number;
  readonly incidents7d: number;
  readonly meanTimeToDetectMinutes: number;
  readonly effectivenessScore: number;
  readonly effectivenessHistory: readonly number[];
  readonly alertHistory7d: readonly number[];
  readonly incidentHistory7d: readonly number[];
  readonly logicSummary: string;
}

export interface SecurityAnalyticsIncident {
  readonly id: `DEMO-AN-INC-${string}`;
  readonly useCaseId: SecurityAnalyticsUseCase["id"];
  readonly severity: AnalyticsIncidentSeverity;
  readonly status: AnalyticsIncidentStatus;
  readonly triggeredAt: string;
  readonly title: string;
}

export type ExplorerEventSeverity = "Critical" | "High" | "Medium" | "Low";
export type ExplorerField = "event.category" | "event.action" | "event.severity" | "source.ip" | "destination.ip" | "user.name" | "host.name" | "data_source";
export type ExplorerOperator = "Equals" | "Not Equals" | "Contains" | "Not Contains" | "In" | "Not In";
export interface ExplorerCondition { readonly boolean: "AND" | "OR"; readonly field: ExplorerField; readonly operator: ExplorerOperator; readonly value: string; }
export interface SecurityDataExplorerEvent {
  readonly id: `DEMO-EVT-${string}`; readonly timestamp: string; readonly sourceId: DataSource["id"];
  readonly category: string; readonly action: string; readonly severity: ExplorerEventSeverity; readonly sourceIp: string;
  readonly destinationIp: string; readonly userName: string; readonly hostName: string; readonly message: string; readonly recordSizeBytes: number;
}
export interface SecuritySavedQuery {
  readonly id: `DEMO-QUERY-${string}`; readonly name: string; readonly conditions: readonly ExplorerCondition[];
  readonly sourceScope: DataSource["id"] | "all"; readonly timeRange: "24h" | "7d" | "30d"; readonly updatedAt: string; readonly createdByRole: string;
}

export interface SecurityDataQualityProfile {
  readonly sourceId: DataSource["id"];
  readonly completeness: number;
  readonly accuracy: number;
  readonly consistency: number;
  readonly timeliness: number;
  readonly uniqueness: number;
  readonly overallScore: number;
  readonly issueIds: readonly `DEMO-DQ-ISSUE-${string}`[];
  readonly trend: readonly number[];
}

export interface DataQualityIssue {
  readonly id: `DEMO-DQ-ISSUE-${string}`;
  readonly type: string;
  readonly severity: DataQualityIssueSeverity;
  readonly affectedSourceIds: readonly DataSource["id"][];
  readonly recordsAffected: number;
  readonly detectedAt: string;
  readonly status: "Open" | "Monitoring";
  readonly trend: readonly number[];
}

export interface DataQualityRule {
  readonly id: `DEMO-DQ-RULE-${string}`;
  readonly name: string;
  readonly dimension: DataQualityDimension;
  readonly severity: DataQualityIssueSeverity;
  readonly status: DataQualityRuleStatus;
  readonly lastRunAt: string;
  readonly affectedSourceIds: readonly DataSource["id"][];
}

export interface IntegrationFailureRecord {
  readonly error: string;
  readonly firstOccurredAt: string;
  readonly lastOccurredAt: string;
}

export interface IntegrationActivity {
  readonly id: `DEMO-INT-ACT-${string}`;
  readonly integrationId: `DEMO-INT-${string}`;
  readonly type: IntegrationActivityType;
  readonly message: string;
  readonly occurredAt: string;
  readonly metadata: string;
}

export interface SecurityDataIntegration {
  readonly id: `DEMO-INT-${string}`;
  readonly sourceId: DataSource["id"];
  readonly connector: string;
  readonly healthStatus: IntegrationHealthStatus;
  readonly lastIngestionAt: string;
  readonly ingestionLatencyMinutes: number | null;
  readonly ingestedEvents7d: number;
  readonly successfulIngestionAttempts7d: number;
  readonly totalIngestionAttempts7d: number;
  readonly successRate: number;
  readonly enabled: boolean;
  readonly failureHistory: readonly IntegrationFailureRecord[];
}

export interface IntegrationStatusSnapshot {
  readonly date: string;
  readonly Healthy: number;
  readonly Warning: number;
  readonly Failed: number;
  readonly Disabled: number;
}

export interface SourceIngestionRecord {
  readonly timestamp: string;
  readonly eventsReceived: number;
  readonly status: IngestionRecordStatus;
}

export interface SourceStatusSnapshot {
  readonly date: string;
  readonly Active: number;
  readonly Warning: number;
  readonly Error: number;
  readonly Inactive: number;
}

export interface DataSource {
  readonly id: `DEMO-SRC-${string}`;
  readonly name: string;
  readonly category: DataSourceCategory;
  readonly connector: string;
  readonly status: DataSourceStatus;
  readonly lastIngestedAt: string;
  readonly events7d: number;
  readonly normalizedEvents7d: number;
  readonly dataQualityScore: number;
  readonly retentionDays: number;
  readonly integrationHealth: number;
  readonly eventTypeDistribution: Readonly<Record<SecurityEventType, number>>;
  readonly environment: DataSourceEnvironment;
  readonly firstSeenAt: string;
  readonly sourceDescription: string;
  readonly ownerTeam: string;
  readonly connectorType: string;
  readonly dataFormat: string;
  readonly demoHostOrEndpointLabel: string;
  readonly recentIngestionHistory: readonly SourceIngestionRecord[];
}

export interface DailyIngestionMetric {
  readonly date: string;
  readonly firewall: number;
  readonly endpoint: number;
  readonly identity: number;
  readonly cloud: number;
  readonly application: number;
  readonly other: number;
}

export interface RecentIntegrationAlert {
  readonly id: `DEMO-DATA-ALERT-${string}`;
  readonly severity: IntegrationAlertSeverity;
  readonly title: string;
  readonly occurredAt: string;
  readonly sourceId: DataSource["id"];
}
