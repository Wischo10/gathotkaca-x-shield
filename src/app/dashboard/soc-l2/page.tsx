"use client";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/app/dashboard/layout";
import { Panel } from "@/components/ui/Panel";

export default function SOCL2DashboardPage() {
  const openSidebar = useSidebarToggle();

  return (
    <>
      <Topbar title="SOC L2 Console" subtitle="Investigate alerts, manage cases, and respond to incidents" onMenuClick={openSidebar} />
      <main className="flex-1 flex flex-col p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 overflow-x-auto">
          {["Alert Queue", "Investigation", "Cases", "Threat Intelligence", "Playbooks", "Reports"].map((tab, i) => (
            <button key={tab} className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${i === 0 ? "border-b-2 border-brand-blue text-brand-blue" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Fake Alert Queue Content */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel title="Alert Queue" className="lg:col-span-1 h-[600px] flex flex-col">
            <div className="flex gap-2 text-[10px] mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-brand-blue">All 2,843</span>
              <span className="text-slate-500">New 1,124</span>
              <span className="text-slate-500">In Progress 842</span>
            </div>
            <div className="flex-1 overflow-y-auto text-xs text-slate-500 flex flex-col gap-3">
               <div className="border p-2 rounded bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50">
                 <span className="bg-red-500 text-white px-1 rounded text-[10px]">Critical</span>
                 <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">Brute Force Login Detected</p>
                 <p>WAF-01 | 192.168.10.25</p>
               </div>
               <div className="border p-2 rounded bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/50">
                 <span className="bg-orange-500 text-white px-1 rounded text-[10px]">High</span>
                 <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">Malware Execution Blocked</p>
                 <p>EDR-02 | FIN-SRV-01</p>
               </div>
               <div className="border p-2 rounded border-slate-200 dark:border-slate-700">
                 <span className="bg-orange-500 text-white px-1 rounded text-[10px]">High</span>
                 <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">Suspicious PowerShell Activity</p>
                 <p>SIEM-01 | FIN-WS-23</p>
               </div>
               <div className="border p-2 rounded border-slate-200 dark:border-slate-700">
                 <span className="bg-yellow-500 text-white px-1 rounded text-[10px]">Medium</span>
                 <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">Web Application Attack</p>
                 <p>WAF-01 | 203.0.113.55</p>
               </div>
            </div>
          </Panel>

          <div className="lg:col-span-2 flex flex-col gap-4">
            <Panel title="Investigation Workspace" action={<div className="flex gap-2"><button className="text-xs border px-2 py-1 rounded">Assign</button><button className="text-xs border px-2 py-1 rounded">Escalate</button></div>}>
              <h2 className="text-xl font-bold text-red-600 mb-4">Brute Force Login Detected <span className="text-xs bg-red-500 text-white px-1 rounded align-middle">Critical</span></h2>
              <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 text-sm font-medium mb-4">
                <span className="border-b-2 border-brand-blue text-brand-blue pb-2">Overview</span>
                <span className="text-slate-500 pb-2">Timeline</span>
                <span className="text-slate-500 pb-2">Entities (7)</span>
                <span className="text-slate-500 pb-2">IOCs (12)</span>
                <span className="text-slate-500 pb-2">Evidence (5)</span>
                <span className="text-slate-500 pb-2">Response</span>
              </div>
              <div className="grid grid-cols-2 gap-6 text-sm text-slate-600 dark:text-slate-400">
                 <div>
                   <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Alert Summary</h3>
                   <p>Multiple failed login attempts detected from external IP targeting VPN portal.</p>
                   <ul className="mt-4 space-y-2">
                     <li><strong>First Seen:</strong> May 19, 2025 10:30:21 AM</li>
                     <li><strong>Last Seen:</strong> May 19, 2025 10:32:15 AM</li>
                     <li><strong>Total Events:</strong> 24</li>
                     <li><strong>Severity:</strong> Critical</li>
                     <li><strong>Status:</strong> In Progress</li>
                     <li><strong>Analyst:</strong> Fandi Junerry</li>
                   </ul>
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Attack Timeline</h3>
                   <ul className="space-y-3 relative border-l border-slate-200 dark:border-slate-700 ml-2 pl-4">
                     <li>
                        <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[5px] top-1.5"></div>
                        <span className="text-xs text-slate-400">10:30:21 AM</span>
                        <p className="font-medium text-slate-700 dark:text-slate-300">Failed login attempt from 185.220.101.2</p>
                     </li>
                     <li>
                        <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[5px] top-1.5"></div>
                        <span className="text-xs text-slate-400">10:30:28 AM</span>
                        <p className="font-medium text-slate-700 dark:text-slate-300">Multiple failed login attempts (user: admin)</p>
                     </li>
                     <li>
                        <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[5px] top-1.5"></div>
                        <span className="text-xs text-slate-400">10:31:02 AM</span>
                        <p className="font-medium text-slate-700 dark:text-slate-300">IP added to blocklist by security policy</p>
                     </li>
                   </ul>
                 </div>
              </div>
            </Panel>
            
            <div className="grid grid-cols-2 gap-4">
              <Panel title="Related Entities"><div className="h-32 flex items-center justify-center text-xs text-slate-400">[Entities List Placeholder]</div></Panel>
              <Panel title="Response Actions">
                <div className="grid grid-cols-2 gap-2 p-2">
                  <button className="border border-red-200 bg-red-50 text-red-600 rounded p-2 text-xs flex items-center gap-2">⚠️ Isolate Asset</button>
                  <button className="border border-red-200 bg-red-50 text-red-600 rounded p-2 text-xs flex items-center gap-2">🚫 Block IP</button>
                  <button className="border border-slate-200 rounded p-2 text-xs text-slate-600 flex items-center gap-2">⛔ Kill Process</button>
                  <button className="border border-slate-200 rounded p-2 text-xs text-slate-600 flex items-center gap-2">▶ Run Playbook</button>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
