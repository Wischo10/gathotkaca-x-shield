import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { name: 'May 13', 'Security Operations': 5, 'Incident & Case Management': 2, 'Threat Intelligence': 1, 'Compliance & Audit': 3, 'Others': 4 },
  { name: 'May 14', 'Security Operations': 7, 'Incident & Case Management': 3, 'Threat Intelligence': 2, 'Compliance & Audit': 2, 'Others': 5 },
  { name: 'May 15', 'Security Operations': 4, 'Incident & Case Management': 2, 'Threat Intelligence': 3, 'Compliance & Audit': 1, 'Others': 8 },
  { name: 'May 16', 'Security Operations': 6, 'Incident & Case Management': 4, 'Threat Intelligence': 2, 'Compliance & Audit': 2, 'Others': 6 },
  { name: 'May 17', 'Security Operations': 5, 'Incident & Case Management': 3, 'Threat Intelligence': 1, 'Compliance & Audit': 3, 'Others': 7 },
  { name: 'May 18', 'Security Operations': 6, 'Incident & Case Management': 5, 'Threat Intelligence': 2, 'Compliance & Audit': 2, 'Others': 5 },
  { name: 'May 19', 'Security Operations': 6, 'Incident & Case Management': 3, 'Threat Intelligence': 4, 'Compliance & Audit': 1, 'Others': 6 },
];

export function ReportsTrend() {
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
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
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
            <Line type="monotone" dataKey="Security Operations" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: "#8b5cf6" }} isAnimationActive={false} />
            <Line type="monotone" dataKey="Incident & Case Management" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: "#3b82f6" }} isAnimationActive={false} />
            <Line type="monotone" dataKey="Threat Intelligence" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b" }} isAnimationActive={false} />
            <Line type="monotone" dataKey="Compliance & Audit" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} isAnimationActive={false} />
            <Line type="monotone" dataKey="Others" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3, fill: "#06b6d4" }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
