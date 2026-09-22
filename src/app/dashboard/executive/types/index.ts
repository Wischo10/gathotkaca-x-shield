export type RangeValue = "24h" | "7d" | "30d";

export interface ApiResponse<T> {
  status: "ok" | "error";
  data: T;
  message?: string;
}

export interface AlertsSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface TrendData {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface AttackMethod {
  name: string;
  value: number;
  color: string;
}

export interface TopVictim {
  name: string;
  count: number;
}

export interface TopRisk {
  domain: string;
  alertCount: number;
  score: number;
  level: 'critical' | 'high' | 'medium' | 'low';
}

export interface CasesStats {
  total_processed_manual: number;
  total_processed_auto: number;
  total_closed: number;
}

export interface MitreTactic {
  name: string;
  value: number;
}

export interface AgentHealthSummary {
  active: number;
  disconnected: number;
}

export interface AgentInfo {
  id: string;
  name: string;
  ip: string;
  os: string;
  status: 'active' | 'disconnected' | string;
}

export interface AgentHealth {
  summary: AgentHealthSummary;
  agents: AgentInfo[];
}

export interface BoardReport {
  quarter: string;
  securityScore: number;
  activeAgents: number;
  totalAgents: number;
  generatedAt: string;
  criticalAlerts: number;
  highAlerts: number;
  mediumAlerts: number;
  lowAlerts: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  totalVulnerabilities: number;
  topRisks?: { domain: string }[];
  highRiskDomains: number;
  compliancePct: number;
  totalComplianceEvents: number;
  topAttackMethod: string;
  attackMethods?: { count: number }[];
}

export interface Incident {
  creationTime: string;
  name: string;
  endpoint: string;
  status: string;
}
