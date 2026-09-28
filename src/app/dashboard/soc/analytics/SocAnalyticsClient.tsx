"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/components/layout/SidebarToggle";
import { Panel } from "@/components/ui/Panel";
import { useApiResult } from "@/hooks/useApiResult";
import type { SocAnalyticsView } from "@/components/dashboard/SocDrilldownLink";
import type { AttackCountryDetection, IncidentsBySeverity, Severity, SocAlertDetailResult, SocAlertRecord, SocIncidentRecord, SocMetrics, SocTelemetry, TopIocDetection } from "@/types/soc";

const TITLES: Record<SocAnalyticsView, string> = {
  severity: "Alerts by Severity",
  trend: "Daily Wazuh Alerts (UTC)",
  status: "Alerts by Status",
  aging: "Alert Timestamp Age",
  incidents: "Incidents by Severity",
  mitre: "Observed MITRE ATT&CK Tactics",
  rules: "Ranked Alerting Rules",
  iocs: "Top IOC Detections",
  alerts: "Recent Alerts",
  countries: "Malicious Source-IP Countries",
  sources: "Detection Sources",
};

const SEVERITIES: Array<{ key: Severity; label: string; color: string; threshold: string }> = [
  { key: "critical", label: "Critical", color: "#ef4444", threshold: "rule.level ≥ 14" },
  { key: "high", label: "High", color: "#f59e0b", threshold: "rule.level 11–13" },
  { key: "medium", label: "Medium", color: "#eab308", threshold: "rule.level 7–10" },
  { key: "low", label: "Low", color: "#10b981", threshold: "rule.level < 7" },
];

export function SocAnalyticsClient({ view }: { view: SocAnalyticsView | null }) {
  const openSidebar = useSidebarToggle();
  const title = view ? TITLES[view] : "Unsupported analytics view";
  return <>
    <Topbar title="SOC Analytics" subtitle={title} onMenuClick={openSidebar} />
    <main className="flex-1 space-y-4 bg-slate-50 p-4 dark:bg-slate-950 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard/soc" className="text-xs font-medium text-brand-blue hover:underline">← Back to SOC Dashboard</Link>
        {view && view !== "status" && <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900">Last 7 Days</span>}
      </div>
      {!view ? <StateCard title="Unsupported view" message="The requested SOC analytics view is not supported." /> : <AnalyticsView view={view} />}
    </main>
  </>;
}

function AnalyticsView({ view }: { view: SocAnalyticsView }) {
  if (["severity", "trend", "aging", "mitre", "rules", "alerts", "sources"].includes(view)) return <TelemetryAnalytics view={view} />;
  if (view === "status") return <StatusAnalytics />;
  if (view === "incidents") return <IncidentAnalytics />;
  if (view === "iocs") return <IocAnalytics />;
  return <CountryAnalytics />;
}

function TelemetryAnalytics({ view }: { view: SocAnalyticsView }) {
  const state = useApiResult<SocTelemetry>("/api/soc/telemetry");
  if (state.phase === "loading") return <StateCard title={TITLES[view]} message="Loading Wazuh analytics…" />;
  if (state.phase === "error") return <StateCard title={TITLES[view]} message="Wazuh analytics unavailable." tone="error" />;
  if (state.phase === "empty") return <StateCard title={TITLES[view]} message="No Wazuh alert documents in this period." />;
  const telemetry = state.data;
  if (view === "severity") return <SeverityView telemetry={telemetry} />;
  if (view === "trend") return <TrendView telemetry={telemetry} />;
  if (view === "aging") return <AgingView telemetry={telemetry} />;
  if (view === "mitre") return <MitreView telemetry={telemetry} />;
  if (view === "rules") return <RulesView telemetry={telemetry} />;
  if (view === "alerts") return <AlertsView telemetry={telemetry} />;
  return <SourcesView telemetry={telemetry} />;
}

function SeverityView({ telemetry }: { telemetry: SocTelemetry }) {
  const rows = SEVERITIES.map((item) => ({ ...item, count: telemetry.severity[item.key], percentage: telemetry.severity.percentages[item.key] }));
  return <div className="space-y-4"><Panel title="Real Wazuh alert severity" action={<RealBadge />}><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]"><div className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={rows}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div><BreakdownTable rows={rows.map((row) => ({ label: row.label, detail: row.threshold, count: row.count, percentage: row.percentage }))} /></div></Panel><AlertInvestigation view="severity" telemetry={telemetry} /></div>;
}

