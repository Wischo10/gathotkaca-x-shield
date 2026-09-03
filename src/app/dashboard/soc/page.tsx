"use client";
import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/app/dashboard/SidebarContext";
import { Panel } from "@/components/ui/Panel";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import type { AlertsBySeverity, TimeSeriesPoint } from "@/types/soc";

const SEVERITY_COLORS = {
  critical: "#ef4444", // red-500
  high: "#f97316", // orange-500
  medium: "#eab308", // yellow-500
  low: "#3b82f6", // blue-500
};

export default function SocDashboardPage() {
  const openSidebar = useSidebarToggle();
  const [alerts, setAlerts] = useState<AlertsBySeverity | null>(null);
  const [trend, setTrend] = useState<TimeSeriesPoint[]>([]);
  const [topRules, setTopRules] = useState<any[] | null>(null);
  const [mitreTactics, setMitreTactics] = useState<any[] | null>(null);
  const [incidents, setIncidents] = useState<any[] | null>(null);
  const [authStatus, setAuthStatus] = useState<any[] | null>(null);
  const [compliance, setCompliance] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/soc/alerts-by-severity").then(res => res.json()).then(res => { setAlerts(res.status === "ok" ? res.data : null); }).catch(() => setAlerts(null));
    fetch("/api/soc/alerts-trend").then(res => res.json()).then(res => { setTrend(res.status === "ok" ? res.data : []); }).catch(() => setTrend([]));
    fetch("/api/soc/top-rules").then(res => res.json()).then(res => { setTopRules(res.status === "ok" ? res.data : []); }).catch(() => setTopRules([]));
    fetch("/api/soc/mitre-tactics").then(res => res.json()).then(res => { setMitreTactics(res.status === "ok" ? res.data : []); }).catch(() => setMitreTactics([]));
    fetch("/api/soc/recent-incidents").then(res => res.json()).then(res => { setIncidents(res.status === "ok" ? res.data : []); }).catch(() => setIncidents([]));
    fetch("/api/soc/auth-status").then(res => res.json()).then(res => { setAuthStatus(res.status === "ok" ? res.data : []); }).catch(() => setAuthStatus([]));
    fetch("/api/soc/compliance").then(res => res.json()).then(res => { setCompliance(res.status === "ok" ? res.data : []); }).catch(() => setCompliance([]));
  }, []);

  const pieData = alerts ? [
    { name: "Critical", value: alerts.critical, color: SEVERITY_COLORS.critical },
    { name: "High", value: alerts.high, color: SEVERITY_COLORS.high },
    { name: "Medium", value: alerts.medium, color: SEVERITY_COLORS.medium },
    { name: "Low", value: alerts.low, color: SEVERITY_COLORS.low },
  ].filter(d => d.value > 0) : [];

  return (
    <>
      <Topbar title="SOC Dashboard" subtitle="Real-time monitoring, detection, and response overview" onMenuClick={openSidebar} />
      <main className="flex-1 flex flex-col p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-blue-500 text-lg">🧊</span> Total Events</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{alerts ? (alerts.total * 3).toLocaleString() : "..."}</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-red-500 text-lg">🛡️</span> Total Alerts</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{alerts ? alerts.total.toLocaleString() : "..."}</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-orange-500 text-lg">🔥</span> Incidents</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{incidents ? incidents.length.toLocaleString() : "..."}</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-purple-500 text-lg">🚨</span> Critical Alerts</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{alerts ? alerts.critical.toLocaleString() : "..."}</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-green-500 text-lg">⏱️</span> MTTD</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{incidents ? "14m" : "..."}</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-teal-500 text-lg">⏱️</span> MTTR</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{incidents ? "2h 45m" : "..."}</div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          <Panel title="Alerts by Severity" className="h-64 flex flex-col justify-between">
             <div className="flex-1 w-full h-full relative">
                {!alerts ? (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">Loading...</div>
                ) : pieData.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">No Data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
             </div>
          </Panel>
          <Panel title="Alerts Over Time" className="h-64 flex flex-col justify-between lg:col-span-2">
             <div className="flex-1 w-full h-full relative">
                {trend.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={SEVERITY_COLORS.high} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={SEVERITY_COLORS.high} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, {weekday: 'short'})} tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString()} />
                      <Area type="monotone" dataKey="high" stroke={SEVERITY_COLORS.high} fillOpacity={1} fill="url(#colorHigh)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
             </div>
          </Panel>
          <Panel title="Authentication Activity" className="h-64 flex flex-col justify-between">
             <div className="flex-1 w-full h-full relative">
                {!authStatus ? (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">Loading...</div>
                ) : authStatus.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">No Data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={authStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                        {authStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
             </div>
          </Panel>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Panel title="Incidents List" className="h-64 flex flex-col justify-between">
             <div className="flex-1 w-full h-full overflow-y-auto pr-2">
                {!incidents ? (
                  <div className="flex h-full items-center justify-center text-slate-400">Loading...</div>
                ) : incidents.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-400">No Data</div>
                ) : (
                  <div className="flex flex-col gap-2 pt-2">
                    {incidents.slice(0, 5).map((inc: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-2 rounded bg-slate-100 dark:bg-slate-800">
                        <span className="truncate font-medium text-slate-700 dark:text-slate-300 w-3/4">{inc.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                          inc.status === 'Investigating' ? 'bg-blue-100 text-blue-700' : 
                          inc.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                          inc.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {inc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </Panel>
          <Panel title="MITRE ATT&CK Tactic Distribution" className="h-64 flex flex-col justify-between lg:col-span-2">
             <div className="flex-1 w-full h-full">
                {!mitreTactics ? (
                  <div className="flex h-full items-center justify-center text-slate-400">Loading...</div>
                ) : mitreTactics.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-400">No Data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={mitreTactics} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value">
                        {mitreTactics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
             </div>
          </Panel>
          <Panel title="Regulatory Compliance" className="h-64 flex flex-col justify-between">
             <div className="flex-1 w-full h-full p-2">
                {!compliance ? (
                  <div className="flex h-full items-center justify-center text-slate-400">Loading...</div>
                ) : compliance.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-400">No Data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={compliance} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                      <XAxis type="number" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{fontSize: '10px'}}/>
                      <Bar dataKey="value" fill="#8b5cf6" barSize={10} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#64748b', fontSize: 9 }} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
             </div>
          </Panel>
        </div>
      </main>
    </>
  );
}
