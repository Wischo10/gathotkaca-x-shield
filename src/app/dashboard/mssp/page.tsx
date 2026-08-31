"use client";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/app/dashboard/layout";
import { Panel } from "@/components/ui/Panel";

export default function MSSPPortalPage() {
  const openSidebar = useSidebarToggle();
  return (
    <>
      <Topbar title="MSSP Portal" subtitle="Unified view to monitor, manage, and deliver security services for all clients" onMenuClick={openSidebar} />
      <main className="flex-1 flex flex-col p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 overflow-x-auto gap-4">
          {["Overview", "Clients", "Alerts & Incidents", "Services", "Reports", "Compliance", "Tickets", "Assets", "Account Management", "Settings"].map((tab, i) => (
            <button key={tab} className={`pb-2 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${i === 0 ? "border-b-2 border-brand-blue text-brand-blue" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
               {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-blue-500 text-lg">👥</span> Total Clients</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">24</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-green-500 text-lg">⚡</span> Active Services</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">58</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-red-500 text-lg">🔔</span> Open Alerts</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">1,248</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-orange-500 text-lg">🚨</span> Open Incidents</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">36</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-teal-500 text-lg">⏱️</span> MTTR (All Clients)</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">24.6 min</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-purple-500 text-lg">📊</span> Service Uptime</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">99.98%</div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          <Panel title="Alerts by Severity" className="h-64 flex flex-col justify-between">
             <div className="flex-1 flex items-center justify-center text-slate-400">[Donut Chart Placeholder]</div>
          </Panel>
          <Panel title="Incidents by Status" className="h-64 flex flex-col justify-between">
             <div className="flex-1 flex items-center justify-center text-slate-400">[Donut Chart Placeholder]</div>
          </Panel>
          <Panel title="Alerts Trend (All Clients)" className="h-64 flex flex-col justify-between lg:col-span-2">
             <div className="flex-1 flex items-center justify-center text-slate-400">[Line Chart Placeholder]</div>
          </Panel>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Panel title="Client Overview" className="lg:col-span-2 flex-1">
             <div className="flex items-center justify-center h-40 text-slate-400">[Client Data Table]</div>
          </Panel>
          <Panel title="Top Clients by Open Alerts" className="flex-1">
             <div className="flex items-center justify-center h-40 text-slate-400">[Horizontal Bar Chart]</div>
          </Panel>
        </div>
      </main>
    </>
  );
}
