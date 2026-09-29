"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel } from "@/components/ui/Panel";
import { useApiResult } from "@/hooks/useApiResult";
import type { MsspOverviewData } from "@/types/mssp";
import type { Severity } from "@/types/soc";

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};
const CLIENT_OVERVIEW_PAGE_SIZE = 5;
const pageButtonClass = "rounded-md border border-slate-200 px-2.5 py-1 text-[10px] font-medium text-slate-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700";

export function MsspOverview() {
  const state = useApiResult<MsspOverviewData>("/api/mssp/overview");

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-white">Overview</h1>
          <p className="mt-1 text-sm text-slate-500">Operational visibility from integrated security sources.</p>
        </div>
        <div className="text-right">
          {state.phase === "ready" && state.data.sourceMode !== "REAL" ? <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">{state.data.sourceMode === "MIXED" ? "Mixed: Live Security Telemetry + Demo Enterprise Data" : "Demo Enterprise Data · Live Security Sources Unavailable"}</span> : <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-blue dark:border-blue-900 dark:bg-blue-950/40">Scope: All Integrated Security Telemetry</span>}
          <p className="mt-1 text-[10px] text-slate-400">Tenant attribution is not yet configured · Last 7 days</p>
        </div>
      </header>

      {state.phase === "loading" ? (
        <PageState message="Loading integrated security telemetry..." />
      ) : state.phase === "error" ? (
        <PageState message="MSSP overview sources are unavailable." error />
      ) : state.phase === "empty" ? (
        <PageState message="No overview data is available." />
      ) : (
        <OverviewContent data={state.data} />
      )}
    </div>
  );
}

