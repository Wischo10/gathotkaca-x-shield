"use client";

import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { DataProvenanceBadge } from "@/components/ui/DataProvenanceBadge";
import { SourceFreshness } from "@/components/ui/SourceFreshness";
import { useSidebarToggle } from "@/context/sidebar-context";
import { useApiResult } from "@/hooks/useApiResult";
import { isScorableRiskAssessment, normalizeRiskCategory, rankTopRisks } from "@/lib/risk-ranking";
import type { CisoMetricsData, IncidentKpiItem } from "@/types/ciso";
import type { ComplianceOverviewData } from "@/types/compliance";
import type { RiskRegisterResponse } from "@/types/risk";
import type { ThirdPartyRegisterResponse } from "@/types/third-party";
import type { ThreatIntelligenceOverviewData } from "@/types/threat-intel";

function latestTimestamp(values: Array<string | null | undefined>) {
  return values.reduce<string | null>((latest, value) => value && (!latest || value > latest) ? value : latest, null);
}

function duration(minutes: number | null) {
  if (minutes === null) return "N/A";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = Math.round(minutes % 60);
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

function ReportMetric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div className="rounded-lg border border-slate-200 p-3 print:break-inside-avoid">
    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
    <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
    {detail && <div className="mt-1 text-xs leading-5 text-slate-500">{detail}</div>}
  </div>;
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="break-inside-avoid rounded-xl border border-slate-200 bg-white p-5 shadow-sm print:rounded-none print:shadow-none">
    <h2 className="mb-4 border-b border-slate-200 pb-2 text-base font-bold text-slate-900">{title}</h2>
    {children}
  </section>;
}

function IncidentMetric({ label, item, unavailableText }: { label: string; item?: IncidentKpiItem; unavailableText?: string }) {
  const measurable = item?.value !== null && item?.value !== undefined;
  return <ReportMetric
    label={label}
    value={measurable ? duration(item.value) : unavailableText ?? "N/A"}
    detail={label === "MTTD"
      ? "Verified occurrence timestamps are unavailable."
      : `Based on ${item?.eligibleIncidents ?? 0} eligible timestamp pair${item?.eligibleIncidents === 1 ? "" : "s"} in the last 30 days.`}
  />;
}