function TrendView({ telemetry }: { telemetry: SocTelemetry }) {
  const rows = telemetry.trend.map((point) => ({ ...point, label: new Date(point.timestamp).toLocaleDateString([], { month: "short", day: "numeric", timeZone: "UTC" }) }));
  if (telemetry.totalAlerts === 0) return <StateCard title={TITLES.trend} message="No alerts in this period." />;
  return <div className="space-y-4"><Panel title="Daily alert documents using UTC calendar boundaries" action={<RealBadge />}><div className="h-[28rem]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={rows}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis allowDecimals={false} /><Tooltip /><Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#ef4444" name="Critical" /><Area type="monotone" dataKey="high" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="High" /><Area type="monotone" dataKey="medium" stackId="1" stroke="#eab308" fill="#eab308" name="Medium" /><Area type="monotone" dataKey="low" stackId="1" stroke="#10b981" fill="#10b981" name="Low" /></AreaChart></ResponsiveContainer></div><p className="mt-3 text-xs text-slate-400">Rolling seven-day query grouped into calendar-day buckets with explicit UTC boundaries.</p></Panel><AlertInvestigation view="trend" telemetry={telemetry} /></div>;
}

function AgingView({ telemetry }: { telemetry: SocTelemetry }) {
  const labels: Record<string, string> = { "0-15m": "0–15 minutes", "15-60m": "15–60 minutes", "1-4h": "1–4 hours", "4-24h": "4–24 hours", ">24h": "24 hours–7 days" };
  if (telemetry.totalEvents === 0) return <StateCard title={TITLES.aging} message="No alert documents in this period." />;
  return <div className="space-y-4"><Panel title="Age from Wazuh observed timestamp" action={<RealBadge />}><p className="mb-5 text-xs text-slate-500 dark:text-slate-400">Age is measured from each Wazuh alert document’s observed timestamp. It does not represent unresolved-alert or analyst workflow age.</p><BreakdownTable rows={telemetry.aging.map((item) => ({ label: labels[item.bucket], detail: "Observed timestamp age", count: item.count, percentage: item.percentage }))} /></Panel><AlertInvestigation view="aging" telemetry={telemetry} /></div>;
}

function MitreView({ telemetry }: { telemetry: SocTelemetry }) {
  if (telemetry.mitre.length === 0) return <StateCard title={TITLES.mitre} message="No observed MITRE tactic mappings in this period." />;
  const total = telemetry.mitre.reduce((sum, item) => sum + item.count, 0);
  return <div className="space-y-4"><Panel title="Observed tactic mappings" action={<RealBadge />}><p className="mb-5 text-xs text-slate-500 dark:text-slate-400">Observed MITRE ATT&CK tactics mapped by Wazuh alert rules. This is not framework coverage or compliance.</p><BreakdownTable rows={telemetry.mitre.map((item) => ({ label: item.tactic, detail: "Wazuh rule tactic mapping", count: item.count, percentage: total ? item.count / total * 100 : 0 }))} /></Panel><AlertInvestigation view="mitre" telemetry={telemetry} /></div>;
}

function RulesView({ telemetry }: { telemetry: SocTelemetry }) {
  if (telemetry.topRules.length === 0) return <StateCard title={TITLES.rules} message="No alerting rules in this period." />;
  return <div className="space-y-4"><Panel title="Top 10 rules by alert-document count" action={<RealBadge />}><p className="mb-4 text-xs text-slate-400">This bounded view contains the current Top 10, not every rule in the index.</p><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800"><th className="px-3 py-3">Rank</th><th className="px-3 py-3">Rule ID</th><th className="px-3 py-3">Description</th><th className="px-3 py-3 text-right">Alert documents</th></tr></thead><tbody>{telemetry.topRules.map((rule, index) => <tr key={rule.id} className="border-b border-slate-100 dark:border-slate-800"><td className="px-3 py-3 text-slate-400">{index + 1}</td><td className="px-3 py-3 font-medium text-slate-700 dark:text-slate-200">{rule.id}</td><td className="px-3 py-3 text-slate-500">{rule.description || `Rule ${rule.id}`}</td><td className="px-3 py-3 text-right font-medium">{rule.count.toLocaleString()}</td></tr>)}</tbody></table></div></Panel><AlertInvestigation view="rules" telemetry={telemetry} /></div>;
}

