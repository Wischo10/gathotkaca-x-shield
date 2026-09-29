import type { ReactNode } from "react";
import { Panel } from "@/components/ui/Panel";

const KPI_ITEMS = [
  { title: "Compliance Score", reason: "Compliance assessment source not configured", icon: "score" },
  { title: "Compliant Controls", reason: "Control assessment source not configured", icon: "controls" },
  { title: "Critical Gaps", reason: "Compliance gap source not configured", icon: "gaps" },
  { title: "At Risk", reason: "Compliance risk model not configured", icon: "risk" },
  { title: "Frameworks Monitored", reason: "Framework registry not configured", icon: "frameworks" },
  { title: "Audit Readiness", reason: "Audit readiness source not configured", icon: "audit" },
] as const;

export function MsspCompliance() {
  return <div className="space-y-4">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="text-xl font-semibold text-slate-800 dark:text-white">Compliance</h1><p className="mt-1 text-sm text-slate-500">Compliance posture, control assessment, audit, and evidence visibility.</p></div>
      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900">Compliance assessment source not configured</span>
    </header>

    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">{KPI_ITEMS.map((item) => <ComplianceKpiCard key={item.title} {...item} />)}</section>

    <section className="grid auto-rows-fr gap-4 xl:grid-cols-12">
      <div className="xl:col-span-5"><UnavailablePanel title="Compliance Score Trend" reason="Compliance assessment history not configured" /></div>
      <div className="xl:col-span-3"><UnavailablePanel title="Compliance Score by Framework" reason="Framework assessment data not configured" /></div>
      <div className="xl:col-span-4"><UnavailablePanel title="Compliance Score by Client" reason="Client compliance mapping not configured" /></div>
    </section>

    <section className="grid auto-rows-fr gap-4 xl:grid-cols-12">
      <div className="min-w-0 xl:col-span-5"><FrameworkSummaryTable /></div>
      <div className="min-w-0 xl:col-span-3"><ComplianceGapsTable /></div>
      <div className="xl:col-span-4"><UnavailablePanel title="Compliance Status Distribution" reason="Control assessment status not configured" /></div>
    </section>

    <section className="grid auto-rows-fr gap-4 xl:grid-cols-12">
      <div className="min-w-0 xl:col-span-4"><ComplianceTable title="Upcoming Audits" columns={["Client", "Audit Type", "Framework", "Scheduled Date", "Status"]} reason="Audit schedule not configured" /></div>
      <div className="min-w-0 xl:col-span-4"><ComplianceTable title="Compliance Activities" columns={["Activity", "Client", "Framework", "Due Date", "Status"]} reason="Compliance activity source not configured" /></div>
      <div className="min-w-0 xl:col-span-4"><ComplianceTable title="Compliance Documents" columns={["Document Name", "Framework", "Last Updated", "Type"]} reason="Compliance document registry not configured" /></div>
    </section>
  </div>;
}

function ComplianceKpiCard({ title, reason, icon }: { title: string; reason: string; icon: IconName }) {
  return <article className="flex min-h-32 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
    <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" aria-hidden="true"><ComplianceIcon name={icon} /></span><p className="text-xs font-semibold leading-4 text-slate-500">{title}</p></div><NotAvailableBadge /></div>
    <p className="mt-3 text-2xl font-bold text-slate-800 dark:text-white">N/A</p><p className="mt-auto pt-2 text-[10px] leading-4 text-slate-400">{reason}</p>
  </article>;
}

function FrameworkSummaryTable() {
  return <ComplianceTable title="Compliance Framework Summary" columns={["Framework", "Controls", "Compliant", "Partially Compliant", "Non-Compliant", "Compliance Score", "Trend"]} reason="Framework assessment data is not configured." wide />;
}

function ComplianceGapsTable() {
  return <ComplianceTable title="Top Compliance Gaps" columns={["Gap", "Framework", "Clients Affected", "Risk Level"]} reason="Compliance findings source not configured" />;
}

function ComplianceTable({ title, columns, reason, wide = false }: { title: string; columns: string[]; reason: string; wide?: boolean }) {
  return <Panel title={title} action={<NotAvailableBadge />}><div className="overflow-x-auto"><table className={`w-full text-left text-[10px] ${wide ? "min-w-[760px]" : "min-w-[480px]"}`}><thead className="border-b border-slate-200 bg-slate-50/80 text-slate-400 dark:border-slate-800 dark:bg-slate-950/40"><tr>{columns.map((heading) => <th key={heading} className="whitespace-nowrap px-3 py-2.5 font-semibold">{heading}</th>)}</tr></thead><tbody><tr><td colSpan={columns.length}><UnavailableState reason={reason} /></td></tr></tbody></table></div></Panel>;
}

function UnavailablePanel({ title, reason }: { title: string; reason: string }) { return <Panel title={title} action={<NotAvailableBadge />}><UnavailableState reason={reason} /></Panel>; }
function UnavailableState({ reason }: { reason: string }) { return <div className="flex min-h-52 flex-col items-center justify-center px-4 text-center"><p className="text-2xl font-semibold text-slate-300 dark:text-slate-600">N/A</p><p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">{reason}</p></div>; }
function NotAvailableBadge() { return <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800">Not Available</span>; }

type IconName = (typeof KPI_ITEMS)[number]["icon"];
function ComplianceIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    score: <><circle cx="12" cy="12" r="9" /><path d="M7 15a6 6 0 0 1 10 0M12 12l3-3" /></>,
    controls: <><path d="M6 3h12v18H6z" /><path d="m9 8 1.5 1.5L14 6M9 14h6M9 17h4" /></>,
    gaps: <><path d="M12 3 2.8 20h18.4L12 3Z" /><path d="M12 9v4M12 17h.01" /></>,
    risk: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 17h.01" /></>,
    frameworks: <><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></>,
    audit: <><path d="M7 3h10v4H7zM5 7h14v14H5z" /><path d="m9 14 2 2 4-5" /></>,
  };
  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
