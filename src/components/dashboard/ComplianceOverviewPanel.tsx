"use client";

import { useState, useMemo } from "react";
import { Panel, PanelEmpty, PanelError, PanelLoading } from "@/components/ui/Panel";
import { useApiResult } from "@/hooks/useApiResult";
import type {
  ComplianceFrameworkItem,
  ComplianceOverviewData,
  ComplianceStatus,
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
      className="flex flex-col justify-between"
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
  return (
    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
      {/* Framework Name */}
      <td className="py-2.5 font-medium text-slate-700 dark:text-slate-200">
        {item.name}
      </td>

      {/* Score */}
      <td className="py-2.5 text-center font-bold text-slate-800 dark:text-white">
        {item.score !== null ? `${item.score}%` : "N/A"}
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
            {Math.abs(item.trend30d)}%
          </span>
        ) : (
          <span className="text-slate-400 font-normal">—</span>
        )}
      </td>

      {/* Status Badge */}
      <td className="py-2.5 text-right">
        <StatusBadge status={item.status} />
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: ComplianceStatus }) {
  switch (status) {
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
          Not Assessed
        </span>
      );
  }
}