function AlertsView({ telemetry }: { telemetry: SocTelemetry }) {
  return <AlertInvestigation view="alerts" telemetry={telemetry} />;
}

function SourcesView({ telemetry }: { telemetry: SocTelemetry }) {
  const data = telemetry.detectionSources;
  if (data.sources.length === 0) return <StateCard title={TITLES.sources} message="No classified detection-source data in this period." />;
  return <div className="space-y-4"><Panel title="Application-classified Wazuh sources" action={<RealBadge />}><p className="mb-4 text-xs text-slate-500 dark:text-slate-400">Categories are mutually exclusive and application-classified from Wazuh metadata; they are not provider-native fields. Coverage: {data.coveragePercent.toFixed(1)}%.</p><BreakdownTable rows={data.sources.map((item) => ({ label: item.source, detail: "Application-classified", count: item.count, percentage: data.total ? item.count / data.total * 100 : 0 }))} /><div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800/50">Unclassified alert documents: <strong>{data.unclassified.toLocaleString()}</strong></div></Panel><AlertInvestigation view="sources" telemetry={telemetry} /></div>;
}

function StatusAnalytics() {
  const state = useApiResult<SocMetrics>("/api/soc/metrics?wazuh=false");
  if (state.phase === "loading") return <StateCard title={TITLES.status} message="Loading workflow availability…" />;
  if (state.phase === "error") return <StateCard title={TITLES.status} message="Workflow status unavailable." tone="error" />;
  const demo = state.phase === "ready" ? state.data.workflowDemo : null;
  if (!demo) return <StateCard title={TITLES.status} message="Alert workflow status is not available from the currently integrated real sources." />;
  const total = demo.alertStatuses.reduce((sum, item) => sum + item.count, 0);
  return <div className="space-y-4"><Panel title="Demo workflow status distribution" action={<DemoBadge />}><p className="mb-4 text-xs text-slate-500">{demo.sourceLabel}. These are synthetic workflow records, not Wazuh alert statuses.</p><BreakdownTable rows={demo.alertStatuses.map((item) => ({ label: item.status, detail: "Demo workflow status", count: item.count, percentage: total ? item.count / total * 100 : 0 }))} /></Panel><Panel title="Demo workflow records" action={<DemoBadge />}><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead><tr className="border-b text-slate-400"><th className="p-3">Demo ID</th><th>Status</th><th>Severity</th><th>Occurred</th><th>Detected</th><th>Response started</th></tr></thead><tbody>{demo.records.map((record) => <tr key={record.id} className="border-b border-slate-100 dark:border-slate-800"><td className="p-3 font-medium">{record.id}</td><td>{record.status}</td><td className="capitalize">{record.severity}</td><td>{formatUtc(record.occurredAt)}</td><td>{formatUtc(record.detectedAt)}</td><td>{formatUtc(record.responseStartedAt)}</td></tr>)}</tbody></table></div></Panel></div>;
}

