"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Panel } from "@/components/ui/Panel";
import type { MsspAccountLifecycleStatus, MsspAccountManagementDemoData, MsspAccountSegment, MsspDemoAccountRow } from "@/types/mssp";

const DAY = 86_400_000;
const PAGE_SIZE = 10;
const SEGMENTS: Record<MsspAccountSegment, string> = { Enterprise: "#2563eb", "Large Business": "#06b6d4", "Medium Business": "#f59e0b", "Small Business": "#8b5cf6" };
const STATUSES: Record<MsspAccountLifecycleStatus, string> = { Active: "#22c55e", Onboarding: "#3b82f6", Suspended: "#f59e0b", Offboarding: "#94a3b8" };
const COLUMNS = ["Client Name", "Industry", "Status", "Contract Start", "Contract End", "Service Tier", "Account Manager", "Assets", "Open Tickets", "SLA Met", "Last Activity"];

export function MsspAccountManagement({ demo }: { demo: MsspAccountManagementDemoData }) {
  const [page, setPage] = useState(1);
  const reference = Date.parse(demo.snapshotAt);
  const rows = useMemo(() => demo.rows.slice().sort((a, b) => rank(a.lifecycleStatus) - rank(b.lifecycleStatus) || Date.parse(b.lastActivityAt) - Date.parse(a.lastActivityAt)), [demo.rows]);
  const status = (Object.keys(STATUSES) as MsspAccountLifecycleStatus[]).map((name) => ({ name, value: rows.filter((r) => r.lifecycleStatus === name).length, color: STATUSES[name] }));
  const segment = (Object.keys(SEGMENTS) as MsspAccountSegment[]).map((name) => ({ name, value: rows.filter((r) => r.segment === name).length, color: SEGMENTS[name] }));
  const expiry = [
    { name: "≤ 30 Days", value: rows.filter((r) => daysUntil(r.contractEnd, reference) > 0 && daysUntil(r.contractEnd, reference) <= 30).length, color: "#ef4444" },
    { name: "31–60 Days", value: rows.filter((r) => daysUntil(r.contractEnd, reference) > 30 && daysUntil(r.contractEnd, reference) <= 60).length, color: "#f59e0b" },
    { name: "61–90 Days", value: rows.filter((r) => daysUntil(r.contractEnd, reference) > 60 && daysUntil(r.contractEnd, reference) <= 90).length, color: "#3b82f6" },
    { name: "> 90 Days", value: rows.filter((r) => daysUntil(r.contractEnd, reference) > 90).length, color: "#94a3b8" },
  ];
  const active = countStatus(rows, "Active");
  const suspended = countStatus(rows, "Suspended");
  const newClients = rows.filter((r) => reference - Date.parse(r.contractStart) >= 0 && reference - Date.parse(r.contractStart) <= demo.newClientPeriodDays * DAY).length;
  const satisfaction = avg(rows.map((r) => r.satisfactionScore));
  const kpis = [
    ["Total Clients", `${rows.length}`, demo.kpiHistory.totalClients, "Clients", "◎"],
    ["Active Clients", `${active}`, demo.kpiHistory.activeClients, "Active", "✓"],
    ["New Clients", `${newClients}`, demo.kpiHistory.newClients, `Last ${demo.newClientPeriodDays} days`, "+"],
    ["Suspended Clients", `${suspended}`, demo.kpiHistory.suspendedClients, "Suspended", "−"],
    ["Expiring Contracts (< 30 Days)", `${expiry[0].value}`, demo.kpiHistory.expiringContracts, "From demo snapshot", "▤"],
    ["Client Satisfaction Score", `${satisfaction.toFixed(1)} / 5`, demo.kpiHistory.satisfactionScore, "Eligible demo accounts", "★"],
  ] as const;
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;

  return <div className="space-y-4">
    <header className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h1 className="text-xl font-semibold text-slate-800 dark:text-white">Account Management</h1><DemoBadge /></div><p className="mt-1 text-sm text-slate-500">Demo client lifecycle and account management data</p></div><p className="text-[10px] text-slate-400">Deterministic snapshot · {date(demo.snapshotAt)}</p></header>
    <section className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">{kpis.map(([title, value, history, note, icon]) => <Kpi key={title} title={title} value={value} history={[...history]} note={note} icon={icon} />)}</section>
    <section className="grid items-stretch gap-4 xl:grid-cols-11">
      <div className="xl:col-span-3"><Panel title="Clients Overview" action={<DemoBadge />}><Donut rows={segment} total={rows.length} label="Total Clients" /></Panel></div>
      <div className="xl:col-span-3"><Panel title="Clients Status" action={<DemoBadge />}><Donut rows={status} total={rows.length} label="Total Clients" /></Panel></div>
      <div className="xl:col-span-5"><Panel title="Top Clients by Asset Count" action={<DemoBadge />}><TopClients rows={rows} /></Panel></div>
    </section>
    <section className="grid items-stretch gap-4 xl:grid-cols-12">
      <div className="min-w-0 xl:col-span-8"><Panel title="All Clients" action={<DemoBadge />}><ClientTable rows={rows.slice(start, start + PAGE_SIZE)} /><div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400"><span>Showing {rows.length ? start + 1 : 0}–{Math.min(start + PAGE_SIZE, rows.length)} of {rows.length} clients</span><div className="flex gap-1"><Page disabled={page === 1} click={() => setPage(page - 1)}>Previous</Page>{Array.from({ length: pages }, (_, i) => <Page key={i} active={page === i + 1} click={() => setPage(i + 1)}>{i + 1}</Page>)}<Page disabled={page === pages} click={() => setPage(page + 1)}>Next</Page></div></div></Panel></div>
      <div className="grid min-w-0 gap-4 xl:col-span-4">
        <Panel title="Client Onboarding Pipeline" action={<DemoBadge />}><Onboarding rows={rows.filter((r) => r.lifecycleStatus === "Onboarding")} /></Panel>
        <Panel title="Contract Expiry Overview" action={<DemoBadge />}><Donut rows={expiry} total={expiry.reduce((n, r) => n + r.value, 0)} label="Total Contracts" compact /></Panel>
        <Panel title="Account Manager Workload" action={<DemoBadge />}><Workload rows={rows} /></Panel>
      </div>
    </section>
  </div>;
}

