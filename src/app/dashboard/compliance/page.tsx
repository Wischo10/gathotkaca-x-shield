"use client";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/app/dashboard/SidebarContext";
import { Panel } from "@/components/ui/Panel";

export default function ComplianceDashboardPage() {
  const openSidebar = useSidebarToggle();
  return (
    <>
      <Topbar title="Regulatory & Security Compliance Dashboard" subtitle="Monitor compliance status, track regulatory requirements, and ensure security governance" onMenuClick={openSidebar} />
      <main className="flex-1 flex flex-col p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 overflow-x-auto gap-4">
          {["Compliance Overview", "Regulatory Tracking", "Audit & Assessment", "Policy Management", "Risk & Gap Analysis", "Reports"].map((tab, i) => (
            <button key={tab} className={`pb-2 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${i === 0 ? "border-b-2 border-brand-blue text-brand-blue" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
               {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
           <Panel title="Compliance Score (Fokus UU PDP)" className="lg:col-span-1 h-32 flex flex-col justify-center">
             <div className="flex items-center gap-4">
               <div className="text-4xl font-bold text-purple-600">92%</div>
               <div className="text-xs text-slate-500">Status: <span className="font-bold text-green-500">Compliant</span><br/>Temuan: 2</div>
             </div>
           </Panel>
           <Panel title="Ringkasan Compliance Keseluruhan" className="lg:col-span-3 h-32 flex items-center justify-around">
             <div className="text-center"><div className="text-xs text-slate-500">Overall Score</div><div className="text-xl font-bold text-blue-600">87.5%</div></div>
             <div className="text-center"><div className="text-xs text-slate-500">Total Requirements</div><div className="text-xl font-bold">58</div></div>
             <div className="text-center"><div className="text-xs text-slate-500">Compliant</div><div className="text-xl font-bold text-green-500">47</div></div>
             <div className="text-center"><div className="text-xs text-slate-500">Non-Compliant</div><div className="text-xl font-bold text-red-500">6</div></div>
           </Panel>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Panel title="Kepatuhan UU PDP per Prinsip" className="h-64 flex flex-col justify-between">
             <div className="flex-1 flex items-center justify-center text-slate-400">[Table Placeholder]</div>
          </Panel>
          <Panel title="Klasifikasi Temuan UU PDP" className="h-64 flex flex-col justify-between">
             <div className="flex-1 flex items-center justify-center text-slate-400">[Donut Chart Placeholder]</div>
          </Panel>
          <Panel title="Kepatuhan per Regulasi / Framework" className="h-64 flex flex-col justify-between">
             <div className="flex-1 flex items-center justify-center text-slate-400">[List Placeholder]</div>
          </Panel>
        </div>
      </main>
    </>
  );
}