function IncidentAnalytics() {
  const metrics = useApiResult<SocMetrics>("/api/soc/metrics?wazuh=false");
  const severity = useApiResult<IncidentsBySeverity>("/api/soc/incidents-by-severity");
  const details = useApiResult<SocIncidentRecord[]>("/api/soc/incident-details?limit=25");
  if (metrics.phase === "loading" || severity.phase === "loading") return <StateCard title={TITLES.incidents} message="Loading persisted incident analytics…" />;
  if (metrics.phase === "error" || severity.phase === "error") return <StateCard title={TITLES.incidents} message="Persisted incident analytics unavailable." tone="error" />;
  if (metrics.phase !== "ready" || severity.phase !== "ready") return <StateCard title={TITLES.incidents} message="No verified incidents in this period." />;
  const real = severity.data;
  const demo = metrics.data.workflowDemo;
  return <div className="space-y-4"><Panel title="Persisted verified Bitdefender incidents" action={<RealBadge />}>{real.totalIncidents === 0 ? <EmptyBlock message="No verified incidents in this period" /> : <BreakdownTable rows={SEVERITIES.map((item) => ({ label: item.label, detail: "Persisted verified severity", count: real[item.key], percentage: real.percentages[item.key] }))} />}<p className="mt-4 text-xs text-slate-400">Current rolling seven-day cohort: {metrics.data.incidents.value?.toLocaleString() ?? "Unavailable"}. The date range is not widened when empty.</p></Panel><Panel title="Persisted incident lifecycle evidence" action={<RealBadge />}>{details.phase === "loading" ? <EmptyBlock message="Loading persisted incident records…" /> : details.phase === "error" ? <EmptyBlock message="Persisted incident records unavailable." /> : details.phase === "empty" ? <EmptyBlock message="No verified incidents in this period" /> : <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-xs"><thead><tr className="border-b text-slate-400"><th className="p-3">Incident ID</th><th>Severity</th><th>Detected</th><th>Acknowledged</th><th>Response started</th><th>Contained</th><th>Last verified</th></tr></thead><tbody>{details.data.map((record) => <tr key={record.incidentId} className="border-b border-slate-100 dark:border-slate-800"><td className="p-3 font-medium">{record.incidentId}</td><td>{record.severity ?? "Unclassified"}</td><td>{formatUtc(record.detectedAt)}</td><td>{record.acknowledgedAt ? formatUtc(record.acknowledgedAt) : "—"}</td><td>{record.responseStartedAt ? formatUtc(record.responseStartedAt) : "—"}</td><td>{record.containedAt ? formatUtc(record.containedAt) : "—"}</td><td>{formatUtc(record.lastVerifiedAt)}</td></tr>)}</tbody></table></div>}</Panel>{real.totalIncidents === 0 && demo && <Panel title="Demo incident severity capability" action={<DemoBadge />}><p className="mb-4 text-xs text-slate-500">Separate synthetic visualization from {demo.sourceLabel}; not included in the real incident count.</p><BreakdownTable rows={SEVERITIES.map((item) => ({ label: item.label, detail: "Demo incident severity", count: demo.incidentSeverity[item.key], percentage: demo.incidentSeverity.total ? demo.incidentSeverity[item.key] / demo.incidentSeverity.total * 100 : 0 }))} /></Panel>}</div>;
}

function IocAnalytics() {
  const state = useApiResult<TopIocDetection[]>("/api/soc/top-ioc-detections");
  const [selectedIp, setSelectedIp] = useState("");
  if (state.phase === "loading") return <StateCard title={TITLES.iocs} message="Loading persisted IOC correlations…" />;
  if (state.phase === "error") return <StateCard title={TITLES.iocs} message="IOC correlations unavailable." tone="error" />;
  if (state.phase === "empty" || state.data.length === 0) return <StateCard title={TITLES.iocs} message="No confirmed IOC detections in this period." />;
  const selected = state.data.find((item) => item.iocValue === selectedIp) ?? state.data[0];
  return <div className="space-y-4"><Panel title="Confirmed malicious source-IP correlations" action={<RealBadge />}><p className="mb-4 text-xs text-slate-500">Persisted Wazuh source-IP observations correlated with AbuseIPDB. Opening this view does not perform enrichment or synchronization.</p><div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800"><th className="px-3 py-3">IOC value</th><th className="px-3 py-3">Country</th><th className="px-3 py-3 text-right">Wazuh detections</th><th className="px-3 py-3">Confidence / reports</th><th className="px-3 py-3">Wazuh last observed</th><th className="px-3 py-3">AbuseIPDB enriched</th></tr></thead><tbody>{state.data.map((item) => <tr key={item.iocValue} onClick={() => setSelectedIp(item.iocValue)} className="cursor-pointer border-b border-slate-100 hover:bg-blue-50/50 dark:border-slate-800"><td className="px-3 py-3 font-medium">{item.iocValue}</td><td className="px-3 py-3">{item.countryCode ?? "—"}</td><td className="px-3 py-3 text-right">{item.detectionCount.toLocaleString()}</td><td className="px-3 py-3">{item.abuseConfidenceScore ?? "—"} / {item.totalReports ?? "—"}</td><td className="px-3 py-3 text-slate-500">{formatUtc(item.lastObservedAt)}</td><td className="px-3 py-3 text-slate-500">{formatUtc(item.enrichedAt)}</td></tr>)}</tbody></table></div></Panel><AlertInvestigation view="alerts" fixedSourceIp={selected.iocValue} /></div>;
}

function CountryAnalytics() {
  const state = useApiResult<AttackCountryDetection[]>("/api/soc/attack-countries");
  const iocs = useApiResult<TopIocDetection[]>("/api/soc/top-ioc-detections");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedIp, setSelectedIp] = useState("");
  if (state.phase === "loading") return <StateCard title={TITLES.countries} message="Loading persisted country enrichment…" />;
  if (state.phase === "error") return <StateCard title={TITLES.countries} message="Source-IP country enrichment unavailable." tone="error" />;
  if (state.phase === "empty" || state.data.length === 0) return <StateCard title={TITLES.countries} message="No confirmed malicious source-IP country data in this period." />;
  const total = state.data.reduce((sum, item) => sum + item.detectionCount, 0);
  const country = selectedCountry || state.data[0].countryCode;
  const contributors = iocs.phase === "ready" ? iocs.data.filter((item) => item.countryCode === country) : [];
  const evidenceIp = selectedIp || contributors[0]?.iocValue;
  return <div className="space-y-4"><Panel title="Persisted source-IP country enrichment" action={<RealBadge />}><p className="mb-4 text-xs text-slate-500">Country is derived from confirmed-malicious source-IP enrichment. It is not attribution of attacker origin.</p><div className="mb-4"><FilterSelect label="Country" value={country} onChange={(value) => { setSelectedCountry(value); setSelectedIp(""); }} options={state.data.map((item) => item.countryCode)} /></div><BreakdownTable rows={state.data.map((item) => ({ label: item.countryName ?? item.countryCode, detail: `${item.countryCode} · ${item.iocCount ?? 0} confirmed source IPs`, count: item.detectionCount, percentage: total ? item.detectionCount / total * 100 : 0 }))} /><h3 className="mt-6 text-sm font-semibold">Persisted IOC contributors for {country}</h3>{iocs.phase === "error" ? <p className="mt-3 text-xs text-red-500">IOC contributor data unavailable.</p> : contributors.length === 0 ? <p className="mt-3 text-xs text-slate-400">No IOC contributor is present in the bounded current IOC read model.</p> : <div className="mt-3 flex flex-wrap gap-2">{contributors.map((item) => <button key={item.iocValue} onClick={() => setSelectedIp(item.iocValue)} className={`rounded border px-3 py-1.5 text-xs ${evidenceIp === item.iocValue ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-slate-200 dark:border-slate-700"}`}>{item.iocValue} · {item.detectionCount.toLocaleString()} detections</button>)}</div>}</Panel>{evidenceIp && <AlertInvestigation view="alerts" fixedSourceIp={evidenceIp} />}</div>;
}

