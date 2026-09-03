import { Panel } from "@/components/ui/Panel";
import { L2Alert } from "@/types/soc";
import { Filter, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";

interface AlertQueueProps {
  alerts: L2Alert[];
  selectedAlertId?: string;
  onSelectAlert: (id: string) => void;
}

export function AlertQueue({ alerts, selectedAlertId, onSelectAlert }: AlertQueueProps) {
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
    { name: "All", count: "2,843", active: true },
    { name: "New", count: "1,124", active: false },
    { name: "In Progress", count: "842", active: false },
    { name: "Investigating", count: "512", active: false },
    { name: "Resolved", count: "301", active: false },
    { name: "Closed", count: "64", active: false },
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
            {alerts.map((alert, index) => (
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
                  {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
                </td>
                <td className="py-3 px-2 text-right">
                  <span className={alert.severity.toLowerCase() === 'critical' ? 'text-red-500 font-medium' : 'text-orange-500 font-medium'}>
                    {(index + 2) * 2}m
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800/50 p-4 flex items-center justify-between mt-auto bg-white dark:bg-slate-900 rounded-b-xl">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Showing 1 to 5 of 2,843 alerts
        </span>
        <div className="flex items-center gap-1">
          <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <ChevronLeft className="w-5 h-5" />
          </button>
          {[1, 2, 3, 4, 5].map((page) => (
            <button 
              key={page} 
              className={`w-7 h-7 flex items-center justify-center rounded text-sm ${page === 1 ? 'bg-brand-blue/10 text-brand-blue font-medium border border-brand-blue/20' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              {page}
            </button>
          ))}
          <span className="text-slate-400 px-1">...</span>
          <button className="w-7 h-7 flex items-center justify-center rounded text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            569
          </button>
          <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Panel>
  );
}
