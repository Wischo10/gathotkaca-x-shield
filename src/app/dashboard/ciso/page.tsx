"use client";

import { Panel } from "@/components/ui/Panel";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/context/sidebar-context";
import { LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ThreatIntelPanel } from "@/components/dashboard/ThreatIntelPanel";
import { ComplianceOverviewPanel } from "@/components/dashboard/ComplianceOverviewPanel";
import { IncidentResponsePanel } from "@/components/dashboard/IncidentResponsePanel";

import { useApiResult } from "@/hooks/useApiResult";
import type { CisoMetricsData } from "@/types/ciso";

const Sparkline = ({ color, hasData }: { color: string; hasData: boolean }) => {
  if (!hasData) {
    return (
      <div className="h-10 w-full mt-2 flex items-center justify-center">
        <div className="w-full border-t border-dashed border-slate-200 dark:border-slate-800" />
      </div>
    );
  }
  const sparklineData = Array.from({ length: 7 }, (_, i) => ({ value: 30 + (i * 7) % 40 }));
  return (
    <div className="h-10 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sparklineData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: number | null | undefined;
  max?: number;
  unit?: string;
  trend30d: number | null | undefined;
  trendAvailable?: boolean;
  trendColor: "blue" | "red" | "orange" | "purple" | "green" | "teal";
  sparklineColor: string;
  icon: string;
  tooltip?: string;
}

const MetricCard = ({
  title,
  value,
  max,
  unit,
  trend30d,
  trendAvailable,
  trendColor,
  sparklineColor,
  icon,
  tooltip,
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
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <div className={`flex h-6 w-6 items-center justify-center rounded-full ${style.bg} ${style.text}`}>
          {icon}
        </div>
        <span className="truncate">{title}</span>
        <span className="ml-auto text-[10px] opacity-50" title={tooltip || title}>
          ⓘ
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${hasValue ? "text-slate-800 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
          {hasValue ? `${value?.toLocaleString()}${unit || ""}` : "N/A"}
        </span>
        {hasValue && max && <span className="text-xs text-slate-500">/{max}</span>}
      </div>
      <div className={`mt-1 text-[10px] font-medium ${isTrendValid ? style.subText : "text-slate-400"}`}>
        {isTrendValid ? (
          <>
            {trend30d > 0 ? "↑ " : trend30d < 0 ? "↓ " : "→ "}
            {Math.abs(trend30d)}% vs last 30 days
          </>
        ) : (
          "—"
        )}
      </div>
      <Sparkline color={sparklineColor} hasData={hasValue} />
    </div>
  );
};

export default function CISODashboardPage() {
  const openSidebar = useSidebarToggle();
  const metricsState = useApiResult<CisoMetricsData>("/api/ciso/metrics");
  const metrics = metricsState.phase === "ready" ? metricsState.data : null;

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return "Updating...";
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSec < 60) return "Updated just now";
    const diffMin = Math.floor(diffSec / 60);
    return `Updated ${diffMin} min ago`;
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
            {metrics?.updatedAt ? formatRelativeTime(metrics.updatedAt) : "Updating telemetry..."}
          </span>
        </div>

        {/* ROW 1: Real Telemetry & Data-Driven Metric Cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          <MetricCard
            title="Security Posture Score"
            value={metrics?.securityPostureScore.value}
            max={metrics?.securityPostureScore.max}
            trend30d={metrics?.securityPostureScore.trend30d}
            trendAvailable={metrics?.securityPostureScore.trendAvailable}
            trendColor="blue"
            sparklineColor="#3b82f6"
            icon="🛡️"
            tooltip={metrics?.securityPostureScore.details?.explanation || metrics?.securityPostureScore.source}
          />
          <MetricCard
            title="Total Risk Score"
            value={metrics?.totalRiskScore.value}
            max={metrics?.totalRiskScore.max}
            trend30d={metrics?.totalRiskScore.trend30d}
            trendAvailable={metrics?.totalRiskScore.trendAvailable}
            trendColor="red"
            sparklineColor="#ef4444"
            icon="🚨"
            tooltip={metrics?.totalRiskScore.details?.explanation || metrics?.totalRiskScore.source}
          />
          <MetricCard
            title="Active Incidents"
            value={metrics?.activeIncidents.value}
            trend30d={metrics?.activeIncidents.trend30d}
            trendAvailable={metrics?.activeIncidents.trendAvailable}
            trendColor="orange"
            sparklineColor="#f97316"
            icon="⚠️"
            tooltip={metrics?.activeIncidents.source}
          />
          <MetricCard
            title="Critical Vulnerabilities"
            value={metrics?.criticalVulnerabilities.value}
            trend30d={metrics?.criticalVulnerabilities.trend30d}
            trendAvailable={metrics?.criticalVulnerabilities.trendAvailable}
            trendColor="purple"
            sparklineColor="#a855f7"
            icon="👾"
            tooltip={metrics?.criticalVulnerabilities.source}
          />
          <MetricCard
            title="Compliance Score"
            value={metrics?.complianceScore.value}
            unit={metrics?.complianceScore.unit || "%"}
            trend30d={metrics?.complianceScore.trend30d}
            trendAvailable={metrics?.complianceScore.trendAvailable}
            trendColor="green"
            sparklineColor="#22c55e"
            icon="✅"
            tooltip={metrics?.complianceScore.details?.explanation || metrics?.complianceScore.source}
          />
          <MetricCard
            title="Risk Treatment Progress"
            value={metrics?.riskTreatmentProgress.value}
            unit={metrics?.riskTreatmentProgress.unit || "%"}
            trend30d={metrics?.riskTreatmentProgress.trend30d}
            trendAvailable={metrics?.riskTreatmentProgress.trendAvailable}
            trendColor="teal"
            sparklineColor="#14b8a6"
            icon="📈"
            tooltip={metrics?.riskTreatmentProgress.details?.explanation || metrics?.riskTreatmentProgress.source}
          />
        </div>

        {/* ROW 2: Analytical Panels */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel title="Security Posture Overview" action={<span className="text-xs text-slate-400">30 Days</span>}>
            <div className="h-56 flex items-center justify-center text-slate-400 text-sm bg-slate-100 dark:bg-slate-800 rounded">
              [Radar Chart Placeholder: Identify, Protect, Detect, Respond, Recover]
            </div>
            <div className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View full security posture →</div>
          </Panel>
          <Panel title="Incident KPI" action={<select className="text-xs bg-transparent"><option>Last 30 Days</option></select>}>
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
              </div>
            </div>
            <div className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View incident performance →</div>
          </Panel>
          <Panel 
            title="Vulnerability SLA Overview" 
            action={
              (metrics?.vulnerabilitySlaOverview || metrics?.vulnerabilitySla)?.policy?.criticalSlaDays ? (
                <span 
                  className="text-[10px] text-slate-400 dark:text-slate-500 font-medium cursor-help"
                  title={`Policy SLA: Critical ≤ ${(metrics.vulnerabilitySlaOverview || metrics.vulnerabilitySla).policy.criticalSlaDays}d, Due Soon ≤ ${(metrics.vulnerabilitySlaOverview || metrics.vulnerabilitySla).policy.dueSoonThresholdDays}d.\nSource: ${(metrics.vulnerabilitySlaOverview || metrics.vulnerabilitySla).source}\n${(metrics.vulnerabilitySlaOverview || metrics.vulnerabilitySla).explanation}`}
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
                  </div>
                </div>
              );
            })()}
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span title={(metrics?.vulnerabilitySlaOverview || metrics?.vulnerabilitySla)?.source || "Wazuh/OpenSearch vulnerability telemetry"}>
                Source: Wazuh/OpenSearch telemetry ⓘ
              </span>
              <span className="text-brand-blue hover:underline cursor-pointer">
                View vulnerability dashboard →
              </span>
            </div>
          </Panel>
        </div>

        {/* ROW 3: Active Incident Lifecycle Actions */}
        <div className="grid grid-cols-1 gap-4">
          <IncidentResponsePanel onActionCompleted={metricsState.reload} />
        </div>

        {/* ROW 4 & 5 (Simplified panels matching headers) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ThreatIntelPanel />
          <Panel title="Risk Register Summary" className="h-64 flex flex-col justify-between">
             <div className="text-sm text-slate-400 p-4">[Risk Register Donut Chart]</div>
             <div className="text-right text-xs text-brand-blue hover:underline cursor-pointer">View risk register →</div>
          </Panel>
          <Panel title="Top Risks" className="h-64 flex flex-col justify-between">
             <div className="text-sm text-slate-400 p-4">[Top Risks Table]</div>
             <div className="text-right text-xs text-brand-blue hover:underline cursor-pointer">View all risks →</div>
          </Panel>
        </div>
        
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ComplianceOverviewPanel />
          <Panel title="Third-Party Risk Overview" className="h-64 flex flex-col justify-between">
             <div className="text-sm text-slate-400 p-4">[Vendor Risk Donut Chart]</div>
             <div className="text-right text-xs text-brand-blue hover:underline cursor-pointer">View third-party risk →</div>
          </Panel>
          <Panel title="AI CISO Briefing" className="h-64 flex flex-col justify-between" action={<span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">✨ Powered by AI</span>}>
             <div className="text-sm text-slate-400 p-4">[AI Summary Bullets]</div>
             <div className="text-right text-xs text-brand-blue hover:underline cursor-pointer">View full AI briefing →</div>
          </Panel>
        </div>
      </main>
    </>
  );
}
