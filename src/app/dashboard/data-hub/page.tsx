"use client";
import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/app/dashboard/SidebarContext";
import { Panel } from "@/components/ui/Panel";

export default function DataHubDashboardPage() {
  const openSidebar = useSidebarToggle();
  const tabs = ["Data Overview", "Data Sources", "Integrations", "Data Quality", "Use Cases & Analytics", "Data Explorer", "Settings"];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Data Overview":
        return (
          <>
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
          </>
        );
      case "Data Sources":
        return (
          <Panel title="Data Sources Management" className="flex-1">
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
               <span className="text-4xl">🗄️</span>
               <p>Manage and configure your data sources.</p>
               <div className="flex gap-2 mt-4">
                 <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 transition-colors text-white rounded-md text-sm font-medium">Add New Source</button>
               </div>
             </div>
          </Panel>
        );
      case "Integrations":
        return (
          <Panel title="Active Integrations" className="flex-1">
             <div className="flex flex-col items-center justify-center min-h-[16rem] text-slate-400 gap-4 py-8">
               <span className="text-4xl">🔗</span>
               <p>View and manage 3rd party API integrations.</p>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 w-full max-w-2xl">
                 <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col items-center gap-2">
                   <span className="font-bold text-slate-800 dark:text-slate-200">Wazuh</span>
                   <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full font-medium">Connected</span>
                 </div>
                 <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col items-center gap-2">
                   <span className="font-bold text-slate-800 dark:text-slate-200">Bitdefender</span>
                   <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full font-medium">Connected</span>
                 </div>
                 <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col items-center gap-2">
                   <span className="font-bold text-slate-800 dark:text-slate-200">VirusTotal</span>
                   <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-full font-medium">Disconnected</span>
                 </div>
               </div>
             </div>
          </Panel>
        );
      case "Data Quality":
        return (
          <Panel title="Data Quality Metrics" className="flex-1">
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
               <span className="text-4xl">✨</span>
               <p>Monitor the health and quality of ingested data streams.</p>
               <div className="text-3xl font-bold text-green-500 mt-2">Health Score: 98%</div>
             </div>
          </Panel>
        );
      case "Use Cases & Analytics":
        return (
          <Panel title="Analytics Hub" className="flex-1">
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
               <span className="text-4xl">📈</span>
               <p>Custom analytics and correlation rule mappings.</p>
               <button className="mt-4 px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-md text-sm font-medium transition-colors">Explore Rules</button>
             </div>
          </Panel>
        );
      case "Data Explorer":
        return (
          <Panel title="Data Explorer" className="flex-1">
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
               <span className="text-4xl">🔍</span>
               <p>Query raw events and logs directly.</p>
               <div className="w-full max-w-md mt-4 flex gap-2">
                 <input type="text" placeholder="Enter query (e.g. source_ip: 192.168.1.1)" className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-sm" disabled />
                 <button className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium opacity-50 cursor-not-allowed">Search</button>
               </div>
             </div>
          </Panel>
        );
      case "Settings":
        return (
          <Panel title="Hub Settings" className="flex-1">
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
               <span className="text-4xl">⚙️</span>
               <p>Configure general settings for the Data Hub.</p>
             </div>
          </Panel>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Topbar title="Security Data & Integration Hub" subtitle="Integrate, normalize, and monitor security data across all sources for unified visibility and intelligence" onMenuClick={openSidebar} />
      <main className="flex-1 flex flex-col p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 overflow-x-auto gap-4 scrollbar-hide">
          {tabs.map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === tab ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border-b-2 border-transparent"}`}>
               {tab}
            </button>
          ))}
        </div>

        {renderTabContent()}
      </main>
    </>
  );
}
