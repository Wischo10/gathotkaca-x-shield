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

// ----------------------------------------------------
// SECURITY POSTURE DETAIL DATA
// ----------------------------------------------------

export interface SecurityPostureFinding {
  id: string;
  domain: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "In Review" | "Remediated";
  detectedAt: string;
  impactScore: number;
}

export interface SecurityPostureAction {
  id: string;
  title: string;
  domain: string;
  priority: "High" | "Medium" | "Low";
  estScoreImpact: string;
  effort: "Low" | "Medium" | "High";
  owner: string;
}

export const CISO_MOCK_POSTURE_TREND_30D = [
  { day: "Day 1", score: 68, benchmark: 70 },
  { day: "Day 5", score: 69, benchmark: 70 },
  { day: "Day 10", score: 71, benchmark: 71 },
  { day: "Day 15", score: 72, benchmark: 71 },
  { day: "Day 20", score: 75, benchmark: 72 },
  { day: "Day 25", score: 76, benchmark: 72 },
  { day: "Day 30", score: 78, benchmark: 73 },
];

export const CISO_MOCK_POSTURE_FINDINGS: SecurityPostureFinding[] = [
  {
    id: "FND-01",
    domain: "Protect",
    title: "Unenforced MFA on Legacy Administrative Endpoints",
    severity: "Critical",
    status: "Open",
    detectedAt: "2 days ago",
    impactScore: 9.2,
  },
  {
    id: "FND-02",
    domain: "Detect",
    title: "Log Ingestion Latency Exceeding Threshold in DMZ SIEM",
    severity: "High",
    status: "In Review",
    detectedAt: "4 days ago",
    impactScore: 7.8,
  },
  {
    id: "FND-03",
    domain: "Recover",
    title: "Disaster Recovery Backup Drill Validation Incomplete",
    severity: "High",
    status: "Open",
    detectedAt: "1 week ago",
    impactScore: 7.4,
  },
  {
    id: "FND-04",
    domain: "Identify",
    title: "Shadow IT Cloud Workloads Unmapped in Asset Inventory",
    severity: "Medium",
    status: "In Review",
    detectedAt: "2 weeks ago",
    impactScore: 5.6,
  },
  {
    id: "FND-05",
    domain: "Govern",
    title: "Annual Security Policy Exception Review Overdue",
    severity: "Low",
    status: "Remediated",
    detectedAt: "3 weeks ago",
    impactScore: 3.2,
  },
];

export const CISO_MOCK_POSTURE_ACTIONS: SecurityPostureAction[] = [
  {
    id: "ACT-01",
    title: "Implement Hardware MFA Enrolment for Tier-1 Admins",
    domain: "Protect",
    priority: "High",
    estScoreImpact: "+3.5 Pts",
    effort: "Medium",
    owner: "IAM Team",
  },
  {
    id: "ACT-02",
    title: "Scale SIEM Pipeline Buffer & Log Forwarders",
    domain: "Detect",
    priority: "High",
    estScoreImpact: "+2.0 Pts",
    effort: "Low",
    owner: "SecOps",
  },
  {
    id: "ACT-03",
    title: "Execute Tabletop Recovery Exercise for Core DBs",
    domain: "Recover",
    priority: "Medium",
    estScoreImpact: "+1.8 Pts",
    effort: "High",
    owner: "Infrastructure",
  },
  {
    id: "ACT-04",
    title: "Automate Cloud Discovery via CloudTrail/Asset API",
    domain: "Identify",
    priority: "Medium",
    estScoreImpact: "+1.2 Pts",
    effort: "Medium",
    owner: "Cloud Sec",
  },
];

// ----------------------------------------------------
// INCIDENT PERFORMANCE DETAIL DATA
// ----------------------------------------------------

export interface IncidentDetailItem {
  id: string;
  title: string;
  category: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Contained" | "Investigating" | "Resolved" | "Closed";
  mttd: string;
  mttr: string;
  owner: string;
  timestamp: string;
}

export interface IncidentRecommendationItem {
  id: string;
  title: string;
  impact: string;
  targetKpi: "MTTD" | "MTTA" | "MTTR" | "MTTC";
  status: "Planned" | "In Progress" | "Completed";
  description: string;
}

export const CISO_MOCK_INCIDENT_TREND_30D = [
  { day: "Day 1", incidents: 8, resolved: 7 },
  { day: "Day 5", incidents: 12, resolved: 10 },
  { day: "Day 10", incidents: 9, resolved: 9 },
  { day: "Day 15", incidents: 15, resolved: 13 },
  { day: "Day 20", incidents: 11, resolved: 12 },
  { day: "Day 25", incidents: 18, resolved: 16 },
  { day: "Day 30", incidents: 14, resolved: 15 },
];

