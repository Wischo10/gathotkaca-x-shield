import { Search, ChevronLeft, ChevronRight, ChevronDown, ListFilter, LayoutGrid } from "lucide-react";
import { useState } from "react";

export function CasesTable({ onSelectCase, selectedCaseId }: { onSelectCase: (id: string) => void, selectedCaseId?: string }) {
  const [activeTab, setActiveTab] = useState("All Cases");

  const tabs = [
    { name: "All Cases", count: 128 },
    { name: "My Cases", count: 12 },
    { name: "Unassigned", count: 4 },
    { name: "SLA Breach", count: 3 },
  ];

  const mockCases = [
    { id: "CASE-2025-0519-0001", title: "Brute Force Login Detected", status: "In Progress", severity: "Critical", priority: "P1", category: "Authentication", assignee: "Fandi Junerry", created: "May 19, 2025\n10:31 AM", sla: 85, updated: "10:55 AM" },
    { id: "CASE-2025-0519-0002", title: "Malware Execution Blocked", status: "In Progress", severity: "High", priority: "P1", category: "Malware", assignee: "Rizky Pratama", created: "May 19, 2025\n10:28 AM", sla: 60, updated: "10:52 AM" },
    { id: "CASE-2025-0519-0003", title: "Web Application Attack", status: "In Progress", severity: "High", priority: "P2", category: "Web Attack", assignee: "Siti Aisyah", created: "May 19, 2025\n10:24 AM", sla: 72, updated: "10:50 AM" },
    { id: "CASE-2025-0519-0004", title: "Data Exfiltration Attempt", status: "On Hold", severity: "Medium", priority: "P2", category: "Data Loss", assignee: "Andi Wijaya", created: "May 19, 2025\n10:22 AM", sla: 40, updated: "10:45 AM" },
    { id: "CASE-2025-0518-0007", title: "Suspicious PowerShell Activity", status: "In Progress", severity: "High", priority: "P1", category: "Suspicious Activity", assignee: "Rizky Pratama", created: "May 18, 2025\n09:15 PM", sla: 75, updated: "10:40 AM" },
    { id: "CASE-2025-0518-0006", title: "Phishing Email Clicked", status: "In Progress", severity: "Medium", priority: "P3", category: "Phishing", assignee: "Dewi Lestari", created: "May 18, 2025\n08:45 PM", sla: 55, updated: "10:35 AM" },
    { id: "CASE-2025-0518-0005", title: "C2 Communication Detected", status: "Closed", severity: "High", priority: "P1", category: "C2 / Command & Control", assignee: "Fandi Junerry", created: "May 18, 2025\n07:30 PM", sla: 100, updated: "May 19, 2025\n09:10 AM" },
    { id: "CASE-2025-0518-0004", title: "Privilege Escalation", status: "Closed", severity: "Medium", priority: "P2", category: "Privilege Abuse", assignee: "Andi Wijaya", created: "May 18, 2025\n08:40 PM", sla: 100, updated: "May 19, 2025\n08:50 AM" },
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

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col mt-4">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2 overflow-x-auto">
        {tabs.map(tab => (
          <button 
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
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
            {mockCases.map((c) => (
              <tr 
                key={c.id} 
                onClick={() => onSelectCase(c.id)}
                className={`cursor-pointer transition-colors ${selectedCaseId === c.id ? "bg-blue-50 dark:bg-blue-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
              >
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="rounded border-slate-300" />
                </td>
                <td className="py-3 px-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{c.id}</td>
                <td className="py-3 px-4 font-medium text-slate-900 dark:text-white min-w-[200px]">{c.title}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(c.status)}`}>
                    {c.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${getSeverityBadge(c.severity)}`}>
                    {c.severity}
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">{c.priority}</td>
                <td className="py-3 px-4 whitespace-nowrap">{c.category}</td>
                <td className="py-3 px-4 whitespace-nowrap">{c.assignee}</td>
                <td className="py-3 px-4 text-xs whitespace-pre-line leading-tight">{c.created}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {/* SVG Circle Progress */}
                    <div className="relative w-6 h-6">
                      <svg className="w-6 h-6 transform -rotate-90">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-slate-200 dark:text-slate-700" />
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="transparent" strokeDasharray={`${2 * Math.PI * 10}`} strokeDashoffset={`${2 * Math.PI * 10 * (1 - c.sla / 100)}`} className={getSLACircleColor(c.sla)} />
                      </svg>
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{c.sla}%</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-xs whitespace-pre-line leading-tight">{c.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between mt-auto">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Showing 1 to 8 of 128 cases
        </span>
        <div className="flex items-center gap-1">
          <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <ChevronLeft className="w-5 h-5" />
          </button>
          {[1, 2, 3, 4, 5].map((page) => (
            <button 
              key={page} 
              className={`w-7 h-7 flex items-center justify-center rounded text-sm ${page === 1 ? 'bg-brand-blue/10 text-brand-blue font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              {page}
            </button>
          ))}
          <span className="text-slate-400 px-1">...</span>
          <button className="w-7 h-7 flex items-center justify-center rounded text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            16
          </button>
          <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