type AlertView = "severity" | "trend" | "aging" | "mitre" | "rules" | "alerts" | "sources";

function AlertInvestigation({ view, telemetry, fixedSourceIp }: { view: AlertView; telemetry?: SocTelemetry; fixedSourceIp?: string }) {
  const [severity, setSeverity] = useState("");
  const [ruleId, setRuleId] = useState("");
  const [agent, setAgent] = useState("");
  const [sourceIp, setSourceIp] = useState(fixedSourceIp ?? "");
  const [tactic, setTactic] = useState("");
  const [ageBucket, setAgeBucket] = useState("");
  const [day, setDay] = useState("");
  const [detectionSource, setDetectionSource] = useState("");
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<SocAlertRecord | null>(null);
  const url = useMemo(() => {
    const params = new URLSearchParams({ limit: "25", offset: String(offset) });
    const values = { severity, ruleId, agent, sourceIp: fixedSourceIp ?? sourceIp, tactic, ageBucket, day, detectionSource };
    Object.entries(values).forEach(([key, value]) => { if (value) params.set(key, value); });
    return `/api/soc/alert-details?${params.toString()}`;
  }, [severity, ruleId, agent, sourceIp, fixedSourceIp, tactic, ageBucket, day, detectionSource, offset]);
  const state = useApiResult<SocAlertDetailResult>(url, [url]);
  const resetPage = () => setOffset(0);
  return <Panel title={view === "alerts" ? "Wazuh alert investigation" : "Contributing Wazuh alert evidence"} action={<RealBadge />}>
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/40">
      {view === "severity" && <FilterSelect label="Severity" value={severity} onChange={(value) => { setSeverity(value); resetPage(); }} options={["critical", "high", "medium", "low"]} />}
      {view === "trend" && <FilterInput label="UTC day" type="date" value={day} onChange={(value) => { setDay(value); resetPage(); }} />}
      {view === "aging" && <FilterSelect label="Timestamp age" value={ageBucket} onChange={(value) => { setAgeBucket(value); resetPage(); }} options={["0-15m", "15-60m", "1-4h", "4-24h", ">24h"]} />}
      {view === "mitre" && <FilterSelect label="Observed tactic" value={tactic} onChange={(value) => { setTactic(value); resetPage(); }} options={(telemetry?.mitre ?? []).map((item) => item.tactic)} />}
      {view === "rules" && <FilterSelect label="Rule" value={ruleId} onChange={(value) => { setRuleId(value); resetPage(); }} options={(telemetry?.topRules ?? []).map((item) => item.id)} />}
      {view === "sources" && <FilterSelect label="Application category" value={detectionSource} onChange={(value) => { setDetectionSource(value); resetPage(); }} options={[...(telemetry?.detectionSources.sources ?? []).map((item) => item.source), "Unclassified"]} />}
      {view === "alerts" && <><FilterSelect label="Severity" value={severity} onChange={(value) => { setSeverity(value); resetPage(); }} options={["critical", "high", "medium", "low"]} /><FilterInput label="Rule ID" value={ruleId} onChange={(value) => { setRuleId(value); resetPage(); }} /><FilterInput label="Agent" value={agent} onChange={(value) => { setAgent(value); resetPage(); }} /><FilterInput label="Source IP" value={sourceIp} onChange={(value) => { setSourceIp(value); resetPage(); }} /></>}
      {fixedSourceIp && <span className="pb-1 text-xs text-slate-500">Exact source IP: <strong>{fixedSourceIp}</strong></span>}
      <span className="ml-auto pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Wazuh / OpenSearch · Real · Last 7 Days</span>
    </div>
    {state.phase === "loading" ? <EmptyBlock message="Loading bounded alert evidence…" /> : state.phase === "error" ? <EmptyBlock message="Wazuh alert evidence unavailable." /> : state.phase === "empty" || state.data.records.length === 0 ? <EmptyBlock message="No alert records match these filters." /> : <>
      <p className="mb-3 text-xs text-slate-500">Showing {state.data.offset + 1}–{Math.min(state.data.offset + state.data.records.length, state.data.total)} of {state.data.total.toLocaleString()} matching documents. Select a row to inspect allowlisted context.</p>
      <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-xs"><thead><tr className="border-b border-slate-200 uppercase tracking-wide text-slate-400 dark:border-slate-800"><th className="px-2 py-3">Time (UTC)</th><th className="px-2 py-3">Severity</th><th className="px-2 py-3">Rule</th><th className="px-2 py-3">Description</th><th className="px-2 py-3">Agent</th><th className="px-2 py-3">Source IP</th><th className="px-2 py-3">User</th><th className="px-2 py-3">MITRE</th></tr></thead><tbody>{state.data.records.map((record) => <tr key={record.id} onClick={() => setSelected(record)} className="cursor-pointer border-b border-slate-100 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:bg-blue-950/20"><td className="whitespace-nowrap px-2 py-3 text-slate-500">{formatUtc(record.timestamp)}</td><td className="px-2 py-3 capitalize">{record.severity} ({record.ruleLevel})</td><td className="px-2 py-3 font-medium">{record.ruleId}</td><td className="max-w-xs truncate px-2 py-3" title={record.ruleDescription}>{record.ruleDescription}</td><td className="px-2 py-3">{record.agentName ?? "—"}</td><td className="px-2 py-3">{record.sourceIp ?? "—"}</td><td className="px-2 py-3">{record.destinationUser ?? record.user ?? "—"}</td><td className="px-2 py-3">{[...record.mitreTactics, ...record.mitreTechniqueIds].join(", ") || "—"}</td></tr>)}</tbody></table></div>
      <div className="mt-4 flex justify-between"><button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 25))} className="rounded border px-3 py-1.5 text-xs disabled:opacity-40">Previous</button><button disabled={offset + 25 >= state.data.total || offset >= 500} onClick={() => setOffset(offset + 25)} className="rounded border px-3 py-1.5 text-xs disabled:opacity-40">Next</button></div>
    </>}
    {selected && <RecordInspector record={selected} onClose={() => setSelected(null)} onRule={() => { setRuleId(selected.ruleId); setSelected(null); resetPage(); }} onAgent={selected.agentName ? () => { setAgent(selected.agentName!); setSelected(null); resetPage(); } : undefined} onSourceIp={selected.sourceIp ? () => { setSourceIp(selected.sourceIp!); setSelected(null); resetPage(); } : undefined} />}
  </Panel>;
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs normal-case dark:border-slate-700 dark:bg-slate-900"><option value="">All</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
function FilterInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block w-36 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs normal-case dark:border-slate-700 dark:bg-slate-900" /></label>; }

