"use client";

import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/context/sidebar-context";
import { Panel, PanelError, PanelLoading } from "@/components/ui/Panel";
import { useApiResult } from "@/hooks/useApiResult";
import type { ComplianceFrameworkItem, ComplianceOverviewData } from "@/types/compliance";

function score(value: number | null) { return value === null ? "N/A" : `${value}%`; }
function status(item: ComplianceFrameworkItem) {
  if (item.metricKind === "telemetry_observation") return "Telemetry Observation";
  return item.status === "not_assessed" ? "Not Assessed" : item.status.replaceAll("_", " ");
}

function FrameworkTable({ items }: { items: ComplianceFrameworkItem[] }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm">
    <thead className="text-xs text-slate-500"><tr className="border-b border-slate-200 dark:border-slate-800">
      <th className="py-2 font-medium">Framework</th><th className="py-2 text-center font-medium">Score</th>
      <th className="py-2 text-center font-medium">Assessment coverage</th><th className="py-2 font-medium">Status</th>
      <th className="py-2 font-medium">Last assessed</th><th className="py-2 font-medium">Trend</th>
    </tr></thead>
    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{items.map(item => <tr key={item.id} title={item.context}>
      <td className="py-3 font-medium text-slate-700 dark:text-slate-200">{item.name}</td>
      <td className="py-3 text-center font-semibold">{score(item.score)}</td>
      <td className="py-3 text-center text-slate-500">{item.assessedControls !== undefined && item.totalApplicableControls !== undefined
        ? `${item.assessedControls} / ${item.totalApplicableControls} ${item.assessmentScopeLabel ?? "controls assessed"}` : "N/A"}</td>
      <td className="py-3 capitalize text-slate-500">{status(item)}</td>
      <td className="py-3 text-slate-500">{item.lastAssessedAt ? new Date(item.lastAssessedAt).toLocaleString() : "N/A"}</td>
      <td className="py-3 text-slate-500">{item.trend30d === null ? "N/A" : `${item.trend30d > 0 ? "+" : ""}${item.trend30d} pp`}</td>
    </tr>)}</tbody>
  </table></div>;
}

export default function ComplianceDashboardPage() {
  const openSidebar = useSidebarToggle();
  const state = useApiResult<ComplianceOverviewData>("/api/ciso/compliance");
  const formal = state.phase === "ready" ? state.data.frameworks.filter(item => item.metricKind === "formal_assessment") : [];
  const telemetry = state.phase === "ready" ? state.data.frameworks.filter(item => item.metricKind === "telemetry_observation") : [];
  return <>
    <Topbar title="Compliance Assessment" subtitle="Formal human assessments kept separate from security telemetry" onMenuClick={openSidebar} />
    <main className="flex-1 space-y-4 bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
      <Link href="/dashboard/ciso" className="text-sm text-brand-blue hover:underline">Back to CISO dashboard</Link>
      {state.phase === "loading" && <Panel title="Compliance"><PanelLoading /></Panel>}
      {state.phase === "error" && <Panel title="Compliance"><PanelError message={state.message} onRetry={state.reload} /></Panel>}
      {state.phase === "ready" && <>
        <Panel title="Formal Assessments" action={<span className="text-xs text-slate-400">Explicit human assessments only</span>}>
          <FrameworkTable items={formal} />
        </Panel>
        <Panel title="Telemetry Observation" action={<span className="text-xs text-slate-400">Excluded from compliance scoring</span>}>
          <FrameworkTable items={telemetry} />
        </Panel>
        <Panel title="New Compliance Assessment">
          <p className="text-sm text-slate-500">Assessment entry is unavailable until legitimate control catalogs are loaded and authentication supplies an active database-backed admin or CISO assessor identity. Existing data remains readable.</p>
        </Panel>
      </>}
    </main>
  </>;
}
