"use client";

import { Panel, PanelEmpty } from "@/components/ui/Panel";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/context/sidebar-context";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ThreatIntelPanel } from "@/components/dashboard/ThreatIntelPanel";
import { ComplianceOverviewPanel } from "@/components/dashboard/ComplianceOverviewPanel";
import { AiCisoBriefingPanel } from "@/components/dashboard/AiCisoBriefingPanel";
import { rankTopRisks } from "@/lib/risk-ranking";

import { useApiResult } from "@/hooks/useApiResult";
import { NIST_FUNCTIONS, type CisoMetricsData } from "@/types/ciso";
import type { RiskRegisterResponse } from "@/types/risk";
import type { ThirdPartyRegisterResponse } from "@/types/third-party";

type MetricIconName = "shield" | "risk" | "incident" | "vulnerability" | "compliance" | "treatment";

const TOTAL_RISK_PRESENTATION_SCORES: Record<string, number> = {
  Low: 25,
  Medium: 50,
  High: 75,
  Critical: 100,
};

const THIRD_PARTY_RISK_BUCKETS = [
  { rating: "Critical", label: "Critical Risk", color: "#dc2626" },
  { rating: "High", label: "High Risk", color: "#f97316" },
  { rating: "Medium", label: "Medium Risk", color: "#eab308" },
  { rating: "Low", label: "Low Risk", color: "#22c55e" },
] as const;

const RISK_REGISTER_BUCKETS = [
  { rating: "Critical", label: "Critical", color: "#dc2626" },
  { rating: "High", label: "High", color: "#f97316" },
  { rating: "Medium", label: "Medium", color: "#eab308" },
  { rating: "Low", label: "Low", color: "#22c55e" },
] as const;

const MetricIcon = ({ name }: { name: MetricIconName }) => {
  const paths: Record<MetricIconName, React.ReactNode> = {
    shield: <path d="M12 3 5 6v5c0 4.6 2.9 8.1 7 10 4.1-1.9 7-5.4 7-10V6l-7-3Zm-3 9 2 2 4-4" />,
    risk: <><path d="M12 3 2.8 19h18.4L12 3Z" /><path d="M12 9v4M12 17h.01" /></>,
    incident: <><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" /><circle cx="12" cy="12" r="3" /></>,
    vulnerability: <><path d="M8 9h8v8a4 4 0 0 1-8 0V9ZM9 5l3 2 3-2M5 13h3M16 13h3M5 17h3M16 17h3M12 9v10" /></>,
    compliance: <><path d="M12 3 5 6v5c0 4.6 2.9 8.1 7 10 4.1-1.9 7-5.4 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    treatment: <><path d="M4 18V9M10 18V5M16 18v-6M3 18h18" /><path d="m4 7 5-4 5 4 6-5" /></>,
  };

  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
};

interface MetricCardProps {
  title: string;
  value: number | string | null | undefined;
  max?: number;
  unit?: string;
  trend30d: number | null | undefined;
  trendAvailable?: boolean;
  trendColor: "blue" | "red" | "orange" | "purple" | "green" | "teal";
  icon: MetricIconName;
  tooltip?: string;
  context?: string;
  basis?: string;
}