function RecordInspector({ record, onClose, onRule, onAgent, onSourceIp }: { record: SocAlertRecord; onClose: () => void; onRule: () => void; onAgent?: () => void; onSourceIp?: () => void }) {
  const fields = [["Timestamp", formatUtc(record.timestamp)], ["Rule", `${record.ruleId} · ${record.ruleDescription}`], ["Agent", [record.agentId, record.agentName, record.agentIp].filter(Boolean).join(" · ")], ["Network", record.sourceIp], ["Identity", record.destinationUser ?? record.user], ["MITRE tactics", record.mitreTactics.join(", ")], ["MITRE techniques", record.mitreTechniqueIds.join(", ")], ["Telemetry source", [record.detectionSource, record.location, record.channel, record.integration].filter(Boolean).join(" · ")]].filter((item) => item[1]);
  return <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50/40 p-4 dark:border-blue-900 dark:bg-blue-950/20"><div className="flex justify-between"><h3 className="text-sm font-semibold">Sanitized investigation context</h3><button onClick={onClose} className="text-xs text-brand-blue">Close</button></div><dl className="mt-3 grid gap-3 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label}><dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 break-words text-xs text-slate-700 dark:text-slate-200">{value}</dd></div>)}</dl><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => navigator.clipboard.writeText(record.ruleId)} className="rounded border px-2 py-1 text-xs">Copy Rule ID</button>{record.sourceIp && <button onClick={() => navigator.clipboard.writeText(record.sourceIp!)} className="rounded border px-2 py-1 text-xs">Copy IOC</button>}<button onClick={onRule} className="rounded border px-2 py-1 text-xs">Filter by Rule</button>{onAgent && <button onClick={onAgent} className="rounded border px-2 py-1 text-xs">Filter by Agent</button>}{onSourceIp && <button onClick={onSourceIp} className="rounded border px-2 py-1 text-xs">Filter by Source IP</button>}</div></div>;
}

