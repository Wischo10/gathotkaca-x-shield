"use client";
import { BookOpen, Play, CheckCircle2, XCircle, Clock, ArrowUp, ArrowDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";

interface PlaybookStats {
  totalAlerts: number;
  executed: number;
  successful: number;
  failed: number;
  critical: number;
  high: number;
}

export function PlaybookKPIs() {
  const [stats, setStats] = useState<PlaybookStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/soc/playbook-stats?range=7d")
      .then(res => res.json())
      .then(data => {
        if (data.status === "ok") setStats(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const generateSparkline = (trend: "up" | "down") =>
    Array.from({ length: 10 }, (_, i) => ({
      value: trend === "up" ? i * 10 + Math.random() * 20 : 100 - i * 10 + Math.random() * 20
    }));

  const successRate = stats && stats.executed > 0
    ? Math.round((stats.successful / stats.executed) * 100)
    : 0;

  const kpis = [
    {
      title: "Total Alerts (7d)",
      value: loading ? "..." : (stats?.totalAlerts ?? 0).toLocaleString(),
      trend: "Live from Wazuh",
      trendUp: true,
      icon: BookOpen,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-500/10",
      border: "border-purple-200 dark:border-purple-900/50",
      stroke: "#a855f7",
      data: generateSparkline("up"),
    },
    {
      title: "Triggered (High+Critical)",
      value: loading ? "..." : (stats?.executed ?? 0).toLocaleString(),
      trend: "Automated triggers",
      trendUp: true,
      icon: Play,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-200 dark:border-blue-900/50",
      stroke: "#3b82f6",
      data: generateSparkline("up"),
    },
    {
      title: "Successful Responses",
      value: loading ? "..." : (stats?.successful ?? 0).toLocaleString(),
      trend: `${successRate}% Success Rate`,
      trendUp: true,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-200 dark:border-emerald-900/50",
      stroke: "#10b981",
      data: generateSparkline("up"),
    },
    {
      title: "Failed / Unhandled",
      value: loading ? "..." : (stats?.failed ?? 0).toLocaleString(),
      trend: "Requires attention",
      trendUp: false,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-500/10",
      border: "border-red-200 dark:border-red-900/50",
      stroke: "#ef4444",
      data: generateSparkline("down"),
    },
    {
      title: "Critical Alerts (7d)",
      value: loading ? "..." : (stats?.critical ?? 0).toLocaleString(),
      trend: "Highest priority",
      trendUp: stats ? stats.critical < stats.high : true,
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-500/10",
      border: "border-orange-200 dark:border-orange-900/50",
      stroke: "#f97316",
      data: generateSparkline("up"),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {kpis.map((kpi, idx) => {
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
            
            <div className={`mt-1 flex items-center gap-1 text-[10px] font-medium ml-[52px] ${kpi.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {kpi.trend.includes('Rate') || kpi.trend.includes('Live') || kpi.trend.includes('trigger') || kpi.trend.includes('priority') || kpi.trend.includes('attention') ? (
                <span>{kpi.trend}</span>
              ) : (
                <>
                  {kpi.trendUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {kpi.trend} <span className="text-slate-400 font-normal">vs last 7 days</span>
                </>
              )}
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
