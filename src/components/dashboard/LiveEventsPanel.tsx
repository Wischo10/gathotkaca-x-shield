"use client";

import { useApiResult } from "@/hooks/useApiResult";
import { Panel, PanelLoading, PanelEmpty, PanelError } from "@/components/ui/Panel";
import type { LiveEvent, Severity } from "@/types/soc";

const SEVERITY_STYLES: Record<Severity, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  high: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

export function LiveEventsPanel() {
  const state = useApiResult<LiveEvent[]>("/api/soc/live-events?limit=10", []);

  return (
    <Panel title="Live Events (Last 10)" className="lg:col-span-3">
      {state.phase === "loading" && <PanelLoading />}
      {state.phase === "empty" && <PanelEmpty message="No recent events" />}
      {state.phase === "error" && (
        <PanelError message={state.message} onRetry={state.reload} />
      )}
      {state.phase === "ready" && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-400 dark:border-slate-700">
                <th className="py-2 pr-4 font-medium">Time</th>
                <th className="py-2 pr-4 font-medium">Event</th>
                <th className="py-2 pr-4 font-medium">Source</th>
                <th className="py-2 pr-4 font-medium">Severity</th>
                <th className="py-2 pr-4 font-medium">Asset / User</th>
              </tr>
            </thead>
            <tbody>
              {state.data.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                >
                  <td className="whitespace-nowrap py-2 pr-4 text-slate-500 dark:text-slate-400">
                    {new Date(event.time).toLocaleTimeString()}
                  </td>
                  <td className="py-2 pr-4 text-slate-700 dark:text-slate-200">
                    {event.event}
                  </td>
                  <td className="py-2 pr-4 text-slate-500 dark:text-slate-400">
                    {event.source}
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${SEVERITY_STYLES[event.severity]}`}
                    >
                      {event.severity}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-slate-500 dark:text-slate-400">
                    {event.assetOrUser}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
