import { Panel } from "@/components/ui/Panel";
import { L2Alert } from "@/types/soc";
import { Filter, MoreVertical, Search, ChevronLeft, ChevronRight, ShieldAlert, Bug, Activity, Mail, ChevronDown } from "lucide-react";

interface InvestigationListProps {
  alerts: L2Alert[];
  selectedAlertId?: string;
  onSelectAlert: (id: string) => void;
}

export function InvestigationList({ alerts, selectedAlertId, onSelectAlert }: InvestigationListProps) {
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
    { name: "All", count: "128", active: true },
    { name: "In Progress", count: "24", active: false },
    { name: "On Hold", count: "6", active: false },
    { name: "Closed", count: "98", active: false },
  ];

  return (
    <Panel 
      title="Investigation List" 
      className="h-[600px] flex flex-col"
      action={
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>
          <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      }
    >
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search investigations..." 
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-2 overflow-x-auto px-4">
        {tabs.map((tab) => (
          <button
            key={tab.name}
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
        {alerts.map((alert, index) => {
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
                      {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-1.5" title={alert.description}>
                    {alert.description || `${alert.title} targeting ${alert.asset}`}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mb-2.5">
                    CASE-2025-0519-000{index + 1}
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

      <div className="border-t border-slate-100 dark:border-slate-800/50 p-4 flex items-center justify-between mt-auto bg-white dark:bg-slate-900 rounded-b-xl">
        <span className="text-[10px] text-slate-500 dark:text-slate-400">
          Showing 1 to {Math.min(5, alerts.length)} of 128 investigations
        </span>
        <div className="flex items-center gap-0.5">
          <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-6 h-6 flex items-center justify-center rounded text-xs bg-brand-blue/10 text-brand-blue font-medium border border-brand-blue/20">
            1
          </button>
          <button className="w-6 h-6 flex items-center justify-center rounded text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            2
          </button>
          <button className="w-6 h-6 flex items-center justify-center rounded text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            3
          </button>
          <span className="text-slate-400 px-1 text-xs">...</span>
          <button className="w-6 h-6 flex items-center justify-center rounded text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            26
          </button>
          <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Panel>
  );
}
