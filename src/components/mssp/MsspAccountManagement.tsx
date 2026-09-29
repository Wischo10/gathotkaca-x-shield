import type { ReactNode } from "react";
import { Panel } from "@/components/ui/Panel";

const KPI_ITEMS = [
  { title: "Total Clients", reason: "Client registry not configured", icon: "clients" },
  { title: "Active Clients", reason: "Client lifecycle status not configured", icon: "active" },
  { title: "New Clients", reason: "Client onboarding history not configured", icon: "new" },
  { title: "Suspended Clients", reason: "Client lifecycle status not configured", icon: "suspended" },
  { title: "Expiring Contracts (< 30 Days)", reason: "Client contract source not configured", icon: "contracts" },
  { title: "Client Satisfaction Score", reason: "Client satisfaction source not configured", icon: "satisfaction" },
] as const;

const CLIENT_COLUMNS = ["Client Name", "Industry", "Status", "Contract Start", "Contract End", "Service Tier", "Account Manager", "Assets", "Open Tickets", "SLA Met", "Last Activity"] as const;

export function MsspAccountManagement() {
  return <div className="space-y-4">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="text-xl font-semibold text-slate-800 dark:text-white">Account Management</h1><p className="mt-1 text-sm text-slate-500">Client lifecycle, contracts, onboarding, and account ownership visibility.</p></div>
      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900">Client account source not configured</span>
    </header>

    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">{KPI_ITEMS.map((item) => <AccountKpiCard key={item.title} {...item} />)}</section>

    <section className="grid auto-rows-fr gap-4 xl:grid-cols-12">
      <div className="xl:col-span-3"><UnavailablePanel title="Clients Overview" reason="Client segmentation not configured" /></div>
      <div className="xl:col-span-3"><UnavailablePanel title="Clients Status" reason="Client lifecycle status not configured" /></div>
      <div className="xl:col-span-6"><UnavailablePanel title="Top Clients by Asset Count" reason="Client-to-asset mapping not configured" /></div>
    </section>

    <section className="grid items-stretch gap-4 xl:grid-cols-12">
      <div className="min-w-0 xl:col-span-8"><AllClientsTable /></div>
      <div className="grid gap-4 xl:col-span-4">
        <UnavailablePanel title="Client Onboarding Pipeline" reason="Client onboarding workflow not configured" compact />
        <UnavailablePanel title="Contract Expiry Overview" reason="Client contract source not configured" compact />
        <UnavailablePanel title="Account Manager Workload" reason="Account manager assignment source not configured" compact />
      </div>
    </section>
  </div>;
}

function AccountKpiCard({ title, reason, icon }: { title: string; reason: string; icon: IconName }) {
  return <article className="flex min-h-32 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" aria-hidden="true"><AccountIcon name={icon} /></span><p className="text-xs font-semibold leading-4 text-slate-500">{title}</p></div><NotAvailableBadge /></div><p className="mt-3 text-2xl font-bold text-slate-800 dark:text-white">N/A</p><p className="mt-auto pt-2 text-[10px] leading-4 text-slate-400">{reason}</p></article>;
}

function AllClientsTable() {
  return <Panel title="All Clients" action={<NotAvailableBadge />}>
    <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800"><table className="w-full min-w-[1180px] text-left text-[10px]"><thead className="border-b border-slate-200 bg-slate-50/80 text-slate-400 dark:border-slate-800 dark:bg-slate-950/40"><tr>{CLIENT_COLUMNS.map((heading) => <th key={heading} className="whitespace-nowrap px-3 py-2.5 font-semibold">{heading}</th>)}</tr></thead><tbody><tr><td colSpan={CLIENT_COLUMNS.length}><UnavailableState reason="Authoritative client registry is not configured." className="min-h-[36rem]" /></td></tr></tbody></table></div>
    <div className="mt-3 text-[10px] text-slate-400">0 clients</div>
  </Panel>;
}

function UnavailablePanel({ title, reason, compact = false }: { title: string; reason: string; compact?: boolean }) { return <Panel title={title} action={<NotAvailableBadge />}><UnavailableState reason={reason} className={compact ? "min-h-36" : "min-h-52"} /></Panel>; }
function UnavailableState({ reason, className }: { reason: string; className: string }) { return <div className={`flex flex-col items-center justify-center px-4 text-center ${className}`}><p className="text-2xl font-semibold text-slate-300 dark:text-slate-600">N/A</p><p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">{reason}</p></div>; }
function NotAvailableBadge() { return <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800">Not Available</span>; }

type IconName = (typeof KPI_ITEMS)[number]["icon"];
function AccountIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    clients: <><circle cx="8" cy="8" r="3" /><circle cx="16" cy="9" r="2.5" /><path d="M3 19c.5-3 2.2-5 5-5s4.5 2 5 5M13 15c3.6-1.2 6.6.7 7 4" /></>,
    active: <><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
    new: <><circle cx="9" cy="8" r="3" /><path d="M4 19c.5-3 2.2-5 5-5M17 11v6M14 14h6" /></>,
    suspended: <><circle cx="12" cy="12" r="9" /><path d="M8.5 12h7" /></>,
    contracts: <><path d="M6 3h9l3 3v15H6z" /><path d="M15 3v4h4M9 12h6M9 16h4" /></>,
    satisfaction: <><circle cx="12" cy="12" r="9" /><path d="M8 14c1 2 2.3 3 4 3s3-1 4-3M9 9h.01M15 9h.01" /></>,
  };
  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
