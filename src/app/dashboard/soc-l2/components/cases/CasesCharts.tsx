import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export function CasesCharts() {
  const statusData = [
    { name: "In Progress", value: 24, color: "#f97316" }, // orange-500
    { name: "On Hold", value: 6, color: "#eab308" }, // yellow-500
    { name: "Closed", value: 98, color: "#10b981" }, // emerald-500
  ];

  const severityData = [
    { name: "Critical", value: 28, color: "#ef4444" }, // red-500
    { name: "High", value: 54, color: "#f97316" }, // orange-500
    { name: "Medium", value: 36, color: "#eab308" }, // yellow-500
    { name: "Low", value: 10, color: "#3b82f6" }, // blue-500
  ];

  const slaData = [
    { name: "Within SLA", value: 105, total: 128, color: "bg-emerald-500" },
    { name: "At Risk", value: 20, total: 128, color: "bg-orange-500" },
    { name: "Breach", value: 3, total: 128, color: "bg-red-500" },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 shadow-sm rounded-md text-sm">
          <p className="font-medium text-slate-900 dark:text-white">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
      {/* Cases by Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-full">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Cases by Status</h3>
        <div className="flex-1 flex items-center justify-between">
          <div className="w-32 h-32 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">128</span>
              <span className="text-[10px] text-slate-500 font-medium">Total</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {statusData.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 w-24">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white text-right w-6">{item.value}</span>
                <span className="text-[10px] text-slate-500 w-8 text-right">({Math.round((item.value / 128) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 text-right">
          <a href="#" className="text-xs font-medium text-brand-blue hover:underline">View full report &rarr;</a>
        </div>
      </div>

      {/* Cases by Severity */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-full">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Cases by Severity</h3>
        <div className="flex-1 flex items-center justify-between">
          <div className="w-32 h-32 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">128</span>
              <span className="text-[10px] text-slate-500 font-medium">Total</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {severityData.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 w-16">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white text-right w-6">{item.value}</span>
                <span className="text-[10px] text-slate-500 w-8 text-right">({Math.round((item.value / 128) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 text-right">
          <a href="#" className="text-xs font-medium text-brand-blue hover:underline">View full report &rarr;</a>
        </div>
      </div>

      {/* SLA Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-full">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6">SLA Overview</h3>
        <div className="flex flex-col gap-5 flex-1">
          {slaData.map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-20">{item.name}</span>
              <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.value / item.total) * 100}%` }}></div>
              </div>
              <div className="flex items-center gap-1.5 w-16 justify-end">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">{item.value}</span>
                <span className="text-[10px] text-slate-500">({Math.round((item.value / item.total) * 100)}%)</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-right">
          <a href="#" className="text-xs font-medium text-brand-blue hover:underline">View SLA report &rarr;</a>
        </div>
      </div>
    </div>
  );
}
