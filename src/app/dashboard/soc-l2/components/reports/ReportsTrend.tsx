import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function ReportsTrend({ trend = [] }: { trend?: any[] }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Reports Trend</h2>
        <select className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-600 dark:text-slate-300 outline-none">
          <option>Daily</option>
          <option>Weekly</option>
        </select>
      </div>
      
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend 
              iconType="circle" 
              wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} 
              formatter={(value) => <span className="text-slate-600 dark:text-slate-400">{value}</span>}
            />
            <Line type="monotone" name="Scheduled" dataKey="scheduled" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: "#8b5cf6" }} isAnimationActive={false} />
            <Line type="monotone" name="On-Demand" dataKey="ondemand" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: "#3b82f6" }} isAnimationActive={false} />
            <Line type="monotone" name="Failed" dataKey="failed" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: "#ef4444" }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
