export interface CisoMetric {
  id: string;
  title: string;
  value: string | number;
  max?: number;
  changePct: number;
  trendText: string;
  trendColor: "blue" | "red" | "orange" | "purple" | "green" | "emerald" | "teal";
  sparklineColor: string;
  isPositiveGood?: boolean;
  icon: string;
  sparklineData: { value: number }[];
}

export interface SecurityPostureDomain {
  domain: string;
  score: number;
  fullMark: number;
  trend: string;
  isUp: boolean;
}

export interface IncidentKpiItem {
  id: string;
  label: string;
  fullName: string;
  value: string;
  changePct: number;
  isImprovement: boolean;
}

export interface VulnerabilitySlaItem {
  name: string;
  value: number;
  color: string;
  percentage: string;
}

export interface ThreatIntelligenceData {
  metrics: {
    label: string;
    value: number | string;
    change: string;
  }[];
  topSources: {
    source: string;
    count: number;
  }[];
}

export interface RiskRegisterItem {
  severity: "Critical" | "High" | "Medium" | "Low";
  count: number;
  color: string;
}

export interface TopRiskItem {
  id: string;
  threat: string;
  category: string;
  impact: "Critical" | "High" | "Medium";
  status: "Mitigating" | "Monitoring" | "Accepted";
  owner: string;
}

export interface ComplianceFrameworkItem {
  id: string;
  framework: string;
  version?: string;
  score: number;
  status: "Compliant" | "Partial";
  targetDate: string;
}

export interface ThirdPartyRiskData {
  summary: {
    totalVendors: number;
    highRiskVendors: number;
    assessmentOverdue: number;
    vendorIncidents: number;
  };
  tierDistribution: {
    tier: "High" | "Medium" | "Low";
    count: number;
    color: string;
  }[];
}

export interface AiCisoBriefingInsight {
  id: string;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
}

// ----------------------------------------------------
// DUMMY MOCK DATA
// ----------------------------------------------------

export const CISO_MOCK_METRICS: CisoMetric[] = [
  {
    id: "posture",
    title: "Security Posture Score",
    value: 78,
    max: 100,
    changePct: 6,
    trendText: "+6% vs last 30 days",
    trendColor: "blue",
    sparklineColor: "#3b82f6",
    isPositiveGood: true,
    icon: "🛡️",
    sparklineData: [
      { value: 68 },
      { value: 70 },
      { value: 72 },
      { value: 71 },
      { value: 75 },
      { value: 76 },
      { value: 78 },
    ],
  },
  {
    id: "risk",
    title: "Total Risk Score",
    value: 715,
    max: 1000,
    changePct: -8,
    trendText: "-8% vs last 30 days",
    trendColor: "emerald",
    sparklineColor: "#10b981",
    isPositiveGood: false,
    icon: "🚨",
    sparklineData: [
      { value: 780 },
      { value: 770 },
      { value: 760 },
      { value: 745 },
      { value: 730 },
      { value: 722 },
      { value: 715 },
    ],
  },
  {
    id: "incidents",
    title: "Active Incidents",
    value: 24,
    changePct: 20,
    trendText: "+20% vs last 30 days",
    trendColor: "orange",
    sparklineColor: "#f97316",
    isPositiveGood: false,
    icon: "⚠️",
    sparklineData: [
      { value: 16 },
      { value: 18 },
      { value: 17 },
      { value: 20 },
      { value: 22 },
      { value: 21 },
      { value: 24 },
    ],
  },
  {
    id: "vulnerabilities",
    title: "Critical Vulnerabilities",
    value: 312,
    changePct: 14,
    trendText: "+14% vs last 30 days",
    trendColor: "purple",
    sparklineColor: "#a855f7",
    isPositiveGood: false,
    icon: "👾",
    sparklineData: [
      { value: 260 },
      { value: 275 },
      { value: 280 },
      { value: 295 },
      { value: 290 },
      { value: 305 },
      { value: 312 },
    ],
  },
  {
    id: "compliance",
    title: "Compliance Score",
    value: "82%",
    changePct: 5,
    trendText: "+5% vs last 30 days",
    trendColor: "green",
    sparklineColor: "#22c55e",
    isPositiveGood: true,
    icon: "✅",
    sparklineData: [
      { value: 74 },
      { value: 75 },
      { value: 77 },
      { value: 78 },
      { value: 79 },
      { value: 80 },
      { value: 82 },
    ],
  },
  {
    id: "treatment",
    title: "Risk Treatment Progress",
    value: "64%",
    changePct: 7,
    trendText: "+7% vs last 30 days",
    trendColor: "teal",
    sparklineColor: "#14b8a6",
    isPositiveGood: true,
    icon: "📈",
    sparklineData: [
      { value: 52 },
      { value: 55 },
      { value: 57 },
      { value: 58 },
      { value: 60 },
      { value: 62 },
      { value: 64 },
    ],
  },
];

export const CISO_MOCK_POSTURE_DOMAINS: SecurityPostureDomain[] = [
  { domain: "Govern", score: 80, fullMark: 100, trend: "+4%", isUp: true },
  { domain: "Identify", score: 76, fullMark: 100, trend: "+3%", isUp: true },
  { domain: "Protect", score: 72, fullMark: 100, trend: "-1%", isUp: false },
  { domain: "Detect", score: 78, fullMark: 100, trend: "+6%", isUp: true },
  { domain: "Respond", score: 74, fullMark: 100, trend: "+2%", isUp: true },
  { domain: "Recover", score: 70, fullMark: 100, trend: "+1%", isUp: true },
];

