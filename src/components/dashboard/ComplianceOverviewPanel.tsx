"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Panel, PanelEmpty, PanelError, PanelLoading } from "@/components/ui/Panel";
import { useApiResult } from "@/hooks/useApiResult";
import type {
  ComplianceFrameworkItem,
  ComplianceOverviewData,
} from "@/types/compliance";

export function ComplianceOverviewPanel() {
  const [selectedFramework, setSelectedFramework] = useState<string>("all");
  const state = useApiResult<ComplianceOverviewData>("/api/ciso/compliance");

  const frameworks = useMemo(() => {
    if (state.phase !== "ready" || !state.data?.frameworks) return [];
    if (selectedFramework === "all") return state.data.frameworks;
    return state.data.frameworks.filter((f) => f.id === selectedFramework);
  }, [state, selectedFramework]);

  return (
    <Panel
      title="Compliance Overview"
      action={
        <div className="flex items-center gap-2">
          <select
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value)}
            className="rounded border border-slate-200 dark:border-slate-700 bg-transparent px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-blue"
          >
            <option value="all" className="bg-white dark:bg-slate-900">
              All Frameworks
            </option>
            {state.phase === "ready" &&
              state.data.frameworks.map((f) => (
                <option
                  key={f.id}
                  value={f.id}
                  className="bg-white dark:bg-slate-900"
                >
                  {f.name}
                </option>
              ))}
          </select>
        </div>
      }
      className="flex h-full min-h-[320px] flex-col justify-between xl:h-[340px]"
    >
      {state.phase === "loading" && <PanelLoading />}
      {state.phase === "empty" && (
        <PanelEmpty message="No compliance framework definitions available." />
      )}
      {state.phase === "error" && (
        <PanelError message={state.message} onRetry={state.reload} />
      )}
      {state.phase === "ready" && (
        <div className="overflow-x-auto my-1">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-medium">
                <th className="pb-2 font-medium">Framework</th>
                <th className="pb-2 text-center font-medium">Score</th>
                <th className="pb-2 text-center font-medium">Trend (30 Days)</th>
                <th className="pb-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {frameworks.map((item) => (
                <FrameworkRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 flex items-center justify-end border-t border-slate-100 dark:border-slate-800 pt-2 text-xs">
        <a
          href="/dashboard/compliance"
          className="text-brand-blue hover:underline cursor-pointer font-medium"
        >
          View compliance dashboard →
        </a>
      </div>
    </Panel>
  );
}

function FrameworkRow({ item }: { item: ComplianceFrameworkItem }) {
  const isPendingAssessment = item.metricKind !== "telemetry_observation"
    && (item.assessmentProgressStatus === "not_assessed"
      || (item.assessmentProgressStatus === undefined && item.status === "not_assessed"));

  return (
    <tr title={item.context} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
      {/* Framework Name */}
      <td className="py-2.5 font-medium text-slate-700 dark:text-slate-200">
        <div>{item.name}</div>
        <div className="mt-0.5 text-[10px] font-normal text-slate-400">
          {item.metricKind === "telemetry_observation" ? "Telemetry Observation" : "Formal Assessment"}
          {item.assessedControls !== undefined && item.totalApplicableControls !== undefined
            ? ` · ${item.assessedControls} / ${item.totalApplicableControls} ${item.assessmentScopeLabel ?? "controls assessed"}${item.assessmentCoveragePercent !== undefined ? ` (${item.assessmentCoveragePercent}% coverage)` : ""}` : ""}
        </div>
        <div className="mt-0.5 text-[10px] font-normal text-slate-400">
          {item.metricKind === "telemetry_observation"
            ? "Telemetry; not a formal assessment"
            : item.lastAssessedAt
              ? `Last assessed ${new Date(item.lastAssessedAt).toLocaleString()}`
              : item.id === "uu-pdp"
                ? "Assessment workspace ready; business assessment pending"
                : "Business assessment has not yet been performed"}
        </div>
        {item.id === "uu-pdp" && isPendingAssessment && (
          <Link href="/dashboard/compliance/uu-pdp" className="mt-1 inline-block text-[10px] font-semibold text-brand-blue hover:underline">
            Start Assessment
          </Link>
        )}
      </td>

      {/* Score */}
      <td className="py-2.5 text-center font-bold text-slate-800 dark:text-white">
        {item.score !== null ? <><div>{item.score}%</div>{item.scoreIsInterim&&<div className="mt-0.5 text-[9px] font-normal text-amber-600 dark:text-amber-400">Interim Assessment Score</div>}</>
          : isPendingAssessment ? "Not Assessed" : "Unavailable"}
      </td>

      {/* Trend (30 Days) */}
      <td className="py-2.5 text-center">
        {item.trend30d !== null ? (
          <span
            className={`inline-flex items-center text-[11px] font-semibold ${
              item.trend30d > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : item.trend30d < 0
                ? "text-red-600 dark:text-red-400"
                : "text-slate-500"
            }`}
          >
            {item.trend30d > 0 ? "↑ " : item.trend30d < 0 ? "↓ " : ""}
            {Math.abs(item.trend30d)}{item.trendUnit === "percentage_points" ? " pp" : "%"}
          </span>
        ) : (
          <span className="text-slate-400 font-normal">
            {item.trendStatus === "insufficient_history" ? "Insufficient History"
              : item.trendStatus === "not_assessed" ? "No Assessment History" : "Unavailable"}
          </span>
        )}
      </td>

      {/* Status Badge */}
      <td className="py-2.5 text-right">
        <StatusBadge item={item} />
      </td>
    </tr>
  );
}

function StatusBadge({ item }: { item: ComplianceFrameworkItem }) {
  const { status } = item;
  if (item.metricKind === "formal_assessment" && item.assessmentProgressStatus === "assessment_in_progress") {
    return <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">Assessment In Progress</span>;
  }
  if (item.metricKind === "formal_assessment" && item.assessmentProgressStatus === "not_assessed") {
    return <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">Assessment Pending</span>;
  }
  if (item.metricKind === "formal_assessment" && item.assessmentProgressStatus === "assessment_complete" && item.score === null) {
    return <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">Assessment Complete · No Score</span>;
  }
  switch (status) {
    case "telemetry":
      return (
        <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          Telemetry Observation
        </span>
      );
    case "compliant":
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          Compliant
        </span>
      );
    case "partial":
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
          Partial
        </span>
      );
    case "non_compliant":
      return (
        <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950/40 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
          Non-Compliant
        </span>
      );
    case "not_assessed":
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          Assessment Pending
        </span>
      );
  }
}
