"use client";
import { Folder, CircleDashed, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { L2Alert } from "@/types/soc";
import { useState, useEffect } from "react";

interface CasesAggregate {
  total: number;
  inProgress: number;
  closed: number;
  critical: number;
  high: number;
}

export function CasesKPIs({ alerts = [] }: { alerts?: L2Alert[] }) {
  const [dbStats, setDbStats] = useState<CasesAggregate | null>(null);

  // Pull real escalated-case stats from Supabase via API
  useEffect(() => {
    fetch("/api/soc/cases/aggregate?range=7d")
      .then(res => res.json())
      .then(data => {
        if (data.status === "ok") setDbStats(data.data);
      })
      .catch(console.error);
  }, []);

  // Live alert queue counts (Wazuh-based)
  const totalCases = dbStats?.total ?? alerts.length;
  const newOrInProgress = dbStats?.inProgress ?? alerts.filter(a => !a.status || a.status === "New" || a.status === "In Progress").length;
  const onHold = alerts.filter(a => a.status === "On Hold").length;
  const closed = dbStats?.closed ?? alerts.filter(a => a.status === "Closed").length;
  const criticalCases = dbStats?.critical ?? alerts.filter(a => a.severity?.toLowerCase() === "critical").length;

  const kpis = [
    {
      title: "Escalated Cases (7d)",
      value: totalCases.toString(),
      subtitle: "From soc_cases DB",
      icon: Folder,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50 dark:bg-blue-500/10"
    },
    {
      title: "In Progress",
      value: newOrInProgress.toString(),
      subtitle: "Active investigations",
      icon: CircleDashed,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50 dark:bg-orange-500/10"
    },
    {
      title: "On Hold",
      value: onHold.toString(),
      subtitle: "Waiting for info",
      icon: Clock,
      iconColor: "text-yellow-500",
      iconBg: "bg-yellow-50 dark:bg-yellow-500/10"
    },
    {
      title: "Closed / Resolved",
      value: closed.toString(),
      subtitle: "From soc_cases DB",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10"
    },
    {
      title: "Critical Cases (7d)",
      value: criticalCases.toString(),
      subtitle: "High priority cases",
      icon: AlertTriangle,
      iconColor: "text-red-500",
      iconBg: "bg-red-50 dark:bg-red-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${kpi.iconBg}`}>
                <Icon className={`w-5 h-5 ${kpi.iconColor}`} />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 text-right leading-tight">
                {kpi.title}
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {kpi.value}
              </div>
            </div>
            <div className="mt-2 text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
              {kpi.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
}
