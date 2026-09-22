import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const donutData: any[] = [];
const lineData: any[] = [];

export function PlaybookMonitor() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm col-span-1 xl:col-span-2">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Playbook Execution Monitor</h2>
      
      {donutData.length === 0 && lineData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center h-64 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
          <span className="text-xs text-slate-500">No execution data available</span>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 h-64">
          {/* Donut Chart */}
          <div className="w-full md:w-1/3 flex items-center">
            <div className="w-40 h-40 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">126</span>
                <span className="text-[10px] text-slate-500">Total Executions</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 ml-4">
              {donutData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-slate-600 dark:text-slate-300 w-16">{item.name}</span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white w-8">{item.value}</span>
                  <span className="text-[10px] text-slate-500">({Math.round(item.value / 126 * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Line Chart */}
          <div className="w-full md:w-2/3 h-full border-l border-slate-100 dark:border-slate-800 pl-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Executions Over Time (This Week)</span>
              <div className="flex items-center gap-3">
                {donutData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] text-slate-500">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={lineData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="Success" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} isAnimationActive={false} />
                <Line type="monotone" dataKey="Failed" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: "#ef4444" }} isAnimationActive={false} />
                <Line type="monotone" dataKey="Running" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b" }} isAnimationActive={false} />
                <Line type="monotone" dataKey="Pending" stroke="#94a3b8" strokeWidth={2} dot={{ r: 3, fill: "#94a3b8" }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
