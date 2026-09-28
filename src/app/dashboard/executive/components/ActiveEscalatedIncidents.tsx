import { ActiveIncident } from "../types";
import { AlertCircle, Clock, ShieldAlert, User } from "lucide-react";

export function ActiveEscalatedIncidents({ incidents }: { incidents: ActiveIncident[] | null }) {
  if (!incidents || incidents.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-400">
        No active escalated incidents at the moment.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3 text-left">Incident</th>
            <th className="px-4 py-3 text-left">Severity</th>
            <th className="px-4 py-3 text-left">Assigned Analyst</th>
            <th className="px-4 py-3 text-left">Latest Action Taken</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {incidents.map((inc) => (
            <tr key={inc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="px-4 py-4 align-top">
                <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">{inc.title}</div>
                <div className="flex items-center text-xs text-slate-500 gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(inc.created_at).toLocaleString("id-ID")}
                </div>
              </td>
              <td className="px-4 py-4 align-top">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  inc.severity === "critical" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" :
                  inc.severity === "high"     ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400" :
                  inc.severity === "medium"   ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" :
                  "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                }`}>
                  <ShieldAlert className="w-3 h-3" />
                  {inc.severity.toUpperCase()}
                </span>
              </td>
              <td className="px-4 py-4 align-top text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate max-w-[120px]">{inc.assigned_to}</span>
                </div>
              </td>
              <td className="px-4 py-4 align-top">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    "{inc.latest_action}"
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
