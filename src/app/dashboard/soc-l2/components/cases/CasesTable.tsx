import { Search, ChevronLeft, ChevronRight, ChevronDown, ListFilter, LayoutGrid } from "lucide-react";
import { useState } from "react";

import { L2Alert } from "@/types/soc";

export function CasesTable({ onSelectCase, selectedCaseId, alerts = [] }: { onSelectCase: (id: string) => void, selectedCaseId?: string, alerts?: L2Alert[] }) {
  const [activeTab, setActiveTab] = useState("All Cases");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const tabs = [
    { name: "All Cases", count: alerts.length },
    { name: "My Cases", count: alerts.filter(a => a.assignee === "Me").length },
    { name: "Unassigned", count: alerts.filter(a => !a.assignee).length },
    { name: "SLA Breach", count: 0 },
  ];



  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10 border-red-200";
      case "high": return "text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10 border-orange-200";
      case "medium": return "text-yellow-700 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-500/10 border-yellow-200";
      default: return "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 border-blue-200";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Progress": return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10";
      case "On Hold": return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-500/10";
      case "Closed": return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10";
      default: return "text-slate-600 bg-slate-50";
    }
  };

  const getSLACircleColor = (sla: number) => {
    if (sla >= 80) return "text-emerald-500";
    if (sla >= 50) return "text-orange-500";
    return "text-red-500";
  };

  const filteredAlerts = alerts.filter(a => {
    if (activeTab === "My Cases") return a.assignee === "Me";
    if (activeTab === "Unassigned") return !a.assignee;
    if (activeTab === "SLA Breach") return false; // mock
    return true; // "All Cases"
  });

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / itemsPerPage));
  const displayedAlerts = filteredAlerts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when tab changes
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col mt-4">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2 overflow-x-auto">
        {tabs.map(tab => (
          <button 
            key={tab.name}
            onClick={() => handleTabChange(tab.name)}
            className={`pb-3 pt-2 px-4 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 border-b-2 ${
              activeTab === tab.name 
                ? "border-brand-blue text-brand-blue" 
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab.name} ({tab.count})
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="p-4 flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search cases..." 
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            Group by: <button className="font-medium flex items-center gap-1 text-slate-800 dark:text-slate-200">None <ChevronDown className="w-3.5 h-3.5" /></button>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <LayoutGrid className="w-4 h-4" /> Columns <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border-t border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="text-xs uppercase text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="py-3 px-4 font-medium w-8"><input type="checkbox" className="rounded border-slate-300" /></th>
              <th className="py-3 px-4 font-medium">Case ID</th>
              <th className="py-3 px-4 font-medium">Title</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Severity</th>
              <th className="py-3 px-4 font-medium">Priority</th>
              <th className="py-3 px-4 font-medium">Category</th>
              <th className="py-3 px-4 font-medium">Assigned To</th>
              <th className="py-3 px-4 font-medium">Created</th>
              <th className="py-3 px-4 font-medium">SLA</th>
              <th className="py-3 px-4 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {displayedAlerts.length === 0 ? (
              <tr><td colSpan={11} className="py-4 text-center text-slate-500">No cases found.</td></tr>
            ) : displayedAlerts.map((c) => {
              let priority = "P3";
              if (c.severity === "critical" || c.severity === "high") priority = "P1";
              else if (c.severity === "medium") priority = "P2";

              const formatDate = (isoString: string) => {
                try {
                  const d = new Date(isoString);
                  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + "\n" + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                } catch {
                  return isoString;
                }
              };
              
              const title = c.title || "No Title";
              const status = c.status || "New";
              const severity = c.severity ? c.severity.charAt(0).toUpperCase() + c.severity.slice(1) : "Unknown";
              const category = c.source || "Unknown";
              const assignee = c.assignee || "Unassigned";
              const created = formatDate(c.firstSeen || new Date().toISOString());
              const updated = formatDate(c.lastSeen || new Date().toISOString());
              const sla = 100; // placeholder SLA
              
              return (
              <tr 
                key={c.id || Math.random().toString()} 
                onClick={() => onSelectCase(c.id)}
                className={`cursor-pointer transition-colors ${selectedCaseId === c.id ? "bg-blue-50 dark:bg-blue-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
              >
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="rounded border-slate-300" />
                </td>
                <td className="py-3 px-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{c.id ? c.id.substring(0, 8) : "N/A"}</td>
                <td className="py-3 px-4 font-medium text-slate-900 dark:text-white min-w-[200px]">{title}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(status)}`}>
                    {status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${getSeverityBadge(severity)}`}>
                    {severity}
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">{priority}</td>
                <td className="py-3 px-4 whitespace-nowrap">{category}</td>
                <td className="py-3 px-4 whitespace-nowrap">{assignee}</td>
                <td className="py-3 px-4 text-xs whitespace-pre-line leading-tight">{created}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {/* SVG Circle Progress */}
                    <div className="relative w-6 h-6">
                      <svg className="w-6 h-6 transform -rotate-90">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-slate-200 dark:text-slate-700" />
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="transparent" strokeDasharray={`${2 * Math.PI * 10}`} strokeDashoffset={`${2 * Math.PI * 10 * (1 - sla / 100)}`} className={getSLACircleColor(sla)} />
                      </svg>
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{sla}%</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-xs whitespace-pre-line leading-tight">{updated}</td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between mt-auto">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Showing {filteredAlerts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredAlerts.length)} of {filteredAlerts.length} cases
        </span>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button 
                key={pageNum} 
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 flex items-center justify-center rounded text-sm ${pageNum === currentPage ? 'bg-brand-blue/10 text-brand-blue font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                {pageNum}
              </button>
            );
          })}
          
          {totalPages > 5 && (
            <>
              <span className="text-slate-400 px-1">...</span>
              <button 
                onClick={() => setCurrentPage(totalPages)}
                className={`w-7 h-7 flex items-center justify-center rounded text-sm ${totalPages === currentPage ? 'bg-brand-blue/10 text-brand-blue font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                {totalPages}
              </button>
            </>
          )}

          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