function Kpi({ title, value, history, note, icon }: { title: string; value: string; history: number[]; note: string; icon: string }) {
  const delta = history.at(-1)! - history[0];
  return <article className="flex min-h-32 flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-xs font-bold text-amber-600 dark:bg-amber-950">{icon}</span><p className="text-[11px] font-semibold leading-4 text-slate-500">{title}</p></div><DemoBadge /></div><div className="mt-2 grid grid-cols-[1fr_4rem] items-end gap-1"><div><p className="text-xl font-bold leading-none text-slate-800 dark:text-white">{value}</p><p className={delta >= 0 ? "mt-1 text-[9px] text-emerald-600" : "mt-1 text-[9px] text-rose-500"}>{delta >= 0 ? "↑" : "↓"} {Math.abs(delta).toFixed(title.includes("Satisfaction") ? 1 : 0)} <span className="text-slate-400">demo trend</span></p></div><div className="h-9"><ResponsiveContainer><LineChart data={history.map((point, i) => ({ i, point }))}><Line dataKey="point" stroke="#f59e0b" strokeWidth={1.8} dot={false} /></LineChart></ResponsiveContainer></div></div><p className="mt-auto pt-1 text-[8px] text-slate-400">{note}</p></article>;
}

function Donut({ rows, total, label, compact = false }: { rows: { name: string; value: number; color: string }[]; total: number; label: string; compact?: boolean }) {
  return <div className={`grid grid-cols-[8.5rem_1fr] items-center gap-2 ${compact ? "min-h-36" : "min-h-48"}`}><div className="relative h-36"><ResponsiveContainer><PieChart><Pie data={rows} dataKey="value" innerRadius={43} outerRadius={62} strokeWidth={0}>{rows.map((r) => <Cell key={r.name} fill={r.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><strong className="text-xl text-slate-800 dark:text-white">{total}</strong><span className="text-[8px] text-slate-400">{label}</span></div></div><div className="space-y-2">{rows.map((r) => <div key={r.name} className="grid grid-cols-[auto_1fr_auto] items-center gap-1.5 text-[9px]"><i className="h-1.5 w-1.5 rounded-full" style={{ background: r.color }} /><span className="truncate text-slate-500">{r.name}</span><span><b>{r.value}</b> <em className="ml-1 not-italic text-slate-400">{total ? (r.value / total * 100).toFixed(0) : 0}%</em></span></div>)}</div></div>;
}
function TopClients({ rows }: { rows: MsspDemoAccountRow[] }) {
  const top = rows.slice().sort((a, b) => b.assets - a.assets || a.clientName.localeCompare(b.clientName)).slice(0, 6);
  const max = Math.max(1, ...top.map((r) => r.assets));
  return <div className="space-y-2.5 py-1">{top.map((r) => <div key={r.clientId} className="grid grid-cols-[minmax(8rem,1fr)_minmax(6rem,.7fr)_2rem_minmax(5rem,1fr)] items-center gap-2 text-[9px]"><b className="truncate text-slate-700 dark:text-slate-200">{r.clientName}</b><span className="truncate text-slate-400">{r.industry}</span><b className="text-right">{r.assets}</b><div className="h-1.5 overflow-hidden rounded bg-slate-100 dark:bg-slate-800"><div className="h-full rounded bg-blue-500" style={{ width: `${r.assets / max * 100}%` }} /></div></div>)}<p className="text-right text-[8px] text-slate-400">Current shared inventory · no historical trend available</p></div>;
}
function ClientTable({ rows }: { rows: MsspDemoAccountRow[] }) {
  return <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800"><table className="w-full min-w-[1120px] table-fixed text-left text-[9px]"><thead className="border-b border-slate-200 bg-slate-50/80 text-slate-400 dark:border-slate-800 dark:bg-slate-950/40"><tr>{COLUMNS.map((h) => <th key={h} className="whitespace-nowrap px-2 py-2 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{rows.map((r) => <tr key={r.clientId}><Td strong>{r.clientName}</Td><Td>{r.industry}</Td><Td><Status value={r.lifecycleStatus} /></Td><Td>{date(r.contractStart)}</Td><Td>{date(r.contractEnd)}</Td><Td>{r.serviceTier}</Td><Td>{r.accountOwner}</Td><Td>{r.assets}</Td><Td>{r.openTickets}</Td><Td>{r.slaPercent.toFixed(1)}%</Td><Td>{dateTime(r.lastActivityAt)}</Td></tr>)}</tbody></table></div>;
}
function Onboarding({ rows }: { rows: MsspDemoAccountRow[] }) { return <div className="space-y-3 py-1">{rows.map((r) => <div key={r.clientId}><div className="flex justify-between gap-2 text-[9px]"><b className="truncate text-slate-600 dark:text-slate-300">{r.clientName}</b><span className="text-slate-400">{r.onboardingProgress}%</span></div><p className="my-1 text-[8px] text-slate-400">{r.onboardingStage}</p><Bar value={r.onboardingProgress} /></div>)}</div>; }
function Workload({ rows }: { rows: MsspDemoAccountRow[] }) {
  const managers = Array.from(new Set(rows.map((r) => r.accountOwner))).map((name) => { const owned = rows.filter((r) => r.accountOwner === name); return { name, clients: owned.length, tickets: owned.reduce((n, r) => n + r.openTickets, 0), sla: avg(owned.map((r) => r.slaPercent)) }; });
  return <table className="w-full text-left text-[9px]"><thead className="border-b border-slate-100 text-slate-400 dark:border-slate-800"><tr>{["Account Manager", "Clients", "Open Tickets", "SLA Met"].map((h) => <th key={h} className="px-1.5 py-2 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{managers.map((m) => <tr key={m.name}><Td strong>{m.name}</Td><Td>{m.clients}</Td><Td>{m.tickets}</Td><td className="px-1.5 py-2">{m.sla.toFixed(1)}%<Bar value={m.sla} /></td></tr>)}</tbody></table>;
}
function Td({ children, strong = false }: { children: ReactNode; strong?: boolean }) { return <td className={`truncate whitespace-nowrap px-2 py-2 ${strong ? "font-semibold text-slate-700 dark:text-slate-200" : "text-slate-500 dark:text-slate-300"}`}>{children}</td>; }
function Status({ value }: { value: MsspAccountLifecycleStatus }) { return <span className="rounded-full px-1.5 py-0.5 text-[8px] font-semibold" style={{ color: STATUSES[value], backgroundColor: `${STATUSES[value]}18` }}>{value}</span>; }
function Bar({ value }: { value: number }) { return <div className="mt-1 h-1.5 overflow-hidden rounded bg-slate-100 dark:bg-slate-800"><div className="h-full rounded bg-blue-500" style={{ width: `${value}%` }} /></div>; }
function Page({ children, disabled, active, click }: { children: ReactNode; disabled?: boolean; active?: boolean; click: () => void }) { return <button type="button" disabled={disabled} onClick={click} className={`rounded-md border px-2 py-1 font-medium disabled:opacity-40 ${active ? "border-blue-500 bg-blue-50 text-blue-600" : "border-slate-200 dark:border-slate-700"}`}>{children}</button>; }
function DemoBadge() { return <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-950 dark:text-amber-300">Demo Data</span>; }
function rank(value: MsspAccountLifecycleStatus) { return ({ Active: 0, Onboarding: 1, Suspended: 2, Offboarding: 3 })[value]; }
function countStatus(rows: MsspDemoAccountRow[], value: MsspAccountLifecycleStatus) { return rows.filter((r) => r.lifecycleStatus === value).length; }
function daysUntil(value: string, reference: number) { return (Date.parse(value) - reference) / DAY; }
function avg(values: number[]) { return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0; }
function date(value: string) { return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)); }
function dateTime(value: string) { return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value)); }
