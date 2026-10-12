import type { SocIncidentRecord, SocTelemetry, TopIocDetection } from "@/types/soc";

export type MsspSourceState<T> =
  | { status: "available"; data: T; source: string; provenance: "REAL" }
  | { status: "unavailable"; source: string; provenance: "NOT_AVAILABLE" };

export type MsspDemoSourceState<T> =
  | { status: "available"; data: T; source: "MSSP Demo Provider"; provenance: "DEMO" }
  | { status: "unavailable"; source: "MSSP Demo Provider"; provenance: "NOT_AVAILABLE" };

export interface MsspDemoClient {
  id: `DEMO-CLIENT-${string}`;
  name: string;
  services: number;
  openAlerts: number;
  openIncidents: number;
  mttrMinutes: number;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  serviceUptimePercent: number;
  serviceTypes: string[];
  slaStatus: "Met" | "Breached";
  industry: string;
  city: string;
  region: string;
  status: "Active" | "Inactive" | "Onboarding";
  lastActivity: string;
}

export interface MsspDemoIncident {
  id: string;
  clientId: `DEMO-CLIENT-${string}`;
  clientName: string;
  name: string;
  owner: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "New" | "Investigating" | "In Progress" | "Contained" | "Resolved";
  openedAt: string;
  resolvedAt: string | null;
  elapsedMinutes: number;
  slaTargetMinutes: number;
  slaState: "Healthy" | "At Risk" | "Breached";
}

export interface MsspDemoServiceOffering {
  id: string;
  name: string;
  type: string;
  clients: number;
  assignments: number;
  status: "Active" | "Warning" | "Maintenance";
  healthScore: number;
  slaPercent: number;
  mttrMinutes: number | null;
  lastActivity: string;
}

export interface MsspDemoServiceIssue {
  id: string;
  serviceName: string;
  issue: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  affectedClients: number;
  status: "Investigating" | "Identified" | "Monitoring" | "Resolved";
  detectedAt: string;
  resolvedAt: string | null;
  resolutionMinutes: number | null;
}

export interface MsspDemoMaintenanceWindow {
  id: string;
  serviceName: string;
  startAt: string;
  endAt: string;
  affectedClients: number;
}

export interface MsspDemoReport {
  id: `DEMO-REPORT-${string}`;
  templateId: string;
  reportName: string;
  clientId: `DEMO-CLIENT-${string}`;
  clientName: string;
  category: string;
  generationMode: "scheduled" | "on-demand";
  generatedBy: string;
  generatedAt: string;
  status: "success" | "failed";
  format: "PDF" | "Excel" | "CSV" | "HTML";
  generationDurationSeconds: number;
  downloadCount: number;
  consumer: string;
}

export interface MsspDemoReportSchedule {
  id: string;
  templateId: string;
  reportName: string;
  frequency: "Daily" | "Weekly" | "Monthly";
  nextRun: string;
  recipients: number;
  status: "Active" | "Paused";
}

export type MsspDemoTicketStatus = "Open" | "In Progress" | "Waiting" | "Resolved" | "Closed";
export type MsspDemoTicketPriority = "Critical" | "High" | "Medium" | "Low" | "Informational";
export interface MsspDemoTicket {
  id: `DEMO-TKT-${string}`;
  clientId: MsspDemoClient["id"];
  subject: string;
  category: "Incident Response" | "Access Management" | "Vulnerability Management" | "Security Monitoring" | "Endpoint Security" | "Network Security" | "Other";
  priority: MsspDemoTicketPriority;
  status: MsspDemoTicketStatus;
  assignedTeam: "SOC L1 Team" | "SOC L2 Team" | "Access Team" | "Endpoint Team" | "Network Team" | "Security Operations";
  createdAt: string;
  startedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  slaTargetMinutes: number;
  slaDueAt: string;
  slaStatus: "Met" | "Breached";
}

export interface MsspTicketsDemoData { clients: MsspDemoClient[]; tickets: MsspDemoTicket[]; snapshotAt: string; }

