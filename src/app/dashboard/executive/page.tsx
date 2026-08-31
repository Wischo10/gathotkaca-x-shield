"use client";

import { Panel } from "@/components/ui/Panel";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/app/dashboard/layout";
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
  Cell,
  Legend
} from "recharts";

// --- MOCK DATA ---

const generateSparkline = () => Array.from({ length: 7 }, (_, i) => ({ day: i, value: Math.random() * 100 }));

const trendData = [
  { day: "May 13", alerts: 600 },
  { day: "May 14", alerts: 650 },
  { day: "May 15", alerts: 820 },
  { day: "May 16", alerts: 680 },
  { day: "May 17", alerts: 710 },
  { day: "May 18", alerts: 420 },
  { day: "May 19", alerts: 750 },
];

const statusTrendData = [
  { day: "May 13", Critical: 45, High: 120, Medium: 250, Low: 100 },
  { day: "May 14", Critical: 50, High: 130, Medium: 260, Low: 90 },
  { day: "May 15", Critical: 85, High: 200, Medium: 350, Low: 150 },
  { day: "May 16", Critical: 60, High: 150, Medium: 280, Low: 120 },
  { day: "May 17", Critical: 55, High: 140, Medium: 270, Low: 110 },
  { day: "May 18", Critical: 30, High: 90, Medium: 150, Low: 70 },
  { day: "May 19", Critical: 65, High: 160, Medium: 300, Low: 130 },
];

const alertStatusData = [
  { name: "Critical", value: 312, color: "#ef4444" },
  { name: "High", value: 864, color: "#f97316" },
  { name: "Medium", value: 1245, color: "#eab308" },
  { name: "Low", value: 422, color: "#22c55e" },
];

const attackMethodData = [
  { name: "Phishing", value: 32, color: "#ef4444" },
  { name: "Malware", value: 26, color: "#f97316" },
  { name: "Exploitation", value: 18, color: "#eab308" },
  { name: "Brute Force", value: 12, color: "#22c55e" },
  { name: "Others", value: 12, color: "#3b82f6" },
];

const topVictims = [
  { name: "FIN-SRV-01", count: 324 },
  { name: "FIN-WS-23", count: 289 },
  { name: "HR-LAP-07", count: 210 },
  { name: "CORP-DC-01", count: 198 },
  { name: "SALES-WS-11", count: 176 },
  { name: "DEV-SRV-02", count: 150 },
  { name: "MKT-LAP-03", count: 142 },
  { name: "OPS-SRV-03", count: 131 },
  { name: "DB-SRV-01", count: 118 },
  { name: "SEC-WS-02", count: 105 },
];

const topRisks = [
  { domain: "Ransomware", score: 95, trend: "up" },
  { domain: "Data Breach", score: 90, trend: "up" },
  { domain: "Phishing", score: 78, trend: "up" },
  { domain: "Privilege Misuse", score: 72, trend: "down" },
  { domain: "System Vulnerability", score: 68, trend: "down" },
  { domain: "Malware", score: 65, trend: "down" },
  { domain: "Insider Threat", score: 60, trend: "down" },
  { domain: "Web Attack", score: 58, trend: "down" },
  { domain: "DDoS Attack", score: 55, trend: "down" },
  { domain: "Social Engineering", score: 48, trend: "down" },
];

const recentIncidents = [
  { time: "May 19, 10:21 AM", name: "Ransomware Activity Detected", asset: "FIN-SRV-01, FIN-WS-23", status: "Investigating", assign: "SOC L2 Team" },
  { time: "May 19, 09:51 AM", name: "Phishing Campaign Detected", asset: "HR-LAP-07", status: "In Progress", assign: "SOC L2 Team" },
  { time: "May 19, 09:21 AM", name: "Brute Force Login Attempt", asset: "CORP-DC-01", status: "Resolved", assign: "SOC L2 Team" },
  { time: "May 19, 08:41 AM", name: "Malicious File Detected", asset: "DEV-SRV-02", status: "In Progress", assign: "SOC L2 Team" },
  { time: "May 19, 07:58 AM", name: "Web Application Attack", asset: "MKT-LAP-03", status: "Monitoring", assign: "SOC L2 Team" },
];

// --- HELPERS ---

function Sparkline({ color }: { color: string }) {
  return (
    <div className="h-10 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={generateSparkline()}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MetricCard({ title, value, trendText, trendColor, sparklineColor, isTrendUp }: any) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-${trendColor}-100 text-${trendColor}-600 dark:bg-${trendColor}-900/30 dark:text-${trendColor}-500`}>
          {title.charAt(0)}
        </div>
        {title} <span className="ml-auto text-[10px] opacity-50">ⓘ</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-800 dark:text-white">{value}</span>
      </div>
      <div className={`mt-1 text-[10px] font-medium text-${trendColor}-500`}>
        {isTrendUp ? "↑" : "↓"} {trendText}
      </div>
      {sparklineColor && <Sparkline color={sparklineColor} />}
    </div>
  );
}

