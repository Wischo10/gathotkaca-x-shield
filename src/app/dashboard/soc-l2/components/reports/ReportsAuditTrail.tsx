import { ArrowRight } from "lucide-react";

const audits: any[] = [];

export function ReportsAuditTrail() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col h-full xl:col-span-3">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Reports Audit Trail (Latest 5 Activities)</h2>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="font-medium pb-2 pr-2">Time</th>
              <th className="font-medium pb-2 px-2">Activity</th>
              <th className="font-medium pb-2 px-2">Report Name</th>
              <th className="font-medium pb-2 px-2">User</th>
              <th className="font-medium pb-2 pl-2">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {audits.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-slate-500">No audit trail available</td>
              </tr>
            )}
            {audits.map((audit) => (
              <tr key={audit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2.5 pr-2 text-slate-500 dark:text-slate-400 whitespace-nowrap">{audit.time}</td>
                <td className="py-2.5 px-2 text-slate-900 dark:text-slate-200 font-medium">{audit.activity}</td>
                <td className="py-2.5 px-2 text-slate-600 dark:text-slate-300 truncate max-w-[200px]" title={audit.name}>{audit.name}</td>
                <td className="py-2.5 px-2 text-slate-600 dark:text-slate-300">{audit.user}</td>
                <td className="py-2.5 pl-2 text-slate-500 dark:text-slate-400 truncate max-w-[250px]" title={audit.details}>{audit.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-end mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button className="text-xs text-brand-blue font-medium hover:underline flex items-center gap-1">
          View full audit trail <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
