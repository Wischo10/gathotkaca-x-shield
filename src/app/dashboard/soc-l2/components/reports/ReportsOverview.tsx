import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ArrowRight } from "lucide-react";

const data = [
  { name: 'Security Operations', value: 14, color: '#8b5cf6' }, // Purple
  { name: 'Incident & Case Management', value: 8, color: '#3b82f6' }, // Blue
  { name: 'Threat Intelligence', value: 6, color: '#f59e0b' }, // Orange
  { name: 'Compliance & Audit', value: 5, color: '#10b981' }, // Green
  { name: 'Others', value: 3, color: '#06b6d4' }, // Cyan
];

export function ReportsOverview() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col h-full">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Reports Overview (This Week)</h2>
      
      <div className="flex flex-col md:flex-row items-center gap-6 flex-1">
        <div className="w-40 h-40 relative flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">36</span>
            <span className="text-[10px] text-slate-500">Total Reports</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 flex-1 w-full">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-600 dark:text-slate-300">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-900 dark:text-white">{item.value}</span>
                <span className="text-[10px] text-slate-500 w-8 text-right">({Math.round(item.value / 36 * 100)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button className="text-xs text-brand-blue font-medium hover:underline flex items-center gap-1">
          View full breakdown <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
