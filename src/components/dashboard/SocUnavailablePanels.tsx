import { Panel } from "@/components/ui/Panel";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { IncidentsBySeverity, SocTelemetry } from "@/types/soc";

function Unavailable({ message }: { message: string }) {
  return <div className="flex h-full min-h-40 flex-col items-center justify-center px-3 text-center"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:bg-slate-800">N/A</span><p className="mt-2 text-xs text-slate-400">{message}</p></div>;
}

function EmptyResult({ message }: { message: string }) {
  return <div className="flex h-full min-h-40 items-center justify-center px-3 text-center text-xs text-slate-400">{message}</div>;
}

export function AlertsByStatusPanel() { return <Panel title="Alerts by Status"><Unavailable message="Alert status data unavailable" /></Panel>; }

export function AlertAgingPanel({ telemetry }: { telemetry?: SocTelemetry }) {
  const labels: Record<string, string> = { "0-15m": "0-15 minutes", "15-60m": "15-60 minutes", "1-4h": "1-4 hours", "4-24h": "4-24 hours", ">24h": ">24 hours" };
  const max = Math.max(...(telemetry?.aging ?? []).map((bucket) => bucket.count), 1);
  return <Panel title="Alert Aging" action={<span title="Age since alert timestamp" className="text-[10px] font-medium text-slate-400">Age since alert timestamp</span>}><div className="flex h-full min-h-48 flex-col justify-center space-y-3">{telemetry ? telemetry.aging.map((bucket) => <div key={bucket.bucket} className="grid grid-cols-[6rem_1fr_auto] items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400"><span>{labels[bucket.bucket]}</span><span className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"><span className="block h-2 rounded-full bg-brand-blue" style={{ width: `${bucket.count / max * 100}%` }} /></span><span className="text-slate-500">{bucket.count.toLocaleString()} <span className="text-slate-400">({bucket.percentage}%)</span></span></div>) : <Unavailable message="Alert timestamp data unavailable" />}{telemetry && telemetry.aging.length === 0 && <p className="text-center text-[11px] text-slate-400">No alerts in this period</p>}</div></Panel>;
}

export function IncidentsBySeverityPanel({ data, unavailable = false }: { data?: IncidentsBySeverity; unavailable?: boolean }) {
  const resolved = unavailable ? undefined : data;
  const series = [{ label: "Critical", key: "critical" as const, color: "#E53935" }, { label: "High", key: "high" as const, color: "#F59E0B" }, { label: "Medium", key: "medium" as const, color: "#EAB308" }, { label: "Low", key: "low" as const, color: "#22C55E" }];
  const chart = resolved && resolved.classifiedIncidents > 0 ? series.map((item) => ({ name: item.label, value: resolved[item.key], color: item.color })) : [{ name: "No classified incidents", value: 1, color: "#e2e8f0" }];
  return <Panel title="Incidents by Severity" action={<span className="text-[10px] font-medium text-slate-400">Last 7 Days</span>}><div className="flex h-full min-h-48 items-center justify-center gap-5"><div className="relative h-28 w-28 shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chart} dataKey="value" innerRadius={42} outerRadius={55} stroke="none">{chart.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="text-center"><div className="text-xl font-semibold text-slate-700 dark:text-slate-200">{resolved ? resolved.totalIncidents.toLocaleString() : "N/A"}</div><div className="text-[10px] text-slate-400">Total incidents</div></div></div></div><ul className="min-w-0 space-y-2 text-xs">{series.map((item) => <li key={item.key} className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} /><span>{item.label}</span><span className="ml-auto pl-2 text-slate-400">{resolved ? `${resolved[item.key].toLocaleString()} / ${percentage(resolved[item.key], resolved.classifiedIncidents)}` : "N/A"}</span></li>)}{resolved && resolved.unclassifiedIncidents > 0 && <li className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><span className="h-2 w-2 rounded-full bg-slate-300" /><span>Unclassified</span><span className="ml-auto pl-2 text-slate-400">{resolved.unclassifiedIncidents.toLocaleString()}</span></li>}</ul></div></Panel>;
}

function percentage(value: number, denominator: number): string { return `${(denominator ? value / denominator * 100 : 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`; }

export function MitreTacticsPanel({ telemetry }: { telemetry?: SocTelemetry }) {
  const max = Math.max(...(telemetry?.mitre ?? []).map((tactic) => tactic.count), 1);
  return <Panel title="MITRE ATT&CK Tactic Distribution"><div className="flex h-full min-h-48 items-end justify-between gap-1 border-b border-slate-200 px-1 pb-1 dark:border-slate-700">{telemetry?.mitre.map((tactic) => <div key={tactic.tactic} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"><span className="mb-1 text-[10px] text-slate-400">{tactic.count.toLocaleString()}</span><span className="w-3/5 rounded-t bg-brand-blue" style={{ height: `${Math.max(4, tactic.count / max * 72)}%` }} /><span className="mt-2 w-full truncate text-center text-[9px] text-slate-400" title={tactic.tactic}>{tactic.tactic}</span></div>)}{!telemetry && <Unavailable message="MITRE tactic data unavailable" />}{telemetry && telemetry.mitre.length === 0 && <EmptyResult message="No MITRE tactics in this period" />}</div></Panel>;
}

export function TopIocDetectionsPanel() { return <Panel title="Top IOC Detections"><div className="h-full min-h-48"><div className="grid grid-cols-[1fr_4rem_4rem] border-b border-slate-200 pb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-800"><span>IOC Value</span><span>Type</span><span className="text-right">Detections</span></div><Unavailable message="IOC correlation unavailable" /></div></Panel>; }
export function AttackCountryPanel() { return <Panel title="Attack Country Heatmap"><Unavailable message="Source geolocation unavailable" /></Panel>; }
export function DetectionSourcesPanel() { return <Panel title="Detection Sources"><Unavailable message="Detection source metadata unavailable" /></Panel>; }
