import { ShieldAlert, Bug, Target, UserX, Ghost, Globe, ArrowUp } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export function ThreatKPIs() {
  const generateSparkline = () => Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 100) }));

  const kpis = [
    {
      title: "Overall Threat Level",
      value: "High",
      trend: "+ 25%",
      icon: ShieldAlert,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-500/10",
      border: "border-red-200 dark:border-red-900/50",
      stroke: "#ef4444",
      data: generateSparkline(),
      isHigh: true,
    },
    {
      title: "New IOCs (This Week)",
      value: "2,843",
      trend: "+ 18%",
      icon: Bug, // The image has a biohazard icon, Bug is close enough
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-200 dark:border-blue-900/50",
      stroke: "#3b82f6",
      data: generateSparkline(),
    },
    {
      title: "Tracked IOCs",
      value: "28,671",
      trend: "+ 12%",
      icon: Target,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-200 dark:border-emerald-900/50",
      stroke: "#10b981",
      data: generateSparkline(),
    },
    {
      title: "Threat Actors Tracked",
      value: "156",
      trend: "+ 8%",
      icon: UserX, // Hacker icon in image
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-500/10",
      border: "border-purple-200 dark:border-purple-900/50",
      stroke: "#a855f7",
      data: generateSparkline(),
    },
    {
      title: "Malware Families",
      value: "342",
      trend: "+ 11%",
      icon: Ghost, // Virus/bug in image
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-500/10",
      border: "border-orange-200 dark:border-orange-900/50",
      stroke: "#f97316",
      data: generateSparkline(),
    },
    {
      title: "High Risk Countries",
      value: "23",
      trend: "+ 9%",
      icon: Globe,
      color: "text-cyan-500",
      bg: "bg-cyan-50 dark:bg-cyan-500/10",
      border: "border-cyan-200 dark:border-cyan-900/50",
      stroke: "#06b6d4",
      data: generateSparkline(),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
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
                  <span className={`text-xl font-bold ${kpi.isHigh ? kpi.color : 'text-slate-900 dark:text-white'} leading-none`}>
                    {kpi.value}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium ml-[52px]">
              <ArrowUp className="w-3 h-3" /> {kpi.trend} <span className="text-slate-400 font-normal">vs last 7 days</span>
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
