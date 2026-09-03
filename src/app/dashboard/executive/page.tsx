"use client";
import { useEffect, useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/app/dashboard/SidebarContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Modal } from "@/components/ui/Modal";

interface MetricCardProps {
  title: string;
  value: string | number;
  trendText: string;
  trendColor: "blue" | "red" | "orange" | "purple" | "yellow" | "green";
  sparklineColor?: string;
  isTrendUp?: boolean;
}

function MetricCard({
  title,
  value,
  trendText,
  trendColor,
  sparklineColor,
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

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <div className={`flex h-6 w-6 items-center justify-center rounded-full ${bgMap[trendColor]}`}>
          {title.charAt(0)}
        </div>
        <span className="truncate">{title}</span>
        <span className="ml-auto text-[10px] opacity-50">ⓘ</span>
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">
        {value}
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div className="text-[10px] text-slate-500">
          <span className={`${colorMap[trendColor]} px-1 py-0.5 rounded font-medium mr-1`}>{trendText}</span>
        </div>
        {sparklineColor && (
          <div className="h-4 w-12 opacity-80">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={[10, 15, 8, 20, 15, 30].map((v, i) => ({v, i}))}>
                 <Line type="monotone" dataKey="v" stroke={sparklineColor} strokeWidth={1.5} dot={false} isAnimationActive={false} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExecutiveDashboardPage() {
  const openSidebar = useSidebarToggle();
  const [alerts, setAlerts] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[] | null>(null);
  const [attackMethods, setAttackMethods] = useState<any[] | null>(null);
  const [topVictims, setTopVictims] = useState<any[] | null>(null);
  const [aiSummary, setAiSummary] = useState<string[] | null>(null);
  
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/soc/alerts-by-severity").then(res => res.json()).then(res => { setAlerts(res.status === "ok" ? res.data : []); }).catch(() => setAlerts([]));
    fetch("/api/soc/alerts-trend").then(res => res.json()).then(res => { setTrend(res.status === "ok" ? res.data : []); }).catch(() => setTrend([]));
    fetch("/api/soc/recent-incidents").then(res => res.json()).then(res => { setIncidents(res.status === "ok" ? res.data : []); }).catch(() => setIncidents([]));
    fetch("/api/soc/attack-methods").then(res => res.json()).then(res => { setAttackMethods(res.status === "ok" ? res.data : []); }).catch(() => setAttackMethods([]));
    fetch("/api/soc/top-victims").then(res => res.json()).then(res => { setTopVictims(res.status === "ok" ? res.data : []); }).catch(() => setTopVictims([]));
    fetch("/api/ai/executive-summary").then(res => res.json()).then(res => { setAiSummary(res.status === "ok" ? res.data : ["Failed to load AI Summary."]); }).catch(() => setAiSummary(["Failed to load AI Summary."]));
  }, []);

  const totalAlerts = alerts ? alerts.total : 0;
  
  const alertStatusData = alerts ? [
    { name: "Critical", value: alerts.critical, color: "#ef4444" },
    { name: "High", value: alerts.high, color: "#f97316" },
    { name: "Medium", value: alerts.medium, color: "#eab308" },
    { name: "Low", value: alerts.low, color: "#22c55e" },
  ].filter(d => d.value > 0) : [];

  const statusTrendData = trend.map(t => ({
    day: new Date(t.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
    Critical: t.critical,
    High: t.high,
    Medium: t.medium,
    Low: t.low,
    alerts: t.critical + t.high + t.medium + t.low
  }));

  const trendData = statusTrendData;

  return (
    <>
      <Topbar
        title="Executive Dashboard"
        subtitle="Strategic overview of cybersecurity posture, threats, and performance"
        onMenuClick={openSidebar}
      />
      <main className="flex-1 space-y-4 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        
        {/* ROW 1: 7 Top Metric Cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
          <MetricCard title="Overall Security Score" value="-" trendText="-" trendColor="blue" sparklineColor="#3b82f6" isTrendUp={true} />
          <MetricCard title="Critical Incidents" value={incidents ? incidents.length.toString() : "-"} trendText={incidents ? "Live Data" : "-"} trendColor="red" sparklineColor={incidents && incidents.length > 0 ? "#ef4444" : undefined} isTrendUp={true} />
          <MetricCard title="Total Alerts" value={totalAlerts.toLocaleString()} trendText="Live Data" trendColor="orange" sparklineColor="#f97316" isTrendUp={true} />
          
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-500">P</div>
              Processed Alerts <span className="ml-auto text-[10px] opacity-50">ⓘ</span>
            </div>
            <div className="mt-2 flex justify-between">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-500">-</div>
                <div className="text-[10px] text-slate-500">Otomatis</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-teal-500 dark:text-teal-400">-</div>
                <div className="text-[10px] text-slate-500">Manual</div>
              </div>
            </div>
          </div>

          <MetricCard title="Closed Alerts" value="-" trendText="-" trendColor="purple" sparklineColor="#a855f7" isTrendUp={true} />
          <MetricCard title="Critical Vulnerabilities" value="-" trendText="-" trendColor="yellow" sparklineColor="#eab308" isTrendUp={true} />
          <MetricCard title="Compliance Score" value="-" trendText="-" trendColor="green" sparklineColor="#22c55e" isTrendUp={true} />
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <Panel title="Alerts by Status" action={<select className="text-xs bg-transparent"><option>Last 7 Days</option></select>}>
            <div className="flex h-56 items-center">
              <div className="h-full w-1/2">
                {!alerts ? <div className="flex h-full items-center justify-center text-xs text-slate-400">Loading...</div> : 
                 alertStatusData.length === 0 ? <div className="flex h-full items-center justify-center text-xs text-slate-400">No Data</div> :
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={alertStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" stroke="none">
                      {alertStatusData.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold fill-slate-800 dark:fill-white">{totalAlerts > 1000000 ? "1M+" : totalAlerts.toLocaleString()}</text>
                    <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-[10px] fill-slate-500">Total Alerts</text>
                  </PieChart>
                </ResponsiveContainer>}
              </div>
              <div className="w-1/2 text-xs flex flex-col gap-2">
                {alertStatusData.map((s: any) => (
                  <div key={s.name} className="flex justify-between items-center pr-2">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}}></span> {s.name}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{s.value.toLocaleString()} <span className="font-normal text-slate-400">({totalAlerts > 0 ? Math.round(s.value/totalAlerts*100) : 0}%)</span></span>
                  </div>
                ))}
              </div>
            </div>
            <div onClick={() => setSelectedFeature("Alerts by Status")} className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View alert analytics →</div>
          </Panel>

          <Panel title="Alerts Trend" action={<select className="text-xs bg-transparent"><option>Last 7 Days</option></select>}>
            <div className="h-56 w-full">
              {trend.length === 0 ? <div className="flex h-full items-center justify-center text-xs text-slate-400">Loading...</div> :
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

          <Panel title="Alerts by Status Trend" action={<select className="text-xs bg-transparent"><option>Last 7 Days</option></select>}>
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

          <Panel title="Top Risks by Domain" action={<select className="text-xs bg-transparent"><option>Last 30 Days</option></select>}>
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
               No Data
            </div>
            <div onClick={() => setSelectedFeature("Top Risks by Domain")} className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View risk register →</div>
          </Panel>
        </div>

        {/* ROW 3 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <Panel title="Attack Country Heatmap" action={<select className="text-xs bg-transparent"><option>Last 30 Days</option></select>}>
            <div className="h-56 relative flex items-center justify-center">
              <div className="absolute inset-0 opacity-50 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-no-repeat bg-center bg-contain" style={{ filter: "invert(0.8) sepia(1) hue-rotate(180deg) saturate(2)"}}></div>
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 text-xs text-slate-400 font-semibold backdrop-blur-sm z-10">No GeoIP Data</div>
            </div>
            <div onClick={() => setSelectedFeature("Attack Country Heatmap")} className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View full map →</div>
          </Panel>

          <Panel title="Attack Method Distribution" action={<select className="text-xs bg-transparent"><option>Last 30 Days</option></select>}>
            <div className="flex h-56 items-center">
              <div className="h-full w-1/2">
                {!attackMethods ? <div className="flex h-full items-center justify-center text-xs text-slate-400">Loading...</div> :
                 attackMethods.length === 0 ? <div className="flex h-full items-center justify-center text-xs text-slate-400">No Data</div> :
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={attackMethods} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" stroke="none">
                      {attackMethods.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold fill-slate-800 dark:fill-white">{attackMethods.reduce((a, b) => a + b.value, 0).toLocaleString()}</text>
                    <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-[10px] fill-slate-500">Total</text>
                  </PieChart>
                </ResponsiveContainer>}
              </div>
              <div className="w-1/2 text-xs flex flex-col gap-2">
                {attackMethods && attackMethods.map(s => (
                  <div key={s.name} className="flex justify-between items-center pr-2">
                    <span className="flex items-center gap-1 w-24 truncate" title={s.name}><span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor: s.color}}></span> {s.name}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{s.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div onClick={() => setSelectedFeature("Attack Method Distribution")} className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View attack analytics →</div>
          </Panel>

          <Panel title="Top 10 Victim (By Alerts)" action={<select className="text-xs bg-transparent"><option>Last 30 Days</option></select>}>
            <div className="h-56 w-full text-[10px]">
              {!topVictims ? <div className="flex h-full items-center justify-center text-xs text-slate-400">Loading...</div> :
               topVictims.length === 0 ? <div className="flex h-full items-center justify-center text-xs text-slate-400">No Data</div> :
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topVictims} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                  <XAxis type="number" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{fontSize: '10px'}}/>
                  <Bar dataKey="count" fill="#2563EB" barSize={10} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#64748b', fontSize: 9 }} />
                </BarChart>
              </ResponsiveContainer>}
            </div>
            <div onClick={() => setSelectedFeature("Top 10 Victim")} className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View all victims →</div>
          </Panel>

          <Panel title="AI Executive Summary" action={<span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">✨ Powered by Ollama</span>}>
             <div className="flex h-56 flex-col gap-3 overflow-y-auto pt-2 text-[11px] text-slate-600 dark:text-slate-400">
                {!aiSummary ? (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">Generating AI Summary...</div>
                ) : (
                  aiSummary.map((line, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-purple-600">☑</span>
                      <p>{line}</p>
                    </div>
                  ))
                )}
             </div>
            <div onClick={() => setSelectedFeature("AI Executive Summary")} className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View full AI report →</div>
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel title="Board Report" action={<select className="text-xs bg-transparent"><option>Q3 2026</option></select>}>
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
               No Data
            </div>
            <div onClick={() => setSelectedFeature("Board Report")} className="mt-auto text-center text-xs text-brand-blue hover:underline cursor-pointer">View full board report →</div>
          </Panel>

          <Panel title="Recent Critical Incidents" className="lg:col-span-2">
            {!incidents ? (
               <div className="flex h-56 items-center justify-center text-xs text-slate-400">Loading incidents...</div>
            ) : incidents.length === 0 ? (
               <div className="flex h-56 items-center justify-center text-xs text-slate-400">No Critical Incidents</div>
            ) : (
              <div className="overflow-x-auto h-56">
                <table className="w-full text-left text-[11px] text-slate-600 dark:text-slate-400">
                  <thead className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 uppercase dark:border-slate-700 text-slate-500">
                    <tr>
                      <th className="py-2">Time</th>
                      <th className="py-2">Incident Name</th>
                      <th className="py-2">Affected Assets</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((inc: any, i: number) => (
                      <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50">
                        <td className="py-2 whitespace-nowrap">{new Date(inc.creationTime).toLocaleString()}</td>
                        <td className="py-2 font-medium text-slate-800 dark:text-slate-200">{inc.name}</td>
                        <td className="py-2">{inc.endpoint}</td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            inc.status === 'Investigating' ? 'bg-blue-100 text-blue-700' : 
                            inc.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                            inc.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {inc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div onClick={() => setSelectedFeature("Recent Critical Incidents")} className="mt-3 text-right text-xs text-brand-blue hover:underline cursor-pointer">View all incidents →</div>
          </Panel>
        </div>
      </main>

      {/* DETAILED VIEW MODAL */}
      <Modal 
        isOpen={selectedFeature !== null} 
        onClose={() => setSelectedFeature(null)} 
        title={selectedFeature || "Detailed View"}
      >
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <div className="mb-4 text-4xl">🚧</div>
          <h4 className="mb-2 text-lg font-bold text-slate-800 dark:text-slate-200">
            {selectedFeature} Detailed View
          </h4>
          <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Tampilan detail untuk fitur ini sedang dalam tahap pengembangan (Under Construction). 
            Nantinya di sini akan memuat tabel data lengkap, opsi filter mendalam, dan fungsi ekspor.
          </p>
        </div>
      </Modal>
    </>
  );
}
