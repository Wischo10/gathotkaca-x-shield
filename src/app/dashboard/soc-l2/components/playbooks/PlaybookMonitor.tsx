import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const donutData = [
  { name: 'Success', value: 112, color: '#10b981' },
  { name: 'Failed', value: 14, color: '#ef4444' },
  { name: 'Running', value: 6, color: '#f59e0b' },
  { name: 'Pending', value: 4, color: '#94a3b8' },
];

const lineData = [
  { name: 'May 13', Success: 20, Failed: 5, Running: 2, Pending: 1 },
  { name: 'May 14', Success: 25, Failed: 8, Running: 3, Pending: 2 },
  { name: 'May 15', Success: 30, Failed: 10, Running: 4, Pending: 1 },
  { name: 'May 16', Success: 28, Failed: 12, Running: 5, Pending: 3 },
  { name: 'May 17', Success: 32, Failed: 9, Running: 2, Pending: 1 },
  { name: 'May 18', Success: 29, Failed: 11, Running: 3, Pending: 2 },
  { name: 'May 19', Success: 35, Failed: 14, Running: 6, Pending: 4 },
];

export function PlaybookMonitor() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm col-span-1 xl:col-span-2">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Playbook Execution Monitor</h2>
      
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
    </div>
  );
}
