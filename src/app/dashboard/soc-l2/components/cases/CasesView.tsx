import { useState } from "react";
import { CasesKPIs } from "./CasesKPIs";
import { CasesTable } from "./CasesTable";
import { CasesCharts } from "./CasesCharts";
import { CaseDetailSidebar } from "./CaseDetailSidebar";
import { Filter, MoreVertical } from "lucide-react";

export function CasesView() {
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>();

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pr-2 pb-4">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cases</h1>
          <div className="flex items-center gap-3">
            <button className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-blue/90 transition-colors">
              Create Case
            </button>
            <button className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Filter className="w-4 h-4" /> Filters
            </button>
            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        <CasesKPIs />
        <CasesTable onSelectCase={setSelectedCaseId} selectedCaseId={selectedCaseId} />
        <CasesCharts />
      </div>

      {/* Sidebar Overlay/Flex Item */}
      {selectedCaseId && (
        <div className="hidden xl:block ml-4">
          <CaseDetailSidebar caseId={selectedCaseId} onClose={() => setSelectedCaseId(undefined)} />
        </div>
      )}

      {/* Mobile Absolute Sidebar */}
      {selectedCaseId && (
        <div className="xl:hidden absolute inset-y-0 right-0 z-50">
          <CaseDetailSidebar caseId={selectedCaseId} onClose={() => setSelectedCaseId(undefined)} />
        </div>
      )}
    </div>
  );
}
