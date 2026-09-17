"use client";
import { useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Panel, PanelEmpty, PanelError, PanelLoading } from "@/components/ui/Panel";
import { useApiResult } from "@/hooks/useApiResult";
import { useSidebarToggle } from "@/context/sidebar-context";
import type { IncidentListResponse } from "@/types/ciso";

type Action = "acknowledge" | "contain" | "resolve";

export default function CisoIncidentsPage() {
  const openSidebar = useSidebarToggle();
  const state = useApiResult<IncidentListResponse>("/api/ciso/incidents?perPage=50");
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  async function perform(incidentId: string, action: Action) {
    setPending(`${incidentId}:${action}`); setMessage(null);
    try {
      const response = await fetch(`/api/ciso/incidents/${encodeURIComponent(incidentId)}/${action}`, { method: "POST" });
      const body = await response.json().catch(() => null);
      setMessage(response.ok ? body?.message ?? "Lifecycle action recorded." : body?.error ?? "Lifecycle action failed.");
      if (response.ok) state.reload();
    } finally { setPending(null); }
  }
  return <><Topbar title="CISO Incident Detail" subtitle="Bitdefender source incidents with internal analyst lifecycle events" onMenuClick={openSidebar}/><main className="flex-1 space-y-4 bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
    <Link href="/dashboard/ciso" className="text-sm text-brand-blue hover:underline">← Back to CISO dashboard</Link>
    {message && <div className="rounded border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-900">{message}</div>}
    <Panel title="Incident Lifecycle" action={<span className="text-xs text-slate-400">Source timeline and internal response lifecycle are kept separate</span>}>
      {state.phase === "loading" && <PanelLoading/>}{state.phase === "error" && <PanelError message="Bitdefender incident source unavailable" onRetry={state.reload}/>} 
      {state.phase === "ready" && (state.data.items.length === 0 ? <PanelEmpty message="No active incidents returned by Bitdefender."/> : <div className="overflow-x-auto"><table className="w-full min-w-[1250px] text-left text-xs">
        <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800"><tr><th className="py-2">Incident</th><th>Source timeline</th><th>Internal response lifecycle</th><th>MTTA</th><th>MTTC</th><th>MTTR</th><th>Actions</th></tr></thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{state.data.items.map(item => {
          const canAcknowledge = Boolean(item.detectedAt) && !item.acknowledgedAt;
          const canContain = Boolean(item.detectedAt && item.acknowledgedAt) && !item.containedAt;
          const canResolve = Boolean(item.detectedAt && item.containedAt) && !item.resolvedAt;
          return <tr key={item.id}><td className="py-3 pr-3"><b>{item.id}</b><div className="max-w-xs text-slate-500">{item.detectionName || item.name}</div><div>{item.severity} · {item.status}</div></td>
            <td><b>Bitdefender</b><div>Detected: {item.detectedAt ? new Date(item.detectedAt).toLocaleString() : "Unavailable"}</div><div className="text-slate-500">Earliest valid sensor alert date</div></td>
            <td><b>Gathotkaca analyst actions</b><div>Acknowledged: {item.acknowledgedAt ? new Date(item.acknowledgedAt).toLocaleString() : "Not recorded"}</div><div>Contained: {item.containedAt ? new Date(item.containedAt).toLocaleString() : "Not recorded"}</div><div>Resolved: {item.resolvedAt ? new Date(item.resolvedAt).toLocaleString() : "Not recorded"}</div></td>
            <td>{item.detectedAt && item.acknowledgedAt ? "Eligible" : "Not eligible"}</td><td>{item.detectedAt && item.containedAt ? "Eligible" : "Not eligible"}</td><td>{item.detectedAt && item.resolvedAt ? "Eligible" : "Not eligible"}</td>
            <td><div className="flex gap-1">{canAcknowledge
              ? <ActionButton label="Acknowledge" disabled={pending !== null} busy={pending === `${item.id}:acknowledge`} onClick={() => perform(item.id, "acknowledge")}/>
              : canContain ? <ActionButton label="Mark Contained" disabled={pending !== null} busy={pending === `${item.id}:contain`} onClick={() => perform(item.id, "contain")}/>
              : canResolve ? <ActionButton label="Resolve" disabled={pending !== null} busy={pending === `${item.id}:resolve`} onClick={() => perform(item.id, "resolve")}/>
              : <span className="text-slate-400">{item.resolvedAt ? "Resolved" : item.detectedAt ? "No valid action" : "Detection unavailable"}</span>}
            </div></td></tr>;
        })}</tbody></table><div className="mt-3 text-xs text-slate-500">{state.data.total} active Bitdefender incidents. MTTD remains unavailable because no trustworthy pre-detection occurrence timestamp exists.</div></div>)}
    </Panel></main></>;
}
function ActionButton({ label, disabled, busy, onClick }: { label: string; disabled: boolean; busy: boolean; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="rounded border border-slate-300 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700">{busy ? "Saving…" : label}</button>;
}
