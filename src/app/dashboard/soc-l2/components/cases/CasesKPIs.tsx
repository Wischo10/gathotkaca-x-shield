import { Folder, CircleDashed, Clock, CheckCircle2, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";
import { L2Alert } from "@/types/soc";

export function CasesKPIs({ alerts = [] }: { alerts?: L2Alert[] }) {
  const totalCases = alerts.length;
  const newOrInProgress = alerts.filter(a => !a.status || a.status === "New" || a.status === "In Progress").length;
  const onHold = alerts.filter(a => a.status === "On Hold").length;
  const closed = alerts.filter(a => a.status === "Closed").length;
  const slaBreach = 0; // Since we don't track SLA natively in alerts

  const kpis = [
    {
      title: "Total Cases",
      value: totalCases.toString(),
      icon: Folder,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50 dark:bg-blue-500/10"
    },
    {
      title: "New / In Progress",
      value: newOrInProgress.toString(),
      icon: CircleDashed,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50 dark:bg-orange-500/10"
    },
    {
      title: "On Hold",
      value: onHold.toString(),
      icon: Clock,
      iconColor: "text-yellow-500",
      iconBg: "bg-yellow-50 dark:bg-yellow-500/10"
    },
    {
      title: "Closed",
      value: closed.toString(),
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10"
    },
    {
      title: "SLA Breach",
      value: slaBreach.toString(),
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
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                {kpi.title}
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {kpi.value}
              </div>
            </div>
            <div className="mt-2 text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
              Live Data Snapshot
            </div>
          </div>
        );
      })}
    </div>
  );
}
