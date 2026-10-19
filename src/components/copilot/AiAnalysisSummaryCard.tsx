"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  AI_SEVERITY_SUMMARY,
  TOTAL_ANALYSES_COUNT,
  type AiSeveritySummaryItem,
} from "@/services/ai-copilot-demo-provider";

interface AiAnalysisSummaryCardProps {
  data?: AiSeveritySummaryItem[];
  total?: number;
  isRealData?: boolean;
}

export function AiAnalysisSummaryCard({
  data = AI_SEVERITY_SUMMARY,
  total = TOTAL_ANALYSES_COUNT,
  isRealData = false,
}: AiAnalysisSummaryCardProps) {
  return (
    <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            AI Analysis Summary (This Week)
          </h2>
          <p className="text-[11px] text-slate-400">
            Severity breakdown of AI processed events
          </p>
        </div>
        {!isRealData && (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            DEMO DATA
          </span>
        )}
      </div>

      {/* Main Body */}
      <div className="my-auto flex flex-1 flex-col items-center justify-center py-2 sm:flex-row sm:justify-around sm:gap-4">
        {/* Donut Chart with Centered Total */}
        <div className="relative h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                stroke="none"
              >
                {data.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as AiSeveritySummaryItem;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-md dark:border-slate-700 dark:bg-slate-800">
                        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: item.color }}>
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                          {item.name}
                        </div>
                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                          {item.count.toLocaleString()} analyses ({item.percentage}%)
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Donut Center Overlay */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold leading-none text-slate-800 dark:text-white">
              {total.toLocaleString()}
            </span>
            <span className="mt-1 text-[10px] uppercase font-medium tracking-wide text-slate-400">
              Total Analyses
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex w-full flex-col justify-center gap-2 px-2 sm:w-auto sm:px-0">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {item.count.toLocaleString()}
                </span>
                <span className="w-8 text-right text-[11px] text-slate-400">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
          View analysis details →
        </button>
      </div>
    </div>
  );
}
