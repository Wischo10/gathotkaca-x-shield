"use client";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/app/dashboard/SidebarContext";
import { Panel } from "@/components/ui/Panel";

export default function CopilotPage() {
  const openSidebar = useSidebarToggle();
  return (
    <>
      <Topbar title="AI Cyber Security Copilot" subtitle="AI-powered analysis, investigation assistant, and security recommendations" onMenuClick={openSidebar} />
      <main className="flex-1 flex flex-col p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 overflow-x-auto gap-4">
          {["AI Alert Analysis", "Incident Summarization", "IOC Analysis", "Investigation Assistant", "Recommendations", "AI Assistant"].map((tab, i) => (
            <button key={tab} className={`pb-2 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${i === 0 ? "border-b-2 border-brand-blue text-brand-blue" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
              {i === 0 && <span className="text-purple-500">✨</span>} {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4">
             <div className="text-purple-500 text-2xl">✨</div>
             <div><div className="text-xs text-slate-500">AI Analyses (This Week)</div><div className="text-xl font-bold">1,248 <span className="text-[10px] text-green-500 font-normal">↑ 24%</span></div></div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4">
             <div className="text-blue-500 text-2xl">📄</div>
             <div><div className="text-xs text-slate-500">Alerts Analyzed</div><div className="text-xl font-bold">2,843 <span className="text-[10px] text-green-500 font-normal">↑ 18%</span></div></div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4">
             <div className="text-green-500 text-2xl">🛡️</div>
             <div><div className="text-xs text-slate-500">AI Accuracy (Confidence)</div><div className="text-xl font-bold">92% <span className="text-[10px] text-green-500 font-normal">↑ 5%</span></div></div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4">
             <div className="text-orange-500 text-2xl">⚡</div>
             <div><div className="text-xs text-slate-500">Time Saved by AI</div><div className="text-xl font-bold">42h 18m <span className="text-[10px] text-green-500 font-normal">↑ 22%</span></div></div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Panel title="AI Analysis Summary (This Week)" className="h-64 flex flex-col justify-between">
             <div className="flex-1 flex items-center justify-center text-slate-400">[Donut Chart Placeholder]</div>
             <div className="text-right text-xs text-brand-blue hover:underline cursor-pointer">View analysis details →</div>
          </Panel>
          <Panel title="Top Alert Categories Analyzed" className="h-64 flex flex-col justify-between">
             <div className="flex-1 flex items-center justify-center text-slate-400">[Horizontal Bar Chart]</div>
             <div className="text-right text-xs text-brand-blue hover:underline cursor-pointer">View all categories →</div>
          </Panel>
          <Panel title="AI Confidence Distribution" className="h-64 flex flex-col justify-between">
             <div className="flex-1 flex items-center justify-center text-slate-400">[Donut Chart Placeholder]</div>
             <div className="text-right text-xs text-brand-blue hover:underline cursor-pointer">View confidence details →</div>
          </Panel>
        </div>
      </main>
    </>
  );
}
