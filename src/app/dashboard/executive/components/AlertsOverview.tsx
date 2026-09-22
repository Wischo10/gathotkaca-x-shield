import { Panel } from "@/components/ui/Panel";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, BarChart, Bar } from "recharts";
import { AlertsSummary, TrendData } from "../types";

interface AlertsOverviewProps {
  alerts: AlertsSummary | null;
  trend: TrendData[];
  setSelectedFeature: (f: string) => void;
}

export function AlertsOverview({ alerts, trend, setSelectedFeature }: AlertsOverviewProps) {
  const totalAlerts = alerts?.total ?? 0;
  
  const alertStatusData = alerts ? [
    { name: "Critical", value: alerts.critical, color: "#ef4444" },
    { name: "High",     value: alerts.high,     color: "#f97316" },
    { name: "Medium",   value: alerts.medium,   color: "#eab308" },
    { name: "Low",      value: alerts.low,      color: "#22c55e" },
  ].filter(d => d.value > 0) : [];

  const statusTrendData = trend.map(t => ({
    day: new Date(t.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
    Critical: t.critical,
    High:     t.high,
    Medium:   t.medium,
    Low:      t.low,
    alerts:   t.critical + t.high + t.medium + t.low,
  }));

  return (
    <>
      <Panel title="Alerts by Status">
        <div className="flex h-56 items-center">
          <div className="h-full w-1/2">
            {!alerts ? <div className="flex h-full items-center justify-center text-xs text-slate-400">Loading...</div> :
              alertStatusData.length === 0 ? <div className="flex h-full items-center justify-center text-xs text-slate-400">No Data</div> :
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={alertStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" stroke="none">
                  {alertStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold fill-slate-800 dark:fill-white">
                  {totalAlerts > 1000000 ? "1M+" : totalAlerts.toLocaleString()}
                </text>
                <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-[10px] fill-slate-500">Total Alerts</text>
              </PieChart>
            </ResponsiveContainer>}
          </div>
          <div className="w-1/2 text-xs flex flex-col gap-2">
            {alertStatusData.map((s) => (
              <div key={s.name} className="flex justify-between items-center pr-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}}></span> {s.name}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {s.value.toLocaleString()} <span className="font-normal text-slate-400">({totalAlerts > 0 ? Math.round(s.value/totalAlerts*100) : 0}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div onClick={() => setSelectedFeature("Alerts by Status")} className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View alert analytics →</div>
      </Panel>

      <Panel title="Alerts Trend">
        <div className="h-56 w-full">
          {trend.length === 0 ? <div className="flex h-full items-center justify-center text-xs text-slate-400">Loading...</div> :
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={statusTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ stroke: "#e2e8f0", strokeWidth: 2 }} />
              <Line type="monotone" dataKey="alerts" stroke="#2563EB" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>}
        </div>
        <div onClick={() => setSelectedFeature("Alerts Trend")} className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View full analytics →</div>
      </Panel>

      <Panel title="Alerts by Status Trend">
        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 mb-2">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span> Critical</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f97316]"></span> High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#eab308]"></span> Medium</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#22c55e]"></span> Low</span>
        </div>
        <div className="h-44 w-full">
          {trend.length === 0 ? <div className="flex h-full items-center justify-center text-xs text-slate-400">Loading...</div> :
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusTrendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="Critical" stackId="a" fill="#ef4444" barSize={20} />
              <Bar dataKey="High" stackId="a" fill="#f97316" />
              <Bar dataKey="Medium" stackId="a" fill="#eab308" />
              <Bar dataKey="Low" stackId="a" fill="#22c55e" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>}
        </div>
        <div onClick={() => setSelectedFeature("Alerts by Status Trend")} className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View trend details →</div>
      </Panel>
    </>
  );
}