function OverviewContent({ data }: { data: MsspOverviewData }) {
  const [clientPage, setClientPage] = useState(1);
  const telemetry = data.telemetry.status === "available" ? data.telemetry.data : null;
  const incidents = data.incidents.status === "available" ? data.incidents.data : null;
  const demo = data.demo.status === "available" ? data.demo.data : null;
  const recentIncidentProvenance = !incidents ? "UNAVAILABLE" as const : incidents.recent.length ? "REAL" as const : demo ? "DEMO" as const : undefined;
  const severityData = telemetry
    ? (["critical", "high", "medium", "low"] as const).map((key) => ({
        name: key[0].toUpperCase() + key.slice(1),
        value: telemetry.severity[key],
        color: SEVERITY_COLORS[key],
      }))
    : [];
  const trendData = telemetry?.trend.map((item) => ({
    ...item,
    total: item.critical + item.high + item.medium + item.low,
    day: new Date(item.timestamp).toLocaleDateString([], { month: "short", day: "numeric", timeZone: "UTC" }),
  })) ?? [];
  const clientPageCount = Math.max(1, Math.ceil((demo?.clients.length ?? 0) / CLIENT_OVERVIEW_PAGE_SIZE));
  const currentClientPage = Math.min(clientPage, clientPageCount);
  const clientRangeStart = demo?.clients.length ? (currentClientPage - 1) * CLIENT_OVERVIEW_PAGE_SIZE + 1 : 0;
  const clientRangeEnd = demo ? Math.min(currentClientPage * CLIENT_OVERVIEW_PAGE_SIZE, demo.clients.length) : 0;
  const visibleClients = demo?.clients.slice(clientRangeStart - 1, clientRangeEnd) ?? [];

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <KpiCard title="Total Clients" value={demo?.clients.length} provenance={demo ? "DEMO" : undefined} source="MSSP Demo Provider" reason="Client model not configured" />
        <KpiCard title="Active Services" value={demo?.activeServices} provenance={demo ? "DEMO" : undefined} source="MSSP Demo Provider" reason="Service catalog not configured" />
        <KpiCard
          title="Alert Documents"
          value={telemetry?.totalEvents}
          source="Wazuh / OpenSearch · Last 7 days"
          provenance={telemetry ? "REAL" : undefined}
          reason="Wazuh telemetry unavailable"
        />
        <KpiCard title="Open Incidents" value={demo?.openIncidents} provenance={demo ? "DEMO" : undefined} source="Demo incident workflow" reason="Workflow status not available" />
        <KpiCard title="MTTR" value={demo ? `${demo.mttrMinutes} min` : undefined} provenance={demo ? "DEMO" : undefined} source="Demo resolved workflow records" reason="Resolution lifecycle not available" />
        <KpiCard title="Service Uptime" value={demo ? `${demo.serviceUptimePercent.toFixed(2)}%` : undefined} provenance={demo ? "DEMO" : undefined} source="Demo service availability" reason="Monitoring source not configured" />
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-3">
          <Panel title="Alerts by Severity" action={<SourceBadge available={Boolean(telemetry)} />}>
            {telemetry ? (
              <div className="flex min-h-52 flex-col justify-center">
                <div className="relative h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={severityData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={58} strokeWidth={0}>
                        {severityData.map((item) => <Cell key={item.name} fill={item.color} />)}
                      </Pie>
                      <Tooltip formatter={(value) => Number(value).toLocaleString()} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-slate-800 dark:text-white">{telemetry.severity.totalAlerts.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-400">classified alerts</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {severityData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1.5 text-slate-500"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <SourceNote text="Wazuh / OpenSearch · All integrated telemetry" />
              </div>
            ) : <Unavailable reason="Wazuh telemetry unavailable" />}
          </Panel>
        </div>

        <div className="xl:col-span-2">
          <Panel title="Incidents by Status" action={<SourceBadge provenance={demo ? "DEMO" : undefined} />}>
            {demo ? <DistributionDonut rows={demo.incidentStatuses.map((item) => ({ label: item.status, value: item.count }))} note="Demo incident workflow" /> : <Unavailable reason="Incident workflow status is not available" />}
          </Panel>
        </div>

        <div className="xl:col-span-4">
          <Panel title="Alerts Trend" action={<SourceBadge available={Boolean(telemetry)} />}>
            {telemetry ? (
              <div className="flex min-h-52 flex-col justify-center">
                {trendData.length ? (
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ left: -18, right: 4, top: 8 }}>
                        <defs><linearGradient id="msspAlertTrend" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.32} /><stop offset="100%" stopColor="#2563eb" stopOpacity={0.03} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 9 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 9 }} />
                        <Tooltip formatter={(value) => Number(value).toLocaleString()} />
                        <Area type="monotone" dataKey="total" stroke="#2563eb" fill="url(#msspAlertTrend)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : <Empty message="No alert documents in this period." />}
                <SourceNote text="Wazuh / OpenSearch · UTC · Last 7 days" />
              </div>
            ) : <Unavailable reason="Wazuh telemetry unavailable" />}
          </Panel>
        </div>

        <div className="xl:col-span-3">
          <Panel title="Top Clients by Open Alerts" action={<SourceBadge provenance={demo ? "DEMO" : undefined} />}>
            {demo ? <DistributionList rows={demo.clients.slice().sort((a, b) => b.openAlerts - a.openAlerts).slice(0, 5).map((client) => ({ label: client.name, value: client.openAlerts }))} note="Synthetic workflow only · Not Wazuh attribution" /> : <Unavailable reason="Client-to-telemetry mapping not configured" />}
          </Panel>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <Panel title="Client Overview" action={<SourceBadge provenance={demo ? "DEMO" : undefined} />}>
            <div className="overflow-x-auto">
              <table className="min-w-[850px] w-full text-left text-[10px]">
                <thead className="border-b border-slate-200 text-slate-400 dark:border-slate-800">
                  <tr>{["Client Name", "Services", "Open Alerts", "Open Incidents", "MTTR", "Risk Score", "Service Uptime", "Status", "Last Activity"].map((heading) => <th key={heading} className="px-2 py-1 font-semibold">{heading}</th>)}</tr>
                </thead>
                <tbody>{demo ? visibleClients.map((client) => <tr key={client.id} className="border-b border-slate-100 dark:border-slate-800"><td className="px-2 py-1 font-medium" title={client.id}>{client.name}</td><td className="px-2 py-1">{client.services}</td><td className="px-2 py-1">{client.openAlerts}</td><td className="px-2 py-1">{client.openIncidents}</td><td className="px-2 py-1">{client.mttrMinutes} min</td><td className="px-2 py-1">{client.riskScore}</td><td className="px-2 py-1">{client.serviceUptimePercent.toFixed(2)}%</td><td className="px-2 py-1">{client.status}</td><td className="whitespace-nowrap px-2 py-1 text-slate-500">{formatUtc(client.lastActivity)}</td></tr>) : <tr><td colSpan={9}><Unavailable reason="Client attribution is not configured. Authoritative tenant mapping is required before client-level metrics can be displayed." compact /></td></tr>}</tbody>
              </table>
            </div>
            {demo && <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-slate-400"><span>Showing {clientRangeStart}–{clientRangeEnd} of {demo.clients.length} clients</span><div className="flex gap-1"><button disabled={currentClientPage === 1} onClick={() => setClientPage(Math.max(1, currentClientPage - 1))} className={pageButtonClass}>Previous</button><button disabled={currentClientPage === clientPageCount} onClick={() => setClientPage(Math.min(clientPageCount, currentClientPage + 1))} className={pageButtonClass}>Next</button></div></div>}
          </Panel>
        </div>
        <div className="xl:col-span-2">
          <Panel title="Services by Type" action={<SourceBadge provenance={demo ? "DEMO" : undefined} />}>
            {demo ? <DistributionDonut rows={demo.servicesByType.map((item) => ({ label: item.type, value: item.count }))} note={`${demo.activeServices} demo service assignments`} /> : <Unavailable reason="Service catalog not configured" />}
          </Panel>
        </div>
        <div className="xl:col-span-3">
          <Panel title="SLA Compliance" action={<SourceBadge provenance={demo ? "DEMO" : undefined} />}>
            {demo ? <SlaDemo sla={demo.sla} /> : <Unavailable reason="SLA source not configured" />}
          </Panel>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <Panel title="Recent Alerts" action={<SourceBadge available={Boolean(telemetry)} />}>
            {telemetry ? (
              telemetry.liveEvents.length ? (
                <div className="flex min-h-52 flex-col">
                  <div className="flex-1 overflow-x-auto">
                    <table className="min-w-[560px] w-full text-left text-[10px]">
                      <thead className="border-b border-slate-200 text-slate-400 dark:border-slate-800"><tr><th className="py-2 pr-2">Time</th><th className="px-2 py-2">Alert / Rule</th><th className="px-2 py-2">Severity</th><th className="px-2 py-2">Source</th><th className="py-2 pl-2">Agent</th></tr></thead>
                      <tbody>{telemetry.liveEvents.slice(0, 5).map((alert) => <tr key={alert.id} className="border-b border-slate-100 dark:border-slate-800"><td className="whitespace-nowrap py-2 pr-2 text-slate-400">{formatUtc(alert.time)}</td><td className="max-w-44 truncate px-2 py-2 font-medium" title={alert.event}>{alert.event || `Rule ${alert.rule}`}</td><td className="capitalize px-2 py-2">{alert.severity}</td><td className="max-w-28 truncate px-2 py-2 text-slate-500" title={alert.assetOrUser}>{alert.assetOrUser || "—"}</td><td className="max-w-28 truncate py-2 pl-2 text-slate-500" title={alert.source}>{alert.source || "—"}</td></tr>)}</tbody>
                    </table>
                  </div>
                  <PanelLink href="/dashboard/mssp/alerts" label="View All" />
                </div>
              ) : <Empty message="No Wazuh alert documents in this period." />
            ) : <Unavailable reason="Wazuh telemetry unavailable" />}
          </Panel>
        </div>

        <div className="xl:col-span-3">
          <Panel title="Recent Incidents" action={<SourceBadge provenance={recentIncidentProvenance} />}>
            {!incidents ? <Unavailable reason="Persisted incident source unavailable" /> : incidents.recent.length ? (
              <div className="flex min-h-52 flex-col">
                <div className="flex-1 space-y-1">
                  {incidents.recent.slice(0, 5).map((incident) => (
                    <div key={incident.incidentId} className="grid grid-cols-[6rem_1fr_auto] gap-2 border-b border-slate-100 py-2 text-[10px] dark:border-slate-800">
                      <span className="text-slate-400">{formatUtc(incident.detectedAt)}</span>
                      <span className="truncate font-medium" title={incident.incidentId}>{incident.incidentId}</span>
                      <span className="capitalize text-slate-500">{incident.severity}</span>
                    </div>
                  ))}
                </div>
                <SourceNote text={`Persisted verified Bitdefender data${incidents.stale ? " · Stale" : ""}`} />
              </div>
            ) : demo ? (
              <div className="flex min-h-52 flex-col overflow-x-auto">
                <table className="min-w-[620px] flex-1 text-left text-[10px]">
                  <thead className="border-b border-slate-200 text-slate-400 dark:border-slate-800"><tr><th className="py-2 pr-2">Time</th><th className="px-2 py-2">Client</th><th className="px-2 py-2">Incident</th><th className="px-2 py-2">Status</th><th className="py-2 pl-2">Owner</th></tr></thead>
                  <tbody>{demo.recentIncidents.map((incident) => <tr key={incident.id} className="border-b border-slate-100 dark:border-slate-800"><td className="whitespace-nowrap py-2 pr-2 text-slate-400">{formatUtc(incident.time)}</td><td className="max-w-32 truncate px-2 py-2" title={`${incident.clientName} (${incident.clientId})`}>{incident.clientName}</td><td className="max-w-44 truncate px-2 py-2 font-medium" title={`${incident.name} (${incident.id})`}>{incident.name}</td><td className="whitespace-nowrap px-2 py-2 text-slate-500">{incident.status}</td><td className="whitespace-nowrap py-2 pl-2 text-slate-500">{incident.owner}</td></tr>)}</tbody>
                </table>
                <SourceNote text="MSSP Demo Provider · Shared incident workflow fixture" />
              </div>
            ) : <Empty message="No incident records are available." compact />}
          </Panel>
        </div>

        <div className="xl:col-span-2">
          <Panel title="Tickets by Status" action={<SourceBadge provenance={demo ? "DEMO" : undefined} />}>
            {demo ? <DistributionDonut rows={demo.ticketStatuses.map((item) => ({ label: item.status, value: item.count }))} note="Demo ticket workflow · Service Desk not called" /> : <Unavailable reason="Service Desk integration not configured" />}
          </Panel>
        </div>

        <div className="xl:col-span-3">
          <Panel title="Quick Actions">
            <div className="grid min-h-52 content-center gap-2">
              <QuickLink href="/dashboard/mssp/alerts" label="View Alerts & Incidents" />
              <QuickLink href="/dashboard/mssp/clients" label="View Clients" />
              <QuickLink href="/dashboard/mssp/services" label="View Services" />
              <QuickLink href="/dashboard/mssp/reports" label="View Reports" />
              <QuickLink href="/dashboard/mssp/settings" label="View Settings" />
            </div>
          </Panel>
        </div>
      </section>
    </>
  );
}

