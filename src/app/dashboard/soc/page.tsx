"use client";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/app/dashboard/SidebarContext";
import { Panel } from "@/components/ui/Panel";

export default function SocDashboardPage() {
  const openSidebar = useSidebarToggle();
  return (
    <>
      <Topbar title="SOC Dashboard" subtitle="Real-time monitoring, detection, and response overview" onMenuClick={openSidebar} />
      <main className="flex-1 flex flex-col p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-blue-500 text-lg">🧊</span> Total Events</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">1,248,780</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-red-500 text-lg">🛡️</span> Total Alerts</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">2,843</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-orange-500 text-lg">🔥</span> Incidents</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">128</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-purple-500 text-lg">🚨</span> Critical Alerts</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">312</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-green-500 text-lg">⏱️</span> MTTD</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">21m</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-teal-500 text-lg">⏱️</span> MTTR</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">4h 12m</div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          <Panel title="Alerts by Severity" className="h-64 flex flex-col justify-between">
             <div className="flex-1 flex items-center justify-center text-slate-400">[Donut Chart]</div>
          </Panel>
          <Panel title="Alerts Over Time" className="h-64 flex flex-col justify-between lg:col-span-2">
             <div className="flex-1 flex items-center justify-center text-slate-400">[Stacked Area Chart]</div>
          </Panel>
          <Panel title="Alerts by Status" className="h-64 flex flex-col justify-between">
             <div className="flex-1 flex items-center justify-center text-slate-400">[Donut Chart]</div>
          </Panel>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Panel title="Incidents by Severity" className="h-64 flex flex-col justify-between">
             <div className="flex-1 flex items-center justify-center text-slate-400">[Donut Chart]</div>
          </Panel>
          <Panel title="MITRE ATT&CK Tactic Distribution" className="h-64 flex flex-col justify-between lg:col-span-2">
             <div className="flex-1 flex items-center justify-center text-slate-400">[Bar Chart]</div>
          </Panel>
          <Panel title="Top 10 Alerting Rules" className="h-64 flex flex-col justify-between">
             <div className="flex-1 flex items-center justify-center text-slate-400">[Horizontal Bar Chart]</div>
          </Panel>
        </div>
      </main>
    </>
  );
}
