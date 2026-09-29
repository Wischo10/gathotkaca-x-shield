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

export interface MsspOverviewDemoData {
  clients: MsspDemoClient[];
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
  ticketStatuses: Array<{ status: "Open" | "In Progress" | "Waiting for Client" | "Resolved" | "Closed"; count: number }>;
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
