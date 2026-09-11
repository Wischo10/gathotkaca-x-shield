"use client";

import type { ReactNode } from "react";
import { useSidebarToggle } from "@/components/layout/SidebarToggle";
import { AlertsBySeverityPanel } from "@/components/dashboard/AlertsBySeverityPanel";
import { AlertsTrendPanel } from "@/components/dashboard/AlertsTrendPanel";
import { LiveEventsPanel } from "@/components/dashboard/LiveEventsPanel";
import { StatCard } from "@/components/dashboard/StatCard";
import { TopRulesPanel } from "@/components/dashboard/TopRulesPanel";
import { AlertAgingPanel, AlertsByStatusPanel, AttackCountryPanel, DetectionSourcesPanel, IncidentsBySeverityPanel, MitreTacticsPanel, TopIocDetectionsPanel } from "@/components/dashboard/SocUnavailablePanels";
import { Topbar } from "@/components/layout/Topbar";
import { useApiResult } from "@/hooks/useApiResult";
import type { IncidentsBySeverity, SocMetric, SocMetrics, SocTelemetry } from "@/types/soc";

const kpis = [
  { label: "Total Events", icon: "pulse" },
  { label: "Total Alerts", icon: "bell" },
  { label: "Incidents", icon: "shield" },
  { label: "Critical Alerts", icon: "warning" },
  { label: "MTTD", icon: "clock" },
  { label: "MTTR", icon: "refresh" },
] as const;

export default function SocDashboardPage() {
  const openSidebar = useSidebarToggle();
  const metrics = useApiResult<SocMetrics>("/api/soc/metrics?wazuh=false");
  const telemetryState = useApiResult<SocTelemetry>("/api/soc/telemetry");
  const incidentSeverityState = useApiResult<IncidentsBySeverity>("/api/soc/incidents-by-severity");
  const data = metrics.phase === "ready" ? metrics.data : null;
  const telemetry = telemetryState.phase === "ready" ? telemetryState.data : undefined;
  const incidentSeverity = incidentSeverityState.phase === "ready" ? incidentSeverityState.data : undefined;
  const metricCards: Array<{ label: string; icon: typeof kpis[number]["icon"]; metric: SocMetric | undefined; duration?: boolean }> = [
    { ...kpis[0], metric: telemetry ? { value: telemetry.totalEvents, source: "Wazuh Indexer alerts index" } : undefined },
    { ...kpis[1], metric: telemetry ? { value: telemetry.totalAlerts, source: "Wazuh Indexer alerts index" } : undefined },
    { ...kpis[2], metric: data?.incidents },
    { ...kpis[3], metric: telemetry ? { value: telemetry.criticalAlerts, source: "Wazuh Indexer alerts index; rule.level >= 14" } : undefined },
    { ...kpis[4], metric: data?.mttdMinutes, duration: true },
    { ...kpis[5], metric: data?.mttrMinutes, duration: true },
  ];
  return <>
    <Topbar title="SOC Dashboard" subtitle="Real-time monitoring, detection, and response overview" onMenuClick={openSidebar} />
    <main className="flex-1 space-y-4 bg-slate-50 p-4 dark:bg-slate-950 sm:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">{metricCards.map((kpi) => <StatCard key={kpi.label} label={kpi.label} value={formatMetric(kpi.metric, kpi.duration)} helper={metricHelper(kpi.label, kpi.metric, metrics.phase === "loading" || telemetryState.phase === "loading")} icon={<MetricIcon name={kpi.icon} />} />)}</div>

      <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
        <div className="h-full xl:col-span-3"><AlertsBySeverityPanel data={telemetry?.severity} unavailable={telemetryState.phase === "error"} /></div>
        <div className="h-full xl:col-span-3"><AlertsTrendPanel telemetry={telemetry} /></div>
        <div className="h-full xl:col-span-3"><AlertsByStatusPanel /></div>
        <div className="h-full xl:col-span-3"><AlertAgingPanel telemetry={telemetry} /></div>
      </div>

      <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
        <div className="h-full xl:col-span-3"><IncidentsBySeverityPanel data={incidentSeverity} unavailable={incidentSeverityState.phase === "error"} /></div>
        <div className="h-full xl:col-span-3"><MitreTacticsPanel telemetry={telemetry} /></div>
        <div className="h-full xl:col-span-3"><TopRulesPanel telemetry={telemetry} /></div>
        <div className="h-full xl:col-span-3"><TopIocDetectionsPanel /></div>
      </div>

      <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
        <div className="h-full md:col-span-2 xl:col-span-6"><LiveEventsPanel telemetry={telemetry} /></div>
        <div className="h-full xl:col-span-3"><AttackCountryPanel /></div>
        <div className="h-full xl:col-span-3"><DetectionSourcesPanel /></div>
      </div>
    </main>
  </>;
}

function formatMetric(metric: SocMetric | undefined, duration = false): string {
  if (metric?.value === null || metric?.value === undefined) return "N/A";
  if (!duration) return metric.value.toLocaleString();
  const minutes = Math.round(metric.value);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
}

function metricHelper(label: string, metric: SocMetric | undefined, loading: boolean): string {
  if (metric?.value !== null && metric?.value !== undefined) {
    return label === "Incidents" ? "Verified data · Last 7 Days" : "Live data · Last 7 Days";
  }
  if (loading) return "Loading real data…";
  if (label === "MTTD") return "Occurrence timestamp unavailable";
  if (label === "MTTR") return "Awaiting response lifecycle data";
  return "Data unavailable";
}

function MetricIcon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    pulse: <path d="M3 12h4l2-6 4 12 2-6h6" />,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    shield: <path d="M12 3 5 6v5c0 4.6 2.8 8.1 7 10 4.2-1.9 7-5.4 7-10V6l-7-3Z" />,
    warning: <><path d="m12 3 9 17H3L12 3Z" /><path d="M12 9v4m0 3h.01" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    refresh: <><path d="M20 7v5h-5" /><path d="M19 12a7 7 0 1 0-2 5" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
