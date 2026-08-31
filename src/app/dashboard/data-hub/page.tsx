"use client";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/app/dashboard/layout";
import { Panel } from "@/components/ui/Panel";

export default function DataHubDashboardPage() {
  const openSidebar = useSidebarToggle();
  return (
    <>
      <Topbar title="Security Data & Integration Hub" subtitle="Integrate, normalize, and monitor security data across all sources for unified visibility and intelligence" onMenuClick={openSidebar} />
      <main className="flex-1 flex flex-col p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 overflow-x-auto gap-4">
          {["Data Overview", "Data Sources", "Integrations", "Data Quality", "Use Cases & Analytics", "Data Explorer", "Settings"].map((tab, i) => (
            <button key={tab} className={`pb-2 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${i === 0 ? "border-b-2 border-brand-blue text-brand-blue" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
               {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-blue-500 text-lg">🗄️</span> Total Data Sources</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">28</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-blue-500 text-lg">🔗</span> Active Integrations</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">26</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-green-500 text-lg">📥</span> Events Ingested</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">18.4 M</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-purple-500 text-lg">📊</span> Normalized Events</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">16.2 M</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-red-500 text-lg">⚡</span> Correlation Rules</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">152</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-1">
             <div className="text-xs text-slate-500 font-semibold flex items-center gap-1"><span className="text-slate-500 text-lg">⏱️</span> Data Retention</div>
             <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">365 Days</div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <Panel title="Events Ingested Over Time" className="h-64 flex flex-col justify-between">
             <div className="flex-1 flex items-center justify-center text-slate-400">[Stacked Area Chart]</div>
          </Panel>
          <Panel title="Events by Type (Top 10)" className="h-64 flex flex-col justify-between">
             <div className="flex-1 flex items-center justify-center text-slate-400">[Donut Chart Placeholder]</div>
          </Panel>
          <Panel title="Data Sources by Category" className="h-64 flex flex-col justify-between">
             <div className="flex-1 flex items-center justify-center text-slate-400">[Donut Chart Placeholder]</div>
          </Panel>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Panel title="Data Sources Status" className="lg:col-span-2 flex-1">
             <div className="flex items-center justify-center h-40 text-slate-400">[Data Sources Table]</div>
          </Panel>
          <Panel title="Integration Health" className="flex-1">
             <div className="flex items-center justify-center h-40 text-slate-400">[Health Status Widget]</div>
          </Panel>
        </div>
      </main>
    </>
  );
}
