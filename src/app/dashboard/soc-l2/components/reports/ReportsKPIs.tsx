"use client";
import { FileText, CalendarClock, CheckCircle2, Download, Clock, ArrowUp, ArrowDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";

export function ReportsKPIs({ kpis }: { kpis?: any }) {
  const generateSparkline = (trend: "up" | "down") =>
    Array.from({ length: 10 }, (_, i) => ({
      value: trend === "up" ? i * 10 + Math.random() * 20 : 100 - i * 10 + Math.random() * 20
    }));

  const kpiList = [
    {
      title: "Total Reports (7d)",
      value: kpis ? kpis.totalReports.toLocaleString() : "...",
      trend: "Generated based on volume",
      trendUp: true,
      icon: FileText,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-500/10",
      border: "border-purple-200 dark:border-purple-900/50",
      stroke: "#a855f7",
      data: generateSparkline("up"),
    },
    {
      title: "Generated Today",
      value: kpis ? kpis.generatedToday.toLocaleString() : "...",
      trend: "Recent activity",
      trendUp: true,
      icon: CalendarClock,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-200 dark:border-blue-900/50",
      stroke: "#3b82f6",
      data: generateSparkline("up"),
    },
    {
      title: "Scheduled Reports",
      value: kpis ? kpis.scheduled.toLocaleString() : "...",
      trend: "Active schedules",
      trendUp: true,
      icon: Clock,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-200 dark:border-emerald-900/50",
      stroke: "#10b981",
      data: generateSparkline("up"),
    },
    {
      title: "Failed Reports",
      value: kpis ? kpis.failed.toLocaleString() : "...",
      trend: "Requires attention",
      trendUp: false,
      icon: Download,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-500/10",
      border: "border-red-200 dark:border-red-900/50",
      stroke: "#ef4444",
      data: generateSparkline("down"),
    },
    {
      title: "Success Rate",
      value: kpis ? `${Math.round(((kpis.totalReports - kpis.failed) / Math.max(1, kpis.totalReports)) * 100)}%` : "...",
      trend: "Overall reliability",
      trendUp: true,
      icon: CheckCircle2,
      color: "text-cyan-500",
      bg: "bg-cyan-50 dark:bg-cyan-500/10",
      border: "border-cyan-200 dark:border-cyan-900/50",
      stroke: "#06b6d4",
      data: generateSparkline("up"),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {kpiList.map((kpi: any, idx: number) => {
        const Icon = kpi.icon;
        return (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${kpi.bg} border ${kpi.border}`}>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight mb-1">
                  {kpi.title}
                </span>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">
                    {kpi.value}
                  </span>
                </div>
              </div>
            </div>

            <div className={`mt-1 flex items-center gap-1 text-[10px] font-medium ml-[52px] ${kpi.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`}>
              <span>{kpi.trend}</span>
            </div>

            <div className="h-10 mt-3 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpi.data}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={kpi.stroke}
                    strokeWidth={2}
                    dot={{ r: 2, fill: kpi.stroke }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}
