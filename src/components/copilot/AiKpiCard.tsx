"use client";

import React from "react";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import type { AiKpiMetric } from "@/services/ai-copilot-demo-provider";

export function AiKpiCard({ metric }: { metric: AiKpiMetric }) {
  const getIcon = (name: string) => {
    switch (name) {
      case "sparkles":
        return (
          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case "document":
        return (
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "shield":
        return (
          <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case "clock":
        return (
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "zap":
      default:
        return (
          <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  const getBgColor = (name: string) => {
    switch (name) {
      case "sparkles":
        return "bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900/40";
      case "document":
        return "bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/40";
      case "shield":
        return "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/40";
      case "clock":
        return "bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/40";
      case "zap":
      default:
        return "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/40";
    }
  };

  const getSparklineColor = (name: string) => {
    switch (name) {
      case "sparkles":
        return "#a855f7";
      case "document":
        return "#3b82f6";
      case "shield":
        return "#10b981";
      case "clock":
        return "#f59e0b";
      case "zap":
      default:
        return "#6366f1";
    }
  };

  return (
    <div className="flex h-full min-w-0 flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${getBgColor(
              metric.icon
            )}`}
          >
            {getIcon(metric.icon)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
              {metric.label}
            </h3>
            <div className="mt-0.5 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {metric.value}
            </div>
          </div>
        </div>

        {/* DEMO DATA badge */}
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          DEMO DATA
        </span>
      </div>

      {/* Comparison trend & Mini sparkline */}
      <div className="mt-3 flex items-end justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          <span>{metric.trendText}</span>
        </div>

        {/* Small sparkline */}
        <div className="h-7 w-20 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metric.sparkline}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={getSparklineColor(metric.icon)}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
