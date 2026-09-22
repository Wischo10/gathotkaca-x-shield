import { useState } from "react";
import { CasesKPIs } from "./CasesKPIs";
import { CasesTable } from "./CasesTable";
import { CasesCharts } from "./CasesCharts";
import { CaseDetailSidebar } from "./CaseDetailSidebar";
import { Filter, MoreVertical } from "lucide-react";
import { L2Alert } from "@/types/soc";

export function CasesView({ alerts = [] }: { alerts?: L2Alert[] }) {
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [caseFilters, setCaseFilters] = useState<string[]>([]);

  const toggleFilter = (filter: string) => {
    setCaseFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
  };

  const filteredAlerts = alerts.filter(alert => {
     if (caseFilters.includes("unassigned") && alert.assignee && alert.assignee !== "Unassigned") return false;
     if (caseFilters.includes("high_priority") && alert.severity !== "critical" && alert.severity !== "high" && alert.severity !== "medium") return false;
     if (caseFilters.includes("exclude_closed") && alert.status === "Closed") return false;
     return true;
  });

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pr-2 pb-4">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cases</h1>
          <div className="flex items-center gap-3 relative">
            <button 
              onClick={() => window.alert("Membuka form pembuatan Case baru (Coming Soon)...")}
              className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-blue/90 transition-colors"
            >
              Create Case
            </button>
            
            <button 
              onClick={() => { setShowFilters(!showFilters); setShowMoreMenu(false); }}
              className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showFilters || caseFilters.length > 0 ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <Filter className="w-4 h-4" /> Filters {caseFilters.length > 0 && <span className="bg-brand-blue text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{caseFilters.length}</span>}
            </button>
            
            {showFilters && (
              <div className="absolute top-12 right-12 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 p-4">
                <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase">Filter Cases</h4>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={caseFilters.includes("unassigned")} onChange={() => toggleFilter("unassigned")} className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue" />
                    <span className="text-slate-700 dark:text-slate-300">Show Unassigned Only</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={caseFilters.includes("high_priority")} onChange={() => toggleFilter("high_priority")} className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue" />
                    <span className="text-slate-700 dark:text-slate-300">High Priority (P1/P2)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={caseFilters.includes("exclude_closed")} onChange={() => toggleFilter("exclude_closed")} className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue" />
                    <span className="text-slate-700 dark:text-slate-300">Exclude Closed</span>
                  </label>
                </div>
              </div>
            )}

            <button 
              onClick={() => { setShowMoreMenu(!showMoreMenu); setShowFilters(false); }}
              className={`p-2 border rounded-lg transition-colors ${showMoreMenu ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900'}`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMoreMenu && (
              <div className="absolute top-12 right-0 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 py-1">
                <button 
                  onClick={() => { window.alert("Mengekspor kasus ke CSV..."); setShowMoreMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Export to CSV
                </button>
                <button 
                  onClick={() => { window.alert("Mengimpor data kasus..."); setShowMoreMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Import Cases
                </button>
                <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                <button 
                  onClick={() => { window.alert("Menyegarkan data..."); setShowMoreMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            )}
          </div>
        </div>

        <CasesKPIs alerts={filteredAlerts} />
        <CasesTable alerts={filteredAlerts} onSelectCase={setSelectedCaseId} selectedCaseId={selectedCaseId} />
        <CasesCharts alerts={filteredAlerts} />
      </div>

      {/* Sidebar Overlay/Flex Item */}
      {selectedCaseId && alerts.find(a => a.id === selectedCaseId) && (
        <div className="hidden xl:block ml-4">
          <CaseDetailSidebar alert={alerts.find(a => a.id === selectedCaseId)!} onClose={() => setSelectedCaseId(undefined)} />
        </div>
      )}

      {/* Mobile Absolute Sidebar */}
      {selectedCaseId && alerts.find(a => a.id === selectedCaseId) && (
        <div className="xl:hidden absolute inset-y-0 right-0 z-50">
          <CaseDetailSidebar alert={alerts.find(a => a.id === selectedCaseId)!} onClose={() => setSelectedCaseId(undefined)} />
        </div>
      )}
    </div>
  );
}
