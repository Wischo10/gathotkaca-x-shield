"use client";

import { Panel } from "@/components/ui/Panel";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/app/dashboard/layout";
import { LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const sparklineData = Array.from({ length: 7 }, (_, i) => ({ value: Math.random() * 100 }));
const Sparkline = ({ color }: { color: string }) => (
  <div className="h-10 w-full mt-2">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={sparklineData}><Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} /></LineChart>
    </ResponsiveContainer>
  </div>
);

const MetricCard = ({ title, value, max, trendText, trendColor, sparklineColor, isTrendUp, icon }: any) => (
  <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
      <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-${trendColor}-100 text-${trendColor}-600 dark:bg-${trendColor}-900/30 dark:text-${trendColor}-500`}>{icon}</div>
      {title} <span className="ml-auto text-[10px] opacity-50">ⓘ</span>
    </div>
    <div className="mt-2 flex items-baseline gap-1">
      <span className="text-2xl font-bold text-slate-800 dark:text-white">{value}</span>
      {max && <span className="text-xs text-slate-500">/{max}</span>}
    </div>
    <div className={`mt-1 text-[10px] font-medium text-${trendColor}-500`}>
      {isTrendUp ? "↑" : "↓"} {trendText}
    </div>
    <Sparkline color={sparklineColor} />
  </div>
);

export default function CISODashboardPage() {
  const openSidebar = useSidebarToggle();

  return (
    <>
      <Topbar title="CISO Dashboard" subtitle="Deep dive into security risk, performance, and compliance" onMenuClick={openSidebar} />
      <main className="flex-1 space-y-4 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        
        {/* ROW 1: Metrics */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          <MetricCard title="Security Posture Score" value="78" max="100" trendText="6% vs last 30 days" trendColor="blue" sparklineColor="#3b82f6" isTrendUp={true} icon="🛡️" />
          <MetricCard title="Total Risk Score" value="715" max="1000" trendText="8% vs last 30 days" trendColor="red" sparklineColor="#ef4444" isTrendUp={true} icon="🚨" />
          <MetricCard title="Active Incidents" value="24" trendText="20% vs last 30 days" trendColor="orange" sparklineColor="#f97316" isTrendUp={true} icon="⚠️" />
          <MetricCard title="Critical Vulnerabilities" value="312" trendText="14% vs last 30 days" trendColor="purple" sparklineColor="#a855f7" isTrendUp={true} icon="👾" />
          <MetricCard title="Compliance Score" value="82%" trendText="5% vs last 30 days" trendColor="green" sparklineColor="#22c55e" isTrendUp={true} icon="✅" />
          <MetricCard title="Risk Treatment Progress" value="64%" trendText="7% vs last 30 days" trendColor="teal" sparklineColor="#14b8a6" isTrendUp={true} icon="📈" />
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel title="Security Posture Overview" action={<span className="text-xs text-slate-400">30 Days</span>}>
            <div className="h-56 flex items-center justify-center text-slate-400 text-sm bg-slate-100 dark:bg-slate-800 rounded">
              [Radar Chart Placeholder: Identify, Protect, Detect, Respond, Recover]
            </div>
            <div className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View full security posture →</div>
          </Panel>
          <Panel title="Incident KPI" action={<select className="text-xs bg-transparent"><option>Last 30 Days</option></select>}>
            <div className="grid grid-cols-2 gap-4 h-56">
              <div className="flex flex-col justify-center gap-1 border-r border-b border-slate-100 dark:border-slate-800 p-2">
                <span className="text-xs text-slate-500">MTTD (Mean Time to Detect)</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">21m <span className="text-[10px] text-green-500 font-normal">↓ 16%</span></div>
              </div>
              <div className="flex flex-col justify-center gap-1 border-b border-slate-100 dark:border-slate-800 p-2">
                <span className="text-xs text-slate-500">MTTA (Mean Time to Acknowledge)</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">32m <span className="text-[10px] text-green-500 font-normal">↓ 11%</span></div>
              </div>
              <div className="flex flex-col justify-center gap-1 border-r border-slate-100 dark:border-slate-800 p-2">
                <span className="text-xs text-slate-500">MTTR (Mean Time to Respond)</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">4h 12m <span className="text-[10px] text-green-500 font-normal">↓ 18%</span></div>
              </div>
              <div className="flex flex-col justify-center gap-1 p-2">
                <span className="text-xs text-slate-500">MTTC (Mean Time to Contain)</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">2h 45m <span className="text-[10px] text-red-500 font-normal">↑ 14%</span></div>
              </div>
            </div>
            <div className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View incident performance →</div>
          </Panel>
          <Panel title="Vulnerability SLA Overview" action={<select className="text-xs bg-transparent"><option>All Scanners</option></select>}>
            <div className="flex h-56 items-center">
              <div className="h-full w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{value:104,fill:"#ef4444"},{value:72,fill:"#f97316"},{value:96,fill:"#eab308"},{value:40,fill:"#22c55e"}]} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" stroke="none" />
                    <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold fill-slate-800 dark:fill-white">312</text>
                    <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-[10px] fill-slate-500">Total Critical</text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 flex flex-col gap-3 text-xs">
                <div className="flex justify-between items-center pr-2"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Overdue</span><span className="font-semibold text-slate-700 dark:text-slate-300">104 (33%)</span></div>
                <div className="flex justify-between items-center pr-2"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Due Soon</span><span className="font-semibold text-slate-700 dark:text-slate-300">72 (23%)</span></div>
                <div className="flex justify-between items-center pr-2"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> In Progress</span><span className="font-semibold text-slate-700 dark:text-slate-300">96 (31%)</span></div>
                <div className="flex justify-between items-center pr-2"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Compliant</span><span className="font-semibold text-slate-700 dark:text-slate-300">40 (13%)</span></div>
              </div>
            </div>
            <div className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View vulnerability dashboard →</div>
          </Panel>
        </div>

        {/* ROW 3 & 4 (Simplified panels matching headers) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel title="Threat Intelligence Overview" className="h-64 flex flex-col justify-between">
             <div className="text-sm text-slate-400 p-4">[List of Threat Campaigns & IOCs]</div>
             <div className="text-right text-xs text-brand-blue hover:underline cursor-pointer">View threat intelligence →</div>
          </Panel>
          <Panel title="Risk Register Summary" className="h-64 flex flex-col justify-between">
             <div className="text-sm text-slate-400 p-4">[Risk Register Donut Chart]</div>
             <div className="text-right text-xs text-brand-blue hover:underline cursor-pointer">View risk register →</div>
          </Panel>
          <Panel title="Top Risks" className="h-64 flex flex-col justify-between">
             <div className="text-sm text-slate-400 p-4">[Top Risks Table]</div>
             <div className="text-right text-xs text-brand-blue hover:underline cursor-pointer">View all risks →</div>
          </Panel>
        </div>
        
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel title="Compliance Overview" className="h-64 flex flex-col justify-between">
             <div className="text-sm text-slate-400 p-4">[Compliance Frameworks Table]</div>
             <div className="text-right text-xs text-brand-blue hover:underline cursor-pointer">View compliance dashboard →</div>
          </Panel>
          <Panel title="Third-Party Risk Overview" className="h-64 flex flex-col justify-between">
             <div className="text-sm text-slate-400 p-4">[Vendor Risk Donut Chart]</div>
             <div className="text-right text-xs text-brand-blue hover:underline cursor-pointer">View third-party risk →</div>
          </Panel>
          <Panel title="AI CISO Briefing" className="h-64 flex flex-col justify-between" action={<span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">✨ Powered by AI</span>}>
             <div className="text-sm text-slate-400 p-4">[AI Summary Bullets]</div>
             <div className="text-right text-xs text-brand-blue hover:underline cursor-pointer">View full AI briefing →</div>
          </Panel>
        </div>
      </main>
    </>
  );
}
