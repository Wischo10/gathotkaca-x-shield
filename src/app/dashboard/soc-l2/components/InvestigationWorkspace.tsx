import { Panel } from "@/components/ui/Panel";
import { InvestigationCase } from "@/types/soc";
import { SessionUser } from "@/lib/auth";
import { useState, useEffect } from "react";
import { ShieldAlert, ChevronDown, FileEdit, Check, ExternalLink } from "lucide-react";
import { CaseSummary } from "./CaseSummary";
import { RelatedEntities } from "./RelatedEntities";
import { IOCs } from "./IOCs";
import { EvidenceList } from "./EvidenceList";
import { ResponseActions } from "./ResponseActions";
import { Modal } from "@/components/ui/Modal";

// --- Types & Interfaces ---

/**
 * Props for the Investigation Workspace component.
 */
interface InvestigationWorkspaceProps {
  investigationCase: InvestigationCase | null;
  user: SessionUser | null;
  onViewCasesTab?: () => void;
}

// --- Sub-components ---

/**
 * Displays the timeline of events associated with the investigation.
 */
function TimelineTab({ investigationCase }: { investigationCase: InvestigationCase }) {
  return (
    <div className="grid grid-cols-1 gap-4">
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
  );
}

// --- Main Component ---

/**
 * Main workspace for SOC L2 analysts to investigate and respond to security alerts.
 * Features tabs for Overview, Timeline, Entities, IOCs, Evidence, and Response.
 */
export function InvestigationWorkspace({ investigationCase, user, onViewCasesTab }: InvestigationWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<string>("Timeline");
  
  const [localStatus, setLocalStatus] = useState("");
  const [isEscalated, setIsEscalated] = useState(false);
  const [actionTaken, setActionTaken] = useState("");
  const [hasCase, setHasCase] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  
  // Loading states
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // Sync state with incoming props
  useEffect(() => {
    if (investigationCase) {
      setLocalStatus(investigationCase.alert.status || "New");
      setIsEscalated(false);
      setActionTaken("");
      setHasCase(false);
      
      // Check if case exists in DB
      fetch(`/api/soc/cases?alert_id=${investigationCase.alert.id}&_t=${Date.now()}`, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (data.status === "ok" && data.data) {
            setHasCase(true);
            setLocalStatus(data.data.status === "in_progress" ? "In Progress" : data.data.status);
          }
        })
        .catch(console.error);
    }
  }, [investigationCase]);

  // Early return if no case is selected
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

  /** Handles creation of a formal investigation case from the current alert */
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
        setLocalStatus("In Progress");
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

  /** Handles escalating the case to SOC L3 or Incident Response teams */
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
          assigned_to: user?.email || "Analyst",
          latest_action: actionTaken || undefined
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

  /** Updates the local status state and database */
  const handleStatusUpdate = async (s: string) => {
    if (s === localStatus) return;
    setStatusMenuOpen(false);
    setIsUpdatingStatus(true);
    try {
      if (hasCase) {
        await fetch("/api/soc/cases", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alert_id: alert.id, status: s })
        });
      }
      setLocalStatus(s);
    } catch (error) {
      console.error(error);
      window.alert("Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  /** Saves an investigation note to the database */
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
        
        {/* Actions Menu */}
        <div className="flex items-center gap-3 flex-wrap relative">
          
          <div className={`flex items-center gap-1.5 text-xs font-medium border px-3 py-1.5 rounded-md ${isUpdatingStatus ? 'opacity-50 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-slate-50 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
            {isUpdatingStatus ? "Updating..." : localStatus}
          </div>

          {!isEscalated && (
            <input 
              type="text" 
              placeholder="Initial Action Taken..." 
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              className="text-xs border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 min-w-[200px] outline-none focus:border-brand-blue"
            />
          )}
          
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
                  onClick={() => { setMoreMenuOpen(false); window.alert("[DUMMY DATA] Fitur Export to PDF belum diimplementasi ke backend."); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Export to PDF
                </button>
                <button
                  onClick={() => { setMoreMenuOpen(false); window.alert("[DUMMY DATA] Fitur Send via Email belum terhubung ke SMTP server."); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Send via Email
                </button>
              </div>
            )}
          </div>
          
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
          
          <button 
            onClick={hasCase ? onViewCasesTab : handleCreateCase}
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
      
      {/* Navigation Tabs */}
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
      
      {/* Content Area Rendering Based on Selected Tab */}
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
          <TimelineTab investigationCase={investigationCase} />
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
      
      {/* Add Note Modal */}
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