export default function CisoExecutiveReportPage() {
  const openSidebar = useSidebarToggle();
  const metricsState = useApiResult<CisoMetricsData>("/api/ciso/metrics");
  const risksState = useApiResult<RiskRegisterResponse>("/api/ciso/risks");
  const complianceState = useApiResult<ComplianceOverviewData>("/api/ciso/compliance");
  const threatState = useApiResult<ThreatIntelligenceOverviewData>("/api/ciso/threat-intelligence");
  const thirdPartyState = useApiResult<ThirdPartyRegisterResponse>("/api/ciso/third-parties");

  const metrics = metricsState.phase === "ready" ? metricsState.data : null;
  const risks = risksState.phase === "ready" ? risksState.data : null;
  const compliance = complianceState.phase === "ready" ? complianceState.data : null;
  const threat = threatState.phase === "ready" ? threatState.data : null;
  const thirdParties = thirdPartyState.phase === "ready" ? thirdPartyState.data : null;
  const sla = metrics?.vulnerabilitySlaOverview ?? metrics?.vulnerabilitySla;
  const latestNist = latestTimestamp(metrics?.nistPosture.domains.map(item => item.assessedAt) ?? []);
  const latestRisk = latestTimestamp(risks?.items.map(item => item.updatedAt) ?? []);
  const latestCompliance = latestTimestamp(compliance?.frameworks
    .filter(item => item.metricKind !== "telemetry_observation").map(item => item.lastAssessedAt) ?? []);
  const latestVendor = latestTimestamp(thirdParties?.items.map(item => item.updatedAt) ?? []);
  const topRisks = risks ? rankTopRisks(risks.items) : [];
  const riskCounts = ["Low", "Medium", "High", "Critical"].map(category => ({
    category,
    count: risks?.items.filter(item => isScorableRiskAssessment(item) && normalizeRiskCategory(item.residualRisk) === category).length ?? 0,
  }));
  const needsAssessment = risks?.items.filter(item => !isScorableRiskAssessment(item)).length ?? 0;
  const formalFrameworks = compliance?.frameworks.filter(item => item.metricKind !== "telemetry_observation") ?? [];
  const observationalFrameworks = compliance?.frameworks.filter(item => item.metricKind === "telemetry_observation") ?? [];

  const metricValue = (value: number | null | undefined, suffix = "") => value === null || value === undefined ? "N/A" : `${value.toLocaleString()}${suffix}`;

  return <>
    <div className="report-actions"><Topbar title="CISO Executive Report" subtitle="Read-only management preview using current CISO dashboard data" onMenuClick={openSidebar}/></div>
    <main className="ciso-report space-y-5 bg-slate-50 p-4 text-slate-800 sm:p-6 print:bg-white print:p-0">
      <div className="report-actions flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard/ciso" className="text-sm font-medium text-brand-blue hover:underline">Back to CISO Dashboard</Link>
        <button type="button" onClick={() => window.print()} className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-90">Print Report</button>
      </div>

      <header className="border-b-2 border-slate-800 pb-4">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Gathotkaca X-Shield</div>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">CISO Executive Security Report</h1>
        <p className="mt-1 text-sm text-slate-500">Current-state preview. Source timestamps retain their dashboard meanings; report rendering time is not data freshness.</p>
      </header>

      <ReportSection title="Executive Summary">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3">
          <ReportMetric label="NIST CSF Assessment Score" value={metricValue(metrics?.securityPostureScore.value, metrics?.securityPostureScore.value === null ? "" : "/100")} detail="Requires all six persisted NIST CSF function assessments."/>
          <ReportMetric label="Assessed Residual Risk" value={metrics?.totalRiskScore.category ?? "N/A"} detail={metrics?.totalRiskScore.value === null || metrics?.totalRiskScore.value === undefined ? "No completed recognized assessments." : `${metrics.totalRiskScore.value.toFixed(1)} / 4; higher is worse. ${metrics.totalRiskScore.eligibleCount ?? 0} of ${risks?.items.length ?? 0} risks assessed.`}/>
          <ReportMetric label="Active Incidents" value={metricValue(metrics?.activeIncidents.value)} detail="Current Bitdefender incident population."/>
          <ReportMetric label="Unique Critical CVEs" value={metricValue(metrics?.criticalVulnerabilities.value)} detail="Exact current Wazuh vulnerability-state population."/>
          <ReportMetric label="Compliance Score" value={metricValue(metrics?.complianceScore.value, "%")} detail="Equal-weight average of completed formal frameworks only."/>
          <ReportMetric label="Risk Treatments Completed" value={metrics?.riskTreatmentProgress.eligibleCount === undefined ? "N/A" : `${metrics.riskTreatmentProgress.completedCount ?? 0} of ${metrics.riskTreatmentProgress.eligibleCount}`} detail={metrics?.riskTreatmentProgress.value === null || metrics?.riskTreatmentProgress.value === undefined ? "No eligible assessed treatments." : `${metrics.riskTreatmentProgress.value}% of eligible assessed treatments.`}/>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <SourceFreshness source="Manual NIST CSF 2.0 assessments" timestamp={latestNist} timestampLabel="Latest assessment"/>
          <SourceFreshness source="Bitdefender GravityZone" timestamp={metrics?.activeIncidents.availability?.fetchedAt} timestampLabel={metrics?.activeIncidents.availability?.cached ? "Retrieved (cached result)" : "Retrieved"}/>
          <SourceFreshness source="Wazuh / OpenSearch"/>
        </div>
      </ReportSection>

      <ReportSection title="Incident Response">
        {metrics?.incidentKpi.provenance && <DataProvenanceBadge provenance={metrics.incidentKpi.provenance} className="mb-3"/>}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
          <IncidentMetric label="MTTD" item={metrics?.incidentKpi.mttd} unavailableText="Not Measurable"/>
          <IncidentMetric label="MTTA" item={metrics?.incidentKpi.mtta}/>
          <IncidentMetric label="MTTC" item={metrics?.incidentKpi.mttc}/>
          <IncidentMetric label="MTTR" item={metrics?.incidentKpi.mttr}/>
        </div>
        <SourceFreshness source="Bitdefender GravityZone + PostgreSQL incident lifecycle" className="mt-3"/>
      </ReportSection>

      <ReportSection title="Vulnerability Exposure">
        <div className="grid gap-3 sm:grid-cols-5 print:grid-cols-5">
          <ReportMetric label="Unique Critical CVEs" value={metricValue(sla?.totalCritical)}/>
          <ReportMetric label="Overdue" value={metricValue(sla?.overdue)}/>
          <ReportMetric label="Due Soon" value={metricValue(sla?.dueSoon)}/>
          <ReportMetric label="Within Configured Threshold" value={metricValue(sla?.compliant)}/>
          <ReportMetric label="Unclassified" value={metricValue(sla?.unclassified)}/>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">{sla?.policy.policyNote ?? "Configured thresholds are application defaults pending organizational policy confirmation."}</p>
        <SourceFreshness source="Wazuh / OpenSearch vulnerability state" className="mt-2"/>
      </ReportSection>

      <ReportSection title="Risk">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5 print:grid-cols-5">
          {riskCounts.map(item => <ReportMetric key={item.category} label={item.category} value={risks ? String(item.count) : "N/A"}/>) }
          <ReportMetric label="Needs Assessment" value={risks ? String(needsAssessment) : "N/A"}/>
        </div>
        <p className="mt-3 text-xs text-slate-500">Total risks: {risks?.items.length ?? "N/A"}. Recognized assessed residual-risk ratings: {metrics?.totalRiskScore.eligibleCount ?? "N/A"}.</p>
        <h3 className="mt-4 text-sm font-semibold">Top assessed risks</h3>
        {topRisks.length ? <div className="mt-2 overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b"><th className="py-2">Risk</th><th>Residual</th><th>Owner</th><th>Treatment</th></tr></thead><tbody>{topRisks.map(item => <tr key={item.id} className="border-b border-slate-100"><td className="py-2 font-medium">{item.riskCode}: {item.title}</td><td>{normalizeRiskCategory(item.residualRisk)}</td><td>{item.riskOwner || "Unassigned"}</td><td>{item.treatmentStatus || "Not recorded"}</td></tr>)}</tbody></table></div> : <p className="mt-2 text-sm text-slate-500">No recognized assessed risks available.</p>}
        <SourceFreshness source="PostgreSQL Risk Register" timestamp={latestRisk} timestampLabel="Latest record update" className="mt-3"/>
      </ReportSection>

      <ReportSection title="Compliance">
        <p className="mb-3 text-xs leading-5 text-slate-500">Formal score = Passed / (Passed + Partial + Failed). Partial controls receive no full-compliance credit. Incomplete frameworks are excluded from the equally weighted executive aggregate. MITRE observations are excluded.</p>
        <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b"><th className="py-2">Framework</th><th>Score</th><th>Status</th><th>Coverage</th><th>Assessed outcomes</th></tr></thead><tbody>{formalFrameworks.map(item => <tr key={item.id} className="border-b border-slate-100"><td className="py-2 font-medium">{item.name}</td><td>{item.score === null ? "N/A" : `${item.score}%`}</td><td className="capitalize">{item.status.replaceAll("_", " ")}</td><td>{item.assessmentCoveragePercent === undefined ? "N/A" : `${item.assessmentCoveragePercent}%`}</td><td>{item.assessedControls ?? 0} of {item.totalApplicableControls ?? 0}</td></tr>)}</tbody></table></div>
        {observationalFrameworks.length > 0 && <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs"><b>Observational telemetry (not formal compliance):</b> {observationalFrameworks.map(item => `${item.name}: ${item.context ?? item.status}`).join("; ")}</div>}
        <SourceFreshness source="PostgreSQL formal assessments" timestamp={latestCompliance} timestampLabel="Latest formal assessment" className="mt-3"/>
      </ReportSection>

      <ReportSection title="Threat Intelligence">
        {threat?.availability !== "unavailable" && threat?.kpis ? <>
          <div className="grid gap-3 sm:grid-cols-5 print:grid-cols-5">
            <ReportMetric label="Total IOCs" value={String(threat.kpis.totalIocs)}/>
            <ReportMetric label="Domains / URLs" value={String(threat.kpis.maliciousDomainsCount)}/>
            <ReportMetric label="IP Addresses" value={String(threat.kpis.maliciousIpsCount)}/>
            <ReportMetric label="Hashes" value={String(threat.kpis.maliciousHashesCount)}/>
            <ReportMetric label="Other" value={String(threat.kpis.otherIocsCount)}/>
          </div>
          <p className="mt-3 text-xs text-slate-500">Trend percentages compare the latest 3.5 days with the preceding 3.5 days in the seven-day observation window; N/A is used when the previous-period denominator is zero.</p>
        </> : <p className="text-sm text-slate-500">ThreatFox data is unavailable; zero is not assumed.</p>}
        <SourceFreshness source="ThreatFox (primary 7-day IOC feed)" timestamp={threat?.availability !== "unavailable" ? threat?.observedAt : null} timestampLabel={threat?.availability === "cached" ? "Retrieved (cached result)" : "Retrieved"} className="mt-3"/>
        <p className="mt-1 text-[10px] text-slate-400">AbuseIPDB and VirusTotal are enrichment/source-health context and do not contribute to headline totals.</p>
      </ReportSection>

      <ReportSection title="Third-Party Risk">
        <div className="grid gap-3 sm:grid-cols-4 print:grid-cols-4">
          <ReportMetric label="Total Vendors" value={thirdParties ? String(thirdParties.summary.totalVendors) : "N/A"}/>
          <ReportMetric label="Assessed" value={thirdParties ? String(thirdParties.summary.assessed) : "N/A"}/>
          <ReportMetric label="Assessment Coverage" value={thirdParties ? `${thirdParties.summary.assessmentCoveragePct}%` : "N/A"}/>
          <ReportMetric label="Highest Assessed Risk" value={thirdParties?.summary.highestAssessedRisk ?? "N/A"}/>
        </div>
        <p className="mt-3 text-xs text-slate-500">Manual vendor-risk assessment coverage; it does not establish PDP processor compliance.</p>
        <SourceFreshness source="PostgreSQL Third-Party Register" timestamp={latestVendor} timestampLabel="Latest record update" className="mt-2"/>
      </ReportSection>

      <ReportSection title="AI CISO Briefing">
        <p className="text-sm leading-6 text-slate-600">Not generated in this report preview. Open the authenticated CISO Dashboard to request a grounded AI briefing. Viewing or printing this report never invokes Ollama.</p>
      </ReportSection>

      <footer className="border-t border-slate-300 pt-3 text-[10px] leading-4 text-slate-500">Read-only current-state report preview. Demo enterprise-provider datasets are excluded from executive totals, formal compliance, and this report.</footer>
    </main>
    <style jsx global>{`
      @media print {
        @page { size: A4; margin: 12mm; }
        body * { visibility: hidden; }
        .ciso-report, .ciso-report * { visibility: visible; }
        .ciso-report { position: absolute; inset: 0; width: 100%; }
        .report-actions { display: none !important; }
        .ciso-report section { break-inside: avoid; page-break-inside: avoid; }
      }
    `}</style>
  </>;
}
