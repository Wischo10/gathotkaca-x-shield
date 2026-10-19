"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import {
  TOP_ALERT_CATEGORIES,
  type AiAlertCategoryItem,
} from "@/services/ai-copilot-demo-provider";

interface TopAlertCategoriesCardProps {
  data?: AiAlertCategoryItem[];
  isRealData?: boolean;
}

export function TopAlertCategoriesCard({
  data = TOP_ALERT_CATEGORIES,
  isRealData = false,
}: TopAlertCategoriesCardProps) {
  // Sort descending by count
  const sortedData = [...data].sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...sortedData.map((d) => d.count), 1);

  return (
    <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Top Alert Categories Analyzed
          </h2>
          <p className="text-[11px] text-slate-400">
            Most frequent detection patterns classified
          </p>
        </div>
        {!isRealData && (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            DEMO DATA
          </span>
        )}
      </div>

      {/* Main Body - Horizontal Bars */}
      <div className="my-auto flex flex-1 flex-col justify-center space-y-2.5 py-2 overflow-y-auto">
        {sortedData.map((item, idx) => {
          const widthPercent = Math.max((item.count / maxCount) * 100, 6);
          // Highlight top categories with subtle gradient / color accents
          const barBg =
            idx === 0
              ? "bg-red-500 dark:bg-red-500"
              : idx === 1
              ? "bg-orange-500 dark:bg-orange-500"
              : idx === 2
              ? "bg-amber-500 dark:bg-amber-500"
              : "bg-blue-500/80 dark:bg-blue-500/80";

          return (
            <div key={item.category} className="group flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="truncate pr-2 font-medium text-slate-700 dark:text-slate-300">
                  {item.category}
                </span>
                <span className="shrink-0 font-semibold text-slate-900 dark:text-slate-100">
                  {item.count.toLocaleString()}
                  <span className="ml-1 text-[11px] font-normal text-slate-400">
                    ({item.percentage}%)
                  </span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barBg}`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
          View all categories →
        </button>
      </div>
    </div>
  );
}
