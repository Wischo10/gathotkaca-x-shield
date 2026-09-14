"use client";
import { FileText, CalendarClock, CheckCircle2, Download, Clock, ArrowUp, ArrowDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";

interface ReportStats {
  totalAlerts: number;
  escalated: number;
  closed: number;
}

export function ReportsKPIs() {
  const [wazuhTotal, setWazuhTotal] = useState<number | null>(null);
  const [caseStats, setCaseStats] = useState<{ total: number; closed: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/soc/playbook-stats?range=7d").then(r => r.json()),
      fetch("/api/soc/cases/aggregate?range=7d").then(r => r.json()),
    ]).then(([playbookData, casesData]) => {
      if (playbookData.status === "ok") setWazuhTotal(playbookData.data.totalAlerts);
      if (casesData.status === "ok") setCaseStats({ total: casesData.data.total, closed: casesData.data.closed });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const generateSparkline = (trend: "up" | "down") =>
    Array.from({ length: 10 }, (_, i) => ({
      value: trend === "up" ? i * 10 + Math.random() * 20 : 100 - i * 10 + Math.random() * 20
    }));

  const kpis = [
    {
      title: "Total Alerts (7d)",
      value: loading ? "..." : (wazuhTotal ?? 0).toLocaleString(),
      trend: "Live from Wazuh",
      trendUp: true,
      icon: FileText,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-500/10",
      border: "border-purple-200 dark:border-purple-900/50",
      stroke: "#a855f7",
      data: generateSparkline("up"),
    },
    {
      title: "Escalated Cases (7d)",
      value: loading ? "..." : (caseStats?.total ?? 0).toLocaleString(),
      trend: "From soc_cases DB",
      trendUp: true,
      icon: CalendarClock,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-200 dark:border-blue-900/50",
      stroke: "#3b82f6",
      data: generateSparkline("up"),
    },
    {
      title: "Cases Resolved (7d)",
      value: loading ? "..." : (caseStats?.closed ?? 0).toLocaleString(),
      trend: "Closed tickets",
      trendUp: true,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-200 dark:border-emerald-900/50",
      stroke: "#10b981",
      data: generateSparkline("up"),
    },
    {
      title: "Active Investigations",
      value: loading ? "..." : ((caseStats?.total ?? 0) - (caseStats?.closed ?? 0)).toLocaleString(),
      trend: "In progress",
      trendUp: false,
      icon: Download,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-500/10",
      border: "border-orange-200 dark:border-orange-900/50",
      stroke: "#f97316",
      data: generateSparkline("up"),
    },
    {
      title: "Resolution Rate",
      value: loading || !caseStats?.total ? "—" : `${Math.round(((caseStats?.closed ?? 0) / (caseStats?.total ?? 1)) * 100)}%`,
      trend: "Efficiency metric",
      trendUp: true,
      icon: Clock,
      color: "text-cyan-500",
      bg: "bg-cyan-50 dark:bg-cyan-500/10",
      border: "border-cyan-200 dark:border-cyan-900/50",
      stroke: "#06b6d4",
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
