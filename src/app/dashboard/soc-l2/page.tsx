"use client";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/app/dashboard/SidebarContext";
import { useState, useEffect } from "react";
import { L2Alert, InvestigationCase } from "@/types/soc";
import { SessionUser } from "@/lib/auth";
import { getL2Alerts, getInvestigationCase } from "@/services/soc-l2-service";
import { AlertQueue } from "./components/alert-queue/AlertQueue";
import { InvestigationList } from "./components/investigation/InvestigationList";
import { InvestigationWorkspace } from "./components/InvestigationWorkspace";
import { AlertDetailWorkspace } from "./components/alert-queue/AlertDetailWorkspace";
import { CaseNote, Note } from "./components/CaseNote";
import { CasesView } from "./components/cases/CasesView";
import { ThreatIntelligenceView } from "./components/threat-intel/ThreatIntelligenceView";
import { PlaybooksView } from "./components/playbooks/PlaybooksView";
import { ReportsView } from "./components/reports/ReportsView";
import { Bell, Search, Briefcase, Target, Book, Download, Settings, Plus } from "lucide-react";

export default function SOCL2DashboardPage() {
  const openSidebar = useSidebarToggle();
  const [alerts, setAlerts] = useState<L2Alert[]>([]);
  const [selectedAlertId, setSelectedAlertId] = useState<string | undefined>();
  const [investigationCase, setInvestigationCase] = useState<InvestigationCase | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [allNotes, setAllNotes] = useState<Record<string, Note[]>>({});
  const [activeTab, setActiveTab] = useState<string>("Threat Intelligence");

  const tabItems = [
    { name: "Alert Queue", icon: Bell },
    { name: "Investigation", icon: Search },
    { name: "Cases", icon: Briefcase },
    { name: "Threat Intelligence", icon: Target },
    { name: "Playbooks", icon: Book },
    { name: "Reports", icon: Download }
  ];

  useEffect(() => {
    // Load alerts and user session on mount
    getL2Alerts().then(data => {
      setAlerts(data);
    });

    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.status === "ok") {
          setUser(data.data.user);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedAlertId) {
      getInvestigationCase(selectedAlertId).then(data => {
        setInvestigationCase(data);
      });
    } else {
      setInvestigationCase(null);
    }
  }, [selectedAlertId]);

  const handleAddNote = (alertId: string, note: Note) => {
    setAllNotes(prev => ({
      ...prev,
      [alertId]: [note, ...(prev[alertId] || [])]
    }));
  };

  return (
    <>
      <Topbar title="SOC L2 Console" subtitle="Investigate alerts, manage cases, and respond to incidents" onMenuClick={openSidebar} />
      <main className="flex-1 flex flex-col p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 overflow-x-auto justify-between items-end">
          <div className="flex">
            {tabItems.map((tab) => (
              <button 
                key={tab.name} 
                onClick={() => setActiveTab(tab.name)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.name 
                    ? "border-b-2 border-brand-blue text-brand-blue" 
                    : "border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>
          {activeTab === "Threat Intelligence" && (
            <button className="flex items-center gap-1.5 text-xs font-medium bg-brand-blue text-white px-3 py-1.5 rounded-md hover:bg-brand-blue/90 mb-2 mr-2">
              <Settings className="w-3.5 h-3.5" /> Manage Feeds & Sources
            </button>
          )}
          {activeTab === "Playbooks" && (
            <button className="flex items-center gap-1.5 text-xs font-medium bg-brand-blue text-white px-3 py-1.5 rounded-md hover:bg-brand-blue/90 mb-2 mr-2 shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Create Playbook
            </button>
          )}
          {activeTab === "Reports" && (
            <button className="flex items-center gap-1.5 text-xs font-medium bg-brand-blue text-white px-3 py-1.5 rounded-md hover:bg-brand-blue/90 mb-2 mr-2 shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Create Report
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4 h-[calc(100vh-180px)]">
          
          {activeTab === "Cases" ? (
            <CasesView />
          ) : activeTab === "Threat Intelligence" ? (
            <div className="h-full -mx-4 sm:-mx-6 -my-4 sm:-my-6 px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto bg-slate-50 dark:bg-slate-950">
              <ThreatIntelligenceView />
            </div>
          ) : activeTab === "Playbooks" ? (
            <div className="h-full -mx-4 sm:-mx-6 -my-4 sm:-my-6 px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto bg-slate-50 dark:bg-slate-950">
              <PlaybooksView />
            </div>
          ) : activeTab === "Reports" ? (
            <div className="h-full -mx-4 sm:-mx-6 -my-4 sm:-my-6 px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto bg-slate-50 dark:bg-slate-950">
              <ReportsView />
            </div>
          ) : (
            <>
              {/* Top Row */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 h-full">
                <div className="xl:col-span-1 h-full overflow-hidden">
                  {activeTab === "Alert Queue" ? (
                    <AlertQueue 
                      alerts={alerts} 
                      selectedAlertId={selectedAlertId} 
                      onSelectAlert={setSelectedAlertId} 
                    />
                  ) : activeTab === "Investigation" ? (
                    <InvestigationList 
                      alerts={alerts} 
                      selectedAlertId={selectedAlertId} 
                      onSelectAlert={setSelectedAlertId} 
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      Content for {activeTab} goes here.
                    </div>
                  )}
                </div>

                <div className="xl:col-span-3 h-full overflow-hidden">
                  {activeTab === "Alert Queue" ? (
                    <AlertDetailWorkspace 
                      investigationCase={investigationCase} 
                      user={user}
                    />
                  ) : (
                    <InvestigationWorkspace 
                      investigationCase={investigationCase} 
                      user={user}
                    />
                  )}
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 gap-4">
                <CaseNote 
                  investigationCase={investigationCase} 
                  user={user} 
                  savedNotes={selectedAlertId ? allNotes[selectedAlertId] || [] : []}
                  onAddNote={(note) => selectedAlertId && handleAddNote(selectedAlertId, note)}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
