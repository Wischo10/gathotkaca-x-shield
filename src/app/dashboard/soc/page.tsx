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
import type { AttackCountryDetection, IncidentsBySeverity, SocMetric, SocMetrics, SocTelemetry, TopIocDetection } from "@/types/soc";

const kpis = [
  { label: "Wazuh Alert Documents", icon: "pulse" },
  { label: "Total Alerts", icon: "bell" },
  { label: "Incidents", icon: "shield" },
  { label: "Critical Alerts", icon: "warning" },
  { label: "MTTD", icon: "clock" },
  { label: "MTT Response Start", icon: "refresh" },
] as const;

export default function SocDashboardPage() {
  const openSidebar = useSidebarToggle();
  const metrics = useApiResult<SocMetrics>("/api/soc/metrics?wazuh=false");
  const telemetryState = useApiResult<SocTelemetry>("/api/soc/telemetry");
  const incidentSeverityState = useApiResult<IncidentsBySeverity>("/api/soc/incidents-by-severity");
  const topIocState = useApiResult<TopIocDetection[]>("/api/soc/top-ioc-detections");
  const attackCountryState = useApiResult<AttackCountryDetection[]>("/api/soc/attack-countries");
  const data = metrics.phase === "ready" ? metrics.data : null;
  const telemetry = telemetryState.phase === "ready" ? telemetryState.data : undefined;
  const incidentSeverity = incidentSeverityState.phase === "ready" ? incidentSeverityState.data : undefined;
  const metricCards: Array<{ label: string; icon: typeof kpis[number]["icon"]; metric: SocMetric | undefined; duration?: boolean }> = [
    { ...kpis[0], metric: telemetry ? { value: telemetry.totalEvents, source: "Wazuh Indexer alerts index" } : undefined },
    { ...kpis[1], metric: telemetry ? { value: telemetry.totalAlerts, source: "Wazuh Indexer alerts index" } : undefined },
    { ...kpis[2], metric: data?.incidents },
    { ...kpis[3], metric: telemetry ? { value: telemetry.criticalAlerts, source: "Wazuh Indexer alerts index; rule.level >= 14" } : undefined },
    { ...kpis[4], metric: data?.mttdMinutes, duration: true },
    { ...kpis[5], metric: data?.meanTimeToResponseStartMinutes, duration: true },
  ];
  return <>
    <Topbar title="SOC Dashboard" subtitle="Monitoring, detection, and response overview" onMenuClick={openSidebar} />
    <main className="flex-1 space-y-4 bg-slate-50 p-4 dark:bg-slate-950 sm:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">{metricCards.map((kpi) => <StatCard key={kpi.label} label={kpi.label} value={formatMetric(kpi.metric, kpi.duration)} helper={metricHelper(kpi.label, kpi.metric, metrics.phase === "loading" || telemetryState.phase === "loading")} badge={kpi.metric?.provenance === "DEMO" ? "Demo Data" : undefined} icon={<MetricIcon name={kpi.icon} />} />)}</div>

      <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
        <div className="h-full xl:col-span-3"><AlertsBySeverityPanel data={telemetry?.severity} loading={telemetryState.phase === "loading"} unavailable={telemetryState.phase === "error"} /></div>
        <div className="h-full xl:col-span-3"><AlertsTrendPanel telemetry={telemetry} loading={telemetryState.phase === "loading"} unavailable={telemetryState.phase === "error"} /></div>
        <div className="h-full xl:col-span-3"><AlertsByStatusPanel demo={data?.workflowDemo ?? null} /></div>
        <div className="h-full xl:col-span-3"><AlertAgingPanel telemetry={telemetry} loading={telemetryState.phase === "loading"} unavailable={telemetryState.phase === "error"} /></div>
      </div>

      <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
        <div className="h-full xl:col-span-3"><IncidentsBySeverityPanel data={incidentSeverity} demo={data?.workflowDemo ?? null} loading={incidentSeverityState.phase === "loading"} unavailable={incidentSeverityState.phase === "error"} /></div>
        <div className="h-full xl:col-span-3"><MitreTacticsPanel telemetry={telemetry} loading={telemetryState.phase === "loading"} unavailable={telemetryState.phase === "error"} /></div>
        <div className="h-full xl:col-span-3"><TopRulesPanel telemetry={telemetry} loading={telemetryState.phase === "loading"} unavailable={telemetryState.phase === "error"} /></div>
        <div className="h-full xl:col-span-3"><TopIocDetectionsPanel data={topIocState.phase === "ready" ? topIocState.data : []} loading={topIocState.phase === "loading"} unavailable={topIocState.phase === "error"} /></div>
      </div>

      <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
        <div className="h-full md:col-span-2 xl:col-span-6"><LiveEventsPanel telemetry={telemetry} loading={telemetryState.phase === "loading"} unavailable={telemetryState.phase === "error"} /></div>
        <div className="h-full xl:col-span-3"><AttackCountryPanel data={attackCountryState.phase === "ready" ? attackCountryState.data : []} loading={attackCountryState.phase === "loading"} unavailable={attackCountryState.phase === "error"} /></div>
        <div className="h-full xl:col-span-3"><DetectionSourcesPanel telemetry={telemetry} loading={telemetryState.phase === "loading"} unavailable={telemetryState.phase === "error"} /></div>
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
    if (metric.provenance === "DEMO") return label === "MTTD"
      ? "Calculated from demo occurred-to-detected lifecycle timestamps"
      : "Calculated from demo detected-to-response-start timestamps";
    if (label === "Wazuh Alert Documents") return "Documents in the Wazuh alert index · Last 7 Days";
    if (label === "Total Alerts") return "Alert documents classified by rule.level · Last 7 Days";
    if (label === "Incidents") {
      const freshness = metric.lastVerifiedAt ? `Last verified: ${formatUtcTimestamp(metric.lastVerifiedAt)}` : "Freshness unavailable";
      return `${metric.availability === "stale" ? "Stale · " : ""}Persisted verified incident data · ${freshness}`;
    }
    if (label === "MTT Response Start") return "Average verified detection to recorded response start";
    return "Live data · Last 7 Days";
  }
  if (loading) return "Loading real data…";
  if (label === "MTTD") return "Not measurable · Occurrence timestamp unavailable";
  if (label === "MTT Response Start") return "No valid detection/response-start pairs";
  if (label === "Incidents") return metric?.reason ?? "Persisted verified incident data unavailable";
  return "Data unavailable";
}

function formatUtcTimestamp(value: string): string {
  return new Date(value).toLocaleString([], {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC", timeZoneName: "short",
  });
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
