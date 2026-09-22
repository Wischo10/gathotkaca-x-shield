import { LineChart, Line, ResponsiveContainer } from "recharts";

interface MetricCardProps {
  title: string;
  value: string | number;
  trendText: string;
  trendColor: "blue" | "red" | "orange" | "purple" | "yellow" | "green";
  sparklineColor?: string;
  isTrendUp?: boolean;
  tooltip?: string;
  delta?: number | null; // % change vs previous period
  sparklineData?: { v: number; i: number }[]; // optional real data
}

export function MetricCard({
  title,
  value,
  trendText,
  trendColor,
  sparklineColor,
  tooltip,
  delta,
  sparklineData
}: MetricCardProps) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-100",
    red: "text-red-600 bg-red-100",
    orange: "text-orange-600 bg-orange-100",
    purple: "text-purple-600 bg-purple-100",
    yellow: "text-yellow-600 bg-yellow-100",
    green: "text-green-600 bg-green-100",
  };

  const bgMap = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500",
    orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-500",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-500",
    yellow: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500",
  };

  // Fallback data if none provided, or empty if backend doesn't support it.
  // We use dummy if sparklineColor is defined but no data is passed, just to keep visual layout.
  const chartData = sparklineData ?? [10, 15, 8, 20, 15, 30].map((v, i) => ({v, i}));

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${bgMap[trendColor]}`}>
          {title.charAt(0)}
        </div>
        <span className="truncate" title={tooltip}>{title}</span>
        <span className="ml-auto text-[10px] opacity-50 cursor-help flex-shrink-0" title={tooltip}>ⓘ</span>
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">
        {value}
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div className="text-[10px] text-slate-500 flex items-center gap-1">
          <span className={`${colorMap[trendColor]} px-1 py-0.5 rounded font-medium mr-1`}>{trendText}</span>
          {delta !== null && delta !== undefined && (
            <span className={`text-[10px] font-semibold ${delta >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {delta >= 0 ? `▲${delta}%` : `▼${Math.abs(delta)}%`}
            </span>
          )}
        </div>
        {sparklineColor && (
          <div className="h-4 w-12 opacity-80">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={chartData}>
                 <Line type="monotone" dataKey="v" stroke={sparklineColor} strokeWidth={1.5} dot={false} isAnimationActive={false} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
