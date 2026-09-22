import { Panel } from "@/components/ui/Panel";
import { L2Alert } from "@/types/soc";
import { Filter, MoreVertical, Search, ShieldAlert, Bug, Activity, Mail, ChevronDown } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { useState } from "react";

interface InvestigationListProps {
  alerts: L2Alert[];
  selectedAlertId?: string;
  onSelectAlert: (id: string) => void;
}

export function InvestigationList({ alerts, selectedAlertId, onSelectAlert }: InvestigationListProps) {
  const [activeTab, setActiveTab] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Filter alerts based on active tab, severity, and search query
  const filteredAlerts = alerts.filter(a => {
    let tabMatch = true;
    if (activeTab !== "All") {
      tabMatch = a.status === activeTab;
    }
    
    let sevMatch = true;
    if (severityFilter.length > 0) {
      sevMatch = severityFilter.includes(a.severity.toLowerCase());
    }

    let searchMatch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      searchMatch = a.title.toLowerCase().includes(q) || a.asset.toLowerCase().includes(q) || a.source.toLowerCase().includes(q);
    }

    return tabMatch && sevMatch && searchMatch;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / itemsPerPage));
  const validPage = Math.min(currentPage, totalPages);
  const displayedAlerts = filteredAlerts.slice((validPage - 1) * itemsPerPage, validPage * itemsPerPage);
  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";
      case "high":
        return "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
    }
  };

  const getStatusBadge = (status?: string) => {
    const s = status?.toLowerCase() || "in progress";
    if (s.includes("progress") || s.includes("investigating")) {
      return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10";
    }
    return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10";
  };

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("brute force") || t.includes("login")) return <ShieldAlert className="w-5 h-5 text-red-500" />;
    if (t.includes("malware") || t.includes("execution")) return <Bug className="w-5 h-5 text-orange-500" />;
    if (t.includes("phishing") || t.includes("email")) return <Mail className="w-5 h-5 text-emerald-500" />;
    if (t.includes("attack") || t.includes("injection") || t.includes("sql")) return <Activity className="w-5 h-5 text-purple-500" />;
    return <ShieldAlert className="w-5 h-5 text-blue-500" />;
  };

  const tabs = [
    { name: "All", count: alerts.length.toString(), active: activeTab === "All" },
    { name: "In Progress", count: alerts.filter(a => a.status === "In Progress").length.toString(), active: activeTab === "In Progress" },
    { name: "On Hold", count: alerts.filter(a => a.status === "On Hold").length.toString(), active: activeTab === "On Hold" },
    { name: "Closed", count: alerts.filter(a => a.status === "Closed").length.toString(), active: activeTab === "Closed" },
  ];

  return (
    <Panel 
      title="Investigation List" 
      className="h-[600px] flex flex-col"
      action={
        <div className="flex items-center gap-2 relative">
          <button 
            onClick={() => { setShowFilters(!showFilters); setShowMoreMenu(false); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-md transition-colors ${showFilters ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters {severityFilter.length > 0 && <span className="bg-brand-blue text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{severityFilter.length}</span>}
          </button>

          {showFilters && (
            <div className="absolute top-10 right-8 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 p-3">
              <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase">Filter by Severity</h4>
              <div className="flex flex-col gap-2">
                {['critical', 'high', 'medium', 'low'].map(sev => (
                  <label key={sev} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue cursor-pointer"
                      checked={severityFilter.includes(sev)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSeverityFilter([...severityFilter, sev]);
                        } else {
                          setSeverityFilter(severityFilter.filter(s => s !== sev));
                        }
                        setCurrentPage(1);
                      }}
                    />
                    <span className="capitalize text-slate-700 dark:text-slate-300">{sev}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={() => { setShowMoreMenu(!showMoreMenu); setShowFilters(false); }}
            className={`p-1.5 rounded border transition-colors ${showMoreMenu ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white' : 'text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMoreMenu && (
            <div className="absolute top-10 right-0 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 py-1">
              <button 
                onClick={() => { window.alert("Mengekspor daftar investigasi ke CSV..."); setShowMoreMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Export to CSV
              </button>
              <button 
                onClick={() => { window.alert("Menyegarkan daftar..."); setShowMoreMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Refresh List
              </button>
            </div>
          )}
        </div>
      }
    >
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search investigations..." 
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-2 overflow-x-auto px-4">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => {
              setActiveTab(tab.name);
              setCurrentPage(1);
            }}
            className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
              tab.active
                ? "border-b-2 border-brand-blue text-brand-blue"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab.name}
            <span className={tab.active ? "text-brand-blue font-semibold" : "text-slate-400"}>({tab.count})</span>
          </button>
        ))}
      </div>
      
      <div className="px-4 py-2 flex justify-between items-center text-xs text-slate-500">
        <div className="flex items-center gap-1">
          Sort by: <button className="font-medium text-slate-700 dark:text-slate-300 hover:text-brand-blue transition-colors">Last Update (Newest)</button>
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 px-3 pb-3">
        {displayedAlerts.map((alert) => {
          const isSelected = selectedAlertId === alert.id;
          return (
            <div 
              key={alert.id}
              onClick={() => onSelectAlert(alert.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all border ${
                isSelected 
                  ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50 shadow-sm relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-brand-blue before:rounded-r-md" 
                  : "bg-white dark:bg-slate-900 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {getIcon(alert.title)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-semibold truncate ${isSelected ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-200"}`} title={alert.title}>
                      {alert.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                      {new Date(alert.firstSeen).toLocaleTimeString('id-ID', { hour: 'numeric', minute: '2-digit', hour12: false })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-1.5" title={alert.description}>
                    {alert.description || `${alert.title} targeting ${alert.asset}`}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mb-2.5">
                    CASE-{alert.id.split('-').slice(0, 3).join('-')}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize ${getSeverityBadge(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize ${getStatusBadge(alert.status)}`}>
                      {alert.status || "In Progress"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800/50 p-4 flex flex-wrap items-center justify-center sm:justify-between gap-4 mt-auto bg-white dark:bg-slate-900 rounded-b-xl shrink-0">
        <span className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap text-center">
          Showing {filteredAlerts.length > 0 ? (validPage - 1) * itemsPerPage + 1 : 0} to {Math.min(validPage * itemsPerPage, filteredAlerts.length)} of {filteredAlerts.length} investigations
        </span>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </Panel>
  );
}
