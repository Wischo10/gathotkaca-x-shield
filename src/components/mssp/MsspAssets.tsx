import type { ReactNode } from "react";
import { Panel } from "@/components/ui/Panel";

const KPI_ITEMS = [
  { title: "Total Assets", reason: "Asset inventory not configured", icon: "total" },
  { title: "Managed Assets", reason: "Asset management status not configured", icon: "managed" },
  { title: "Unmanaged Assets", reason: "Asset management status not configured", icon: "unmanaged" },
  { title: "New Assets", reason: "Asset lifecycle history not configured", icon: "new" },
  { title: "High Risk Assets", reason: "Asset risk model not configured", icon: "risk" },
  { title: "Assets with Vulnerabilities", reason: "Asset-vulnerability mapping not configured", icon: "vulnerable" },
] as const;

export function MsspAssets() {
  return <div className="space-y-4">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="text-xl font-semibold text-slate-800 dark:text-white">Assets</h1><p className="mt-1 text-sm text-slate-500">Asset inventory, risk, lifecycle, and security visibility.</p></div>
      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900">Asset Management integration not configured</span>
    </header>

    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">{KPI_ITEMS.map((item) => <AssetKpiCard key={item.title} {...item} />)}</section>

    <section className="grid auto-rows-fr gap-4 xl:grid-cols-12">
      <div className="xl:col-span-3"><UnavailablePanel title="Assets by Type" reason="Asset classification not configured" /></div>
      <div className="xl:col-span-4"><UnavailablePanel title="Assets Over Time" reason="Asset inventory history not configured" /></div>
      <div className="xl:col-span-3"><UnavailablePanel title="Assets by Operating System" reason="Asset OS inventory not configured" /></div>
      <div className="xl:col-span-2"><UnavailablePanel title="Assets by Risk Level" reason="Asset risk model not configured" /></div>
    </section>

    <section className="grid auto-rows-fr gap-4 xl:grid-cols-12">
      <div className="min-w-0 xl:col-span-5"><TopRiskAssetsTable /></div>
      <div className="xl:col-span-3"><UnavailablePanel title="Assets by Client" reason="Client-to-asset mapping not configured" /></div>
      <div className="xl:col-span-4"><UnavailablePanel title="Assets by Location" reason="Asset location data not configured" /></div>
    </section>

    <section className="grid auto-rows-fr gap-4 xl:grid-cols-12">
      <div className="xl:col-span-3"><UnavailablePanel title="Asset Inventory by Status" reason="Asset lifecycle status not configured" /></div>
      <div className="min-w-0 xl:col-span-6"><RecentAssetChangesTable /></div>
      <div className="xl:col-span-3"><UnavailablePanel title="Asset Discovery Sources" reason="Asset discovery provenance not configured" /></div>
    </section>
  </div>;
}

function AssetKpiCard({ title, reason, icon }: { title: string; reason: string; icon: IconName }) {
  return <article className="flex min-h-32 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" aria-hidden="true"><AssetIcon name={icon} /></span><p className="text-xs font-semibold leading-4 text-slate-500">{title}</p></div><NotAvailableBadge /></div><p className="mt-3 text-2xl font-bold text-slate-800 dark:text-white">N/A</p><p className="mt-auto pt-2 text-[10px] leading-4 text-slate-400">{reason}</p></article>;
}

function TopRiskAssetsTable() {
  return <AssetTable title="Top Assets by Risk Score" columns={["Asset Name", "Client", "Asset Type", "Risk Score", "Risk Level", "Last Seen"]} reason="Asset risk model not configured" />;
}

function RecentAssetChangesTable() {
  return <AssetTable title="Recent Asset Changes" columns={["Time", "Asset Name", "Client", "Change", "Changed By"]} reason="Asset change history not configured" />;
}

function AssetTable({ title, columns, reason }: { title: string; columns: string[]; reason: string }) {
  return <Panel title={title} action={<NotAvailableBadge />}><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-[10px]"><thead className="border-b border-slate-200 bg-slate-50/80 text-slate-400 dark:border-slate-800 dark:bg-slate-950/40"><tr>{columns.map((heading) => <th key={heading} className="whitespace-nowrap px-3 py-2.5 font-semibold">{heading}</th>)}</tr></thead><tbody><tr><td colSpan={columns.length}><UnavailableState reason={reason} /></td></tr></tbody></table></div></Panel>;
}

function UnavailablePanel({ title, reason }: { title: string; reason: string }) { return <Panel title={title} action={<NotAvailableBadge />}><UnavailableState reason={reason} /></Panel>; }
function UnavailableState({ reason }: { reason: string }) { return <div className="flex min-h-52 flex-col items-center justify-center px-4 text-center"><p className="text-2xl font-semibold text-slate-300 dark:text-slate-600">N/A</p><p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">{reason}</p></div>; }
function NotAvailableBadge() { return <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800">Not Available</span>; }

type IconName = (typeof KPI_ITEMS)[number]["icon"];
function AssetIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    total: <><path d="M4 6h16v12H4z" /><path d="M8 21h8M12 18v3" /></>,
    managed: <><path d="M4 6h16v12H4z" /><path d="m9 12 2 2 4-5" /></>,
    unmanaged: <><path d="M4 6h16v12H4z" /><path d="m9 10 6 6M15 10l-6 6" /></>,
    new: <><path d="M4 6h16v12H4z" /><path d="M12 9v6M9 12h6" /></>,
    risk: <><path d="M12 3 2.8 20h18.4L12 3Z" /><path d="M12 9v4M12 17h.01" /></>,
    vulnerable: <><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z" /><path d="M12 8v5M12 17h.01" /></>,
  };
  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