const MetricCard = ({
  title,
  value,
  max,
  unit,
  trend30d,
  trendAvailable,
  trendColor,
  icon,
  tooltip,
  context,
  basis,
}: MetricCardProps) => {
  const hasValue = value !== null && value !== undefined;
  const isTrendValid = trendAvailable && trend30d !== null && trend30d !== undefined;

  const colorStyles: Record<string, { bg: string; text: string; subText: string }> = {
    blue: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", subText: "text-blue-500" },
    red: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400", subText: "text-red-500" },
    orange: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400", subText: "text-orange-500" },
    purple: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400", subText: "text-purple-500" },
    green: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400", subText: "text-green-500" },
    teal: { bg: "bg-teal-100 dark:bg-teal-900/30", text: "text-teal-600 dark:text-teal-400", subText: "text-teal-500" },
  };

  const style = colorStyles[trendColor] || colorStyles.blue;

  return (
    <div className="flex min-h-[172px] flex-col rounded-2xl border border-slate-200/80 bg-white p-[18px] shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2.5">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.bg} ${style.text}`} aria-hidden="true">
          <MetricIcon name={icon} />
        </div>
        <span className="min-w-0 text-sm font-semibold leading-5 text-slate-700 dark:text-slate-200">{title}</span>
        <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-200 text-[11px] font-semibold text-slate-400 dark:border-slate-700 dark:text-slate-500" title={tooltip || title} aria-label={`About ${title}`}>
          i
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={`text-3xl font-bold tracking-tight ${hasValue ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
          {hasValue ? `${value?.toLocaleString()}${unit || ""}` : "N/A"}
        </span>
        {hasValue && max && <span className="text-sm font-medium text-slate-400">/{max}</span>}
      </div>
      <div className={`mt-1 min-h-5 text-xs font-medium leading-5 ${isTrendValid ? style.subText : "text-slate-500 dark:text-slate-400"}`}>
        {!hasValue ? "Source unavailable" : context ? context : isTrendValid ? (
          <>
            {trend30d > 0 ? "↑ " : trend30d < 0 ? "↓ " : "→ "}
            {Math.abs(trend30d)}% vs last 30 days
          </>
        ) : (
          <span className="text-slate-400">Trend unavailable</span>
        )}
      </div>
      {basis && <div className="mt-0.5 text-[11px] leading-4 text-slate-400 dark:text-slate-500">{basis}</div>}
      <div className="mt-auto pt-2.5" aria-hidden="true">
        <div className="h-6 rounded-md bg-gradient-to-b from-transparent to-slate-50/80 dark:to-slate-800/20">
          <div className="relative top-4 h-px w-full bg-slate-200/70 dark:bg-slate-700/60" />
        </div>
      </div>
    </div>
  );
};

