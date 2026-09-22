import { X, ChevronLeft, ChevronRight, ShieldAlert, ChevronDown, Clock, Circle, FileEdit, MoreVertical, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { L2Alert, InvestigationCase } from "@/types/soc";

export function CaseDetailSidebar({ alert, onClose }: { alert: L2Alert, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [caseData, setCaseData] = useState<InvestigationCase | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/soc/l2-cases?id=${alert.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "ok") {
          setCaseData(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [alert.id]);

  const tabs = [
    { name: "Overview" },
    { name: "Timeline" },
    { name: "Entities", count: caseData?.entities?.length || 0 },
    { name: "IOCs", count: caseData?.iocs?.length || 0 },
    { name: "Evidence", count: 0 },
    { name: "Response" },
  ];

  const recentNotes: any[] = [];

  return (
    <div className="w-96 lg:w-[450px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-2xl flex-shrink-0 relative z-20">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800">
        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{alert.id}</span>
        <div className="flex items-center gap-1 text-slate-400">
          <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><ChevronLeft className="w-4 h-4" /></button>
          <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><ChevronRight className="w-4 h-4" /></button>
          <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded ml-2 text-slate-500 hover:text-slate-700" onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Header Info */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 dark:bg-red-500/10 p-2 rounded-lg border border-red-100 dark:border-red-900/50">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {alert.title}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${alert.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-900/50' : alert.severity === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-900/50' : alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-900/50'} border`}>
                  {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                </span>
              </h2>
            </div>
          </div>
          <button className="flex items-center gap-1 text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 px-2 py-1 rounded">
            {alert.status} <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`pb-2.5 pt-1 px-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-1 ${
              activeTab === tab.name
                ? "border-brand-blue text-brand-blue"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab.name} {tab.count !== undefined && <span className={activeTab === tab.name ? 'text-brand-blue/70' : 'text-slate-400'}>({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-brand-blue pt-10">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <p className="text-xs text-slate-500">Loading data...</p>
          </div>
        ) : activeTab === "Overview" ? (
          <>
            {/* Row: Details & Description */}
            <div className="grid grid-cols-2 gap-4">
          
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-xs text-slate-900 dark:text-white">Case Details</h3>
            <div className="text-[11px] flex flex-col gap-2.5">
              <div className="grid grid-cols-[80px_1fr] gap-2"><span className="text-slate-500">Case ID</span><span className="text-slate-900 dark:text-slate-200 font-medium truncate">{alert.id}</span></div>
              <div className="grid grid-cols-[80px_1fr] gap-2"><span className="text-slate-500">Status</span><span className="text-orange-600 font-medium bg-orange-50 px-1.5 py-0.5 rounded w-max">{alert.status}</span></div>
              <div className="grid grid-cols-[80px_1fr] gap-2"><span className="text-slate-500">Severity</span><span className="text-red-600 font-medium flex items-center gap-1"><Circle className={`w-1.5 h-1.5 ${alert.severity === 'critical' ? 'fill-red-500' : alert.severity === 'high' ? 'fill-orange-500' : alert.severity === 'medium' ? 'fill-yellow-500' : 'fill-blue-500'}`} /> {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}</span></div>
              <div className="grid grid-cols-[80px_1fr] gap-2"><span className="text-slate-500">Priority</span><span className="text-slate-900 dark:text-slate-200 font-medium">{alert.severity === 'critical' ? 'P1 - Highest' : alert.severity === 'high' ? 'P2 - High' : alert.severity === 'medium' ? 'P3 - Medium' : 'P4 - Low'}</span></div>
              <div className="grid grid-cols-[80px_1fr] gap-2"><span className="text-slate-500">Category</span><span className="text-slate-900 dark:text-slate-200 font-medium">{alert.title}</span></div>
              <div className="grid grid-cols-[80px_1fr] gap-2"><span className="text-slate-500">Assigned To</span><span className="text-slate-900 dark:text-slate-200 font-medium">{alert.assignee || 'Unassigned'} <span className="text-slate-400 font-normal">(SOC Analyst)</span></span></div>
              <div className="grid grid-cols-[80px_1fr] gap-2"><span className="text-slate-500">Created</span><span className="text-slate-900 dark:text-slate-200 font-medium">{alert.firstSeen}</span></div>
              <div className="grid grid-cols-[80px_1fr] gap-2"><span className="text-slate-500">Last Update</span><span className="text-slate-900 dark:text-slate-200 font-medium">{alert.lastSeen}</span></div>
              <div className="grid grid-cols-[80px_1fr] gap-2"><span className="text-slate-500">SLA</span><span className="text-red-600 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> 00:42:30 <span className="text-slate-400 font-normal">/ 01:00:00</span></span></div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-xs text-slate-900 dark:text-white">Description</h3>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed mb-1">
              {alert.description}
            </p>
            <div className="text-[11px] flex flex-col gap-2.5">
              <div className="grid grid-cols-[70px_1fr] gap-2"><span className="text-slate-500">First Seen</span><span className="text-slate-900 dark:text-slate-200 font-medium">{alert.firstSeen}</span></div>
              <div className="grid grid-cols-[70px_1fr] gap-2"><span className="text-slate-500">Last Seen</span><span className="text-slate-900 dark:text-slate-200 font-medium">{alert.lastSeen}</span></div>
              <div className="grid grid-cols-[70px_1fr] gap-2"><span className="text-slate-500">Total Events</span><span className="text-slate-900 dark:text-slate-200 font-medium">{alert.totalEvents}</span></div>
              <div className="grid grid-cols-[70px_1fr] gap-2"><span className="text-slate-500">Source</span><span className="text-slate-900 dark:text-slate-200 font-medium">{alert.source}</span></div>
            </div>
          </div>

        </div>

        {/* Tags */}
        <div className="border-t border-slate-100 dark:border-slate-800/50 pt-4">
          <h3 className="font-semibold text-xs text-slate-900 dark:text-white mb-2.5">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">Authentication</span>
            <span className="text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">Brute Force</span>
            <span className="text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">VPN</span>
            <button className="text-[10px] font-medium text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 border-dashed px-2 py-0.5 rounded">+</button>
          </div>
        </div>

        {/* Recent Notes */}
        <div className="border-t border-slate-100 dark:border-slate-800/50 pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-xs text-slate-900 dark:text-white">Recent Notes</h3>
            <a href="#" className="text-[10px] font-medium text-brand-blue hover:underline">View All</a>
          </div>
          
          <div className="flex flex-col gap-4">
            {recentNotes.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No notes available.</p>
            ) : (
              recentNotes.map((note, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-600">
                    {note.author.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">{note.author}</span>
                        {note.isLatest && <span className="text-[9px] bg-brand-blue text-white px-1.5 rounded-sm">Latest</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">{note.time}</span>
                        <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 pr-4">
                      {note.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

          </>
        ) : activeTab === "Timeline" ? (
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-xs text-slate-900 dark:text-white">Timeline Events</h3>
            {caseData?.timeline?.map(t => (
              <div key={t.id} className="flex gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-brand-blue shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{t.time}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{t.description}</p>
                </div>
              </div>
            ))}
            {!caseData?.timeline?.length && <p className="text-xs text-slate-500">No events.</p>}
          </div>
        ) : activeTab === "Entities" ? (
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-xs text-slate-900 dark:text-white">Related Entities</h3>
            <div className="flex flex-col gap-2">
              {caseData?.entities?.map(e => (
                <div key={e.id} className="p-2.5 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{e.type}</span>
                  <span className="text-xs font-medium text-slate-900 dark:text-white">{e.value}</span>
                </div>
              ))}
              {!caseData?.entities?.length && <p className="text-xs text-slate-500 text-center py-4">No entities found.</p>}
            </div>
          </div>
        ) : activeTab === "IOCs" ? (
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-xs text-slate-900 dark:text-white">Indicators of Compromise</h3>
            <div className="flex flex-col gap-2">
              {caseData?.iocs?.length ? caseData.iocs.map(ioc => (
                <div key={ioc.id} className="p-2.5 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{ioc.type}</span>
                    <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full font-semibold">{ioc.confidence}% Confidence</span>
                  </div>
                  <span className="text-xs text-slate-900 dark:text-white font-mono break-all">{ioc.value}</span>
                </div>
              )) : <p className="text-xs text-slate-500 text-center py-4">No IOCs found.</p>}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 pt-10">
            <p className="text-sm">Data <span className="font-semibold">{activeTab}</span> (Coming Soon)</p>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => window.alert(`Menampilkan detail kasus: ${alert.id} (Coming Soon)`)}
          className="w-full py-2 bg-white dark:bg-slate-900 border border-brand-blue text-brand-blue text-xs font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-brand-blue/10 transition-colors"
        >
          View Case Detail &rarr;
        </button>
      </div>

    </div>
  );
}