export const CISO_MOCK_INCIDENT_SEVERITY_DIST = [
  { week: "Week 1", critical: 3, high: 8, medium: 14, low: 20 },
  { week: "Week 2", critical: 2, high: 11, medium: 16, low: 18 },
  { week: "Week 3", critical: 5, high: 9, medium: 12, low: 22 },
  { week: "Week 4", critical: 4, high: 7, medium: 15, low: 25 },
];

export const CISO_MOCK_INCIDENT_CATEGORIES = [
  { category: "Phishing / Social Eng", count: 42, color: "#3B82F6" },
  { category: "Malware & Ransomware", count: 28, color: "#EF4444" },
  { category: "Unauthorized Access", count: 19, color: "#F97316" },
  { category: "Cloud Misconfig", count: 14, color: "#EAB308" },
  { category: "DDoS / Volumetric", count: 8, color: "#8B5CF6" },
];

export const CISO_MOCK_RECENT_INCIDENTS: IncidentDetailItem[] = [
  {
    id: "INC-2026-089",
    title: "Cobalt Strike Beacon in DMZ Bastion Host",
    category: "Malware & Ransomware",
    severity: "Critical",
    status: "Contained",
    mttd: "14m",
    mttr: "2h 10m",
    owner: "Tier-2 SOC",
    timestamp: "3 hours ago",
  },
  {
    id: "INC-2026-088",
    title: "Mass Spear-Phishing Campaign Targeting Finance",
    category: "Phishing / Social Eng",
    severity: "High",
    status: "Resolved",
    mttd: "18m",
    mttr: "1h 45m",
    owner: "Email Sec",
    timestamp: "12 hours ago",
  },
  {
    id: "INC-2026-087",
    title: "Suspicious API Token Escalation in Kubernetes",
    category: "Unauthorized Access",
    severity: "Critical",
    status: "Investigating",
    mttd: "25m",
    mttr: "In Progress",
    owner: "Cloud Sec",
    timestamp: "1 day ago",
  },
  {
    id: "INC-2026-086",
    title: "S3 Bucket Public Read Policy Misconfiguration",
    category: "Cloud Misconfig",
    severity: "High",
    status: "Closed",
    mttd: "8m",
    mttr: "45m",
    owner: "DevSecOps",
    timestamp: "2 days ago",
  },
  {
    id: "INC-2026-085",
    title: "Brute Force Burst against VPN Gateway",
    category: "Unauthorized Access",
    severity: "Medium",
    status: "Closed",
    mttd: "12m",
    mttr: "35m",
    owner: "Network Sec",
    timestamp: "3 days ago",
  },
];

export const CISO_MOCK_INCIDENT_RECOMMENDATIONS: IncidentRecommendationItem[] = [
  {
    id: "REC-01",
    title: "SOAR Automated Containment for Endpoint Isolation",
    impact: "-45% MTTR on Host Malware",
    targetKpi: "MTTR",
    status: "In Progress",
    description: "Deploy automated playbook to sever network connectivity immediately upon EDR critical alert.",
  },
  {
    id: "REC-02",
    title: "Identity Threat Detection & Response (ITDR) Sensor",
    impact: "-30% MTTD on Privileged Abuse",
    targetKpi: "MTTD",
    status: "Planned",
    description: "Correlate Kerberos ticket anomalies and session hijacking in real-time.",
  },
  {
    id: "REC-03",
    title: "Tier-1 Alert Enrichment Playbooks",
    impact: "-20% MTTA across all queues",
    targetKpi: "MTTA",
    status: "Completed",
    description: "Pre-fetch WHOIS, VirusTotal, and active directory user context upon ticket generation.",
  },
];

// ----------------------------------------------------
// VULNERABILITY DETAIL DATA
// ----------------------------------------------------

export interface VulnerabilityCveItem {
  cve: string;
  title: string;
  asset: string;
  assetType: string;
  cvss: number;
  status: "Overdue" | "Due Soon" | "In Progress" | "Compliant";
  dueDate: string;
}

export interface VulnerabilityActionItem {
  id: string;
  title: string;
  priority: "Critical" | "High" | "Medium";
  impact: string;
  owner: string;
  description: string;
}

export const CISO_MOCK_VULN_SEVERITY_DIST = [
  { name: "Critical", value: 312, color: "#EF4444", percentage: "25%" },
  { name: "High", value: 428, color: "#F97316", percentage: "34%" },
  { name: "Medium", value: 356, color: "#EAB308", percentage: "29%" },
  { name: "Low", value: 152, color: "#22C55E", percentage: "12%" },
];

