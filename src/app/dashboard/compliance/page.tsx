"use client";

import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/context/sidebar-context";
import { Panel, PanelError, PanelLoading } from "@/components/ui/Panel";
import { useApiResult } from "@/hooks/useApiResult";
import type { ComplianceFrameworkItem, ComplianceOverviewData } from "@/types/compliance";

function score(item: ComplianceFrameworkItem) {
  if (item.score !== null) return `${item.score}%${item.scoreIsInterim ? " — Interim" : ""}`;
  return item.status === "not_assessed" ? "Not Assessed" : "Unavailable";
}
function status(item: ComplianceFrameworkItem) {
  if (item.metricKind === "telemetry_observation") return "Telemetry Observation";
  if (item.assessmentProgressStatus === "assessment_in_progress") return "Assessment In Progress";
  if (item.assessmentProgressStatus === "not_assessed") return "Assessment Pending";
  if (item.assessmentProgressStatus === "assessment_complete" && item.score === null) return "Assessment Complete — No Score";
  return item.status === "not_assessed" ? "Assessment Pending" : item.status.replaceAll("_", " ");
}
function trend(item: ComplianceFrameworkItem) {
  if (item.trend30d !== null) return `${item.trend30d > 0 ? "+" : ""}${item.trend30d} pp`;
  if (item.trendStatus === "not_assessed") return "No Assessment History";
  if (item.trendStatus === "insufficient_history") return "Insufficient History";
  return "Unavailable";
}

function FrameworkTable({ items }: { items: ComplianceFrameworkItem[] }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm">
    <thead className="text-xs text-slate-500"><tr className="border-b border-slate-200 dark:border-slate-800">
      <th className="py-2 font-medium">Framework</th><th className="py-2 text-center font-medium">Score</th>
      <th className="py-2 text-center font-medium">Assessment coverage</th><th className="py-2 font-medium">Status</th>
      <th className="py-2 font-medium">Assessment states</th><th className="py-2 font-medium">Last assessed</th><th className="py-2 font-medium">Trend</th><th className="py-2 font-medium">Action</th>
    </tr></thead>
    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{items.map(item => <tr key={item.id} title={item.context}>
      <td className="py-3 font-medium text-slate-700 dark:text-slate-200">{item.name}</td>
      <td className="py-3 text-center font-semibold">{score(item)}</td>
      <td className="py-3 text-center text-slate-500">{item.assessedControls !== undefined && item.totalApplicableControls !== undefined
        ? `${item.assessedControls} / ${item.totalApplicableControls} ${item.assessmentScopeLabel ?? "controls assessed"}${item.assessmentCoveragePercent !== undefined ? ` (${item.assessmentCoveragePercent}%)` : ""}`
        : item.metricKind === "telemetry_observation" ? "Not applicable" : "Not reported"}</td>
      <td className="py-3 capitalize text-slate-500">{status(item)}</td>
      <td className="py-3 text-slate-500">{item.metricKind === "formal_assessment" ? `Compliant ${item.passedControls ?? 0} · Partial ${item.partialControls ?? 0} · Non-Compliant ${item.failedControls ?? 0} · Not Assessed ${item.notAssessedControls ?? item.totalApplicableControls ?? "N/A"}` : "Not applicable"}</td>
      <td className="py-3 text-slate-500">{item.lastAssessedAt ? new Date(item.lastAssessedAt).toLocaleString() : item.status === "not_assessed" ? "Not Assessed" : "Not applicable"}</td>
      <td className="py-3 text-slate-500">{trend(item)}</td>
      <td className="py-3">{item.id === "uu-pdp"
        ? <Link href="/dashboard/compliance/uu-pdp" className="font-medium text-brand-blue hover:underline">{(item.assessedControls ?? 0) === 0 ? "Start Assessment" : "Manage Assessment"}</Link>
        : item.id === "nist-csf"
          ? <Link href="/dashboard/ciso/security-posture" className="font-medium text-brand-blue hover:underline">Manage Assessment</Link>
          : <span className="text-slate-400">No assessment workflow</span>}</td>
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
        <div className="text-right"><Link href="/dashboard/compliance/uu-pdp" className="text-sm font-medium text-brand-blue hover:underline">Open UU PDP baseline →</Link></div>
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