export type MsspDemoAssetRiskLevel = "High" | "Medium" | "Low" | "Info";
export interface MsspDemoAsset {
  id: `DEMO-ASSET-${string}`;
  assetName: `DEMO-${string}`;
  clientId: MsspDemoClient["id"];
  assetType: "Server" | "Workstation" | "Network Device" | "Cloud Resource" | "Application" | "Other";
  operatingSystem: "Windows" | "Linux" | "Network OS" | "macOS" | "Other";
  managementStatus: "Managed" | "Unmanaged";
  lifecycleStatus: "Active" | "Inactive" | "Offline" | "Decommissioned";
  riskScore: number;
  riskLevel: MsspDemoAssetRiskLevel;
  vulnerabilityCount: number;
  criticalVulnerabilityCount: number;
  highVulnerabilityCount: number;
  location: "Jakarta" | "Surabaya" | "Singapore" | "Tokyo" | "Sydney";
  discoverySource: "Endpoint Agent" | "Network Discovery" | "Cloud Inventory" | "Manual Entry";
  firstSeen: string;
  lastSeen: string;
}
export interface MsspDemoAssetChange { id: `DEMO-ASSET-CHANGE-${string}`; assetId: MsspDemoAsset["id"]; changedAt: string; changeType: "New Asset Added" | "Risk Level Changed" | "Asset Updated" | "Vulnerability Detected" | "Status Changed" | "Management Status Changed"; changedBy: "System" | "Inventory Sync"; }
export interface MsspAssetsDemoData { clients: MsspDemoClient[]; assets: MsspDemoAsset[]; changes: MsspDemoAssetChange[]; snapshotAt: string; }

export type MsspAccountLifecycleStatus = "Active" | "Onboarding" | "Suspended" | "Offboarding";
export type MsspAccountSegment = "Enterprise" | "Large Business" | "Medium Business" | "Small Business";
export type MsspAccountServiceTier = "Premium" | "Standard" | "Basic";
export type MsspAccountOnboardingStage = "Verification & Setup" | "Assessment" | "Service Configuration" | "Contract Review" | "Completed";
export interface MsspDemoAccountMetadata {
  clientId: MsspDemoClient["id"];
  segment: MsspAccountSegment;
  lifecycleStatus: MsspAccountLifecycleStatus;
  contractStart: string;
  contractEnd: string;
  serviceTier: MsspAccountServiceTier;
  accountOwner: "Account Manager A" | "Account Manager B" | "Account Manager C";
  onboardingStage: MsspAccountOnboardingStage;
  onboardingProgress: number;
  satisfactionScore: number;
  lastActivityAt: string;
}
export interface MsspDemoAccountRow extends MsspDemoAccountMetadata {
  clientName: string;
  industry: string;
  assets: number;
  openTickets: number;
  slaPercent: number;
}
export interface MsspAccountManagementDemoData {
  clients: MsspDemoClient[];
  accounts: MsspDemoAccountMetadata[];
  rows: MsspDemoAccountRow[];
  snapshotAt: string;
  newClientPeriodDays: 30;
  openTicketStatuses: Array<"Open" | "In Progress" | "Waiting">;
  kpiHistory: {
    totalClients: number[];
    activeClients: number[];
    newClients: number[];
    suspendedClients: number[];
    expiringContracts: number[];
    satisfactionScore: number[];
  };
}

export interface MsspDemoAdminRole { id: string; name: string; description: string; }
export interface MsspDemoAdminUser { id: string; displayName: string; emailAlias: `${string}@example.invalid`; roleId: string; status: "Active" | "Inactive"; lastLoginAt: string | null; }
export interface MsspDemoAuditEvent { id: string; timestamp: string; actor: string; action: "Login" | "View Dashboard" | "Update Demo Preference" | "Review Incident" | "Generate Demo Report" | "View Asset Inventory"; resource: string; source: "Demo Admin Preview"; }
export interface MsspDemoNotificationPreference { name: string; email: boolean; inApp: boolean; }
export interface MsspKnownIntegrationCapability { name: string; type: string; state: "AVAILABLE" | "NOT CONFIGURED"; health: "UNKNOWN"; healthChecked: false; }
export interface MsspSettingsDemoData {
  snapshotAt: string;
  uptimePercent: number;
  uptimeHistory: number[];
  users: MsspDemoAdminUser[];
  roles: MsspDemoAdminRole[];
  auditEvents: MsspDemoAuditEvent[];
  auditHistory: number[];
  integrations: MsspKnownIntegrationCapability[];
  notifications: MsspDemoNotificationPreference[];
  apiAccess: { apiKeys: number; activeApiKeys: number; webhookEndpoints: number; trustedIpRules: number; };
  storage: { storageUsedPercent: number; storageUsed: string; logStorage7Days: string; backups30Days: number; lastBackupAt: string; };
  activities: Array<{ id: string; activity: string; timestamp: string }>;
}

