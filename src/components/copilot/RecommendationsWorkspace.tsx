"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { AiKpiCard } from "./AiKpiCard";
import {
  RECOMMENDATION_TAB_KPIS,
  TOP_RECOMMENDED_ACTIONS,
  RECOMMENDATIONS_BY_CATEGORY,
  TOTAL_RECOMMENDATIONS_COUNT,
  PRIORITIZATION_MATRIX_CELLS,
  IMPLEMENTATION_STATUS_DATA,
  RECOMMENDATIONS_OVER_TIME_SERIES,
  TOP_ASSETS_TO_IMPROVE,
  RECENT_RECOMMENDATIONS_LIST,
  type TopRecommendedActionItem,
  type TopAssetToImproveItem,
  type RecentRecommendationRecord,
} from "@/services/ai-copilot-demo-provider";

export function RecommendationsWorkspace() {
  const [trendGranularity, setTrendGranularity] = useState<string>("Daily");

  const getPriorityBadge = (priority: TopRecommendedActionItem["priority"] | string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/50";
      case "High":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-900/50";
      case "Medium":
        return "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400 dark:border-yellow-900/50";
      case "Low":
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/50";
    }
  };

  const getImpactBadge = (impact: "High" | "Medium" | "Low" | string) => {
    switch (impact) {
      case "High":
        return "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/40";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40";
      case "Low":
      default:
        return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  const getStatusBadge = (status: RecentRecommendationRecord["status"] | string) => {
    switch (status) {
      case "Implemented":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/50";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900/50";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/50";
      case "Overdue":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900/50";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  const getRiskBadge = (risk: TopAssetToImproveItem["riskLevel"]) => {
    switch (risk) {
      case "Critical":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-900/50";
      case "High":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-400 dark:border-orange-900/50";
      case "Medium":
        return "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/60 dark:text-yellow-400 dark:border-yellow-900/50";
      case "Low":
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/50";
    }
  };

  const matrixImpactRows: Array<"High" | "Medium" | "Low"> = ["High", "Medium", "Low"];
  const matrixEffortCols: Array<"Low" | "Medium" | "High"> = ["Low", "Medium", "High"];

  return (
    <div className="space-y-4">
      {/* =========================================================================
          TOP KPI CARDS (6 in One Row)
          1. Total Recommendations (156)
          2. High Priority (48 (31%))
          3. Implemented (62 (40%))
          4. In Progress (54 (35%))
          5. Overdue (12 (8%))
          6. Effectiveness Score (87%)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 items-stretch">
        {RECOMMENDATION_TAB_KPIS.map((metric) => (
          <AiKpiCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* =========================================================================
          ROW 1: 3 CARDS ACROSS THE PAGE
          CARD 1: Top Recommended Actions (Large Table)
          CARD 2: Recommendation by Category (Donut Chart)
          CARD 3: Recommendation Prioritization Matrix (3x3 Grid)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* CARD 1: Top Recommended Actions */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Top Recommended Actions
              </h2>
              <p className="text-[11px] text-slate-400">
                High-leverage remediations ranked by risk impact
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                DEMO DATA
              </span>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
                View All →
              </button>
            </div>
          </div>

          <div className="my-2 flex flex-1 flex-col overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400 dark:border-slate-800">
                  <th className="pb-2 font-medium">Recommendation</th>
                  <th className="pb-2 font-medium">Category</th>
                  <th className="pb-2 font-medium">Priority</th>
                  <th className="pb-2 font-medium">Impact</th>
                  <th className="pb-2 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                {TOP_RECOMMENDED_ACTIONS.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-2.5 pr-2 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[170px] text-[11px]">
                      {row.recommendation}
                    </td>
                    <td className="py-2.5 text-slate-500 whitespace-nowrap text-[11px]">
                      {row.category}
                    </td>
                    <td className="py-2.5 whitespace-nowrap">
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold ${getPriorityBadge(
                          row.priority
                        )}`}
                      >
                        {row.priority}
                      </span>
                    </td>
                    <td className="py-2.5 whitespace-nowrap">
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold ${getImpactBadge(
                          row.impact
                        )}`}
                      >
                        {row.impact}
                      </span>
                    </td>
                    <td className="py-2.5 text-right whitespace-nowrap">
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold ${getStatusBadge(
                          row.status
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-[11px] text-slate-400 dark:border-slate-800/80 flex items-center justify-between">
            <span>5 priority remediations active</span>
            <span className="font-medium text-slate-600 dark:text-slate-300">
              Avg resolution: 18h
            </span>
          </div>
        </div>

        {/* CARD 2: Recommendation by Category (Donut Chart) */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Recommendation by Category
              </h2>
              <p className="text-[11px] text-slate-400">
                Functional distribution across security pillars
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                DEMO DATA
              </span>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
                View All →
              </button>
            </div>
          </div>

          {/* Donut chart with centered total count */}
          <div className="my-auto flex flex-1 flex-col items-center justify-center py-2 sm:flex-row sm:justify-around sm:gap-4">
            <div className="relative h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={RECOMMENDATIONS_BY_CATEGORY}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {RECOMMENDATIONS_BY_CATEGORY.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                      color: "#f8fafc",
                    }}
                    formatter={(val: number, name: string) => [
                      `${val} (${Math.round((val / TOTAL_RECOMMENDATIONS_COUNT) * 100)}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {TOTAL_RECOMMENDATIONS_COUNT}
                </span>
                <span className="text-[10px] text-slate-500 leading-tight">
                  Total Recommendations
                </span>
              </div>
            </div>

            {/* Legend list */}
            <div className="mt-3 flex w-full flex-col gap-1.5 sm:mt-0 sm:w-auto text-xs">
              {RECOMMENDATIONS_BY_CATEGORY.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100 text-[11px]">
                    <span>{item.count}</span>
                    <span className="font-normal text-slate-400">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-[11px] text-slate-400 dark:border-slate-800/80 flex items-center justify-between">
            <span>Threat Prevention is largest share</span>
            <span className="font-medium text-slate-600 dark:text-slate-300">
              42 actions (27%)
            </span>
          </div>
        </div>

        {/* CARD 3: Recommendation Prioritization Matrix (3x3) */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Prioritization Matrix
              </h2>
              <p className="text-[11px] text-slate-400">
                Impact vs Effort action quadrant
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                DEMO DATA
              </span>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
                View All →
              </button>
            </div>
          </div>

          {/* 3x3 Matrix Grid */}
          <div className="my-auto flex flex-1 flex-col justify-center py-2">
            {/* Column labels (Effort: Low, Medium, High) */}
            <div className="grid grid-cols-[3.5rem_repeat(3,minmax(0,1fr))] gap-1.5 text-center text-[10px] font-semibold text-slate-400 mb-1">
              <div></div>
              <div>Low Effort</div>
              <div>Med Effort</div>
              <div>High Effort</div>
            </div>

            {/* Matrix rows (Impact: High, Medium, Low) */}
            <div className="space-y-1.5">
              {matrixImpactRows.map((impact) => (
                <div
                  key={impact}
                  className="grid grid-cols-[3.5rem_repeat(3,minmax(0,1fr))] gap-1.5 items-center"
                >
                  <div className="text-[10px] font-semibold text-slate-500 text-right pr-2">
                    {impact}
                  </div>
                  {matrixEffortCols.map((effort) => {
                    const cell = PRIORITIZATION_MATRIX_CELLS[impact][effort];
                    return (
                      <div
                        key={effort}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all hover:scale-[1.02] cursor-pointer ${cell.badgeBg}`}
                      >
                        <span className="text-sm font-bold">{cell.count}</span>
                        <span className="text-[9px] opacity-80 whitespace-nowrap">
                          {cell.actionType}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend: Do First, Schedule, Consider, Monitor */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[10px] pt-1">
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Do First
              </span>
              <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Schedule
              </span>
              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Consider
              </span>
              <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-slate-400" /> Monitor
              </span>
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-[11px] text-slate-400 dark:border-slate-800/80 flex items-center justify-between">
            <span>34 High Impact / Low Effort recommendations</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Do First
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 2: 3 CARDS ACROSS THE PAGE
          CARD 4: Implementation Status (Donut Chart: Implemented 62, In Progress 54, Pending 28, Overdue 12)
          CARD 5: Recommendations Over Time (Line Chart with Daily selector)
          CARD 6: Top Assets to Improve (Table)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* CARD 4: Implementation Status */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Implementation Status
              </h2>
              <p className="text-[11px] text-slate-400">
                Execution lifecycle metrics (Total 156)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                DEMO DATA
              </span>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
                View All →
              </button>
            </div>
          </div>

          {/* Donut chart */}
          <div className="my-auto flex flex-1 flex-col items-center justify-center py-2 sm:flex-row sm:justify-around sm:gap-4">
            <div className="relative h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={IMPLEMENTATION_STATUS_DATA}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {IMPLEMENTATION_STATUS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                      color: "#f8fafc",
                    }}
                    formatter={(val: number, name: string) => [
                      `${val} (${Math.round((val / TOTAL_RECOMMENDATIONS_COUNT) * 100)}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  156
                </span>
                <span className="text-[10px] text-slate-500">Total</span>
              </div>
            </div>

            {/* Legend list */}
            <div className="mt-3 flex w-full flex-col gap-2 sm:mt-0 sm:w-auto text-xs">
              {IMPLEMENTATION_STATUS_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100 text-[11px]">
                    <span>{item.count}</span>
                    <span className="font-normal text-slate-400">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-[11px] text-slate-400 dark:border-slate-800/80 flex items-center justify-between">
            <span>75% implemented or in-progress</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              116 active/done
            </span>
          </div>
        </div>

        {/* CARD 5: Recommendations Over Time (Line Chart) */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Recommendations Over Time
              </h2>
              <p className="text-[11px] text-slate-400">
                Progress tracking across May cohort
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={trendGranularity}
                onChange={(e) => setTrendGranularity(e.target.value)}
                className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
              </select>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                DEMO DATA
              </span>
            </div>
          </div>

          {/* Line Chart */}
          <div className="my-auto flex flex-1 flex-col justify-center py-2 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={RECOMMENDATIONS_OVER_TIME_SERIES}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                  domain={[0, 180]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "0.5rem",
                    fontSize: "11px",
                    color: "#f8fafc",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Total"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 2.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="Implemented"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 2.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="InProgress"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 2.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="Overdue"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 2.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
            {/* Chart Legend */}
            <div className="mt-1 flex items-center justify-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-indigo-500" /> Total
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Implemented
              </span>
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> In Progress
              </span>
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Overdue
              </span>
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-[11px] text-slate-400 dark:border-slate-800/80 flex items-center justify-between">
            <span>May 13 – May 19 cohort</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              +14 resolved this week
            </span>
          </div>
        </div>

        {/* CARD 6: Top Assets to Improve */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Top Assets to Improve
              </h2>
              <p className="text-[11px] text-slate-400">
                Target infrastructure with multiple open findings
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                DEMO DATA
              </span>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
                View All →
              </button>
            </div>
          </div>

          <div className="my-2 flex flex-1 flex-col overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400 dark:border-slate-800">
                  <th className="pb-2 font-medium">Asset</th>
                  <th className="pb-2 font-medium">Risk Level</th>
                  <th className="pb-2 text-center font-medium">Open Rec.</th>
                  <th className="pb-2 font-medium">Top Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                {TOP_ASSETS_TO_IMPROVE.map((row) => (
                  <tr
                    key={row.asset}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap text-[11px]">
                      {row.asset}
                    </td>
                    <td className="py-2.5 whitespace-nowrap">
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold ${getRiskBadge(
                          row.riskLevel
                        )}`}
                      >
                        {row.riskLevel}
                      </span>
                    </td>
                    <td className="py-2.5 text-center font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap text-[11px]">
                      {row.openRec}
                    </td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-400 truncate max-w-[170px] text-[11px]">
                      {row.topRecommendation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-[11px] text-slate-400 dark:border-slate-800/80 flex items-center justify-between">
            <span>26 total open asset recommendations</span>
            <span className="font-medium text-slate-600 dark:text-slate-300">
              Perimeter & IAM focus
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM SECTION: RECENT RECOMMENDATIONS (FULL-WIDTH CARD)
          Columns: Recommendation ID, Recommendation, Category, Priority, Impact,
                   Status, Assigned To, Created At, Due Date
          ========================================================================= */}
      <div className="flex min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Recent Recommendations
            </h2>
            <p className="text-[11px] text-slate-400">
              Comprehensive log of newly generated security guidance with assigned owners
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              DEMO DATA
            </span>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
              View All →
            </button>
          </div>
        </div>

        <div className="my-2 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400 dark:border-slate-800">
                <th className="pb-2 font-medium">Recommendation ID</th>
                <th className="pb-2 font-medium">Recommendation</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium">Priority</th>
                <th className="pb-2 font-medium">Impact</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Assigned To</th>
                <th className="pb-2 font-medium">Created At</th>
                <th className="pb-2 font-medium">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
              {RECENT_RECOMMENDATIONS_LIST.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-2.5 font-mono text-[11px] font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    {row.id}
                  </td>
                  <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200 text-[11px] max-w-xs truncate">
                    {row.recommendation}
                  </td>
                  <td className="py-2.5 text-slate-500 whitespace-nowrap text-[11px]">
                    {row.category}
                  </td>
                  <td className="py-2.5 whitespace-nowrap">
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold ${getPriorityBadge(
                        row.priority
                      )}`}
                    >
                      {row.priority}
                    </span>
                  </td>
                  <td className="py-2.5 whitespace-nowrap">
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold ${getImpactBadge(
                        row.impact
                      )}`}
                    >
                      {row.impact}
                    </span>
                  </td>
                  <td className="py-2.5 whitespace-nowrap">
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold ${getStatusBadge(
                        row.status
                      )}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-300 whitespace-nowrap text-[11px]">
                    {row.assignedTo}
                  </td>
                  <td className="py-2.5 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                    {row.createdAt}
                  </td>
                  <td className="py-2.5 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                    {row.dueDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
