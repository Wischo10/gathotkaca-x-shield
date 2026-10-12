"use client";

import { useState, useEffect } from "react";
import { ActiveIncident } from "../types";
import { AlertCircle, Clock, ShieldAlert, User, X, Activity } from "lucide-react";

// --- Types ---

/**
 * Represents a single activity log entry for an incident.
 */
export type LogEntry = {
  id: string;
  analyst_name: string;
  action_taken: string;
  created_at: string;
};

// --- Helpers ---

/**
 * Returns the CSS class names for styling the severity badge.
 * @param severity - The severity level of the incident (e.g., 'critical', 'high').
 * @returns Tailwind CSS classes string.
 */
function getSeverityStyles(severity: string): string {
  switch (severity.toLowerCase()) {
    case "critical":
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
    case "high":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400";
    case "medium":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400";
    default:
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400";
  }
}

// --- Sub-components ---

/**
 * Modal component to display the timeline of actions taken on an incident.
 * This component manages its own fetch state for logs to keep the parent clean.
 */
function ActivityTimelineModal({
  incident,
  onClose,
}: {
  incident: ActiveIncident;
  onClose: () => void;
}) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setLogs([]);
    fetch(`/api/executive/active-incidents/${incident.id}/logs`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          setLogs(data.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch logs:", err);
      })
      .finally(() => setLoading(false));
  }, [incident.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-brand-blue/10 rounded-md text-brand-blue shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Activity Timeline</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Incident Summary */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/50">
           <h4 className="font-semibold text-base text-slate-900 dark:text-slate-100">{incident.title}</h4>
           <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <span>Assigned to: <strong className="text-slate-700 dark:text-slate-300">{incident.assigned_to}</strong></span>
              <span>•</span>
              <span>Severity: <strong className="uppercase">{incident.severity}</strong></span>
           </div>
        </div>

        {/* Timeline Logs */}
        <div className="p-6 flex-1 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center text-sm text-slate-500 py-10">No activity logs found.</div>
          ) : (
            <div className="relative border-l border-slate-200 dark:border-slate-700 ml-3 space-y-6">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-6">
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-brand-blue rounded-full ring-4 ring-white dark:ring-slate-900"></div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm text-slate-800 dark:text-slate-200">{log.analyst_name}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                       <Clock className="w-3 h-3" />
                       {new Date(log.created_at).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 mt-2">
                    {log.action_taken}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

/**
 * Main component to display a table of active escalated incidents.
 * Clicking on a row opens the timeline modal.
 */
export function ActiveEscalatedIncidents({ incidents }: { incidents: ActiveIncident[] | null }) {
  const [selectedIncident, setSelectedIncident] = useState<ActiveIncident | null>(null);

  if (!incidents || incidents.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-400">
        No active escalated incidents at the moment.
      </div>
    );
  }

  return (
    <>
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
              <tr 
                key={inc.id} 
                onClick={() => setSelectedIncident(inc)}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-4 align-top">
                  <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">{inc.title}</div>
                  <div className="flex items-center text-xs text-slate-500 gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(inc.created_at).toLocaleString("id-ID")}
                  </div>
                </td>
                <td className="px-4 py-4 align-top">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getSeverityStyles(inc.severity)}`}>
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
                      &quot;{inc.latest_action}&quot;
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedIncident && (
        <ActivityTimelineModal 
          incident={selectedIncident} 
          onClose={() => setSelectedIncident(null)} 
        />
      )}
    </>
  );
}