function BreakdownTable({ rows }: { rows: Array<{ label: string; detail: string; count: number; percentage: number }> }) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  return <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800"><th className="px-3 py-3">Category</th><th className="px-3 py-3">Definition</th><th className="px-3 py-3 text-right">Count</th><th className="px-3 py-3 text-right">Percentage</th><th className="w-1/3 px-3 py-3">Distribution</th></tr></thead><tbody>{rows.map((row) => <tr key={`${row.label}-${row.detail}`} className="border-b border-slate-100 dark:border-slate-800"><td className="px-3 py-3 font-medium text-slate-700 dark:text-slate-200">{row.label}</td><td className="px-3 py-3 text-slate-500">{row.detail}</td><td className="px-3 py-3 text-right">{row.count.toLocaleString()}</td><td className="px-3 py-3 text-right">{row.percentage.toFixed(1)}%</td><td className="px-3 py-3"><div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 rounded-full bg-brand-blue" style={{ width: `${row.count / max * 100}%` }} /></div></td></tr>)}</tbody></table></div>;
}

function StateCard({ title, message, tone = "neutral" }: { title: string; message: string; tone?: "neutral" | "error" }) {
  return <Panel title={title}><div className={`flex min-h-72 items-center justify-center rounded-lg border border-dashed px-6 text-center text-sm ${tone === "error" ? "border-red-200 text-red-500 dark:border-red-900" : "border-slate-200 text-slate-500 dark:border-slate-800"}`}>{message}</div></Panel>;
}

function EmptyBlock({ message }: { message: string }) { return <div className="flex min-h-48 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-400 dark:bg-slate-800/40">{message}</div>; }
function RealBadge() { return <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand-blue dark:bg-blue-950/60">Real</span>; }
function DemoBadge() { return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">Demo Data</span>; }
function formatUtc(value: string): string { return value ? new Date(value).toLocaleString([], { timeZone: "UTC", timeZoneName: "short" }) : "Unavailable"; }
