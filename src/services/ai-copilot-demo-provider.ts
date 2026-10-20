/**
 * Centralized deterministic demo data provider for AI Cyber Security Copilot.
 * Note: Real data should be preferred where available in the project.
 * All demo metrics and records are completely deterministic (NO Math.random()).
 */

export interface SparklinePoint {
  day: string;
  value: number;
}

export interface AiKpiMetric {
  id: string;
  label: string;
  value: string;
  trendText: string;
  isTrendUp: boolean;
  trendPositive: boolean; // green vs red
  icon: string;
  sparkline: SparklinePoint[];
}

export interface AiSeveritySummaryItem {
  name: "Critical" | "High" | "Medium" | "Low";
  count: number;
  percentage: number;
  color: string;
}

export interface AiAlertCategoryItem {
  category: string;
  count: number;
  percentage: number;
}

export interface AiConfidenceTier {
  name: string;
  rangeLabel: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RecentAiAlertAnalysisItem {
  id: string;
  time: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  confidence: number;
  summary: string;
  targetAsset: string;
}

export interface AiRecommendationItem {
  id: string;
  title: string;
  explanation: string;
  priority: "High" | "Medium" | "Low";
  icon: string;
  category: string;
}

export interface SuggestedQuestion {
  id: string;
  query: string;
  category: string;
}

// =========================================================================
// IOC ANALYSIS DEMO DATA (Tab 3: Primary Specifications)
// =========================================================================

// 1. KPI ROW (6 Cards)
export const IOC_ANALYSIS_KPIS: AiKpiMetric[] = [
  {
    id: "total-iocs",
    label: "Total IOCs Analyzed",
    value: "8,942",
    trendText: "14% vs last week",
    isTrendUp: true,
    trendPositive: true,
    icon: "shield",
    sparkline: [
      { day: "Mon", value: 1120 },
      { day: "Tue", value: 1240 },
      { day: "Wed", value: 1310 },
      { day: "Thu", value: 1290 },
      { day: "Fri", value: 1380 },
      { day: "Sat", value: 1220 },
      { day: "Sun", value: 1382 },
    ],
  },
  {
    id: "malicious-iocs",
    label: "Malicious IOCs",
    value: "1,248",
    trendText: "8% vs last week",
    isTrendUp: true,
    trendPositive: false,
    icon: "zap",
    sparkline: [
      { day: "Mon", value: 160 },
      { day: "Tue", value: 185 },
      { day: "Wed", value: 195 },
      { day: "Thu", value: 170 },
      { day: "Fri", value: 210 },
      { day: "Sat", value: 155 },
      { day: "Sun", value: 173 },
    ],
  },
  {
    id: "benign-iocs",
    label: "Benign IOCs",
    value: "5,310",
    trendText: "12% vs last week",
    isTrendUp: true,
    trendPositive: true,
    icon: "sparkles",
    sparkline: [
      { day: "Mon", value: 710 },
      { day: "Tue", value: 740 },
      { day: "Wed", value: 780 },
      { day: "Thu", value: 760 },
      { day: "Fri", value: 810 },
      { day: "Sat", value: 730 },
      { day: "Sun", value: 780 },
    ],
  },
  {
    id: "suspicious-iocs",
    label: "Suspicious IOCs",
    value: "1,842",
    trendText: "5% vs last week",
    isTrendUp: true,
    trendPositive: false,
    icon: "document",
    sparkline: [
      { day: "Mon", value: 240 },
      { day: "Tue", value: 265 },
      { day: "Wed", value: 280 },
      { day: "Thu", value: 260 },
      { day: "Fri", value: 295 },
      { day: "Sat", value: 245 },
      { day: "Sun", value: 257 },
    ],
  },
  {
    id: "new-iocs",
    label: "New IOCs (This Week)",
    value: "486",
    trendText: "21% vs last week",
    isTrendUp: true,
    trendPositive: false,
    icon: "clock",
    sparkline: [
      { day: "Mon", value: 62 },
      { day: "Tue", value: 74 },
      { day: "Wed", value: 82 },
      { day: "Thu", value: 68 },
      { day: "Fri", value: 85 },
      { day: "Sat", value: 55 },
      { day: "Sun", value: 60 },
    ],
  },
  {
    id: "high-risk-iocs",
    label: "High Risk IOCs",
    value: "342",
    trendText: "3% vs last week",
    isTrendUp: false,
    trendPositive: true,
    icon: "shield",
    sparkline: [
      { day: "Mon", value: 58 },
      { day: "Tue", value: 54 },
      { day: "Wed", value: 52 },
      { day: "Thu", value: 48 },
      { day: "Fri", value: 46 },
      { day: "Sat", value: 43 },
      { day: "Sun", value: 41 },
    ],
  },
];

// 2. MAIN ROW: 3A - IOC Type Distribution (Donut)
export const IOC_TYPE_DISTRIBUTION = [
  { name: "IP Address", count: 3755, percentage: 42, color: "#3b82f6" },
  { name: "Domain", count: 2146, percentage: 24, color: "#8b5cf6" },
  { name: "URL", count: 1252, percentage: 14, color: "#06b6d4" },
  { name: "Hash", count: 984, percentage: 11, color: "#f59e0b" },
  { name: "Email", count: 447, percentage: 5, color: "#10b981" },
  { name: "File", count: 358, percentage: 4, color: "#ef4444" },
];
export const TOTAL_IOC_COUNT = 8942;

// 3. MAIN ROW: 3B - IOC Trend (This Week) (Line chart, series: Malicious, Benign, Suspicious, Unknown)
export const IOC_TREND_SERIES = [
  { day: "Mon", Malicious: 160, Benign: 710, Suspicious: 240, Unknown: 75 },
  { day: "Tue", Malicious: 185, Benign: 740, Suspicious: 265, Unknown: 82 },
  { day: "Wed", Malicious: 195, Benign: 780, Suspicious: 280, Unknown: 88 },
  { day: "Thu", Malicious: 170, Benign: 760, Suspicious: 260, Unknown: 70 },
  { day: "Fri", Malicious: 210, Benign: 810, Suspicious: 295, Unknown: 95 },
  { day: "Sat", Malicious: 155, Benign: 730, Suspicious: 245, Unknown: 65 },
  { day: "Sun", Malicious: 173, Benign: 780, Suspicious: 257, Unknown: 69 },
];

// 4. MAIN ROW: 3C - Top Malicious IOCs (Compact table)
export interface TopMaliciousIocItem {
  id: string;
  iocValue: string;
  type: "IP Address" | "Domain" | "URL" | "Hash";
  threatLevel: "Critical" | "High" | "Medium" | "Low";
  firstSeen: string;
  lastSeen: string;
  source: string;
}

export const TOP_MALICIOUS_IOCS: TopMaliciousIocItem[] = [
  {
    id: "ioc-1",
    iocValue: "194.26.29.112",
    type: "IP Address",
    threatLevel: "Critical",
    firstSeen: "May 13, 08:14",
    lastSeen: "10 mins ago",
    source: "AbuseIPDB (100%)",
  },
  {
    id: "ioc-2",
    iocValue: "auth-update-service.com",
    type: "Domain",
    threatLevel: "Critical",
    firstSeen: "May 14, 11:20",
    lastSeen: "25 mins ago",
    source: "Threat Intel Feed",
  },
  {
    id: "ioc-3",
    iocValue: "45.142.214.8",
    type: "IP Address",
    threatLevel: "High",
    firstSeen: "May 15, 04:30",
    lastSeen: "1 hour ago",
    source: "AlienVault OTX",
  },
  {
    id: "ioc-4",
    iocValue: "7a8b9c0d1e2f3a4b...",
    type: "Hash",
    threatLevel: "High",
    firstSeen: "May 16, 14:15",
    lastSeen: "3 hours ago",
    source: "VirusTotal (64/70)",
  },
  {
    id: "ioc-5",
    iocValue: "hxxp://malware-drop.ru/bin",
    type: "URL",
    threatLevel: "Medium",
    firstSeen: "May 17, 09:40",
    lastSeen: "5 hours ago",
    source: "Internal Threat DB",
  },
];

// 5. SECOND ROW: 4A - IOC Risk Level (Donut)
export const IOC_RISK_LEVEL_DISTRIBUTION = [
  { name: "Critical", count: 1248, percentage: 14, color: "#ef4444" },
  { name: "High", count: 2415, percentage: 27, color: "#f97316" },
  { name: "Medium", count: 3220, percentage: 36, color: "#eab308" },
  { name: "Low", count: 2059, percentage: 23, color: "#22c55e" },
];

// 6. SECOND ROW: 4B - Recent IOC Analysis (Compact Table)
export interface RecentIocAnalysisRecord {
  id: string;
  iocValue: string;
  type: string;
  verdict: "Malicious" | "Benign" | "Suspicious";
  riskLevel: "High" | "Medium" | "Low";
  confidence: number;
  analyzedAt: string;
  source: string;
}

export const RECENT_IOC_ANALYSES: RecentIocAnalysisRecord[] = [
  {
    id: "rec-1",
    iocValue: "185.220.101.5",
    type: "IP Address",
    verdict: "Malicious",
    riskLevel: "High",
    confidence: 96,
    analyzedAt: "10:14 AM",
    source: "AbuseIPDB",
  },
  {
    id: "rec-2",
    iocValue: "cdn-static-assets.net",
    type: "Domain",
    verdict: "Benign",
    riskLevel: "Low",
    confidence: 99,
    analyzedAt: "10:08 AM",
    source: "Threat Intel",
  },
  {
    id: "rec-3",
    iocValue: "194.26.29.112",
    type: "IP Address",
    verdict: "Malicious",
    riskLevel: "High",
    confidence: 98,
    analyzedAt: "09:54 AM",
    source: "AlienVault OTX",
  },
  {
    id: "rec-4",
    iocValue: "e3b0c44298fc1c14...",
    type: "Hash",
    verdict: "Suspicious",
    riskLevel: "Medium",
    confidence: 84,
    analyzedAt: "09:30 AM",
    source: "VirusTotal",
  },
  {
    id: "rec-5",
    iocValue: "login.portal-sec.xyz",
    type: "Domain",
    verdict: "Suspicious",
    riskLevel: "Medium",
    confidence: 89,
    analyzedAt: "09:12 AM",
    source: "Internal Threat DB",
  },
];

// 7. SECOND ROW: 4C - IOC Reputation Sources (Horizontal Progress Bars)
export const IOC_REPUTATION_SOURCES = [
  { source: "VirusTotal", count: 3412, percentage: 38, color: "#3b82f6" },
  { source: "AbuseIPDB", count: 2593, percentage: 29, color: "#8b5cf6" },
  { source: "Threat Intel", count: 1430, percentage: 16, color: "#10b981" },
  { source: "AlienVault OTX", count: 984, percentage: 11, color: "#f59e0b" },
  { source: "Internal Threat DB", count: 523, percentage: 6, color: "#06b6d4" },
];

// 8. THIRD ROW: 5A - Geographic Distribution (IP IOCs)
export const GEOGRAPHIC_IOC_DISTRIBUTION = [
  { countryCode: "US", countryName: "United States", count: 1420, intensity: "Very High" },
  { countryCode: "RU", countryName: "Russia", count: 980, intensity: "High" },
  { countryCode: "CN", countryName: "China", count: 840, intensity: "High" },
  { countryCode: "DE", countryName: "Germany", count: 420, intensity: "Medium" },
  { countryCode: "NL", countryName: "Netherlands", count: 390, intensity: "Medium" },
  { countryCode: "BR", countryName: "Brazil", count: 280, intensity: "Low" },
  { countryCode: "ID", countryName: "Indonesia", count: 190, intensity: "Low" },
  { countryCode: "IN", countryName: "India", count: 140, intensity: "Very Low" },
];

// 9. THIRD ROW: 5B - IOC Matching Summary
export const IOC_MATCHING_SUMMARY = {
  exactMatches: { count: 4892, percentage: 54.7, change: "+8.4%" },
  fuzzyMatches: { count: 2680, percentage: 30.0, change: "+4.1%" },
  noMatches: { count: 1370, percentage: 15.3, change: "-3.2%" },
  donutData: [
    { name: "Exact Matches", value: 4892, color: "#2563eb" },
    { name: "Fuzzy Matches", value: 2680, color: "#f59e0b" },
    { name: "No Matches", value: 1370, color: "#94a3b8" },
  ],
  total: 8942,
};

// 10. THIRD ROW: 5C - IOC Analysis Summary (This Week)
export const IOC_ANALYSIS_SUMMARY_STATS = {
  totalAnalyzed: 8942,
  newIdentified: 486,
  matchedThreatIntel: 3412,
  falsePositiveBenign: 5310,
  highRisk: 342,
  autoResolved: 724,
  maliciousConfidencePercent: 94.6,
};

// =========================================================================
// INCIDENT SUMMARIZATION DEMO DATA (Tab 2: Baseline)
// =========================================================================
export const INCIDENT_SUMMARIZATION_KPIS: AiKpiMetric[] = [
  {
    id: "inc-summarized",
    label: "Incidents Summarized",
    value: "148",
    trendText: "12% vs last week",
    isTrendUp: true,
    trendPositive: true,
    icon: "document",
    sparkline: [
      { day: "Mon", value: 16 },
      { day: "Tue", value: 22 },
      { day: "Wed", value: 19 },
      { day: "Thu", value: 25 },
      { day: "Fri", value: 28 },
      { day: "Sat", value: 18 },
      { day: "Sun", value: 20 },
    ],
  },
  {
    id: "avg-summary-time",
    label: "Avg. Summary Time",
    value: "1.4s",
    trendText: "0.3s faster",
    isTrendUp: true,
    trendPositive: true,
    icon: "zap",
    sparkline: [
      { day: "Mon", value: 2.1 },
      { day: "Tue", value: 1.8 },
      { day: "Wed", value: 1.6 },
      { day: "Thu", value: 1.5 },
      { day: "Fri", value: 1.4 },
      { day: "Sat", value: 1.4 },
      { day: "Sun", value: 1.35 },
    ],
  },
  {
    id: "ai-confidence-inc",
    label: "AI Confidence Avg.",
    value: "94.2%",
    trendText: "3.1% vs last week",
    isTrendUp: true,
    trendPositive: true,
    icon: "shield",
    sparkline: [
      { day: "Mon", value: 91 },
      { day: "Tue", value: 92 },
      { day: "Wed", value: 93 },
      { day: "Thu", value: 94 },
      { day: "Fri", value: 95 },
      { day: "Sat", value: 94 },
      { day: "Sun", value: 94.2 },
    ],
  },
  {
    id: "analyst-accepted",
    label: "Analyst Acceptance Rate",
    value: "96.8%",
    trendText: "2.4% vs last week",
    isTrendUp: true,
    trendPositive: true,
    icon: "sparkles",
    sparkline: [
      { day: "Mon", value: 92 },
      { day: "Tue", value: 94 },
      { day: "Wed", value: 95 },
      { day: "Thu", value: 96 },
      { day: "Fri", value: 97 },
      { day: "Sat", value: 96 },
      { day: "Sun", value: 96.8 },
    ],
  },
  {
    id: "triage-hours-saved",
    label: "Triage Time Saved",
    value: "54h 30m",
    trendText: "16% vs last week",
    isTrendUp: true,
    trendPositive: true,
    icon: "clock",
    sparkline: [
      { day: "Mon", value: 6.2 },
      { day: "Tue", value: 7.5 },
      { day: "Wed", value: 8.1 },
      { day: "Thu", value: 8.8 },
      { day: "Fri", value: 9.2 },
      { day: "Sat", value: 6.5 },
      { day: "Sun", value: 8.2 },
    ],
  },
];

export interface SummarizedIncidentItem {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  source: string;
  time: string;
  summary: string;
  summaryTimestamp: string;
  keyMetrics: {
    failedAttempts: number;
    attackDuration: string;
    sourceIP: string;
    successfulLogin: boolean;
  };
  keyTakeaways: string[];
  confidenceScore: number;
  recommendedActions: string[];
  timeline: Array<{
    id: string;
    time: string;
    description: string;
    source: string;
    isStart?: boolean;
    isEnd?: boolean;
  }>;
}

export const RECENT_SUMMARIZED_INCIDENTS: SummarizedIncidentItem[] = [
  {
    id: "INC-2025-0842",
    title: "Brute Force Attack on Authentication Service",
    severity: "Critical",
    source: "WAF & Auth Proxy Logs",
    time: "10 mins ago",
    summary:
      "Automated credential stuffing and dictionary attack observed targeting enterprise SSO gateway. 1,420 failed authentication attempts detected within 14 minutes originating from distributed IP addresses.",
    summaryTimestamp: "May 19, 2025 · 10:14 UTC",
    keyMetrics: {
      failedAttempts: 1420,
      attackDuration: "14m 22s",
      sourceIP: "194.26.29.112 (AS200017)",
      successfulLogin: false,
    },
    keyTakeaways: [
      "Attacker leveraged rotating User-Agent strings to mimic valid mobile clients.",
      "Zero successful logins recorded; adaptive rate limiting triggered on perimeter gateway.",
      "Identified 12 high-privilege usernames targeted in credential stuffing attempt.",
    ],
    confidenceScore: 96,
    recommendedActions: [
      "Block IP subnet 194.26.29.0/24 on Cloudflare edge WAF ruleset.",
      "Enforce mandatory step-up FIDO2 MFA on the 12 targeted administrative accounts.",
      "Review Auth0 rate-limiting thresholds for auth/login endpoint.",
    ],
    timeline: [
      {
        id: "tl-1",
        time: "10:00:14 UTC",
        description: "First automated password spray probe initiated against /api/v2/auth",
        source: "Edge WAF",
        isStart: true,
      },
      {
        id: "tl-2",
        time: "10:04:30 UTC",
        description: "Velocity threshold exceeded: 450 requests/min from single ASN",
        source: "Auth Proxy",
      },
      {
        id: "tl-3",
        time: "10:08:15 UTC",
        description: "Adaptive CAPTCHA challenge presented to suspicious sessions",
        source: "Identity Shield",
      },
      {
        id: "tl-4",
        time: "10:12:00 UTC",
        description: "Perimeter rate-limiting rule drops subsequent TCP handshakes",
        source: "Perimeter Firewall",
      },
      {
        id: "tl-5",
        time: "10:14:36 UTC",
        description: "Attack traffic subsided; zero compromised account sessions verified",
        source: "AI Investigation Engine",
        isEnd: true,
      },
    ],
  },
  {
    id: "INC-2025-0841",
    title: "Malware Dropper Execution Prevented",
    severity: "High",
    source: "Bitdefender EDR Telemetry",
    time: "42 mins ago",
    summary:
      "Trojan dropper payload detected inside temp folder of FIN-WS-44 following an email attachment unpack. Process tree terminated prior to persistence creation.",
    summaryTimestamp: "May 19, 2025 · 09:42 UTC",
    keyMetrics: {
      failedAttempts: 0,
      attackDuration: "2m 10s",
      sourceIP: "185.220.101.5",
      successfulLogin: false,
    },
    keyTakeaways: [
      "Executable attempted to spawn cmd.exe with obfuscated Base64 PowerShell.",
      "EDR agent quarantined file binary hash and severed endpoint network connections.",
      "No registry persistence keys were successfully written.",
    ],
    confidenceScore: 94,
    recommendedActions: [
      "Isolate endpoint FIN-WS-44 from local subnet for forensic image acquisition.",
      "Submit quarantined binary hash to sandbox sandbox-analyzer for full detonation report.",
      "Purge matching phishing email subject across corporate mailboxes via Exchange filter.",
    ],
    timeline: [
      {
        id: "tl-21",
        time: "09:40:02 UTC",
        description: "Invoice_Payment.iso extracted to user temp directory",
        source: "Endpoint Agent",
        isStart: true,
      },
      {
        id: "tl-22",
        time: "09:41:18 UTC",
        description: "Suspicious child process cmd.exe spawned by rundll32.exe",
        source: "Sysmon Telemetry",
      },
      {
        id: "tl-23",
        time: "09:42:12 UTC",
        description: "EDR heuristic behavioral block engaged; process tree terminated",
        source: "Bitdefender EDR",
        isEnd: true,
      },
    ],
  },
  {
    id: "INC-2025-0840",
    title: "SQL Injection Probe against Customer Portal",
    severity: "Medium",
    source: "ModSecurity WAF & Ingress",
    time: "2 hours ago",
    summary:
      "Automated vulnerability scanner triggered 86 signature violations on URL search parameters. Database parameters utilized prepared statements and threw standard 400 Bad Request.",
    summaryTimestamp: "May 19, 2025 · 08:15 UTC",
    keyMetrics: {
      failedAttempts: 86,
      attackDuration: "4m 50s",
      sourceIP: "45.142.214.8",
      successfulLogin: false,
    },
    keyTakeaways: [
      "Attacker sent UNION SELECT error-based injection payloads.",
      "Application database backend remained unimpacted due to ORM parameterized queries.",
      "Origin IP is a known bulletproof VPS hosting provider.",
    ],
    confidenceScore: 92,
    recommendedActions: [
      "Add source IP 45.142.214.8 to perimeter automated drop list.",
      "Verify Web Application Firewall OWASP Core Rule Set sensitivity level.",
    ],
    timeline: [
      {
        id: "tl-31",
        time: "08:10:05 UTC",
        description: "Initial SQL syntax test injection observed on /search?q=",
        source: "Ingress Controller",
        isStart: true,
      },
      {
        id: "tl-32",
        time: "08:14:55 UTC",
        description: "Scanner concluded probe after persistent HTTP 403 / 400 responses",
        source: "WAF Rule Engine",
        isEnd: true,
      },
    ],
  },
  {
    id: "INC-2025-0839",
    title: "Anomalous Lateral Access Attempt on Domain Controller",
    severity: "High",
    source: "Active Directory Event Logs",
    time: "4 hours ago",
    summary:
      "Unusual SMB session creation attempt on DC-PRIMARY from non-standard workstation IP using service account credentials outside maintenance window.",
    summaryTimestamp: "May 19, 2025 · 06:18 UTC",
    keyMetrics: {
      failedAttempts: 4,
      attackDuration: "18m 05s",
      sourceIP: "10.0.4.15",
      successfulLogin: false,
    },
    keyTakeaways: [
      "Service account svc_backup attempted interactive logon session on Domain Controller.",
      "Group policy properly rejected interactive session authorization.",
    ],
    confidenceScore: 89,
    recommendedActions: [
      "Rotate password for service account svc_backup immediately.",
      "Audit workstation 10.0.4.15 for credential cache extraction tools.",
    ],
    timeline: [
      {
        id: "tl-41",
        time: "06:00:22 UTC",
        description: "Kerberos TGS request for cifs/dc-primary.internal from workstation",
        source: "AD Security Log",
        isStart: true,
      },
      {
        id: "tl-42",
        time: "06:18:27 UTC",
        description: "Interactive session denied by GPO security rights",
        source: "Domain Controller",
        isEnd: true,
      },
    ],
  },
];

export const INCIDENT_CATEGORIES_SUMMARY = [
  { name: "Authentication / Brute Force", count: 58, percentage: 39, color: "#ef4444" },
  { name: "Malware / Dropper", count: 42, percentage: 28, color: "#f97316" },
  { name: "Web App Exploitation", count: 28, percentage: 19, color: "#eab308" },
  { name: "Lateral Movement", count: 20, percentage: 14, color: "#3b82f6" },
];

export const TOTAL_INCIDENTS_THIS_WEEK = 148;

export interface AnalystReviewItem {
  id: string;
  incidentId: string;
  confidence: number;
  analyst: string;
  reviewedAt: string;
  feedback: "Accurate" | "Adjusted" | "Approved";
  notes: string;
}

export const RECENT_ANALYST_REVIEWS: AnalystReviewItem[] = [
  {
    id: "REV-501",
    incidentId: "INC-2025-0842",
    confidence: 96,
    analyst: "A. Pratama",
    reviewedAt: "10:20 AM",
    feedback: "Approved",
    notes: "AI summary captured credential stuffing scope completely.",
  },
  {
    id: "REV-502",
    incidentId: "INC-2025-0841",
    confidence: 94,
    analyst: "R. Wijaya",
    reviewedAt: "09:55 AM",
    feedback: "Accurate",
    notes: "Verified remediation steps; host containment confirmed.",
  },
  {
    id: "REV-503",
    incidentId: "INC-2025-0840",
    confidence: 92,
    analyst: "S. Melinda",
    reviewedAt: "08:30 AM",
    feedback: "Approved",
    notes: "WAF blocked payload correctly, non-actionable incident.",
  },
  {
    id: "REV-504",
    incidentId: "INC-2025-0839",
    confidence: 89,
    analyst: "D. Kusuma",
    reviewedAt: "06:45 AM",
    feedback: "Adjusted",
    notes: "Added note about scheduled backup script failure.",
  },
];

// =========================================================================
// AI ALERT ANALYSIS DEMO DATA (Tab 1: Preserved)
// =========================================================================
export const AI_KPI_CARDS: AiKpiMetric[] = [
  {
    id: "ai-analyses",
    label: "AI Analyses (This Week)",
    value: "1,248",
    trendText: "24% vs last week",
    isTrendUp: true,
    trendPositive: true,
    icon: "sparkles",
    sparkline: [
      { day: "Mon", value: 140 },
      { day: "Tue", value: 165 },
      { day: "Wed", value: 190 },
      { day: "Thu", value: 175 },
      { day: "Fri", value: 210 },
      { day: "Sat", value: 160 },
      { day: "Sun", value: 208 },
    ],
  },
  {
    id: "alerts-analyzed",
    label: "Alerts Analyzed",
    value: "2,843",
    trendText: "18% vs last week",
    isTrendUp: true,
    trendPositive: true,
    icon: "document",
    sparkline: [
      { day: "Mon", value: 340 },
      { day: "Tue", value: 410 },
      { day: "Wed", value: 390 },
      { day: "Thu", value: 460 },
      { day: "Fri", value: 430 },
      { day: "Sat", value: 380 },
      { day: "Sun", value: 433 },
    ],
  },
  {
    id: "ai-accuracy",
    label: "AI Accuracy (Confidence)",
    value: "92%",
    trendText: "5% vs last week",
    isTrendUp: true,
    trendPositive: true,
    icon: "shield",
    sparkline: [
      { day: "Mon", value: 88 },
      { day: "Tue", value: 89 },
      { day: "Wed", value: 91 },
      { day: "Thu", value: 90 },
      { day: "Fri", value: 93 },
      { day: "Sat", value: 92 },
      { day: "Sun", value: 92 },
    ],
  },
  {
    id: "time-saved",
    label: "Time Saved by AI",
    value: "42h 18m",
    trendText: "22% vs last week",
    isTrendUp: true,
    trendPositive: true,
    icon: "clock",
    sparkline: [
      { day: "Mon", value: 4.5 },
      { day: "Tue", value: 5.8 },
      { day: "Wed", value: 6.2 },
      { day: "Thu", value: 7.1 },
      { day: "Fri", value: 6.5 },
      { day: "Sat", value: 5.2 },
      { day: "Sun", value: 6.88 },
    ],
  },
  {
    id: "automated-actions",
    label: "Automated Actions (Suggested)",
    value: "312",
    trendText: "12% vs last week",
    isTrendUp: true,
    trendPositive: true,
    icon: "zap",
    sparkline: [
      { day: "Mon", value: 35 },
      { day: "Tue", value: 42 },
      { day: "Wed", value: 48 },
      { day: "Thu", value: 45 },
      { day: "Fri", value: 54 },
      { day: "Sat", value: 38 },
      { day: "Sun", value: 50 },
    ],
  },
];

export const AI_SEVERITY_SUMMARY: AiSeveritySummaryItem[] = [
  { name: "Critical", count: 187, percentage: 15, color: "#ef4444" },
  { name: "High", count: 437, percentage: 35, color: "#f97316" },
  { name: "Medium", count: 499, percentage: 40, color: "#eab308" },
  { name: "Low", count: 125, percentage: 10, color: "#22c55e" },
];

export const TOTAL_ANALYSES_COUNT = 1248;

export const TOP_ALERT_CATEGORIES: AiAlertCategoryItem[] = [
  { category: "Brute Force / Login Attempt", count: 864, percentage: 30 },
  { category: "Malware / Ransomware", count: 582, percentage: 20 },
  { category: "Web Application Attack", count: 440, percentage: 15 },
  { category: "Data Exfiltration", count: 326, percentage: 11 },
  { category: "Privilege Escalation", count: 265, percentage: 9 },
  { category: "Phishing", count: 198, percentage: 7 },
  { category: "Suspicious Activity", count: 114, percentage: 5 },
  { category: "Others", count: 54, percentage: 3 },
];

export const AI_CONFIDENCE_DISTRIBUTION: AiConfidenceTier[] = [
  { name: "High", rangeLabel: "80–100%", count: 924, percentage: 74, color: "#22c55e" },
  { name: "Medium", rangeLabel: "50–79%", count: 262, percentage: 21, color: "#f59e0b" },
  { name: "Low", rangeLabel: "0–49%", count: 62, percentage: 5, color: "#ef4444" },
];

export const AVERAGE_CONFIDENCE_PERCENT = 89;

export const RECENT_AI_ALERT_ANALYSES: RecentAiAlertAnalysisItem[] = [
  {
    id: "ANL-9401",
    time: "10:14 AM",
    title: "Brute Force Login Detected",
    severity: "Critical",
    confidence: 96,
    summary: "Repeated failed SSH handshakes from 194.26.29.112 across perimeter bastion hosts.",
    targetAsset: "BASTION-01",
  },
  {
    id: "ANL-9402",
    time: "09:48 AM",
    title: "Malware Execution Blocked",
    severity: "High",
    confidence: 92,
    summary: "Known trojan dropper prevented in user downloads directory; hash matched active campaign.",
    targetAsset: "FIN-WS-44",
  },
  {
    id: "ANL-9403",
    time: "09:12 AM",
    title: "Suspicious PowerShell Activity",
    severity: "High",
    confidence: 88,
    summary: "Encoded command execution attempting credential harvesting via Invoke-Mimikatz alias.",
    targetAsset: "HR-SRV-02",
  },
  {
    id: "ANL-9404",
    time: "08:35 AM",
    title: "Web Application Attack",
    severity: "Medium",
    confidence: 84,
    summary: "SQL Injection payload identified in HTTP POST parameter for billing lookup API.",
    targetAsset: "WAF-GATEWAY-1",
  },
  {
    id: "ANL-9405",
    time: "07:50 AM",
    title: "Data Exfiltration Attempt",
    severity: "Critical",
    confidence: 94,
    summary: "Anomalous 4.2GB outbound encrypted transmission to unclassified external destination.",
    targetAsset: "DB-CLUSTER-PRIMARY",
  },
];

export const AI_RECOMMENDED_NEXT_STEPS: AiRecommendationItem[] = [
  {
    id: "REC-101",
    title: "Isolate affected host",
    explanation: "Recommend network containment on FIN-WS-44 to isolate active dropper payload.",
    priority: "High",
    icon: "shield-alert",
    category: "Containment",
  },
  {
    id: "REC-102",
    title: "Investigate suspicious IP",
    explanation: "Review reputation and correlate lateral flows for 194.26.29.112 across egress logs.",
    priority: "High",
    icon: "search",
    category: "Investigation",
  },
  {
    id: "REC-103",
    title: "Review firewall rule",
    explanation: "Review edge ACL-402 on perimeter router to drop unauthenticated port 22 probes.",
    priority: "Medium",
    icon: "sliders",
    category: "Hardening",
  },
  {
    id: "REC-104",
    title: "Collect endpoint logs",
    explanation: "Trigger Sysmon process creation and PowerShell transcript gathering on HR-SRV-02.",
    priority: "Low",
    icon: "archive",
    category: "Forensics",
  },
];

export const SUGGESTED_ASSISTANT_QUESTIONS: SuggestedQuestion[] = [
  {
    id: "q1",
    query: "What are the top critical alerts today?",
    category: "Triage",
  },
  {
    id: "q2",
    query: "Summarize incident CASE-2025-0842",
    category: "Incident",
  },
  {
    id: "q3",
    query: "Show me related IOCs for this alert",
    category: "Intelligence",
  },
  {
    id: "q4",
    query: "Which assets are most at risk right now?",
    category: "Risk",
  },
];

export const DEMO_ASSISTANT_CONVERSATION: Array<{
  id: string;
  sender: "assistant" | "user";
  message: string;
  timestamp: string;
}> = [
  {
    id: "msg-1",
    sender: "assistant",
    message:
      "Hello! I am your AI Cyber Security Copilot. I can assist with triage, IOC correlation, incident summarization, and recommended mitigation actions.",
    timestamp: "10:00 AM",
  },
];

export const DETERMINISTIC_QUERY_RESPONSES: Record<string, string> = {
  "What are the top critical alerts today?":
    "Top critical alerts today include: 1) Brute Force SSH sweep on BASTION-01 from 194.26.29.112 (96% confidence), and 2) Data Exfiltration Attempt (4.2GB outbound spike) on DB-CLUSTER-PRIMARY (94% confidence). Recommended containment is ready for review.",
  "Summarize incident CASE-2025-0842":
    "Summary for CASE-2025-0842: Credential stuffing attack on authentication service originating from 194.26.29.112 with 1,420 failed requests. Zero compromised accounts confirmed.",
  "Show me related IOCs for this alert":
    "Related IOCs found: IP 194.26.29.112 (Abuse Score: 100%, ASN: AS200017), MD5 7a8b9c... (Trojan.Win64.Agent), Domain update-sync-service[.]com (registered 4 days ago).",
  "Which assets are most at risk right now?":
    "Highest risk assets right now: 1) DB-CLUSTER-PRIMARY (critical data tier with active egress alert), 2) BASTION-01 (perimeter host under brute force), and 3) FIN-WS-44 (endpoint with blocked executable).",
};

// =========================================================================
// INVESTIGATION ASSISTANT DEMO DATA (Tab 4: Primary Specifications)
// =========================================================================

// 1. KPI ROW (5 Cards)
export const INVESTIGATION_ASSISTANT_KPIS: AiKpiMetric[] = [
  {
    id: "inv-this-week",
    label: "Investigations (This Week)",
    value: "42",
    trendText: "+12% vs last week",
    isTrendUp: true,
    trendPositive: true,
    icon: "shield",
    sparkline: [
      { day: "Mon", value: 28 },
      { day: "Tue", value: 32 },
      { day: "Wed", value: 37 },
      { day: "Thu", value: 35 },
      { day: "Fri", value: 40 },
      { day: "Sat", value: 38 },
      { day: "Sun", value: 42 },
    ],
  },
  {
    id: "inv-open",
    label: "Open Investigations",
    value: "14",
    trendText: "3 new today",
    isTrendUp: true,
    trendPositive: false,
    icon: "zap",
    sparkline: [
      { day: "Mon", value: 18 },
      { day: "Tue", value: 16 },
      { day: "Wed", value: 19 },
      { day: "Thu", value: 15 },
      { day: "Fri", value: 17 },
      { day: "Sat", value: 13 },
      { day: "Sun", value: 14 },
    ],
  },
  {
    id: "inv-resolved",
    label: "Investigations Resolved",
    value: "28",
    trendText: "+18% resolution pace",
    isTrendUp: true,
    trendPositive: true,
    icon: "document",
    sparkline: [
      { day: "Mon", value: 10 },
      { day: "Tue", value: 16 },
      { day: "Wed", value: 18 },
      { day: "Thu", value: 20 },
      { day: "Fri", value: 23 },
      { day: "Sat", value: 25 },
      { day: "Sun", value: 28 },
    ],
  },
  {
    id: "inv-avg-time",
    label: "Avg. Investigation Time",
    value: "38m",
    trendText: "-14m faster with AI",
    isTrendUp: false,
    trendPositive: true,
    icon: "clock",
    sparkline: [
      { day: "Mon", value: 52 },
      { day: "Tue", value: 48 },
      { day: "Wed", value: 44 },
      { day: "Thu", value: 41 },
      { day: "Fri", value: 39 },
      { day: "Sat", value: 38 },
      { day: "Sun", value: 38 },
    ],
  },
  {
    id: "inv-escalated",
    label: "Escalated to Analyst",
    value: "6",
    trendText: "14.2% of total",
    isTrendUp: false,
    trendPositive: true,
    icon: "sparkles",
    sparkline: [
      { day: "Mon", value: 9 },
      { day: "Tue", value: 8 },
      { day: "Wed", value: 7 },
      { day: "Thu", value: 8 },
      { day: "Fri", value: 6 },
      { day: "Sat", value: 6 },
      { day: "Sun", value: 6 },
    ],
  },
];

// 2. ACTIVE INVESTIGATIONS LIST ITEM
export interface ActiveInvestigationItem {
  id: string;
  incidentId: string;
  title: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "In Progress" | "Open" | "Pending" | "Escalated" | "Resolved";
  assignedTo: string;
  age: string;
  // Details for Investigation Assistant card binding
  summary: string;
  keyEntities: {
    sourceIp: string;
    targetAccount: string;
    targetSystem: string;
    firstSeen: string;
    lastSeen: string;
  };
  suggestedNextSteps: string[];
}

export const ACTIVE_INVESTIGATIONS_LIST: ActiveInvestigationItem[] = [
  {
    id: "INV-2025-0101",
    incidentId: "INC-9482",
    title: "Brute Force Login Attempts",
    priority: "Critical",
    status: "In Progress",
    assignedTo: "Sarah Jenkins (SOC L2)",
    age: "18m ago",
    summary:
      "Multiple failed authentication attempts detected originating from a known bulletproof hosting ASN, targeting privileged administrative endpoints. Behavioral patterns indicate distributed dictionary spraying.",
    keyEntities: {
      sourceIp: "194.26.29.112",
      targetAccount: "admin.svc@corp.internal",
      targetSystem: "AUTH-GW-01.prod",
      firstSeen: "May 19, 08:14 UTC",
      lastSeen: "2 mins ago",
    },
    suggestedNextSteps: [
      "Review edge firewall ACL to verify ingress drop from 194.26.29.112",
      "Review VPN access logs for suspicious concurrent sessions",
      "Recommend immediate password reset & session revocation for target account",
      "Monitor repeated authentication attempts from related AS200017 subnet",
    ],
  },
  {
    id: "INV-2025-0102",
    incidentId: "INC-9480",
    title: "Malware Execution Detected",
    priority: "Critical",
    status: "Escalated",
    assignedTo: "David Kim (Lead Analyst)",
    age: "45m ago",
    summary:
      "Suspicious PowerShell child process spawned by winword.exe with obfuscated base64 payload. Attempted persistence via Scheduled Task creation before EDR isolation hook engaged.",
    keyEntities: {
      sourceIp: "10.14.32.88",
      targetAccount: "j.doe@finance.corp",
      targetSystem: "FIN-WS-082.corp",
      firstSeen: "May 19, 07:42 UTC",
      lastSeen: "12 mins ago",
    },
    suggestedNextSteps: [
      "Investigate process memory tree on isolated endpoint FIN-WS-082",
      "Review email gateway logs for inbound phishing payload source",
      "Recommend hash block for 7a8b9c0d1e2f3a4b across endpoint fleet",
      "Monitor Active Directory replication logs for privileged service ticket requests",
    ],
  },
  {
    id: "INV-2025-0103",
    incidentId: "INC-9477",
    title: "Phishing Email Reported",
    priority: "High",
    status: "In Progress",
    assignedTo: "Elena Rostova (SOC L1)",
    age: "1h 10m ago",
    summary:
      "Multiple users reported an urgent invoice notification linking to a typo-squatted credential capture page. Email passed SPF/DKIM due to compromised third-party vendor relay.",
    keyEntities: {
      sourceIp: "185.220.101.5",
      targetAccount: "procurement@corp.internal",
      targetSystem: "M365 Mail Gateway",
      firstSeen: "May 19, 07:15 UTC",
      lastSeen: "35 mins ago",
    },
    suggestedNextSteps: [
      "Purge matching phishing message ID across all tenant mailboxes",
      "Add malicious domain invoice-portal-update[.]com to DNS sinkhole",
      "Investigate 3 recipients who clicked the embedded hyperlink",
      "Recommend triggering security awareness refresher for affected department",
    ],
  },
  {
    id: "INV-2025-0104",
    incidentId: "INC-9471",
    title: "Web Application Attack",
    priority: "High",
    status: "Pending",
    assignedTo: "Automated AI Agent",
    age: "2h 05m ago",
    summary:
      "Repetitive SQL injection and path traversal payloads detected by WAF against public API gateway endpoint. Payload signatures match known CVE-2023-38606 automated scanners.",
    keyEntities: {
      sourceIp: "45.142.214.8",
      targetAccount: "api-public-anon",
      targetSystem: "API-EDGE-CLUSTER",
      firstSeen: "May 19, 06:18 UTC",
      lastSeen: "42 mins ago",
    },
    suggestedNextSteps: [
      "Review WAF custom rule triggers for bypass telemetry",
      "Investigate backend API database query latency metrics during spike",
      "Recommend temporary rate-limiting on /v2/auth endpoints for /24 CIDR",
      "Monitor application logs for 500 error code responses",
    ],
  },
  {
    id: "INV-2025-0105",
    incidentId: "INC-9466",
    title: "Data Exfiltration Attempt",
    priority: "Medium",
    status: "Open",
    assignedTo: "Marcus Chen (Threat Hunter)",
    age: "3h 20m ago",
    summary:
      "Unusual volume of compressed archive files staged in temporary user profile directory, followed by elevated encrypted outbound traffic to external cloud storage provider.",
    keyEntities: {
      sourceIp: "10.8.12.44",
      targetAccount: "b.miller@rnd.corp",
      targetSystem: "ENG-STATION-19",
      firstSeen: "May 19, 05:02 UTC",
      lastSeen: "1h 15m ago",
    },
    suggestedNextSteps: [
      "Review DLP gateway outbound byte volume matched against user baseline",
      "Inspect file hashes in user Temp/Staging directory on host",
      "Recommend temporarily restricting external storage upload access",
      "Investigate user's active file access log history across code repositories",
    ],
  },
];

// 3. INVESTIGATION PROGRESS OVERVIEW (Donut Breakdown)
export interface InvestigationStatusBreakdown {
  name: "Not Started" | "In Progress" | "Pending" | "Escalated" | "Resolved";
  count: number;
  percentage: number;
  color: string;
}

export const INVESTIGATION_STATUS_OVERVIEW: InvestigationStatusBreakdown[] = [
  { name: "In Progress", count: 18, percentage: 43, color: "#3b82f6" }, // blue
  { name: "Resolved", count: 14, percentage: 33, color: "#10b981" }, // emerald
  { name: "Escalated", count: 4, percentage: 10, color: "#ef4444" }, // red
  { name: "Pending", count: 3, percentage: 7, color: "#f59e0b" }, // amber
  { name: "Not Started", count: 3, percentage: 7, color: "#94a3b8" }, // slate
];

export const TOTAL_INVESTIGATIONS_COUNT = 42;

// 4. INVESTIGATION TIMELINE (Vertical timeline)
export interface InvestigationTimelineEvent {
  id: string;
  timestamp: string;
  date: string;
  incidentId: string;
  description: string;
  severity: "Critical" | "High" | "Medium" | "Low";
}

export const INVESTIGATION_TIMELINE_EVENTS: InvestigationTimelineEvent[] = [
  {
    id: "EVT-801",
    timestamp: "09:12:44",
    date: "Today, May 19",
    incidentId: "INC-9482",
    description: "Account locked automatically following policy violation",
    severity: "Critical",
  },
  {
    id: "EVT-802",
    timestamp: "09:08:15",
    date: "Today, May 19",
    incidentId: "INC-9482",
    description: "Multiple failed attempts threshold exceeded (>50 attempts/min)",
    severity: "Critical",
  },
  {
    id: "EVT-803",
    timestamp: "08:52:10",
    date: "Today, May 19",
    incidentId: "INC-9480",
    description: "EDR telemetry correlated malicious script block on FIN-WS-082",
    severity: "High",
  },
  {
    id: "EVT-804",
    timestamp: "08:34:02",
    date: "Today, May 19",
    incidentId: "INC-9477",
    description: "Phishing alert generated via user submission plugin",
    severity: "Medium",
  },
  {
    id: "EVT-805",
    timestamp: "08:15:30",
    date: "Today, May 19",
    incidentId: "INC-9482",
    description: "Initial brute force login attempt detected on perimeter gateway",
    severity: "High",
  },
];

// 5. MITRE ATT&CK TACTICS (Active Investigations)
export interface MitreTacticItem {
  tactic: string;
  count: number;
  percentage: number;
}

export const MITRE_ATTACK_TACTICS_ACTIVE: MitreTacticItem[] = [
  { tactic: "Initial Access", count: 18, percentage: 28 },
  { tactic: "Execution", count: 14, percentage: 22 },
  { tactic: "Credential Access", count: 12, percentage: 19 },
  { tactic: "Defense Evasion", count: 8, percentage: 12 },
  { tactic: "Persistence", count: 5, percentage: 8 },
  { tactic: "Exfiltration", count: 4, percentage: 6 },
  { tactic: "Discovery", count: 3, percentage: 5 },
];

// 6. TOP INVESTIGATION TAGS (Tag / Word cloud visualization)
export interface InvestigationTagItem {
  tag: string;
  count: number;
  weight: "xl" | "lg" | "md" | "sm";
  colorClass: string;
}

export const TOP_INVESTIGATION_TAGS: InvestigationTagItem[] = [
  { tag: "Brute Force", count: 28, weight: "xl", colorClass: "text-red-600 dark:text-red-400 font-extrabold" },
  { tag: "Malware", count: 22, weight: "xl", colorClass: "text-orange-600 dark:text-orange-400 font-bold" },
  { tag: "Initial Access", count: 18, weight: "lg", colorClass: "text-blue-600 dark:text-blue-400 font-bold" },
  { tag: "Credential Abuse", count: 16, weight: "lg", colorClass: "text-purple-600 dark:text-purple-400 font-semibold" },
  { tag: "Phishing", count: 15, weight: "lg", colorClass: "text-indigo-600 dark:text-indigo-400 font-semibold" },
  { tag: "Defense Evasion", count: 12, weight: "md", colorClass: "text-amber-600 dark:text-amber-400 font-medium" },
  { tag: "Data Exfiltration", count: 9, weight: "md", colorClass: "text-rose-600 dark:text-rose-400 font-medium" },
  { tag: "Lateral Movement", count: 7, weight: "sm", colorClass: "text-slate-600 dark:text-slate-300 font-normal" },
  { tag: "Lateral Escalation", count: 5, weight: "sm", colorClass: "text-slate-500 dark:text-slate-400 font-normal" },
  { tag: "Password Spray", count: 8, weight: "md", colorClass: "text-cyan-600 dark:text-cyan-400 font-medium" },
  { tag: "Command & Control", count: 6, weight: "sm", colorClass: "text-emerald-600 dark:text-emerald-400 font-normal" },
];

// 7. RECENTLY RESOLVED INVESTIGATIONS (Full width bottom table)
export interface ResolvedInvestigationRecord {
  id: string;
  incidentId: string;
  title: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Resolved";
  resolvedBy: string;
  resolvedAt: string;
  resolutionTime: string;
  summary: string;
}

export const RECENTLY_RESOLVED_INVESTIGATIONS: ResolvedInvestigationRecord[] = [
  {
    id: "INV-2025-0098",
    incidentId: "INC-9452",
    title: "Suspicious Kerberoasting Activity",
    priority: "High",
    status: "Resolved",
    resolvedBy: "Sarah Jenkins (SOC L2)",
    resolvedAt: "May 18, 17:45",
    resolutionTime: "24m",
    summary: "SPN query spikes contained via automated domain controller group isolation.",
  },
  {
    id: "INV-2025-0095",
    incidentId: "INC-9448",
    title: "Cobalt Strike Beacon Simulation",
    priority: "Critical",
    status: "Resolved",
    resolvedBy: "David Kim (Lead Analyst)",
    resolvedAt: "May 18, 14:20",
    resolutionTime: "18m",
    summary: "Authorized Red Team simulation validated and confirmed against drill schedule.",
  },
  {
    id: "INV-2025-0091",
    incidentId: "INC-9439",
    title: "Ransomware Canary File Modification",
    priority: "Critical",
    status: "Resolved",
    resolvedBy: "Automated EDR Playbook",
    resolvedAt: "May 18, 11:05",
    resolutionTime: "12m",
    summary: "Canary trap triggered, rogue encryption utility immediately terminated and host quarantined.",
  },
  {
    id: "INV-2025-0089",
    incidentId: "INC-9431",
    title: "Privilege Escalation via CVE-2024-21413",
    priority: "High",
    status: "Resolved",
    resolvedBy: "Marcus Chen (Threat Hunter)",
    resolvedAt: "May 17, 19:30",
    resolutionTime: "42m",
    summary: "Outlook preview bypass payload patched and verified on all client workstations.",
  },
  {
    id: "INV-2025-0084",
    incidentId: "INC-9420",
    title: "Suspicious Outbound DNS Tunneling",
    priority: "Medium",
    status: "Resolved",
    resolvedBy: "Elena Rostova (SOC L1)",
    resolvedAt: "May 17, 15:10",
    resolutionTime: "31m",
    summary: "Misconfigured telemetry service on DEV-SRV-04 corrected to legitimate internal DNS server.",
  },
];

// =========================================================================
// RECOMMENDATION WORKSPACE DATA (Tab 5: Primary Specifications)
// =========================================================================

// 1. TOP KPI CARDS (6 Cards in 1 Row)
export const RECOMMENDATION_TAB_KPIS: AiKpiMetric[] = [
  {
    id: "rec-total-156",
    label: "Total Recommendations",
    value: "156",
    trendText: "+8% vs last 7 days",
    isTrendUp: true,
    trendPositive: true,
    icon: "sparkles",
    sparkline: [
      { day: "Mon", value: 140 },
      { day: "Tue", value: 144 },
      { day: "Wed", value: 148 },
      { day: "Thu", value: 150 },
      { day: "Fri", value: 152 },
      { day: "Sat", value: 154 },
      { day: "Sun", value: 156 },
    ],
  },
  {
    id: "rec-high-priority-48",
    label: "High Priority",
    value: "48 (31%)",
    trendText: "+3 vs last 7 days",
    isTrendUp: true,
    trendPositive: false,
    icon: "shield",
    sparkline: [
      { day: "Mon", value: 42 },
      { day: "Tue", value: 45 },
      { day: "Wed", value: 44 },
      { day: "Thu", value: 46 },
      { day: "Fri", value: 49 },
      { day: "Sat", value: 47 },
      { day: "Sun", value: 48 },
    ],
  },
  {
    id: "rec-implemented-62",
    label: "Implemented",
    value: "62 (40%)",
    trendText: "+14% vs last 7 days",
    isTrendUp: true,
    trendPositive: true,
    icon: "document",
    sparkline: [
      { day: "Mon", value: 48 },
      { day: "Tue", value: 50 },
      { day: "Wed", value: 53 },
      { day: "Thu", value: 56 },
      { day: "Fri", value: 59 },
      { day: "Sat", value: 60 },
      { day: "Sun", value: 62 },
    ],
  },
  {
    id: "rec-in-progress-54",
    label: "In Progress",
    value: "54 (35%)",
    trendText: "-2 vs last 7 days",
    isTrendUp: false,
    trendPositive: true,
    icon: "clock",
    sparkline: [
      { day: "Mon", value: 58 },
      { day: "Tue", value: 57 },
      { day: "Wed", value: 56 },
      { day: "Thu", value: 55 },
      { day: "Fri", value: 53 },
      { day: "Sat", value: 55 },
      { day: "Sun", value: 54 },
    ],
  },
  {
    id: "rec-overdue-12",
    label: "Overdue",
    value: "12 (8%)",
    trendText: "-4 vs last 7 days",
    isTrendUp: false,
    trendPositive: true,
    icon: "zap",
    sparkline: [
      { day: "Mon", value: 18 },
      { day: "Tue", value: 16 },
      { day: "Wed", value: 15 },
      { day: "Thu", value: 14 },
      { day: "Fri", value: 13 },
      { day: "Sat", value: 12 },
      { day: "Sun", value: 12 },
    ],
  },
  {
    id: "rec-effectiveness-87",
    label: "Effectiveness Score",
    value: "87%",
    trendText: "+5% vs last 7 days",
    isTrendUp: true,
    trendPositive: true,
    icon: "sparkles",
    sparkline: [
      { day: "Mon", value: 81 },
      { day: "Tue", value: 82 },
      { day: "Wed", value: 84 },
      { day: "Thu", value: 85 },
      { day: "Fri", value: 86 },
      { day: "Sat", value: 86 },
      { day: "Sun", value: 87 },
    ],
  },
];

// 2. ROW 1: CARD 1 - TOP RECOMMENDED ACTIONS TABLE
export interface TopRecommendedActionItem {
  id: string;
  recommendation: string;
  category: "Threat Prevention" | "Identity Security" | "Access Control" | "Vulnerability Mgmt" | "Account Security";
  priority: "Critical" | "High" | "Medium";
  impact: "High" | "Medium";
  status: "In Progress" | "Implemented";
}

export const TOP_RECOMMENDED_ACTIONS: TopRecommendedActionItem[] = [
  {
    id: "ACT-01",
    recommendation: "Block IP 185.220.101.2 at firewall and WAF",
    category: "Threat Prevention",
    priority: "Critical",
    impact: "High",
    status: "In Progress",
  },
  {
    id: "ACT-02",
    recommendation: "Enforce MFA for VPN and privileged accounts",
    category: "Identity Security",
    priority: "Critical",
    impact: "High",
    status: "Implemented",
  },
  {
    id: "ACT-03",
    recommendation: "Review and restrict excessive VPN access",
    category: "Access Control",
    priority: "High",
    impact: "Medium",
    status: "In Progress",
  },
  {
    id: "ACT-04",
    recommendation: "Patch security vulnerabilities in public-facing apps",
    category: "Vulnerability Mgmt",
    priority: "High",
    impact: "High",
    status: "In Progress",
  },
  {
    id: "ACT-05",
    recommendation: "Enable account lockout policy for failed logins",
    category: "Account Security",
    priority: "Medium",
    impact: "Medium",
    status: "Implemented",
  },
];

// 3. ROW 1: CARD 2 - RECOMMENDATION BY CATEGORY (DONUT CHART)
// Sum: 42 + 36 + 28 + 24 + 16 + 10 = 156
export interface RecommendationCategoryItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export const RECOMMENDATIONS_BY_CATEGORY: RecommendationCategoryItem[] = [
  { name: "Threat Prevention", count: 42, percentage: 27, color: "#ef4444" }, // red
  { name: "Identity Security", count: 36, percentage: 23, color: "#3b82f6" }, // blue
  { name: "Access Control", count: 28, percentage: 18, color: "#8b5cf6" }, // purple
  { name: "Vulnerability Mgmt", count: 24, percentage: 15, color: "#f59e0b" }, // amber
  { name: "Account Security", count: 16, percentage: 10, color: "#10b981" }, // emerald
  { name: "Others", count: 10, percentage: 7, color: "#94a3b8" }, // slate
];

export const TOTAL_RECOMMENDATIONS_COUNT = 156;

// 4. ROW 1: CARD 3 - PRIORITIZATION MATRIX (3x3)
// Y-axis: Impact (High, Medium, Low)
// X-axis: Effort (Low, Medium, High)
// Legend tags: Do First (High Impact, Low Effort), Schedule (High/Med Impact, Med Effort), Consider, Monitor
export interface MatrixCellData {
  count: number;
  actionType: "Do First" | "Schedule" | "Consider" | "Monitor";
  badgeBg: string;
}

export const PRIORITIZATION_MATRIX_CELLS: Record<"High" | "Medium" | "Low", Record<"Low" | "Medium" | "High", MatrixCellData>> = {
  High: {
    Low: { count: 34, actionType: "Do First", badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800" },
    Medium: { count: 28, actionType: "Schedule", badgeBg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800" },
    High: { count: 16, actionType: "Schedule", badgeBg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800" },
  },
  Medium: {
    Low: { count: 24, actionType: "Consider", badgeBg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800" },
    Medium: { count: 22, actionType: "Consider", badgeBg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800" },
    High: { count: 12, actionType: "Monitor", badgeBg: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" },
  },
  Low: {
    Low: { count: 10, actionType: "Consider", badgeBg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800" },
    Medium: { count: 6, actionType: "Monitor", badgeBg: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" },
    High: { count: 4, actionType: "Monitor", badgeBg: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" },
  },
};

// 5. ROW 2: CARD 4 - IMPLEMENTATION STATUS (DONUT CHART)
// Implemented = 62 (40%)
// In Progress = 54 (35%)
// Pending = 28 (18%)
// Overdue = 12 (7%)
// Total = 156
export interface ImplementationStatusItem {
  name: "Implemented" | "In Progress" | "Pending" | "Overdue";
  count: number;
  percentage: number;
  color: string;
}

export const IMPLEMENTATION_STATUS_DATA: ImplementationStatusItem[] = [
  { name: "Implemented", count: 62, percentage: 40, color: "#10b981" }, // emerald
  { name: "In Progress", count: 54, percentage: 35, color: "#3b82f6" }, // blue
  { name: "Pending", count: 28, percentage: 18, color: "#f59e0b" }, // amber
  { name: "Overdue", count: 12, percentage: 7, color: "#ef4444" }, // red
];

// 6. ROW 2: CARD 5 - RECOMMENDATIONS OVER TIME (LINE CHART)
// Time: May 13, May 14, May 15, May 16, May 18, May 19
export interface RecommendationTrendPoint {
  date: string;
  Total: number;
  Implemented: number;
  InProgress: number;
  Overdue: number;
}

export const RECOMMENDATIONS_OVER_TIME_SERIES: RecommendationTrendPoint[] = [
  { date: "May 13", Total: 140, Implemented: 48, InProgress: 58, Overdue: 18 },
  { date: "May 14", Total: 144, Implemented: 50, InProgress: 57, Overdue: 16 },
  { date: "May 15", Total: 148, Implemented: 53, InProgress: 56, Overdue: 15 },
  { date: "May 16", Total: 150, Implemented: 56, InProgress: 55, Overdue: 14 },
  { date: "May 18", Total: 154, Implemented: 60, InProgress: 55, Overdue: 12 },
  { date: "May 19", Total: 156, Implemented: 62, InProgress: 54, Overdue: 12 },
];

// 7. ROW 2: CARD 6 - TOP ASSETS TO IMPROVE (TABLE)
export interface TopAssetToImproveItem {
  asset: string;
  riskLevel: "Critical" | "High" | "Medium" | "Low";
  openRec: number;
  topRecommendation: string;
}

export const TOP_ASSETS_TO_IMPROVE: TopAssetToImproveItem[] = [
  {
    asset: "185.220.101.2",
    riskLevel: "Critical",
    openRec: 8,
    topRecommendation: "Block IP at perimeter edge and sinkhole related DNS beacons",
  },
  {
    asset: "VPN-GW-01",
    riskLevel: "Critical",
    openRec: 6,
    topRecommendation: "Enforce hardware token MFA & terminate idle privileged sessions",
  },
  {
    asset: "Web Application",
    riskLevel: "High",
    openRec: 5,
    topRecommendation: "Patch public CVE-2023-38606 & review rate limiting thresholds",
  },
  {
    asset: "Domain Controllers",
    riskLevel: "High",
    openRec: 4,
    topRecommendation: "Enforce AES Kerberos encryption & audit delegated service accounts",
  },
  {
    asset: "Email Gateway",
    riskLevel: "Medium",
    openRec: 3,
    topRecommendation: "Tighten DMARC policy from quarantine to reject on external relays",
  },
];

// 8. BOTTOM SECTION: RECENT RECOMMENDATIONS (FULL-WIDTH TABLE)
export interface RecentRecommendationRecord {
  id: string; // e.g. REC-2025-0519-0001
  recommendation: string;
  category: "Threat Prevention" | "Identity Security" | "Access Control" | "Vulnerability Mgmt" | "Account Security";
  priority: "Critical" | "High" | "Medium" | "Low";
  impact: "High" | "Medium" | "Low";
  status: "In Progress" | "Implemented" | "Pending" | "Overdue";
  assignedTo: string;
  createdAt: string;
  dueDate: string;
}

export const RECENT_RECOMMENDATIONS_LIST: RecentRecommendationRecord[] = [
  {
    id: "REC-2025-0519-0001",
    recommendation: "Block IP 185.220.101.2 at firewall and WAF perimeter",
    category: "Threat Prevention",
    priority: "Critical",
    impact: "High",
    status: "In Progress",
    assignedTo: "Network Sec Team",
    createdAt: "May 19, 08:30",
    dueDate: "May 20, 12:00",
  },
  {
    id: "REC-2025-0519-0002",
    recommendation: "Enforce MFA for VPN and privileged accounts fleet-wide",
    category: "Identity Security",
    priority: "Critical",
    impact: "High",
    status: "Implemented",
    assignedTo: "IAM Administrator",
    createdAt: "May 18, 14:15",
    dueDate: "May 19, 18:00",
  },
  {
    id: "REC-2025-0519-0003",
    recommendation: "Review and restrict excessive VPN access permissions for contractors",
    category: "Access Control",
    priority: "High",
    impact: "Medium",
    status: "In Progress",
    assignedTo: "Security Operations",
    createdAt: "May 18, 10:45",
    dueDate: "May 22, 17:00",
  },
  {
    id: "REC-2025-0519-0004",
    recommendation: "Patch security vulnerabilities in public-facing API gateways",
    category: "Vulnerability Mgmt",
    priority: "High",
    impact: "High",
    status: "Pending",
    assignedTo: "DevOps & SecOps",
    createdAt: "May 17, 16:20",
    dueDate: "May 24, 18:00",
  },
  {
    id: "REC-2025-0519-0005",
    recommendation: "Enable account lockout policy for consecutive failed logins",
    category: "Account Security",
    priority: "Medium",
    impact: "Medium",
    status: "Implemented",
    assignedTo: "Active Directory Team",
    createdAt: "May 17, 09:10",
    dueDate: "May 18, 17:00",
  },
];