export const CISO_MOCK_VULN_SLA_WEEKLY = [
  { week: "Week 1", compliant: 45, inProgress: 90, dueSoon: 68, overdue: 110 },
  { week: "Week 2", compliant: 52, inProgress: 94, dueSoon: 70, overdue: 108 },
  { week: "Week 3", compliant: 48, inProgress: 98, dueSoon: 75, overdue: 106 },
  { week: "Week 4", compliant: 40, inProgress: 96, dueSoon: 72, overdue: 104 },
];

export const CISO_MOCK_VULN_ASSET_RISK = [
  { asset: "Domain Controller", count: 88, critical: 32, riskScore: 9.6 },
  { asset: "Database Cluster", count: 64, critical: 24, riskScore: 9.1 },
  { asset: "Mail Server", count: 52, critical: 18, riskScore: 8.4 },
  { asset: "Web Server (DMZ)", count: 46, critical: 15, riskScore: 7.9 },
  { asset: "Endpoint Fleet", count: 62, critical: 15, riskScore: 7.2 },
];

export const CISO_MOCK_TOP_CRITICAL_CVES: VulnerabilityCveItem[] = [
  {
    cve: "CVE-2025-1001",
    title: "Remote Code Execution in Active Directory Domain Service",
    asset: "DC-PRIMARY-01 (10.0.1.5)",
    assetType: "Domain Controller",
    cvss: 9.8,
    status: "Overdue",
    dueDate: "Yesterday",
  },
  {
    cve: "CVE-2025-2018",
    title: "Authentication Bypass in Core Edge Gateway",
    asset: "GW-EDGE-EXT (192.168.1.1)",
    assetType: "Web Server",
    cvss: 9.4,
    status: "Due Soon",
    dueDate: "In 2 days",
  },
  {
    cve: "CVE-2025-3309",
    title: "SQL Injection via Unsanitized Stored Procedures",
    asset: "DB-FIN-PROD-02 (10.0.4.12)",
    assetType: "Database",
    cvss: 8.9,
    status: "In Progress",
    dueDate: "In 5 days",
  },
  {
    cve: "CVE-2025-4112",
    title: "Privilege Escalation via Spooler Service Buffer Overflow",
    asset: "EXCH-MAIL-01 (10.0.2.20)",
    assetType: "Mail Server",
    cvss: 8.6,
    status: "Overdue",
    dueDate: "3 days ago",
  },
  {
    cve: "CVE-2025-5090",
    title: "Cross-Site Scripting (XSS) in Customer Portal Backend",
    asset: "APP-PORTAL-WEB (10.0.3.50)",
    assetType: "Web Server",
    cvss: 7.5,
    status: "Compliant",
    dueDate: "In 12 days",
  },
];

export const CISO_MOCK_VULN_REMEDIATION_TREND_30D = [
  { day: "Day 1", open: 340, remediated: 40, verified: 35 },
  { day: "Day 5", open: 335, remediated: 52, verified: 48 },
  { day: "Day 10", open: 330, remediated: 68, verified: 60 },
  { day: "Day 15", open: 325, remediated: 84, verified: 78 },
  { day: "Day 20", open: 320, remediated: 95, verified: 90 },
  { day: "Day 25", open: 315, remediated: 108, verified: 102 },
  { day: "Day 30", open: 312, remediated: 120, verified: 114 },
];

export const CISO_MOCK_VULN_ACTIONS: VulnerabilityActionItem[] = [
  {
    id: "VACT-01",
    title: "Prioritize Critical Patch Deployment for Domain Controllers",
    priority: "Critical",
    impact: "Resolves 32 Critical CVEs (CVSS 9.8)",
    owner: "Infrastructure Team",
    description: "Expedite emergency change window to deploy cumulative security patches onto DC-PRIMARY-01 and replicas.",
  },
  {
    id: "VACT-02",
    title: "Enforce Remediation of 104 Overdue Findings",
    priority: "High",
    impact: "+14% SLA Compliance Lift",
    owner: "DevSecOps & IT",
    description: "Issue escalation notices for all findings exceeding the 14-day SLA deadline across production services.",
  },
  {
    id: "VACT-03",
    title: "Harden Database Layer & Address High CVSS Injections",
    priority: "High",
    impact: "Mitigates Data Exfiltration Vector",
    owner: "Database Administration",
    description: "Audit ORM query sanitization and restrict public DB cluster listener endpoints.",
  },
];