function KpiCard({ title, value, source, provenance, reason }: { title: string; value?: number | string; source?: string; provenance?: "REAL" | "DEMO"; reason: string }) {
  const available = provenance !== undefined && value !== undefined;
  return (
    <div className="flex min-h-32 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2"><p className="text-xs font-semibold text-slate-500">{title}</p><SourceBadge provenance={available ? provenance : undefined} /></div>
      <p className="mt-3 text-2xl font-bold text-slate-800 dark:text-white">{available ? typeof value === "number" ? value.toLocaleString() : value : "N/A"}</p>
      <p className="mt-auto pt-2 text-[10px] leading-4 text-slate-400">{available ? source : reason}</p>
    </div>
  );
}

function SourceBadge({ available, provenance }: { available?: boolean; provenance?: "REAL" | "DEMO" | "UNAVAILABLE" }) {
  const state = provenance ?? (available ? "REAL" : "N/A");
  const styles = state === "REAL" ? "bg-blue-50 text-brand-blue dark:bg-blue-950" : state === "DEMO" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : state === "UNAVAILABLE" ? "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800";
  return <span className={`rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide ${styles}`}>{state === "DEMO" ? "Demo Data" : state === "REAL" ? "Real" : state === "UNAVAILABLE" ? "Unavailable" : "Not Available"}</span>;
}