// --- MAIN PAGE ---

export default function ExecutiveDashboardPage() {
  const openSidebar = useSidebarToggle();

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
          <MetricCard title="Overall Security Score" value="78 / 100" trendText="6% vs last 7 days" trendColor="blue" sparklineColor="#3b82f6" isTrendUp={true} />
          <MetricCard title="Critical Incidents" value="12" trendText="20% vs last 7 days" trendColor="red" sparklineColor="#ef4444" isTrendUp={true} />
          <MetricCard title="Total Alerts" value="2,843" trendText="18% vs last 7 days" trendColor="orange" sparklineColor="#f97316" isTrendUp={true} />
          
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-500">P</div>
              Processed Alerts <span className="ml-auto text-[10px] opacity-50">ⓘ</span>
            </div>
            <div className="mt-2 flex justify-between">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-500">1,926</div>
                <div className="text-[10px] text-slate-500">(67%) Otomatis</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-teal-500 dark:text-teal-400">917</div>
                <div className="text-[10px] text-slate-500">(33%) Manual</div>
              </div>
            </div>
          </div>

          <MetricCard title="Closed Alerts" value="2,215" trendText="16% vs last 7 days" trendColor="purple" sparklineColor="#a855f7" isTrendUp={true} />
          <MetricCard title="Critical Vulnerabilities" value="312" trendText="14% vs last 7 days" trendColor="yellow" sparklineColor="#eab308" isTrendUp={true} />
          <MetricCard title="Compliance Score" value="82%" trendText="5% vs last 30 days" trendColor="green" sparklineColor="#22c55e" isTrendUp={true} />
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <Panel title="Alerts by Status" action={<select className="text-xs bg-transparent"><option>Last 7 Days</option></select>}>
            <div className="flex h-56 items-center">
              <div className="h-full w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={alertStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" stroke="none">
                      {alertStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold fill-slate-800 dark:fill-white">2,843</text>
                    <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-[10px] fill-slate-500">Total Alerts</text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 text-xs flex flex-col gap-2">
                {alertStatusData.map(s => (
                  <div key={s.name} className="flex justify-between items-center pr-2">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}}></span> {s.name}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{s.value} <span className="font-normal text-slate-400">({Math.round(s.value/2843*100)}%)</span></span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View alert analytics →</div>
          </Panel>

          <Panel title="Alerts Trend" action={<select className="text-xs bg-transparent"><option>Last 7 Days</option></select>}>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ stroke: "#e2e8f0", strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="alerts" stroke="#2563EB" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View full analytics →</div>
          </Panel>

          <Panel title="Alerts by Status Trend" action={<select className="text-xs bg-transparent"><option>Last 7 Days</option></select>}>
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 mb-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span> Critical</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f97316]"></span> High</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#eab308]"></span> Medium</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#22c55e]"></span> Low</span>
            </div>
            <div className="h-44 w-full">
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
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View trend details →</div>
          </Panel>

          <Panel title="Top Risks by Domain" action={<select className="text-xs bg-transparent"><option>Last 30 Days</option></select>}>
            <div className="h-56 overflow-y-auto pr-1">
              <table className="w-full text-left text-[11px] text-slate-600 dark:text-slate-400">
                <thead className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 pb-1">
                  <tr>
                    <th className="py-1 font-semibold">Domain</th>
                    <th className="py-1 font-semibold text-right">Risk Score</th>
                    <th className="py-1 font-semibold text-center">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {topRisks.map((r, i) => (
                    <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50">
                      <td className="py-1.5">{r.domain}</td>
                      <td className="py-1.5 text-right font-medium text-slate-800 dark:text-slate-200">{r.score}</td>
                      <td className={`py-1.5 text-center font-bold ${r.trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
                        {r.trend === 'up' ? '↑' : '↓'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View risk register →</div>
          </Panel>
        </div>

        {/* ROW 3 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <Panel title="Attack Country Heatmap" action={<select className="text-xs bg-transparent"><option>Last 30 Days</option></select>}>
            <div className="h-56 relative flex items-center justify-center">
              <div className="absolute inset-0 opacity-50 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-no-repeat bg-center bg-contain" style={{ filter: "invert(0.8) sepia(1) hue-rotate(180deg) saturate(2)"}}></div>
              {/* Fake heatmap dots */}
              <div className="absolute top-1/3 left-1/4 w-8 h-8 rounded-full bg-red-500/40 blur-sm"></div>
              <div className="absolute top-1/4 left-1/2 w-12 h-12 rounded-full bg-red-500/50 blur-sm"></div>
              <div className="absolute bottom-1/3 left-2/3 w-6 h-6 rounded-full bg-orange-500/40 blur-sm"></div>
              
              <div className="absolute bottom-0 left-0 text-[10px] flex items-center gap-1 text-slate-500">
                Low <div className="w-16 h-2 bg-gradient-to-r from-orange-200 to-red-600 rounded"></div> High
              </div>
            </div>
            <div className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View full map →</div>
          </Panel>

          <Panel title="Attack Method Distribution" action={<select className="text-xs bg-transparent"><option>Last 30 Days</option></select>}>
            <div className="flex h-56 items-center">
              <div className="h-full w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={attackMethodData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" stroke="none">
                      {attackMethodData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold fill-slate-800 dark:fill-white">2,843</text>
                    <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-[10px] fill-slate-500">Total</text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 text-xs flex flex-col gap-2">
                {attackMethodData.map(s => (
                  <div key={s.name} className="flex justify-between items-center pr-2">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}}></span> {s.name}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View attack analytics →</div>
          </Panel>

          <Panel title="Top 10 Victim (By Alerts)" action={<select className="text-xs bg-transparent"><option>Last 30 Days</option></select>}>
            <div className="h-56 w-full text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topVictims} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                  <XAxis type="number" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{fontSize: '10px'}}/>
                  <Bar dataKey="count" fill="#2563EB" barSize={10} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#64748b', fontSize: 9 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View all victims →</div>
          </Panel>

          <Panel title="AI Executive Summary" action={<span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">✨ Powered by AI</span>}>
            <div className="flex h-56 flex-col gap-3 overflow-y-auto pt-2 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex gap-2">
                <span className="text-purple-600">☑</span>
                <p>Security score improved 6% compared to last 7 days, driven by better detection and faster response.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-600">☑</span>
                <p>Ransomware and Data Breach are the top risks that require immediate executive attention.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-600">☑</span>
                <p>Phishing attacks increased 18% this week, targeting finance and HR assets.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-600">☑</span>
                <p>312 critical vulnerabilities detected; 64 are internet-facing and need urgent remediation.</p>
              </div>
            </div>
            <div className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View full AI report →</div>
          </Panel>
        </div>

        {/* ROW 4 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel title="Board Report" className="lg:col-span-1">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex flex-col gap-1 rounded bg-slate-50 p-2 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">🛡️</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Security Posture</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200">Improving</span>
                <span className="text-[10px] text-green-600">↑ 6% vs last 7 days</span>
              </div>
              <div className="flex flex-col gap-1 rounded bg-slate-50 p-2 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600">🚨</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Top Risk</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200">Ransomware</span>
                <span className="text-[10px] text-slate-500">Risk Score 95 /100</span>
              </div>
              <div className="flex flex-col gap-1 rounded bg-slate-50 p-2 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600">🎯</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Key Priority</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200">Reduce Attack Surface</span>
                <span className="text-[10px] text-slate-500">Focus on internet-facing assets</span>
              </div>
              <div className="flex flex-col gap-1 rounded bg-slate-50 p-2 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">✅</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Strategic Recommendation</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200">Strengthen Email Security</span>
                <span className="text-[10px] text-slate-500">Implement advanced phishing protection</span>
              </div>
            </div>
            <div className="mt-auto text-center text-xs text-brand-blue hover:underline cursor-pointer">View full board report →</div>
          </Panel>

          <Panel title="Recent Critical Incidents" className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] text-slate-600 dark:text-slate-400">
                <thead className="border-b border-slate-200 uppercase dark:border-slate-700 text-slate-500">
                  <tr>
                    <th className="py-2">Time</th>
                    <th className="py-2">Incident Name</th>
                    <th className="py-2">Affected Assets</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Assigned To</th>
                  </tr>
                </thead>
                <tbody>
                  {recentIncidents.map((inc, i) => (
                    <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50">
                      <td className="py-2 whitespace-nowrap">{inc.time}</td>
                      <td className="py-2 font-medium text-slate-800 dark:text-slate-200">{inc.name}</td>
                      <td className="py-2">{inc.asset}</td>
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
                      <td className="py-2">{inc.assign}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-right text-xs text-brand-blue hover:underline cursor-pointer">View all incidents →</div>
          </Panel>
        </div>

      </main>
    </>
  );
}