export type MsspComplianceStatus = "compliant" | "partially-compliant" | "non-compliant" | "not-applicable";
export interface MsspDemoComplianceFramework { id: `DEMO-FRAMEWORK-${string}`; name: string; totalControls: number; }
export interface MsspDemoControlAssessment { controlId: `DEMO-CONTROL-${string}`; frameworkId: MsspDemoComplianceFramework["id"]; clientId: MsspDemoClient["id"]; status: MsspComplianceStatus; assessedAt: string; }
export interface MsspDemoComplianceGap { id: `DEMO-GAP-${string}`; title: string; frameworkId: MsspDemoComplianceFramework["id"]; affectedClientIds: MsspDemoClient["id"][]; riskLevel: "Critical" | "High" | "Medium" | "Low"; status: "Open" | "In Review" | "Mitigating"; }
export interface MsspDemoAudit { id: `DEMO-AUDIT-${string}`; clientId: MsspDemoClient["id"]; auditType: string; frameworkId: MsspDemoComplianceFramework["id"]; scheduledDate: string; status: "Upcoming" | "Scheduled" | "Preparation"; }
export interface MsspDemoComplianceActivity { id: `DEMO-ACTIVITY-${string}`; activity: string; clientId: MsspDemoClient["id"]; frameworkId: MsspDemoComplianceFramework["id"]; dueDate: string; status: "Pending" | "In Progress" | "Completed"; }
export interface MsspDemoComplianceDocument { id: `DEMO-DOC-${string}`; documentName: string; frameworkId: MsspDemoComplianceFramework["id"]; lastUpdated: string; type: "Policy" | "Report" | "Procedure" | "Spreadsheet" | "Evidence"; }
export interface MsspComplianceDemoData { clients: MsspDemoClient[]; frameworks: MsspDemoComplianceFramework[]; assessments: MsspDemoControlAssessment[]; gaps: MsspDemoComplianceGap[]; audits: MsspDemoAudit[]; activities: MsspDemoComplianceActivity[]; documents: MsspDemoComplianceDocument[]; scoreTrend: Array<{ date: string; score: number }>; }

export interface MsspOverviewDemoData {
  clients: MsspDemoClient[];
  tickets: MsspDemoTicket[];
  activeServices: number;
  openIncidents: number;
  mttrMinutes: number;
  serviceUptimePercent: number;
  incidentStatuses: Array<{ status: "New" | "Investigating" | "In Progress" | "Contained" | "Resolved"; count: number }>;
  recentIncidents: Array<{
    id: string;
    time: string;
    clientId: `DEMO-CLIENT-${string}`;
    clientName: string;
    name: string;
    status: "New" | "Investigating" | "In Progress" | "Contained" | "Resolved";
    owner: string;
  }>;
  demoIncidents: MsspDemoIncident[];
  servicesByType: Array<{ type: string; count: number }>;
  sla: { met: number; breached: number; total: number; percentage: number };
  ticketStatuses: Array<{ status: MsspDemoTicketStatus; count: number }>;
  clientActivities: Array<{
    clientId: `DEMO-CLIENT-${string}`;
    timestamp: string;
    type: "Incident Updated" | "Ticket Updated" | "Service Health Event" | "SLA Event" | "Client Review Activity";
  }>;
  clientKpiHistory: Array<{
    date: string;
    totalClients: number;
    activeClients: number;
    atRiskClients: number;
    inactiveClients: number;
    slaPercent: number;
    averageRisk: number;
    newClients: number;
    openAlerts: number;
    openIncidents: number;
  }>;
  incidentKpiHistory: Array<{ date: string; openIncidents: number; mttrMinutes: number; needingAttention: number }>;
  serviceOfferings: MsspDemoServiceOffering[];
  serviceIssues: MsspDemoServiceIssue[];
  maintenanceWindows: MsspDemoMaintenanceWindow[];
  serviceHealthHistory: Array<{ date: string; scores: Array<{ serviceName: string; score: number }> }>;
  serviceKpiHistory: Array<{ date: string; totalServices: number; activeServices: number; serviceIssues: number; maintenanceWindows: number; slaPercent: number; slaBreached: number }>;
  reports: MsspDemoReport[];
  reportTemplates: Array<{ id: string; name: string; category: string }>;
  reportSchedules: MsspDemoReportSchedule[];
  reportHistory: Array<{ date: string; scheduled: number; onDemand: number; downloads: number; successRate: number }>;
}

export interface MsspOverviewData {
  scope: "All Integrated Security Telemetry";
  range: "7d";
  sourceMode: "REAL" | "DEMO" | "MIXED";
  telemetry: MsspSourceState<SocTelemetry>;
  incidents: MsspSourceState<{ count: number; lastVerifiedAt: string | null; stale: boolean; recent: SocIncidentRecord[] }>;
  iocs: MsspSourceState<{ count: number; records: TopIocDetection[] }>;
  demo: MsspDemoSourceState<MsspOverviewDemoData>;
}

export interface MsspAlertsData {
  scope: "All Integrated Security Telemetry";
  range: "7d";
  telemetry: MsspSourceState<SocTelemetry>;
  incidents: MsspSourceState<{
    count: number;
    lastVerifiedAt: string | null;
    stale: boolean;
    recent: SocIncidentRecord[];
  }>;
  demo: MsspDemoSourceState<MsspOverviewDemoData>;
}