function DistributionList({ rows, note }: { rows: Array<{ label: string; value: number }>; note: string }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return <div className="flex min-h-52 flex-col justify-center space-y-2.5">{rows.map((row) => <div key={row.label}><div className="mb-1 flex justify-between gap-2 text-[10px]"><span className="truncate font-medium text-slate-600 dark:text-slate-300" title={row.label}>{row.label}</span><span className="text-slate-400">{row.value}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-amber-500" style={{ width: `${row.value / max * 100}%` }} /></div></div>)}<SourceNote text={note} /></div>;
}

function DistributionDonut({ rows, note }: { rows: Array<{ label: string; value: number }>; note: string }) {
  const colors = ["#2563eb", "#14b8a6", "#f59e0b", "#8b5cf6", "#ef4444", "#64748b"];
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  return (
    <div className="flex min-h-52 flex-col justify-center">
      <div className="relative h-28">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={rows} dataKey="value" nameKey="label" innerRadius={34} outerRadius={50} strokeWidth={0}>
              {rows.map((row, index) => <Cell key={row.label} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip formatter={(value) => Number(value).toLocaleString()} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-slate-800 dark:text-white">{total.toLocaleString()}</span>
          <span className="text-[9px] text-slate-400">total</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {rows.map((row, index) => (
          <div key={row.label} className="flex min-w-0 items-center justify-between gap-2 text-[9px]">
            <span className="flex min-w-0 items-center gap-1 text-slate-500"><span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} /><span className="truncate" title={row.label}>{row.label}</span></span>
            <span className="font-medium text-slate-700 dark:text-slate-200">{row.value}</span>
          </div>
        ))}
      </div>
      <SourceNote text={note} />
    </div>
  );
}

function SlaDemo({ sla }: { sla: { met: number; breached: number; total: number; percentage: number } }) {
  const data = [{ name: "Met", value: sla.met, color: "#22c55e" }, { name: "Breached", value: sla.breached, color: "#ef4444" }];
  return <div className="flex min-h-52 flex-col justify-center"><div className="relative h-32"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" innerRadius={40} outerRadius={58} strokeWidth={0}>{data.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={(value) => Number(value).toLocaleString()} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-lg font-bold text-slate-800 dark:text-white">{sla.percentage.toFixed(1)}%</span><span className="text-[9px] text-slate-400">SLA met</span></div></div><div className="flex justify-center gap-4 text-[10px]"><span className="text-slate-500">Met <strong className="text-slate-700 dark:text-slate-200">{sla.met}</strong></span><span className="text-slate-500">Breached <strong className="text-slate-700 dark:text-slate-200">{sla.breached}</strong></span></div><SourceNote text={`${sla.total} demo service assignments`} /></div>;
}

function Unavailable({ reason, compact = false }: { reason: string; compact?: boolean }) {
  return <div className={`flex flex-col items-center justify-center px-4 text-center ${compact ? "min-h-28" : "min-h-52"}`}><p className="text-2xl font-semibold text-slate-300 dark:text-slate-600">N/A</p><p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">{reason}</p></div>;
}

function Empty({ message, compact = false }: { message: string; compact?: boolean }) {
  return <div className={`flex items-center justify-center px-4 text-center text-xs text-slate-400 ${compact ? "min-h-28" : "min-h-52"}`}>{message}</div>;
}

function SourceNote({ text }: { text: string }) {
  return <p className="mt-3 border-t border-slate-100 pt-2 text-[9px] text-slate-400 dark:border-slate-800">{text}</p>;
}

function PanelLink({ href, label }: { href: string; label: string }) {
  return <div className="mt-2 border-t border-slate-100 pt-2 text-right dark:border-slate-800"><Link href={href} className="text-[10px] font-semibold text-brand-blue hover:underline">{label} →</Link></div>;
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-brand-blue dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-900 dark:hover:bg-blue-950/30">{label}<span aria-hidden="true">→</span></Link>;
}

function formatUtc(value: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}

function PageState({ message, error = false }: { message: string; error?: boolean }) {
  return <div className={`flex min-h-64 items-center justify-center rounded-xl border border-dashed bg-white text-sm dark:bg-slate-900 ${error ? "border-red-200 text-red-500" : "border-slate-200 text-slate-500 dark:border-slate-800"}`}>{message}</div>;
}
