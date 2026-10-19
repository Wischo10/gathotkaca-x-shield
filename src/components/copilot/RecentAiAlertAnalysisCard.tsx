"use client";

import React, { useState } from "react";
import {
  RECENT_AI_ALERT_ANALYSES,
  type RecentAiAlertAnalysisItem,
} from "@/services/ai-copilot-demo-provider";

interface RecentAiAlertAnalysisCardProps {
  data?: RecentAiAlertAnalysisItem[];
  isRealData?: boolean;
}

export function RecentAiAlertAnalysisCard({
  data = RECENT_AI_ALERT_ANALYSES,
  isRealData = false,
}: RecentAiAlertAnalysisCardProps) {
  const [selectedAlert, setSelectedAlert] = useState<RecentAiAlertAnalysisItem | null>(null);

  const getSeverityBadge = (severity: RecentAiAlertAnalysisItem["severity"]) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-900/50";
      case "High":
        return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-400 dark:border-orange-900/50";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/60 dark:text-yellow-400 dark:border-yellow-900/50";
      case "Low":
      default:
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/50";
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40";
    }
    if (confidence >= 75) {
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40";
    }
    return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  };

  return (
    <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Recent AI Alert Analysis
          </h2>
          <p className="text-[11px] text-slate-400">
            Real-time automated incident evaluations
          </p>
        </div>
        {!isRealData && (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            DEMO DATA
          </span>
        )}
      </div>

      {/* Table Container */}
      <div className="my-auto flex flex-1 flex-col overflow-x-auto py-1">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400 dark:border-slate-800">
              <th className="pb-2 font-medium">Time</th>
              <th className="pb-2 font-medium">Alert Title</th>
              <th className="pb-2 font-medium">Severity</th>
              <th className="pb-2 font-medium">Confidence</th>
              <th className="pb-2 font-medium">Summary</th>
              <th className="pb-2 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
            {data.map((item) => (
              <tr
                key={item.id}
                className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
              >
                {/* Time */}
                <td className="py-2.5 whitespace-nowrap text-[11px] text-slate-500 dark:text-slate-400">
                  {item.time}
                </td>

                {/* Title & Asset */}
                <td className="py-2.5 pr-2 max-w-[140px]">
                  <div className="truncate font-semibold text-slate-800 dark:text-slate-200">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {item.targetAsset}
                  </div>
                </td>

                {/* Severity Badge */}
                <td className="py-2.5 whitespace-nowrap pr-2">
                  <span
                    className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-semibold ${getSeverityBadge(
                      item.severity
                    )}`}
                  >
                    {item.severity}
                  </span>
                </td>

                {/* Confidence Badge */}
                <td className="py-2.5 whitespace-nowrap pr-2">
                  <span
                    className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-semibold ${getConfidenceBadge(
                      item.confidence
                    )}`}
                  >
                    {item.confidence}%
                  </span>
                </td>

                {/* Short readable summary */}
                <td className="py-2.5 max-w-[180px] text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="line-clamp-2 leading-relaxed" title={item.summary}>
                    {item.summary}
                  </div>
                </td>

                {/* Action button */}
                <td className="py-2.5 text-right whitespace-nowrap">
                  <button
                    onClick={() => setSelectedAlert(item)}
                    className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-400"
                    title="View AI details"
                  >
                    <span>View</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer link */}
      <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
          View all analyses →
        </button>
      </div>

      {/* Modal Dialog for Alert View Details */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs text-slate-400">
                  {selectedAlert.id} · {selectedAlert.time}
                </span>
                <h3 className="mt-0.5 text-base font-bold text-slate-900 dark:text-white">
                  {selectedAlert.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${getSeverityBadge(selectedAlert.severity)}`}>
                  {selectedAlert.severity} Severity
                </span>
                <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${getConfidenceBadge(selectedAlert.confidence)}`}>
                  AI Confidence: {selectedAlert.confidence}%
                </span>
                <span className="font-mono text-slate-500 dark:text-slate-400">
                  Target: {selectedAlert.targetAsset}
                </span>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  AI Assessment Summary:
                </div>
                <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-400">
                  {selectedAlert.summary}
                </p>
              </div>

              <div className="text-[11px] text-slate-400">
                Note: This analysis was generated deterministically by the AI Security evaluation engine.
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                onClick={() => setSelectedAlert(null)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