export const CISO_MOCK_INCIDENT_KPI: IncidentKpiItem[] = [
  {
    id: "mttd",
    label: "MTTD",
    fullName: "Mean Time to Detect",
    value: "21m",
    changePct: -16,
    isImprovement: true,
  },
  {
    id: "mtta",
    label: "MTTA",
    fullName: "Mean Time to Acknowledge",
    value: "32m",
    changePct: -11,
    isImprovement: true,
  },
  {
    id: "mttr",
    label: "MTTR",
    fullName: "Mean Time to Respond",
    value: "4h 12m",
    changePct: -18,
    isImprovement: true,
  },
  {
    id: "mttc",
    label: "MTTC",
    fullName: "Mean Time to Contain",
    value: "2h 45m",
    changePct: 14,
    isImprovement: false,
  },
];

export const CISO_MOCK_VULN_SLA: VulnerabilitySlaItem[] = [
  { name: "Overdue", value: 104, color: "#ef4444", percentage: "33%" },
  { name: "Due Soon", value: 72, color: "#f97316", percentage: "23%" },
  { name: "In Progress", value: 96, color: "#eab308", percentage: "31%" },
  { name: "Compliant", value: 40, color: "#22c55e", percentage: "13%" },
];

export const CISO_MOCK_THREAT_INTEL: ThreatIntelligenceData = {
  metrics: [
    { label: "Malware Campaigns", value: 18, change: "+3" },
    { label: "Phishing Campaigns", value: 42, change: "+12" },
    { label: "Exposed Assets", value: 9, change: "-2" },
    { label: "IOC Newly Detected", value: "1,240", change: "+180" },
    { label: "Dark Web Mentions", value: 5, change: "+1" },
  ],
  topSources: [
    { source: "Botnet / C2", count: 480 },
    { source: "Phishing URLs", count: 350 },
    { source: "Ransomware Affiliates", count: 240 },
    { source: "Exploit Kits", count: 170 },
  ],
};

export const CISO_MOCK_RISK_REGISTER: RiskRegisterItem[] = [
  { severity: "Critical", count: 22, color: "#ef4444" },
  { severity: "High", count: 47, color: "#f97316" },
  { severity: "Medium", count: 38, color: "#eab308" },
  { severity: "Low", count: 19, color: "#22c55e" },
];

export const CISO_MOCK_TOP_RISKS: TopRiskItem[] = [
  {
    id: "RSK-01",
    threat: "Ransomware",
    category: "Malware / Extortion",
    impact: "Critical",
    status: "Mitigating",
    owner: "SecOps Team",
  },
  {
    id: "RSK-02",
    threat: "Data Breach",
    category: "Data Security",
    impact: "Critical",
    status: "Mitigating",
    owner: "Data Governance",
  },
  {
    id: "RSK-03",
    threat: "Phishing",
    category: "Social Engineering",
    impact: "High",
    status: "Monitoring",
    owner: "Awareness & IT",
  },
  {
    id: "RSK-04",
    threat: "Privilege Misuse",
    category: "Identity & Access",
    impact: "High",
    status: "Monitoring",
    owner: "IAM Team",
  },
  {
    id: "RSK-05",
    threat: "Third-Party Risk",
    category: "Supply Chain",
    impact: "Medium",
    status: "Accepted",
    owner: "Vendor Mgmt",
  },
];

export const CISO_MOCK_COMPLIANCE: ComplianceFrameworkItem[] = [
  {
    id: "iso27001",
    framework: "ISO 27001",
    version: "2022",
    score: 88,
    status: "Compliant",
    targetDate: "Q4 2026",
  },
  {
    id: "nistcsf",
    framework: "NIST CSF 2.0",
    version: "2.0",
    score: 78,
    status: "Partial",
    targetDate: "Q3 2026",
  },
  {
    id: "uupdp",
    framework: "UU PDP",
    version: "2022",
    score: 92,
    status: "Compliant",
    targetDate: "Compliant",
  },
  {
    id: "mitre",
    framework: "MITRE ATT&CK Coverage",
    score: 68,
    status: "Partial",
    targetDate: "Ongoing",
  },
  {
    id: "cis",
    framework: "CIS Controls",
    version: "v8",
    score: 84,
    status: "Compliant",
    targetDate: "Q4 2026",
  },
];

export const CISO_MOCK_THIRD_PARTY_RISK: ThirdPartyRiskData = {
  summary: {
    totalVendors: 142,
    highRiskVendors: 12,
    assessmentOverdue: 8,
    vendorIncidents: 2,
  },
  tierDistribution: [
    { tier: "High", count: 18, color: "#ef4444" },
    { tier: "Medium", count: 56, color: "#f97316" },
    { tier: "Low", count: 68, color: "#22c55e" },
  ],
};

export const CISO_MOCK_AI_BRIEFING: AiCisoBriefingInsight[] = [
  {
    id: "ai-1",
    title: "Security Posture Improvement",
    description: "Overall security posture improved by 6% over the past 30 days driven by NIST CSF Detect enhancement.",
    tag: "Posture",
    tagColor: "blue",
  },
  {
    id: "ai-2",
    title: "Ransomware Remains Top Risk",
    description: "External threat intelligence indicates elevated affiliate campaigns targeting supply chain vectors.",
    tag: "Top Threat",
    tagColor: "red",
  },
  {
    id: "ai-3",
    title: "Critical Vulnerabilities Attention",
    description: "104 critical vulnerabilities breached resolution SLAs; prioritizing perimeter assets is advised.",
    tag: "Action Needed",
    tagColor: "orange",
  },
  {
    id: "ai-4",
    title: "Compliance Score Progression",
    description: "Compliance score increased to 82% following audit readiness for UU PDP and ISO 27001.",
    tag: "Audit Ready",
    tagColor: "emerald",
  },
];
