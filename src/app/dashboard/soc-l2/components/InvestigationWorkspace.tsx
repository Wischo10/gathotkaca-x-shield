import { Panel } from "@/components/ui/Panel";
import { InvestigationCase } from "@/types/soc";
import { SessionUser } from "@/lib/auth";
import { useState } from "react";
import { UserPlus, ShieldAlert, ChevronDown, Circle, FileEdit, Check, ExternalLink } from "lucide-react";
import { CaseSummary } from "./CaseSummary";
import { RelatedEntities } from "./RelatedEntities";
import { IOCs } from "./IOCs";
import { EvidenceList } from "./EvidenceList";
import { ResponseActions } from "./ResponseActions";
import { Modal } from "@/components/ui/Modal";
import { useEffect } from "react";

interface InvestigationWorkspaceProps {
  investigationCase: InvestigationCase | null;
  user: SessionUser | null;
}

export function InvestigationWorkspace({ investigationCase, user }: InvestigationWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<string>("Timeline");
  
  const [localStatus, setLocalStatus] = useState("");
  const [isEscalated, setIsEscalated] = useState(false);
  const [hasCase, setHasCase] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  useEffect(() => {
    if (investigationCase) {
      setLocalStatus(investigationCase.alert.status || "In Progress");
      setIsEscalated(false);
      setHasCase(false);
    }
  }, [investigationCase?.alert?.id]);

  if (!investigationCase) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-full min-h-[400px]">
        <div className="flex-1 flex items-center justify-center text-slate-400">
          Select an alert from the queue to start investigating.
        </div>
      </div>
    );
  }

  const { alert } = investigationCase;

  const handleCreateCase = async () => {
    if (hasCase) return;
    setIsCreatingCase(true);
    try {
      const res = await fetch("/api/soc/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alert_id: alert.id,
          title: `Investigation: ${alert.title}`,
          severity: alert.severity,
          assigned_to: user?.email || "unassigned"
        })
      });
      if (res.ok) {
        setHasCase(true);
        window.alert("Success: Investigation case created in database!");
      } else {
        window.alert("Failed to create case.");
      }
    } catch (error) {
      window.alert("Network error occurred.");
    } finally {
      setIsCreatingCase(false);
    }
  };

  const handleEscalate = async () => {
    setIsEscalating(true);
    try {
      const res = await fetch("/api/soc/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alert_id: alert.id,
          title: alert.title,
          severity: alert.severity.toLowerCase(),
          assigned_to: user?.email || "Analyst"
        })
      });
      if (res.ok) {
        setIsEscalated(true);
      } else {
        const errData = await res.json().catch(() => ({}));
        window.alert(`Failed to escalate: ${errData.message || 'Internal Server Error'}`);
      }
    } catch (error) {
      window.alert("Network error occurred.");
    } finally {
      setIsEscalating(false);
    }
  };

  const handleStatusUpdate = (s: string) => {
    if (s === localStatus) return;
    setStatusMenuOpen(false);
    setIsUpdatingStatus(true);
    // Simulate API call to Wazuh/SOAR
    setTimeout(() => {
      setLocalStatus(s);
      setIsUpdatingStatus(false);
    }, 800);
  };

  const handleSaveNote = async () => {
    if (!noteText.trim()) return;
    setIsSavingNote(true);
    try {
      const res = await fetch("/api/soc/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alert_id: alert.id,
          author: user?.email || "Analyst",
          role: user?.role || "SOC L2",
          content: noteText
        })
      });
      if (res.ok) {
        window.alert("Note successfully saved to database!");
        setNoteText("");
        setIsNoteModalOpen(false);
      } else {
        window.alert("Failed to save note.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingNote(false);
    }
  };
  
  const tabs = [
    { name: "Overview" }, 
    { name: "Timeline" }, 
    { name: "Entities", count: investigationCase.entities.length }, 
    { name: "IOCs", count: investigationCase.iocs.length }, 
    { name: "Evidence", count: 0 }, 
    { name: "Response" }
  ];
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm h-full">
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
        <div className="flex items-center gap-3 flex-wrap relative">
          
          <div className="relative">
            <button 
              onClick={() => setStatusMenuOpen(!statusMenuOpen)}
              disabled={isUpdatingStatus}
              className={`flex items-center gap-1.5 text-xs font-medium border px-3 py-1.5 rounded-md ${isUpdatingStatus ? 'opacity-50 cursor-wait bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-900/50'}`}
            >
              {isUpdatingStatus ? "Updating..." : localStatus} <ChevronDown className="w-3 h-3" />
            </button>
            {statusMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg py-1 z-10">
                {["New", "In Progress", "Resolved", "Closed"].map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusUpdate(s)}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex justify-between items-center"
                  >
                    {s}
                    {localStatus === s && <Check className="w-3 h-3 text-brand-blue" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={handleEscalate}
            disabled={isEscalating || isEscalated}
            className={`text-xs font-medium border px-3 py-1.5 rounded-md transition-colors ${
              isEscalated 
                ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-900/50 opacity-100' 
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            } ${isEscalating ? 'opacity-50 cursor-wait' : ''}`}
          >
            {isEscalating ? "Escalating..." : (isEscalated ? "Escalated to L3" : "Escalate")}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="flex items-center gap-1 text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors px-3 py-1.5 rounded-md"
            >
              More <ChevronDown className="w-3 h-3" />
            </button>
            {moreMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg py-1 z-10">
                <button
                  onClick={() => { setMoreMenuOpen(false); window.alert("Exporting to PDF..."); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Export to PDF
                </button>
                <button
                  onClick={() => { setMoreMenuOpen(false); window.alert("Sending email to team..."); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Send via Email
                </button>
              </div>
            )}
          </div>
          
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
          
          <button 
            onClick={handleCreateCase}
            disabled={isCreatingCase}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              hasCase 
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-brand-blue text-white hover:bg-brand-blue/90'
            } disabled:opacity-50`}
          >
            {hasCase ? <><ExternalLink className="w-3.5 h-3.5" /> View Case</> : (isCreatingCase ? "Creating..." : "Create Case")}
          </button>
          
          <button 
            onClick={() => setIsNoteModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-blue border border-brand-blue/30 bg-blue-50 dark:bg-brand-blue/10 px-3 py-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-brand-blue/20 transition-colors"
          >
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
      <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50 flex-1 overflow-y-auto">
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
      
      {/* Note Modal */}
      <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title="Add Investigation Note">
        <div className="flex flex-col gap-4">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Type your findings, analysis, or next steps here..."
            className="w-full h-32 p-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 resize-none"
          ></textarea>
          <div className="flex justify-end">
            <button 
              onClick={handleSaveNote}
              disabled={isSavingNote || !noteText.trim()}
              className="bg-brand-blue text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-brand-blue/90 disabled:opacity-50 flex items-center gap-2"
            >
              {isSavingNote ? "Saving..." : "Save Note"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
