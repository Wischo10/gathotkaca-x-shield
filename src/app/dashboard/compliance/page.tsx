"use client";
import { Topbar } from "@/components/layout/Topbar";
import Link from "next/link";
import { useSidebarToggle } from "@/app/dashboard/SidebarContext";
import { Panel } from "@/components/ui/Panel";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function ComplianceDashboardPage() {
  const openSidebar = useSidebarToggle();
  const [activeTab, setActiveTab] = useState("Compliance Overview");
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const tabs = ["Compliance Overview", "Regulatory Tracking", "Audit & Assessment", "Policy Management", "Risk & Gap Analysis", "Reports"];

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch("/api/compliance/summary");
        const json = await res.json();
        setSummary(json.data);
      } catch (error) {
        console.error("Failed to fetch compliance summary", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <Topbar title="Regulatory & Security Compliance Dashboard" subtitle="Monitor compliance status, track regulatory requirements, and ensure security governance" onMenuClick={openSidebar} />
      <main className="flex-1 flex flex-col p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 overflow-x-auto gap-4">
          {tabs.map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === tab ? "border-b-2 border-brand-blue text-brand-blue" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border-b-2 border-transparent"}`}
            >
               {tab}
            </button>
          ))}
        </div>

        {activeTab === "Compliance Overview" ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
               <Panel title="Compliance Score (Fokus UU PDP)" className="lg:col-span-1 h-32 flex flex-col justify-center">
                 <div className="flex items-center gap-4">
                   <div className="text-4xl font-bold text-purple-600">
                     {loading ? <Loader2 className="w-8 h-8 animate-spin text-purple-600" /> : `${summary?.overallScore || 0}%`}
                   </div>
                   <div className="text-xs text-slate-500">Status: <span className="font-bold text-green-500">{summary?.overallScore >= 80 ? 'Compliant' : 'Warning'}</span><br/>Temuan: {summary?.nonCompliant || 0}</div>
                 </div>
               </Panel>
               <Panel title="Ringkasan Compliance Keseluruhan" className="lg:col-span-3 h-32 flex items-center justify-around">
                 <div className="text-center"><div className="text-xs text-slate-500">Overall Score</div><div className="text-xl font-bold text-blue-600">
                   {loading ? <Loader2 className="w-5 h-5 animate-spin text-brand-blue mx-auto" /> : `${summary?.overallScore || 0}%`}
                 </div></div>
                 <div className="text-center"><div className="text-xs text-slate-500">Total Requirements</div><div className="text-xl font-bold">
                   {loading ? <Loader2 className="w-5 h-5 animate-spin text-brand-blue mx-auto" /> : summary?.totalRequirements || 0}
                 </div></div>
                 <div className="text-center"><div className="text-xs text-slate-500">Compliant</div><div className="text-xl font-bold text-green-500">
                   {loading ? <Loader2 className="w-5 h-5 animate-spin text-brand-blue mx-auto" /> : summary?.compliant || 0}
                 </div></div>
                 <div className="text-center"><div className="text-xs text-slate-500">Non-Compliant</div><div className="text-xl font-bold text-red-500">
                   {loading ? <Loader2 className="w-5 h-5 animate-spin text-brand-blue mx-auto" /> : summary?.nonCompliant || 0}
                 </div></div>
               </Panel>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Panel title="Kepatuhan UU PDP per Prinsip" className="h-64 flex flex-col justify-between">
                 <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                   <span>[Table Placeholder]</span>
                 </div>
              </Panel>
              <Panel title="Klasifikasi Temuan UU PDP" className="h-64 flex flex-col justify-between">
                 <div className="flex-1 flex items-center justify-center text-slate-400">[Donut Chart Placeholder]</div>
              </Panel>
              <Panel title="Recent Control Deficiencies" className="h-64 flex flex-col">
                 <div className="flex-1 overflow-auto">
                   <div className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded border-b border-slate-100 dark:border-slate-800">
                     <div>
                       <div className="text-sm font-semibold">Access Control Failure</div>
                       <div className="text-xs text-slate-500">Domain: Identity</div>
                     </div>
                     <Link href="/dashboard/soc-l2?controlId=identity-01" className="text-xs text-brand-blue hover:underline">View SOC Evidence →</Link>
                   </div>
                   <div className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded">
                     <div>
                       <div className="text-sm font-semibold">Unencrypted Data Transfer</div>
                       <div className="text-xs text-slate-500">Domain: Network</div>
                     </div>
                     <Link href="/dashboard/soc-l2?controlId=network-02" className="text-xs text-brand-blue hover:underline">View SOC Evidence →</Link>
                   </div>
                 </div>
              </Panel>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 min-h-[400px]">
            <p>Konten untuk tab <strong>{activeTab}</strong> sedang dalam tahap pengembangan.</p>
          </div>
        )}
      </main>
    </>
  );
}
