import type { ReactNode } from "react";
import { Panel } from "@/components/ui/Panel";
import type { DemoAlertStatus, Severity, SocWorkflowDemo } from "@/types/soc";

const STATUS_COLORS: Record<DemoAlertStatus, string> = {
  New: "#3b82f6", "In Progress": "#f97316", Investigating: "#eab308", Resolved: "#22c55e", Closed: "#64748b",
};

export function MsspTickets({ demo }: { demo: SocWorkflowDemo | null }) {
  const inProgress = demo?.alertStatuses.find((item) => item.status === "In Progress")?.count;
  const resolved = demo?.alertStatuses.find((item) => item.status === "Resolved")?.count;
  const resolvedRecords = demo?.records.filter((record) => record.status === "Resolved" || record.status === "Closed") ?? [];
  const averageResolution = resolvedRecords.length ? average(resolvedRecords.map((record) => minutesBetween(record.detectedAt, record.resolvedAt))) : null;

  return <div className="space-y-4">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="text-xl font-semibold text-slate-800 dark:text-white">Tickets</h1><p className="mt-1 text-sm text-slate-500">Ticket workflow, service performance, and resolution visibility.</p></div>
      <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${demo ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40" : "border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900"}`}>{demo ? "Demo Ticketing Provider" : "Service Desk integration not configured"}</span>
    </header>
    {demo && <p className="rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/30">Temporary demo ticket data · Service Desk integration is not currently configured.</p>}

    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      <TicketKpiCard title="Total Tickets" value={demo?.records.length} demo={Boolean(demo)} reason="Ticketing provider not configured" icon="total" />
      <TicketKpiCard title="Open Tickets" reason="Ticket workflow status not available" icon="open" />
      <TicketKpiCard title="In Progress Tickets" value={inProgress} demo={Boolean(demo)} reason="Ticket workflow status not available" icon="progress" />
      <TicketKpiCard title="Resolved Tickets" value={resolved} demo={Boolean(demo)} reason="Ticket workflow status not available" icon="resolved" />
      <TicketKpiCard title="SLA Met" reason="Ticket SLA source not configured" icon="slaMet" />
      <TicketKpiCard title="SLA Breached" reason="Ticket SLA source not configured" icon="slaBreached" />
    </section>

    <section className="grid auto-rows-fr gap-4 xl:grid-cols-12">
      <div className="xl:col-span-5"><UnavailablePanel title="Tickets Over Time" reason="Ticket history not configured" /></div>
      <div className="xl:col-span-3"><UnavailablePanel title="Tickets by Priority" reason="Ticket priority source not configured" /></div>
      <div className="xl:col-span-4"><UnavailablePanel title="Top Ticket Categories" reason="Ticket category source not configured" /></div>
    </section>

    <section className="grid auto-rows-fr gap-4 xl:grid-cols-12">
      <div className="min-w-0 xl:col-span-6"><RecentTicketsPanel demo={demo} /></div>
      <div className="xl:col-span-3"><TicketsByStatusPanel demo={demo} /></div>
      <div className="xl:col-span-3"><UnavailablePanel title="SLA Performance" reason="Ticket SLA source not configured" /></div>
    </section>

    <section className="grid auto-rows-fr gap-4 xl:grid-cols-12">
      <div className="xl:col-span-3"><UnavailablePanel title="Tickets by Client" reason="Client-to-ticket mapping not configured" /></div>
      <div className="xl:col-span-4"><UnavailablePanel title="Tickets by Assignee" reason="Ticket assignment source not configured" /></div>
      <div className="xl:col-span-5"><ResolutionPanel demo={Boolean(demo)} averageMinutes={averageResolution} /></div>
    </section>
  </div>;
}

type IconName = "total" | "open" | "progress" | "resolved" | "slaMet" | "slaBreached";
function TicketKpiCard({ title, value, demo = false, reason, icon }: { title: string; value?: number; demo?: boolean; reason: string; icon: IconName }) {
  const available = demo && value !== undefined;
  return <article className="flex min-h-32 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><TicketIcon name={icon} /><p className="text-xs font-semibold leading-4 text-slate-500">{title}</p></div><StateBadge demo={available} /></div><p className="mt-3 text-2xl font-bold text-slate-800 dark:text-white">{available ? value.toLocaleString() : "N/A"}</p><p className="mt-auto pt-2 text-[10px] leading-4 text-slate-400">{available ? "Demo Ticketing Provider" : reason}</p></article>;
}

function RecentTicketsPanel({ demo }: { demo: SocWorkflowDemo | null }) {
  return <Panel title="Recent Tickets" action={<StateBadge demo={Boolean(demo)} />}>
    <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-[10px]"><thead className="border-b border-slate-200 bg-slate-50/80 text-slate-400 dark:border-slate-800 dark:bg-slate-950/40"><tr>{["Ticket ID", "Severity", "Status", "Detected At", "Resolved At"].map((heading) => <th key={heading} className="whitespace-nowrap px-3 py-2.5 font-semibold">{heading}</th>)}</tr></thead><tbody>{demo ? demo.records.slice(0, 5).map((record) => <tr key={record.id} className="border-b border-slate-100 dark:border-slate-800"><td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-200">{record.id}</td><td className="px-3 py-2 capitalize">{record.severity}</td><td className="px-3 py-2"><span style={{ color: STATUS_COLORS[record.status] }}>{record.status}</span></td><td className="whitespace-nowrap px-3 py-2 text-slate-500">{formatUtc(record.detectedAt)}</td><td className="whitespace-nowrap px-3 py-2 text-slate-500">{record.status === "Resolved" || record.status === "Closed" ? formatUtc(record.resolvedAt) : "N/A"}</td></tr>) : <tr><td colSpan={5}><Unavailable reason="Ticketing provider not configured" /></td></tr>}</tbody></table>{demo && <SourceNote text="Latest 5 fixtures · Demo Ticketing Provider" />}</div>
  </Panel>;
}

