import { MoreVertical } from "lucide-react";

export function RecentThreatAlerts() {
  const alerts = [
    {
      time: "May 19, 10:30 AM",
      alert: "New C2 domain observed: bad-update[.]com",
      isNew: true,
      type: "Domain",
      relevance: "High",
      source: "Threat Intel",
      case: "CASE-2025-0519-0001"
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm mt-2 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-900 dark:text-white">Recent Threat Intelligence Alerts</h3>
        <a href="#" className="text-xs font-medium text-brand-blue hover:underline">View All Alerts &rarr;</a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/50">
            <tr>
              <th className="py-3 pr-4 font-medium whitespace-nowrap">Time</th>
              <th className="py-3 pr-4 font-medium">Alert</th>
              <th className="py-3 pr-4 font-medium">Type</th>
              <th className="py-3 pr-4 font-medium">Relevance</th>
              <th className="py-3 pr-4 font-medium">Source</th>
              <th className="py-3 pr-4 font-medium">Associated Cases</th>
              <th className="py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
            {alerts.map((alert, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-4 pr-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{alert.time}</td>
                <td className="py-4 pr-4 text-slate-900 dark:text-white font-medium flex items-center gap-2">
                  {alert.alert}
                  {alert.isNew && (
                    <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-900/50 px-1.5 py-0.5 rounded">New</span>
                  )}
                </td>
                <td className="py-4 pr-4 text-slate-600 dark:text-slate-400">{alert.type}</td>
                <td className="py-4 pr-4">
                  <span className="text-red-700 bg-red-50 border border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-900/50 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                    {alert.relevance}
                  </span>
                </td>
                <td className="py-4 pr-4 text-slate-600 dark:text-slate-400">{alert.source}</td>
                <td className="py-4 pr-4">
                  <a href="#" className="font-medium text-brand-blue hover:underline">{alert.case}</a>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <button className="text-[11px] font-medium text-brand-blue border border-brand-blue/30 bg-blue-50 dark:bg-brand-blue/10 px-3 py-1 rounded hover:bg-blue-100 dark:hover:bg-brand-blue/20 transition-colors">
                      Investigate
                    </button>
                    <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
