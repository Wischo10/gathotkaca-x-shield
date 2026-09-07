import { Panel } from "@/components/ui/Panel";
import { L2Alert } from "@/types/soc";
import { Filter, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import { useState } from "react";

interface AlertQueueProps {
  alerts: L2Alert[];
  selectedAlertId?: string;
  onSelectAlert: (id: string) => void;
}

export function AlertQueue({ alerts, selectedAlertId, onSelectAlert }: AlertQueueProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(alerts.length / itemsPerPage));
  const displayedAlerts = alerts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

  const tabs = [
    { name: "All", count: alerts.length.toString(), active: true },
    { name: "New", count: alerts.filter(a => a.status === "New").length.toString(), active: false },
    { name: "In Progress", count: alerts.filter(a => a.status === "In Progress").length.toString(), active: false },
    { name: "Investigating", count: "0", active: false },
    { name: "Resolved", count: "0", active: false },
    { name: "Closed", count: alerts.filter(a => a.status === "Closed").length.toString(), active: false },
  ];

  return (
    <Panel 
      title="Alert Queue" 
      className="h-[600px] flex flex-col"
      action={
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      }
    >
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-2 overflow-x-auto px-4 mt-2">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${
              tab.active
                ? "border-b-2 border-brand-blue text-brand-blue"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab.name}
            <span className={tab.active ? "text-brand-blue font-semibold" : "text-slate-400 text-xs"}>{tab.count}</span>
          </button>
        ))}
      </div>
      
      <div className="flex-1 overflow-auto px-4">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="text-xs text-slate-500 dark:text-slate-400 sticky top-0 bg-white dark:bg-slate-900 z-10">
            <tr>
              <th className="py-3 px-2 font-medium w-8">
                <input type="checkbox" className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue" />
              </th>
              <th className="py-3 px-2 font-medium">Severity</th>
              <th className="py-3 px-2 font-medium">Alert Title</th>
              <th className="py-3 px-2 font-medium">Source</th>
              <th className="py-3 px-2 font-medium">Asset / User</th>
              <th className="py-3 px-2 font-medium">Time</th>
              <th className="py-3 px-2 font-medium text-right">Age</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {displayedAlerts.map((alert, index) => {
              const ageMinutes = Math.floor((new Date().getTime() - new Date(alert.firstSeen).getTime()) / 60000);
              return (
              <tr 
                key={alert.id} 
                onClick={() => onSelectAlert(alert.id)}
                className={`cursor-pointer transition-colors ${
                  selectedAlertId === alert.id 
                    ? "bg-blue-50/50 dark:bg-blue-900/10" 
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <td className="py-3 px-2">
                  <input type="checkbox" className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue" onClick={e => e.stopPropagation()} />
                </td>
                <td className="py-3 px-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${getSeverityBadge(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </td>
                <td className="py-3 px-2 font-medium text-slate-900 dark:text-white truncate max-w-[200px]" title={alert.title}>
                  {alert.title}
                </td>
                <td className="py-3 px-2 text-slate-500">{alert.source}</td>
                <td className="py-3 px-2 text-slate-500 truncate max-w-[150px]">{alert.asset}</td>
                <td className="py-3 px-2 text-slate-500 whitespace-nowrap">
                  {new Date(alert.firstSeen).toLocaleTimeString('id-ID', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false })}
                </td>
                <td className="py-3 px-2 text-right">
                  <span className={alert.severity.toLowerCase() === 'critical' ? 'text-red-500 font-medium' : 'text-orange-500 font-medium'}>
                    {ageMinutes}m
                  </span>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800/50 p-4 flex items-center justify-between mt-auto bg-white dark:bg-slate-900 rounded-b-xl">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Showing {alerts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, alerts.length)} of {alerts.length} alerts
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
                className={`w-7 h-7 flex items-center justify-center rounded text-sm ${pageNum === currentPage ? 'bg-brand-blue/10 text-brand-blue font-medium border border-brand-blue/20' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
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
                className={`w-7 h-7 flex items-center justify-center rounded text-sm ${totalPages === currentPage ? 'bg-brand-blue/10 text-brand-blue font-medium border border-brand-blue/20' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
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
    </Panel>
  );
}
