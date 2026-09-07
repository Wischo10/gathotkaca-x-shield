import { Panel } from "@/components/ui/Panel";
import { InvestigationCase } from "@/types/soc";
import { SessionUser } from "@/lib/auth";
import { useState } from "react";
import { UserPlus, ShieldAlert, ChevronDown, Circle, FileEdit } from "lucide-react";
import { CaseSummary } from "./CaseSummary";
import { RelatedEntities } from "./RelatedEntities";
import { IOCs } from "./IOCs";
import { EvidenceList } from "./EvidenceList";
import { ResponseActions } from "./ResponseActions";

interface InvestigationWorkspaceProps {
  investigationCase: InvestigationCase | null;
  user: SessionUser | null;
}

export function InvestigationWorkspace({ investigationCase, user }: InvestigationWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<string>("Timeline");

  if (!investigationCase) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-[800px]">
        <div className="flex-1 flex items-center justify-center text-slate-400">
          Select an alert from the queue to start investigating.
        </div>
      </div>
    );
  }

  const { alert } = investigationCase;
  
  const tabs = [
    { name: "Overview" }, 
    { name: "Timeline" }, 
    { name: "Entities", count: investigationCase.entities.length }, 
    { name: "IOCs", count: investigationCase.iocs.length }, 
    { name: "Evidence", count: 0 }, 
    { name: "Response" }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm h-auto xl:min-h-[800px]">
      {/* Header */}
      <div className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex-shrink-0">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {alert.title}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-900/50 capitalize">
                {alert.severity}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              CASE-{alert.id.split('-').slice(0, 3).join('-')} &bull; Alert ID: {alert.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="flex items-center gap-1.5 text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 px-3 py-1.5 rounded-md">
            {alert.status || "In Progress"} <ChevronDown className="w-3 h-3" />
          </button>
          <button className="text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors px-3 py-1.5 rounded-md">
            Escalate
          </button>
          <button className="flex items-center gap-1 text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors px-3 py-1.5 rounded-md">
            More <ChevronDown className="w-3 h-3" />
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <button className="text-xs font-medium bg-brand-blue text-white px-3 py-1.5 rounded-md hover:bg-brand-blue/90 transition-colors">
            Create Case
          </button>
          <button className="flex items-center gap-1.5 text-xs font-medium text-brand-blue border border-brand-blue/30 bg-blue-50 dark:bg-brand-blue/10 px-3 py-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-brand-blue/20 transition-colors">
            <FileEdit className="w-3.5 h-3.5" /> Add Note
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800 px-6 overflow-x-auto">
        {tabs.map(tab => (
          <button 
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 border-b-2 ${
              activeTab === tab.name 
                ? "border-brand-blue text-brand-blue" 
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab.name}
            {tab.count !== undefined && (
              <span className={`text-xs ${activeTab === tab.name ? 'text-brand-blue' : 'text-slate-400'}`}>
                ({tab.count})
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Content Area */}
      <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50 flex-1">
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 flex flex-col gap-4">
              <CaseSummary investigationCase={investigationCase} user={user} />
              <EvidenceList />
            </div>
            <div className="xl:col-span-1 flex flex-col gap-4">
              <RelatedEntities entities={investigationCase.entities} />
              <IOCs iocs={investigationCase.iocs} />
              <ResponseActions investigationCase={investigationCase} />
            </div>
          </div>
        )}

        {activeTab === "Timeline" && (
          <div className="grid grid-cols-1 gap-4">
            
            {/* Timeline Column */}
            <div className="xl:col-span-1">
              <Panel title="Investigation Timeline" action={<a href="#" className="text-brand-blue font-medium text-xs hover:underline">Expand All</a>} className="h-full">
                <div className="flex-1 relative border-l border-slate-200 dark:border-slate-800 ml-3 pl-5 space-y-6 mt-4">
                  {investigationCase.timeline.map((event, i) => (
                    <div key={event.id || i} className="relative">
                      <div className={`absolute w-3.5 h-3.5 bg-white dark:bg-slate-900 border-2 border-blue-500 rounded-full -left-[27px] top-1`}>
                        <div className={`w-1.5 h-1.5 bg-blue-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}></div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                        <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 w-[70px] shrink-0 mt-0.5 whitespace-pre-line leading-tight">
                          {new Date(event.time).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(',', '\n')}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">
                              {event.description}
                            </p>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">Source: Wazuh</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-[10px] text-slate-500">System Event</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <button className="text-xs font-medium text-brand-blue hover:text-brand-blue/80 inline-flex items-center gap-1">
                    Load more events <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </Panel>
            </div>

          </div>
        )}
        
        {activeTab === "Entities" && (
          <div className="grid grid-cols-1 gap-4">
            <RelatedEntities entities={investigationCase.entities} />
          </div>
        )}

        {activeTab === "IOCs" && (
          <div className="grid grid-cols-1 gap-4">
            <IOCs iocs={investigationCase.iocs} />
          </div>
        )}

        {activeTab === "Evidence" && (
          <div className="grid grid-cols-1 gap-4">
            <EvidenceList />
          </div>
        )}

        {activeTab === "Response" && (
          <div className="grid grid-cols-1 gap-4">
            <ResponseActions investigationCase={investigationCase} />
          </div>
        )}
      </div>
    </div>
  );
}
