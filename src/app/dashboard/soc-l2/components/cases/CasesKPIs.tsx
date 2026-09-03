import { Folder, CircleDashed, Clock, CheckCircle2, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";

export function CasesKPIs() {
  const kpis = [
    {
      title: "Total Cases",
      value: "128",
      trend: "+18%",
      trendDir: "up",
      icon: Folder,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50 dark:bg-blue-500/10"
    },
    {
      title: "In Progress",
      value: "24",
      trend: "+14%",
      trendDir: "up",
      icon: CircleDashed,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50 dark:bg-orange-500/10"
    },
    {
      title: "On Hold",
      value: "6",
      trend: "+25%",
      trendDir: "up",
      icon: Clock,
      iconColor: "text-yellow-500",
      iconBg: "bg-yellow-50 dark:bg-yellow-500/10"
    },
    {
      title: "Closed (This Week)",
      value: "98",
      trend: "+22%",
      trendDir: "up",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10"
    },
    {
      title: "SLA Breach",
      value: "3",
      trend: "+40%",
      trendDir: "down", // visually it's green arrow down in typical dashboards, but here it's green arrow down in mock? wait, it says +40%, so bad? Let's use red up arrow for breach if it goes up, but the image shows a green arrow down for SLA Breach? Ah, the image has a green arrow down and "-40% vs last 7 days" maybe? The image says "+40%" with a green arrow pointing down. That's weird. I'll just make it a green arrow down for now.
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
            <div className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              {kpi.trendDir === "up" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {kpi.trend} <span className="text-slate-400 dark:text-slate-500 font-normal ml-0.5">vs last 7 days</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
