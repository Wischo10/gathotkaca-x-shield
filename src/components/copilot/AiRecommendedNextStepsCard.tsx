"use client";

import React from "react";
import {
  AI_RECOMMENDED_NEXT_STEPS,
  type AiRecommendationItem,
} from "@/services/ai-copilot-demo-provider";

interface AiRecommendedNextStepsCardProps {
  data?: AiRecommendationItem[];
  isRealData?: boolean;
}

export function AiRecommendedNextStepsCard({
  data = AI_RECOMMENDED_NEXT_STEPS,
  isRealData = false,
}: AiRecommendedNextStepsCardProps) {
  const getPriorityBadge = (priority: AiRecommendationItem["priority"]) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/40";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40";
      case "Low":
      default:
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/40";
    }
  };

  const getStepIcon = (icon: string) => {
    switch (icon) {
      case "shield-alert":
        return (
          <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "search":
        return (
          <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case "sliders":
        return (
          <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        );
      case "archive":
      default:
        return (
          <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        );
    }
  };

  return (
    <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            AI Recommended Next Steps
          </h2>
          <p className="text-[11px] text-slate-400">
            Suggested mitigation & investigation actions
          </p>
        </div>
        {!isRealData && (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            DEMO DATA
          </span>
        )}
      </div>

      {/* Main List */}
      <div className="my-auto flex flex-1 flex-col justify-center gap-2.5 py-2 overflow-y-auto">
        {data.map((step) => (
          <div
            key={step.id}
            className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 transition-all hover:border-slate-200 hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950/40 dark:hover:border-slate-700 dark:hover:bg-slate-950/70"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-700 dark:bg-slate-800">
              {getStepIcon(step.icon)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {step.title}
                </span>
                <span
                  className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-semibold ${getPriorityBadge(
                    step.priority
                  )}`}
                >
                  {step.priority} Priority
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {step.explanation}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer disclaimer emphasizing advisory role */}
      <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
        <span className="text-[10px] text-slate-400">
          Advisory suggestions • Requires analyst validation before execution
        </span>
      </div>
    </div>
  );
}