function TicketsByStatusPanel({ demo }: { demo: SocWorkflowDemo | null }) {
  const max = Math.max(1, ...(demo?.alertStatuses.map((item) => item.count) ?? []));
  return <Panel title="Tickets by Status" action={<StateBadge demo={Boolean(demo)} />}>{!demo ? <Unavailable reason="Ticket workflow status not available" /> : <div className="flex min-h-52 flex-col justify-center space-y-3">{demo.alertStatuses.map((item) => <div key={item.status}><div className="mb-1 flex justify-between text-[10px]"><span className="font-medium text-slate-600 dark:text-slate-300">{item.status}</span><span className="text-slate-400">{item.count}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full" style={{ width: `${item.count / max * 100}%`, backgroundColor: STATUS_COLORS[item.status] }} /></div></div>)}<SourceNote text="Demo workflow status aggregation" /></div>}</Panel>;
}

function ResolutionPanel({ demo, averageMinutes }: { demo: boolean; averageMinutes: number | null }) {
  const available = demo && averageMinutes !== null;
  return <Panel title="Average Resolution Time" action={<StateBadge demo={available} />}>{available ? <div className="flex min-h-52 flex-col items-center justify-center text-center"><p className="text-3xl font-bold text-slate-800 dark:text-white">{formatDuration(averageMinutes)}</p><p className="mt-2 text-xs text-slate-400">Resolved and Closed demo records only</p><div className="mt-5 grid w-full max-w-md grid-cols-3 gap-2 text-[10px]"><ResolutionSubmetric label="High Priority" /><ResolutionSubmetric label="Medium Priority" /><ResolutionSubmetric label="Low Priority" /></div><SourceNote text="Demo Ticketing Provider · detected-to-resolved interval" /></div> : <Unavailable reason="Ticket resolution lifecycle not available" />}</Panel>;
}
function ResolutionSubmetric({ label }: { label: string }) { return <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60"><p className="text-slate-400">{label}</p><p className="mt-1 font-semibold text-slate-500">N/A</p></div>; }

function UnavailablePanel({ title, reason }: { title: string; reason: string }) { return <Panel title={title} action={<StateBadge demo={false} />}><Unavailable reason={reason} /></Panel>; }
function Unavailable({ reason }: { reason: string }) { return <div className="flex min-h-52 flex-col items-center justify-center px-4 text-center"><p className="text-2xl font-semibold text-slate-300 dark:text-slate-600">N/A</p><p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">{reason}</p></div>; }
function StateBadge({ demo }: { demo: boolean }) { return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide ${demo ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>{demo ? "Demo Data" : "Not Available"}</span>; }
function SourceNote({ text }: { text: string }) { return <p className="mt-3 border-t border-slate-100 pt-2 text-[9px] text-slate-400 dark:border-slate-800">{text}</p>; }

function TicketIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    total: <><path d="M4 6h16v5a2 2 0 0 0 0 4v5H4v-5a2 2 0 0 0 0-4z" /><path d="M12 7v2M12 15v2" /></>,
    open: <><path d="M5 8h14v12H5zM8 8V5h8v3" /><path d="M9 13h6" /></>,
    progress: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    resolved: <><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
    slaMet: <><path d="M6 3h12v18H6z" /><path d="m9 12 2 2 4-5" /></>,
    slaBreached: <><path d="M6 3h12v18H6z" /><path d="m9 10 6 6M15 10l-6 6" /></>,
  };
  return <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" aria-hidden="true"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg></span>;
}

function minutesBetween(start: string, end: string) { return (Date.parse(end) - Date.parse(start)) / 60_000; }
function average(values: number[]) { return values.reduce((sum, value) => sum + value, 0) / values.length; }
function formatDuration(minutes: number) { const hours = Math.floor(minutes / 60); const remainder = Math.round(minutes % 60); return hours ? `${hours}h ${remainder}m` : `${remainder}m`; }
function formatUtc(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }); }
