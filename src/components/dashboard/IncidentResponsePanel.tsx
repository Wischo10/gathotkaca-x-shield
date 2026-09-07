"use client";

import { useState } from "react";
import { Panel, PanelEmpty, PanelError, PanelLoading } from "@/components/ui/Panel";
import { useApiResult } from "@/hooks/useApiResult";
import type { IncidentListResponse, BitdefenderIncidentListItem } from "@/types/ciso";

interface IncidentActionState {
  incidentId: string;
  action: "acknowledge" | "respond" | "contain";
  loading: boolean;
  message?: string;
  error?: string;
}

export function IncidentResponsePanel({ onActionCompleted }: { onActionCompleted?: () => void }) {
  const state = useApiResult<IncidentListResponse>("/api/ciso/incidents?perPage=5");
  const [actionState, setActionState] = useState<IncidentActionState | null>(null);

  const handleAction = async (
    incidentId: string,
    action: "acknowledge" | "respond" | "contain"
  ) => {
    setActionState({ incidentId, action, loading: true });
    try {
      const res = await fetch(`/api/ciso/incidents/${encodeURIComponent(incidentId)}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "ciso_dashboard_ui",
          triggeredAt: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionState({
          incidentId,
          action,
          loading: false,
          error: data.error || `Failed to ${action} incident.`,
        });
        return;
      }

      setActionState({
        incidentId,
        action,
        loading: false,
        message: data.message || `Successfully recorded ${action} event.`,
      });

      // Reload incident list and notify parent to refresh metrics
      state.reload();
      if (onActionCompleted) {
        onActionCompleted();
      }
    } catch (err) {
      setActionState({
        incidentId,
        action,
        loading: false,
        error: err instanceof Error ? err.message : "Network error performing action.",
      });
    }
  };

  return (
    <Panel
      title="Active Bitdefender Incidents & Response"
      action={
        <span className="text-[10px] text-slate-400 font-medium">
          Real Telemetry Actions
        </span>
      }
      className="col-span-full"
    >
      {state.phase === "loading" && <PanelLoading />}
      {state.phase === "empty" && (
        <PanelEmpty message="No active Bitdefender incidents found." />
      )}
      {state.phase === "error" && (
        <PanelError message={state.message} onRetry={state.reload} />
      )}
      {state.phase === "ready" && (
        <div className="flex flex-col gap-3">
          {actionState?.message && (
            <div className="p-2 text-xs rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
              <span>✓ {actionState.message}</span>
              <button
                onClick={() => setActionState(null)}
                className="text-emerald-500 hover:text-emerald-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}
          {actionState?.error && (
            <div className="p-2 text-xs rounded bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 flex justify-between items-center">
              <span>⚠ {actionState.error}</span>
              <button
                onClick={() => setActionState(null)}
                className="text-red-500 hover:text-red-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase text-slate-400 font-medium">
                <tr>
                  <th className="py-2.5">Detected Time</th>
                  <th className="py-2.5">Incident ID / Name</th>
                  <th className="py-2.5 text-center">Severity</th>
                  <th className="py-2.5 text-center">Alerts</th>
                  <th className="py-2.5">Lifecycle Status</th>
                  <th className="py-2.5 text-right">Analyst Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {state.data.items.map((inc) => (
                  <IncidentRow
                    key={inc.id}
                    incident={inc}
                    onAction={handleAction}
                    actionLoading={actionState?.incidentId === inc.id && actionState.loading}
                    currentAction={actionState?.incidentId === inc.id ? actionState.action : undefined}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
            <span>
              Showing {state.data.items.length} of {state.data.total} real Bitdefender incidents
            </span>
            <span className="text-slate-500">
              Actions record real audit timestamps to calculate MTTA, MTTR, and MTTC
            </span>
          </div>
        </div>
      )}
    </Panel>
  );
}

function IncidentRow({
  incident,
  onAction,
  actionLoading,
  currentAction,
}: {
  incident: BitdefenderIncidentListItem;
  onAction: (id: string, action: "acknowledge" | "respond" | "contain") => void;
  actionLoading: boolean;
  currentAction?: "acknowledge" | "respond" | "contain";
}) {
  const isAcked = !!incident.acknowledgedAt;
  const isResponded = !!incident.respondedAt;
  const isContained = !!incident.containedAt;

  return (
    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
      {/* Detected Time */}
      <td className="py-3 text-[11px] whitespace-nowrap text-slate-500">
        {new Date(incident.detectedAt).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </td>

      {/* Incident Name & ID */}
      <td className="py-3 font-medium text-slate-800 dark:text-slate-200">
        <div className="flex flex-col">
          <span className="truncate max-w-[280px]" title={incident.name}>
            {incident.name}
          </span>
          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[220px]">
            {incident.id}
          </span>
        </div>
      </td>

      {/* Severity */}
      <td className="py-3 text-center">
        <SeverityBadge severity={incident.severity} />
      </td>

      {/* Alerts */}
      <td className="py-3 text-center font-bold text-slate-700 dark:text-slate-300">
        {incident.alertCount}
      </td>

      {/* Lifecycle Status Badge */}
      <td className="py-3">
        <div className="flex flex-col gap-1">
          <LifecycleBadge status={incident.lifecycleStatus} />
          <div className="text-[9px] text-slate-400 space-y-0.5">
            {incident.acknowledgedAt && (
              <div>Ack: {new Date(incident.acknowledgedAt).toLocaleTimeString()}</div>
            )}
            {incident.respondedAt && (
              <div>Resp: {new Date(incident.respondedAt).toLocaleTimeString()}</div>
            )}
            {incident.containedAt && (
              <div>Cont: {new Date(incident.containedAt).toLocaleTimeString()}</div>
            )}
          </div>
        </div>
      </td>

      {/* Analyst Action Buttons */}
      <td className="py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {/* 1. Acknowledge button */}
          <button
            onClick={() => onAction(incident.id, "acknowledge")}
            disabled={isAcked || actionLoading}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              isAcked
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            }`}
            title={isAcked ? `Acknowledged at ${incident.acknowledgedAt}` : "Record triage acknowledgement"}
          >
            {actionLoading && currentAction === "acknowledge" ? "..." : isAcked ? "Ack'd ✓" : "Acknowledge"}
          </button>

          {/* 2. Respond button */}
          <button
            onClick={() => onAction(incident.id, "respond")}
            disabled={isResponded || actionLoading}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              isResponded
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                : "bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
            }`}
            title={isResponded ? `Response started at ${incident.respondedAt}` : "Record response action started"}
          >
            {actionLoading && currentAction === "respond" ? "..." : isResponded ? "Responded ✓" : "Respond"}
          </button>

          {/* 3. Contain button */}
          <button
            onClick={() => onAction(incident.id, "contain")}
            disabled={isContained || actionLoading}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              isContained
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            }`}
            title={isContained ? `Contained at ${incident.containedAt}` : "Record incident containment"}
          >
            {actionLoading && currentAction === "contain" ? "..." : isContained ? "Contained ✓" : "Contain"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const s = severity.toLowerCase();
  if (s === "critical") {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
        Critical
      </span>
    );
  }
  if (s === "high") {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
        High
      </span>
    );
  }
  if (s === "medium") {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
        Medium
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
      {severity}
    </span>
  );
}

function LifecycleBadge({ status }: { status: BitdefenderIncidentListItem["lifecycleStatus"] }) {
  switch (status) {
    case "contained":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Contained
        </span>
      );
    case "responding":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Responding
        </span>
      );
    case "acknowledged":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Acknowledged
        </span>
      );
    case "detected":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
          Detected
        </span>
      );
    case "unhandled":
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          New / Unhandled
        </span>
      );
  }
}
