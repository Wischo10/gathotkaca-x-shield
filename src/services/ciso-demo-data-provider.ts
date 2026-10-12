export interface CisoDemoBriefing {
  id: `DEMO-CISO-${string}`;
  asOf: string;
  executiveSummary: string;
  observations: readonly string[];
  priorityActions: readonly string[];
}

export const CISO_DEMO_BRIEFING: CisoDemoBriefing = Object.freeze({
  id: "DEMO-CISO-001",
  asOf: "2026-10-06T08:00:00.000Z",
  executiveSummary: "Demonstration preview of how an executive security briefing will be presented when the configured AI provider is available.",
  observations: Object.freeze([
    "Security leadership can review operational telemetry, risk, compliance, and vulnerability context in one executive workspace.",
    "Formal assessment and enterprise workflow coverage should be reviewed separately from live security telemetry.",
  ]),
  priorityActions: Object.freeze([
    "Complete outstanding business-owned assessments and assign accountable treatment owners.",
    "Review critical vulnerability age and incident lifecycle readiness during the next governance checkpoint.",
  ]),
});

export const CISO_DEMO_DATA = Object.freeze({
  kpis: Object.freeze({
    securityPosture: { value: 78, trend30d: 3 },
    totalRisk: { value: 2.8, category: "High", trend30d: -0.2 },
    activeIncidents: { value: 8, trend30d: -2 },
    compliance: { value: 82, trend30d: 4 },
    riskTreatment: { value: 75, completed: 9, eligible: 12, planned: 2, inProgress: 1, trend30d: 8 },
  }),
  postureDomains: Object.freeze([
    { name: "Govern", score: 76, trend30d: 3 },
    { name: "Identify", score: 82, trend30d: 2 },
    { name: "Protect", score: 79, trend30d: 4 },
    { name: "Detect", score: 85, trend30d: 1 },
    { name: "Respond", score: 74, trend30d: 3 },
    { name: "Recover", score: 72, trend30d: 2 },
  ]),
  incidentKpis: Object.freeze({ mttd: 12, mtta: 18, mttc: 64, mttr: 245 }),
  risks: Object.freeze([
    { id: "DEMO-RISK-001", code: "RISK-001", title: "Credential compromise", score: 88, trend: 4, owner: "Security Operations", rating: "Critical" },
    { id: "DEMO-RISK-002", code: "RISK-002", title: "Critical vulnerability exposure", score: 76, trend: -3, owner: "Infrastructure", rating: "High" },
    { id: "DEMO-RISK-003", code: "RISK-003", title: "Third-party service disruption", score: 61, trend: 2, owner: "Risk Management", rating: "High" },
    { id: "DEMO-RISK-004", code: "RISK-004", title: "Cloud configuration drift", score: 48, trend: -2, owner: "Cloud Platform", rating: "Medium" },
    { id: "DEMO-RISK-005", code: "RISK-005", title: "Data retention control gap", score: 35, trend: 0, owner: "Data Governance", rating: "Medium" },
    { id: "DEMO-RISK-006", code: "RISK-006", title: "Endpoint policy exception", score: 22, trend: -1, owner: "Endpoint Security", rating: "Low" },
  ]),
  complianceFrameworks: Object.freeze([
    { id: "iso27001", name: "ISO/IEC 27001:2022", score: 84, trend30d: 3, status: "compliant" },
    { id: "nist-csf", name: "NIST CSF 2.0", score: 78, trend30d: 3, status: "partial" },
    { id: "uu-pdp", name: "UU PDP No. 27/2022", score: 80, trend30d: 4, status: "partial" },
    { id: "cis-v8", name: "CIS Controls v8", score: 81, trend30d: 2, status: "partial" },
  ]),
  vendors: Object.freeze({ total: 14, assessed: 11, overdue: 3, incidents: 2, distribution: Object.freeze([
    { name: "High Risk", count: 3, color: "#f97316" },
    { name: "Medium Risk", count: 6, color: "#eab308" },
    { name: "Low Risk", count: 5, color: "#22c55e" },
  ]) }),
});

export function createDemoVulnerabilityWorkflow(total: number) {
  if (total <= 0) return { overdue: 0, dueSoon: 0, inProgress: 0, compliant: 0 };
  const overdue = Math.round(total * 0.3);
  const dueSoon = Math.round(total * 0.2);
  const inProgress = Math.round(total * 0.25);
  return { overdue, dueSoon, inProgress, compliant: total - overdue - dueSoon - inProgress };
}