export default function CISODashboardPage() {
  const openSidebar = useSidebarToggle();
  const metricsState = useApiResult<CisoMetricsData>("/api/ciso/metrics");
  const risksState = useApiResult<RiskRegisterResponse>("/api/ciso/risks");
  const thirdPartiesState = useApiResult<ThirdPartyRegisterResponse>("/api/ciso/third-parties");
  const metrics = metricsState.phase === "ready" ? metricsState.data : null;
  const totalRiskPresentationScore = metrics?.totalRiskScore.category
    ? TOTAL_RISK_PRESENTATION_SCORES[metrics.totalRiskScore.category] ?? null
    : null;
  const thirdPartyDistribution = thirdPartiesState.phase === "ready" ? [
    ...THIRD_PARTY_RISK_BUCKETS.map(bucket => ({
      name: bucket.label,
      count: thirdPartiesState.data.items.filter(vendor =>
        vendor.assessmentStatus === "assessed" && vendor.riskRating === bucket.rating
      ).length,
      color: bucket.color,
    })),
    {
      name: "Needs Assessment",
      count: thirdPartiesState.data.items.filter(vendor => vendor.assessmentStatus === "needs_assessment").length,
      color: "#94a3b8",
    },
  ] : [];
  const thirdPartyDonutDistribution = thirdPartyDistribution.filter(bucket => bucket.count > 0);
  const riskRegisterDistribution = risksState.phase === "ready" ? [
    ...RISK_REGISTER_BUCKETS.map(bucket => ({
      name: bucket.label,
      count: risksState.data.items.filter(risk =>
        risk.assessmentStatus === "assessed" && risk.residualRisk === bucket.rating
      ).length,
      color: bucket.color,
    })),
    {
      name: "Needs Assessment",
      count: risksState.data.items.filter(risk => risk.assessmentStatus === "needs_assessment").length,
      color: "#94a3b8",
    },
  ] : [];
  const riskRegisterDonutDistribution = riskRegisterDistribution.filter(bucket => bucket.count > 0);
  const topRisks = risksState.phase === "ready" ? rankTopRisks(risksState.data.items) : [];
  const nistPostureDomains = NIST_FUNCTIONS.map(name => {
    const assessment = metrics?.nistPosture?.domains.find(domain => domain.name === name);
    return {
      name, score: assessment?.score ?? null, trend30d: assessment?.trend30d ?? null,
      assessedAt: assessment?.assessedAt, assessedBy: assessment?.assessedBy,
    };
  });
  // Require all six recorded scores; null is never converted to a zero-radius vertex.
  const radarAvailable = nistPostureDomains.every(domain => domain.score !== null
    && Number.isFinite(domain.score) && domain.score >= 0 && domain.score <= 100);
  const radarPoints = radarAvailable ? nistPostureDomains.map((domain, index) => {
    const angle = (-90 + index * 60) * Math.PI / 180;
    const radius = domain.score! / 100 * 80;
    return `${140 + Math.cos(angle) * radius},${130 + Math.sin(angle) * radius}`;
  }).join(" ") : undefined;

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return "Updating...";
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSec < 60) return "Dashboard refreshed just now";
    const diffMin = Math.floor(diffSec / 60);
    return `Dashboard refreshed ${diffMin} min ago`;
  };

  const formatDuration = (minutes: number | null | undefined): string => {
    if (minutes === null || minutes === undefined) return "N/A";
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const renderTrend = (trend30d: number | null | undefined, trendAvailable: boolean | undefined) => {
    if (!trendAvailable || trend30d === null || trend30d === undefined) {
      return <span className="text-[10px] text-slate-400 font-normal ml-1">—</span>;
    }
    const isImproved = trend30d < 0;
    const color = isImproved ? "text-green-500" : "text-red-500";
    const arrow = trend30d < 0 ? "↓ " : trend30d > 0 ? "↑ " : "→ ";
    return (
      <span className={`text-[10px] font-normal ml-1 ${color}`}>
        {arrow}{Math.abs(trend30d)}%
      </span>
    );
  };

  const renderKpiMetadata = (item: CisoMetricsData["incidentKpi"]["mttd"]) => (
    <div className="mt-1 space-y-0.5 text-[10px] leading-tight text-slate-400">
      <div>{item?.explanation || "Incident KPI source unavailable"}</div>
      {item?.value !== null && item?.value !== undefined && <>
        <div>{item.sampleSize} verified sample{item.sampleSize === 1 ? "" : "s"} · Last 30 days</div>
        <div className="truncate" title={item.source}>Source: {item.source}</div>
      </>}
    </div>
  );

  return (
    <>
      <Topbar title="CISO Dashboard" subtitle="Deep dive into security risk, performance, and compliance" onMenuClick={openSidebar} />
      <main className="flex-1 space-y-4 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        
        {/* Metric Header with Timestamp */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Executive Security Overview
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            {metrics?.updatedAt ? formatRelativeTime(metrics.updatedAt) : "Refreshing dashboard..."}
          </span>
        </div>

        {/* ROW 1: Real Telemetry & Data-Driven Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <MetricCard
            title="Security Posture Score"
            value={metrics?.securityPostureScore.value}
            max={metrics?.securityPostureScore.max}
            trend30d={metrics?.securityPostureScore.trend30d}
            trendAvailable={metrics?.securityPostureScore.trendAvailable}
            trendColor="blue"
            icon="shield"
            tooltip={metrics?.securityPostureScore.details?.explanation || metrics?.securityPostureScore.source}
            basis="Manual NIST assessment"
          />
          <MetricCard
            title="Total Risk Score"
            value={totalRiskPresentationScore}
            max={100}
            trend30d={metrics?.totalRiskScore.trend30d}
            trendAvailable={metrics?.totalRiskScore.trendAvailable}
            trendColor="red"
            icon="risk"
            tooltip={metrics ? `Numeric score is a project-defined executive presentation mapping derived from the assessed Total Risk category. Authoritative result: ${metrics.totalRiskScore.category ?? "N/A"} (${metrics.totalRiskScore.value ?? "N/A"}/${metrics.totalRiskScore.max ?? 4}). ${metrics.totalRiskScore.details?.explanation || metrics.totalRiskScore.source}` : "Loading assessed Total Risk."}
            context={metrics?.totalRiskScore.value !== null && metrics?.totalRiskScore.value !== undefined
              ? `${metrics.totalRiskScore.category} · ${metrics.totalRiskScore.eligibleCount} assessed ${metrics.totalRiskScore.eligibleCount === 1 ? "risk" : "risks"}`
              : undefined}
            basis="Assessed risks"
          />
          <MetricCard
            title="Active Incidents"
            value={metrics?.activeIncidents.value}
            trend30d={metrics?.activeIncidents.trend30d}
            trendAvailable={metrics?.activeIncidents.trendAvailable}
            trendColor="orange"
            icon="incident"
            tooltip={metrics?.activeIncidents.availability?.error?.message || metrics?.activeIncidents.source || (metricsState.phase === "error" ? metricsState.message : "Loading Bitdefender incident count...")}
          />
          <MetricCard
            title="Critical Vulnerabilities"
            value={metrics?.criticalVulnerabilities.value}
            trend30d={metrics?.criticalVulnerabilities.trend30d}
            trendAvailable={metrics?.criticalVulnerabilities.trendAvailable}
            trendColor="purple"
            icon="vulnerability"
            tooltip={metrics?.criticalVulnerabilities.availability?.error?.message || metrics?.criticalVulnerabilities.source || (metricsState.phase === "error" ? metricsState.message : "Loading unique critical CVE count...")}
          />
          <MetricCard
            title="Compliance Score"
            value={metrics?.complianceScore.value}
            unit={metrics?.complianceScore.unit || "%"}
            trend30d={metrics?.complianceScore.trend30d}
            trendAvailable={metrics?.complianceScore.trendAvailable}
            trendColor="green"
            icon="compliance"
            tooltip={metrics?.complianceScore.details?.explanation || metrics?.complianceScore.source}
            basis="Formal assessments"
          />
          <MetricCard
            title="Risk Treatment Progress"
            value={metrics?.riskTreatmentProgress.value}
            unit={metrics?.riskTreatmentProgress.unit || "%"}
            trend30d={metrics?.riskTreatmentProgress.trend30d}
            trendAvailable={metrics?.riskTreatmentProgress.trendAvailable}
            trendColor="teal"
            icon="treatment"
            tooltip={metrics?.riskTreatmentProgress.details?.explanation || metrics?.riskTreatmentProgress.source}
            context={metrics?.riskTreatmentProgress.value !== null && metrics?.riskTreatmentProgress.value !== undefined
              ? `${metrics.riskTreatmentProgress.completedCount} of ${metrics.riskTreatmentProgress.eligibleCount} treatments completed${metrics.riskTreatmentProgress.plannedCount ? ` · ${metrics.riskTreatmentProgress.plannedCount} Planned` : ""}`
              : undefined}
            basis="Eligible assessed treatments"
          />
        </div>

        {/* ROW 2: Analytical Panels */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel title="Security Posture Overview" action={<span className="text-xs text-slate-400">NIST CSF 2.0</span>}>
            <div className="flex h-56 items-center gap-2 overflow-x-auto">
              {/* Neutral scaffold; the data polygon requires all six actual assessments. */}
              <svg viewBox="0 0 280 260" className="h-full min-w-[150px] flex-1" role="img" aria-label={radarAvailable ? "NIST CSF six-function assessment radar, scale 0 to 100" : "NIST CSF six-function radar. Insufficient assessment data; no score polygon rendered."}>
                <g fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeDasharray="3 3">
                  <path d="M140 50 L209 90 L209 170 L140 210 L71 170 L71 90 Z" />
                  <path d="M140 90 L175 110 L175 150 L140 170 L105 150 L105 110 Z" />
                  <path d="M140 50 V210 M71 90 L209 170 M209 90 L71 170" />
                </g>
                <g textAnchor="middle" className="fill-slate-500 dark:fill-slate-400" fontSize="12">
                  <text x="140" y="28">Govern</text>
                  <text x="238" y="80">Identify</text>
                  <text x="238" y="190">Protect</text>
                  <text x="140" y="238">Detect</text>
                  <text x="42" y="190">Respond</text>
                  <text x="42" y="80">Recover</text>
                </g>
                {radarAvailable ? <polygon points={radarPoints} className="fill-blue-500/20 stroke-blue-500" strokeWidth="2" /> : <>
                <rect x="79" y="111" width="122" height="38" rx="4" className="fill-white dark:fill-slate-900" />
                <text x="140" y="126" textAnchor="middle" fontSize="11" className="fill-slate-500 dark:fill-slate-400">
                  <tspan x="140">Insufficient</tspan>
                  <tspan x="140" dy="15">assessment data</tspan>
                </text>
                </>}
              </svg>
              <table className="w-1/2 min-w-[150px] text-left text-[10px]" aria-label="NIST CSF function assessments">
                <thead className="text-slate-400">
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-2 font-medium">Domain</th>
                    <th className="pb-2 text-center font-medium">Score</th>
                    <th className="pb-2 text-right font-medium">Trend<br />(30 Days)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {nistPostureDomains.map(domain => (
                    <tr key={domain.name} title={domain.score === null ? metrics?.nistPosture?.explanation || "No recorded function assessment available" : `Assessed ${domain.assessedAt} by ${domain.assessedBy}. Trend is percentage-point change against a recorded assessment 30–35 days ago.`}>
                      <td className="py-2 font-medium text-slate-600 dark:text-slate-300">{domain.name}</td>
                      <td className="py-2 text-center text-slate-400">{domain.score === null ? "N/A" : `${domain.score}%`}</td>
                      <td className="py-2 text-right text-slate-400">{domain.trend30d === null ? "N/A" : `${domain.trend30d > 0 ? "+" : ""}${domain.trend30d} pp`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-right text-xs">
              <a href="/dashboard/ciso/security-posture" className="text-brand-blue hover:underline">View full security posture →</a>
            </div>
          </Panel>
          <Panel title="Incident Response KPI" action={<span className="text-xs text-slate-400">Last 30 Days</span>}>
            <div className="grid grid-cols-2 gap-4 h-56">
              <div 
                className="flex flex-col justify-center gap-1 border-r border-b border-slate-100 dark:border-slate-800 p-2"
                title={metrics?.incidentKpi?.mttd?.explanation}
              >
                <span className="text-xs text-slate-500">MTTD (Mean Time to Detect)</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-white flex items-baseline">
                  {formatDuration(metrics?.incidentKpi?.mttd?.value)}
                  {renderTrend(metrics?.incidentKpi?.mttd?.trend30d, metrics?.incidentKpi?.mttd?.trendAvailable)}
                </div>
                {metrics?.incidentKpi?.mttd && renderKpiMetadata(metrics.incidentKpi.mttd)}
              </div>
              <div 
                className="flex flex-col justify-center gap-1 border-b border-slate-100 dark:border-slate-800 p-2"
                title={metrics?.incidentKpi?.mtta?.explanation}
              >
                <span className="text-xs text-slate-500">MTTA (Mean Time to Acknowledge)</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-white flex items-baseline">
                  {formatDuration(metrics?.incidentKpi?.mtta?.value)}
                  {renderTrend(metrics?.incidentKpi?.mtta?.trend30d, metrics?.incidentKpi?.mtta?.trendAvailable)}
                </div>
                {metrics?.incidentKpi?.mtta && renderKpiMetadata(metrics.incidentKpi.mtta)}
              </div>
              <div 
                className="flex flex-col justify-center gap-1 border-r border-slate-100 dark:border-slate-800 p-2"
                title={metrics?.incidentKpi?.mttr?.explanation}
              >
                <span className="text-xs text-slate-500">MTTR (Mean Time to Respond)</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-white flex items-baseline">
                  {formatDuration(metrics?.incidentKpi?.mttr?.value)}
                  {renderTrend(metrics?.incidentKpi?.mttr?.trend30d, metrics?.incidentKpi?.mttr?.trendAvailable)}
                </div>
                {metrics?.incidentKpi?.mttr && renderKpiMetadata(metrics.incidentKpi.mttr)}
              </div>
              <div 
                className="flex flex-col justify-center gap-1 p-2"
                title={metrics?.incidentKpi?.mttc?.explanation}
              >
                <span className="text-xs text-slate-500">MTTC (Mean Time to Contain)</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-white flex items-baseline">
                  {formatDuration(metrics?.incidentKpi?.mttc?.value)}
                  {renderTrend(metrics?.incidentKpi?.mttc?.trend30d, metrics?.incidentKpi?.mttc?.trendAvailable)}
                </div>
                {metrics?.incidentKpi?.mttc && renderKpiMetadata(metrics.incidentKpi.mttc)}
              </div>
            </div>
          </Panel>
          <Panel 
            title="Vulnerability SLA Overview" 
            action={
              (metrics?.vulnerabilitySlaOverview || metrics?.vulnerabilitySla)?.policy?.criticalSlaDays ? (
                <span 
                  className="text-[10px] text-slate-400 dark:text-slate-500 font-medium cursor-help"
                  title={`Policy SLA: Critical ≤ ${(metrics.vulnerabilitySlaOverview || metrics.vulnerabilitySla).policy.criticalSlaDays}d, Due Soon ≥ ${(metrics.vulnerabilitySlaOverview || metrics.vulnerabilitySla).policy.dueSoonThresholdDays}d and ≤ ${(metrics.vulnerabilitySlaOverview || metrics.vulnerabilitySla).policy.criticalSlaDays}d.\nSource: ${(metrics.vulnerabilitySlaOverview || metrics.vulnerabilitySla).source}\n${(metrics.vulnerabilitySlaOverview || metrics.vulnerabilitySla).explanation}`}
                >
                  Policy: Critical ≤ {(metrics.vulnerabilitySlaOverview || metrics.vulnerabilitySla).policy.criticalSlaDays}d ⓘ
                </span>
              ) : undefined
            }
          >
            {(() => {
              const sla = metrics?.vulnerabilitySlaOverview || metrics?.vulnerabilitySla;
              const hasData = sla?.dataAvailable && sla.totalCritical !== null;

              if (!hasData || !sla) {
                return (
                  <div className="flex h-56 flex-col items-center justify-center text-center p-4 text-slate-400 dark:text-slate-500">
                    <span className="text-2xl font-bold mb-1">N/A</span>
                    <span className="text-xs max-w-xs">
                      {sla?.source || "Vulnerability SLA telemetry is currently unavailable"}
                    </span>
                  </div>
                );
              }

              const chartData = [
                { name: "Overdue", value: sla.overdue ?? 0, fill: "#ef4444" },
                { name: "Due Soon", value: sla.dueSoon ?? 0, fill: "#f97316" },
                { name: "Compliant", value: sla.compliant ?? 0, fill: "#22c55e" },
                { name: "Unclassified", value: sla.unclassified ?? 0, fill: "#94a3b8" },
              ].filter(d => d.value > 0);

              return (
                <div className="flex h-56 items-center">
                  <div className="h-full w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={chartData} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={40} 
                          outerRadius={60} 
                          dataKey="value" 
                          stroke="none" 
                        />
                        <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold fill-slate-800 dark:fill-white">
                          {sla.totalCritical !== null ? sla.totalCritical.toLocaleString() : "—"}
                        </text>
                        <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-[10px] fill-slate-500">
                          Total Critical
                        </text>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 flex flex-col gap-2.5 text-xs">
                    {/* 1. Overdue */}
                    <div className="flex justify-between items-center pr-2">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Overdue
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {sla.overdue !== null ? `${sla.overdue} (${sla.overduePct ?? (sla.totalCritical ? Math.round((sla.overdue / sla.totalCritical) * 100) : 0)}%)` : "N/A"}
                      </span>
                    </div>

                    {/* 2. Due Soon */}
                    <div className="flex justify-between items-center pr-2">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span> Due Soon
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {sla.dueSoon !== null ? `${sla.dueSoon} (${sla.dueSoonPct ?? (sla.totalCritical ? Math.round((sla.dueSoon / sla.totalCritical) * 100) : 0)}%)` : "N/A"}
                      </span>
                    </div>

                    {/* 3. In Progress (remediation lifecycle source not integrated yet -> N/A) */}
                    <div className="flex justify-between items-center pr-2" title="Remediation workflow/ticketing data is not currently available from Wazuh telemetry">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span> In Progress
                      </span>
                      <span className="font-semibold text-slate-400 dark:text-slate-500">
                        {sla.inProgress !== null ? `${sla.inProgress}` : "—"}
                      </span>
                    </div>

                    {/* 4. Compliant */}
                    <div className="flex justify-between items-center pr-2">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Compliant
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {sla.compliant !== null ? `${sla.compliant} (${sla.compliantPct ?? (sla.totalCritical ? Math.round((sla.compliant / sla.totalCritical) * 100) : 0)}%)` : "N/A"}
                      </span>
                    </div>
                    {sla.unclassified !== null && sla.unclassified > 0 && (
                      <div className="flex justify-between items-center pr-2" title="Detection age unavailable or incomplete; not counted as compliant">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Unclassified</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{sla.unclassified} ({sla.unclassifiedPct}%)</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span title={(metrics?.vulnerabilitySlaOverview || metrics?.vulnerabilitySla)?.source || "Wazuh/OpenSearch vulnerability telemetry"}>
                Source: Wazuh/OpenSearch telemetry ⓘ
              </span>
              <a href="/dashboard/vulnerability" className="text-brand-blue hover:underline">
                View vulnerability dashboard →
              </a>
            </div>
          </Panel>
        </div>

        {/* Executive risk, threat intelligence, and compliance summaries */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ThreatIntelPanel />
          <Panel title="Risk Register Summary" className="flex h-64 flex-col">
             {risksState.phase === "ready"
               ? risksState.data.items.length === 0
                 ? <PanelEmpty message="No risks have been registered." />
                 : <div className="grid min-h-0 flex-1 grid-cols-1 items-center gap-3 sm:grid-cols-[45%_55%]">
                     <div className="relative mx-auto h-[148px] w-[148px]" aria-label={`Risk register distribution for ${risksState.data.items.length} risks`}>
                       <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie data={riskRegisterDonutDistribution} dataKey="count" nameKey="name" innerRadius={45} outerRadius={68} paddingAngle={2} stroke="none" isAnimationActive={false}>
                             {riskRegisterDonutDistribution.map(bucket => <Cell key={bucket.name} fill={bucket.color} />)}
                           </Pie>
                         </PieChart>
                       </ResponsiveContainer>
                       <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                         <span className="text-3xl font-bold tabular-nums text-slate-800 dark:text-white">{risksState.data.items.length}</span>
                         <span className="text-[10px] font-medium text-slate-400">Total Risks</span>
                       </div>
                     </div>
                     <ul className="min-w-0 space-y-2 text-xs">
                       {riskRegisterDistribution.map(bucket => {
                         const percentage = Math.round(bucket.count / risksState.data.items.length * 100);
                         return <li key={bucket.name} className="flex items-center justify-between gap-2">
                           <span className="flex min-w-0 items-center gap-2 text-slate-600 dark:text-slate-300">
                             <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: bucket.color }} />
                             {bucket.name}
                           </span>
                           <span className="shrink-0 font-semibold tabular-nums text-slate-800 dark:text-slate-100">{bucket.count} <span className="font-normal text-slate-400">({percentage}%)</span></span>
                         </li>;
                       })}
                     </ul>
                   </div>
               : risksState.phase === "loading"
                 ? <PanelEmpty message="Loading risk register..." />
                 : <PanelEmpty message="Risk Register unavailable" />}
             <div className="mt-auto border-t border-slate-100 pt-2 text-right text-xs dark:border-slate-800"><a href="/dashboard/ciso/risks" className="font-medium text-brand-blue hover:underline">View risk register →</a></div>
          </Panel>
          <Panel title="Top Risks" className="h-64 flex flex-col justify-between">
             {risksState.phase === "loading" ? <PanelEmpty message="Loading assessed risks..." />
               : topRisks.length === 0 ? <PanelEmpty message="No assessed risks." />
               : <div className="min-h-0 flex-1 overflow-y-auto">
                   <p className="mb-2 text-[10px] text-slate-400" title="Project-defined dashboard methodology; not an external standard or enterprise policy.">Top Risks ranks assessed risks primarily by residual risk, followed by inherent risk, severity, and due date.</p>
                   <ol className="divide-y divide-slate-100 dark:divide-slate-800">{topRisks.map(risk => <li key={risk.id} className="py-2 first:pt-0">
                     <div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{risk.riskCode}</div><div className="truncate text-[11px] text-slate-500" title={risk.title}>{risk.title}</div></div><span className="rounded bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">{risk.residualRisk}</span></div>
                     <div className="mt-1 flex gap-3 text-[10px] text-slate-500"><span>Treatment: {risk.treatmentStatus ?? "N/A"}</span><span>Due: {risk.dueDate ?? "N/A"}</span></div>
                   </li>)}</ol>
                 </div>}
             <div className="text-right text-xs"><a href="/dashboard/ciso/risks" className="text-brand-blue hover:underline">Review assessed risks →</a></div>
          </Panel>
        </div>
        
        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <ComplianceOverviewPanel />
          <Panel
            title="Third-Party Risk Overview"
            className="flex h-full min-h-[320px] flex-col xl:h-[340px]"
            action={thirdPartiesState.phase === "ready" && thirdPartiesState.data.summary.highestAssessedRisk
              ? <span className="whitespace-nowrap rounded-full bg-orange-50 px-2 py-1 text-[10px] font-semibold text-orange-700 dark:bg-orange-900/20 dark:text-orange-300" title="Highest risk rating among assessed third parties">Highest assessed: {thirdPartiesState.data.summary.highestAssessedRisk}</span>
              : undefined}
          >
             {thirdPartiesState.phase === "ready" ? thirdPartiesState.data.summary.totalVendors === 0
               ? <PanelEmpty message="No third parties have been registered." />
               : <div className="grid min-h-0 flex-1 grid-cols-1 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_112px_minmax(0,1fr)]">
                   <dl className="min-w-0 divide-y divide-slate-100 text-[10px] dark:divide-slate-800">
                     {[
                       ["Total Vendors", thirdPartiesState.data.summary.totalVendors],
                       ["Assessed Vendors", thirdPartiesState.data.summary.assessed],
                       ["Needs Assessment", thirdPartiesState.data.summary.needsAssessment],
                       ["Assessment Coverage", `${thirdPartiesState.data.summary.assessmentCoveragePct}%`],
                     ].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-2 py-1.5 first:pt-0 last:pb-0">
                       <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
                       <dd className="shrink-0 text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-100">{value}</dd>
                     </div>)}
                   </dl>

                   <div className="relative mx-auto h-[112px] w-[112px]" aria-label={`Third-party assessment distribution for ${thirdPartiesState.data.summary.totalVendors} vendors`}>
                     <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie data={thirdPartyDonutDistribution} dataKey="count" nameKey="name" innerRadius={34} outerRadius={52} paddingAngle={2} stroke="none" isAnimationActive={false}>
                           {thirdPartyDonutDistribution.map(bucket => <Cell key={bucket.name} fill={bucket.color} />)}
                         </Pie>
                       </PieChart>
                     </ResponsiveContainer>
                     <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                       <span className="text-2xl font-bold tabular-nums text-slate-800 dark:text-white">{thirdPartiesState.data.summary.totalVendors}</span>
                       <span className="text-[9px] font-medium text-slate-400">Total Vendors</span>
                     </div>
                   </div>

                   <ul className="min-w-0 space-y-1.5 text-[10px]">
                     {thirdPartyDistribution.map(bucket => {
                       const percentage = Math.round(bucket.count / thirdPartiesState.data.summary.totalVendors * 100);
                       return <li key={bucket.name} className="flex items-center justify-between gap-1.5">
                         <span className="flex min-w-0 items-center gap-1.5 text-slate-600 dark:text-slate-300">
                           <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: bucket.color }} />
                           {bucket.name}
                         </span>
                         <span className="shrink-0 font-semibold tabular-nums text-slate-800 dark:text-slate-100">{bucket.count} <span className="font-normal text-slate-400">({percentage}%)</span></span>
                       </li>;
                     })}
                   </ul>
                 </div>
               : thirdPartiesState.phase === "loading" ? <PanelEmpty message="Loading third-party register..." /> : <PanelEmpty message="N/A — third-party register unavailable" />}
             <div className="mt-auto border-t border-slate-100 pt-3 text-right text-xs dark:border-slate-800"><a href="/dashboard/ciso/third-parties" className="font-medium text-brand-blue hover:underline">View third-party risk →</a></div>
          </Panel>
          <AiCisoBriefingPanel />
        </div>
      </main>
    </>
  );
}
