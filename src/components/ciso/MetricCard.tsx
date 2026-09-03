"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";
import type { CisoMetric } from "@/mock/ciso-dashboard.mock";

export function MetricCard({ metric }: { metric: CisoMetric }) {
  const isPositive = metric.changePct >= 0;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:shadow dark:border-slate-800 dark:bg-slate-900">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-sm dark:bg-slate-800">
            {metric.icon}
          </span>
          <span className="truncate">{metric.title}</span>
        </div>

        <div className="mt-2.5 flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {metric.value}
          </span>
          {metric.max && (
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
              /{metric.max}
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-1 text-[11px] font-medium">
          <span
            className={
              isPositive
                ? metric.isPositiveGood === false
                  ? "text-rose-500"
                  : "text-emerald-600 dark:text-emerald-400"
                : metric.isPositiveGood === false
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-500"
            }
          >
            {isPositive ? "↑" : "↓"} {Math.abs(metric.changePct)}%
          </span>
          <span className="text-slate-400 dark:text-slate-500 text-[10px]">
            vs last 30d
          </span>
        </div>
      </div>

      <div className="h-9 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={metric.sparklineData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={metric.sparklineColor}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
