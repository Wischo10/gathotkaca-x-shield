"use client";
import { useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Panel, PanelEmpty, PanelError, PanelLoading } from "@/components/ui/Panel";
import { DataProvenanceBadge } from "@/components/ui/DataProvenanceBadge";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";
import { useApiResult } from "@/hooks/useApiResult";
import { useSidebarToggle } from "@/context/sidebar-context";
import type { IncidentListResponse } from "@/types/ciso";
import type { IncidentTicketingOverview } from "@/types/incident-ticketing";

type Action = "acknowledge" | "contain" | "resolve";
type Confirmation = { incidentId: string; action: Action; title: string; description: string; confirmLabel: string };

export default function CisoIncidentsPage() {
  const openSidebar = useSidebarToggle();
  const state = useApiResult<IncidentListResponse>("/api/ciso/incidents?perPage=50");
  const ticketingState = useApiResult<IncidentTicketingOverview>("/api/ciso/incident-ticketing");
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  function confirmAction(incidentId: string, action: Action) {
    const content: Record<Action, Omit<Confirmation, "incidentId" | "action">> = {
      acknowledge: { title: "Acknowledge Incident", description: "Confirm that this incident should be marked as acknowledged. This will update the internal incident lifecycle record.", confirmLabel: "Confirm Acknowledge" },
      contain: { title: "Mark Incident as Contained", description: "Confirm that this incident should be recorded as contained. This records an internal lifecycle transition and does not execute containment in Wazuh, Bitdefender, or another external security system.", confirmLabel: "Confirm Contained" },
      resolve: { title: "Resolve Incident", description: "Confirm that this incident should be recorded as resolved in the internal incident lifecycle.", confirmLabel: "Confirm Resolve" },
    };
    setConfirmation({ incidentId, action, ...content[action] });
  }
  async function perform(incidentId: string, action: Action) {
    setPending(`${incidentId}:${action}`); setMessage(null);
    try {
      const response = await fetch(`/api/ciso/incidents/${encodeURIComponent(incidentId)}/${action}`, { method: "POST" });
      const body = await response.json().catch(() => null);
      setMessage(response.ok ? body?.message ?? "Lifecycle action recorded." : body?.error ?? "Lifecycle action failed.");
      if (response.ok) state.reload();
    } catch { setMessage("Lifecycle action failed."); }
    finally { setPending(null); }
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
              ? <ActionButton label="Acknowledge" disabled={pending !== null} busy={pending === `${item.id}:acknowledge`} onClick={() => confirmAction(item.id, "acknowledge")}/>
              : canContain ? <ActionButton label="Mark Contained" disabled={pending !== null} busy={pending === `${item.id}:contain`} onClick={() => confirmAction(item.id, "contain")}/>
              : canResolve ? <ActionButton label="Resolve" disabled={pending !== null} busy={pending === `${item.id}:resolve`} onClick={() => confirmAction(item.id, "resolve")}/>
              : <span className="text-slate-400">{item.resolvedAt ? "Resolved" : item.detectedAt ? "No valid action" : "Detection unavailable"}</span>}
            </div></td></tr>;
        })}</tbody></table><div className="mt-3 text-xs text-slate-500">{state.data.total} active Bitdefender incidents. MTTD remains unavailable because no trustworthy pre-detection occurrence timestamp exists.</div></div>)}
    </Panel>
    <Panel title="Independent Ticketing Lifecycle" action={ticketingState.phase === "ready" ? <DataProvenanceBadge provenance={ticketingState.data.provenance}/> : undefined}>
      {ticketingState.phase === "loading" && <PanelLoading/>}
      {ticketingState.phase === "error" && <PanelError message="Incident/ticketing provider unavailable" onRetry={ticketingState.reload}/>}
      {ticketingState.phase === "ready" && ticketingState.data.provenance.mode === "NOT_AVAILABLE" && <PanelEmpty message="Incident/ticketing provider is not configured or available."/>}
      {ticketingState.phase === "ready" && ticketingState.data.records.length > 0 && <div className="overflow-x-auto">
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          {ticketingState.data.provenance.mode === "DEMO"
            ? "Demo Data only. These records are read-only, not persisted, and not correlated with live Bitdefender incidents."
            : "This provider dataset remains separate from Bitdefender unless an explicit authoritative incident ID is supplied."}
        </div>
        <table className="w-full min-w-[950px] text-left text-xs">
          <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800"><tr><th className="py-2">Incident / ticket</th><th>Scenario</th><th>Lifecycle timestamps</th><th>Owner / team</th><th>Status</th><th>Source</th></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{ticketingState.data.records.map(item => <tr key={item.incidentId}>
            <td className="py-3 pr-3"><b>{item.incidentId}</b><div className="text-slate-500">{item.externalTicketId}</div></td>
            <td className="pr-3"><b>{item.title}</b><div className="capitalize text-slate-500">{item.severity} severity</div></td>
            <td className="pr-3"><div>Occurred: {item.occurredAt ? new Date(item.occurredAt).toLocaleString() : "Unavailable"}</div><div>Detected: {new Date(item.detectedAt).toLocaleString()}</div><div>Acknowledged: {item.acknowledgedAt ? new Date(item.acknowledgedAt).toLocaleString() : "Not recorded"}</div><div>Contained: {item.containedAt ? new Date(item.containedAt).toLocaleString() : "Not recorded"}</div><div>Resolved: {item.resolvedAt ? new Date(item.resolvedAt).toLocaleString() : "Not recorded"}</div></td>
            <td className="pr-3">{item.owner ?? "Unassigned"}<div className="text-slate-500">{item.team ?? "No team"}</div></td>
            <td className="capitalize">{item.status}</td>
            <td><DataProvenanceBadge provenance={item.provenance}/><div className="mt-1 text-slate-500">{item.source}</div></td>
          </tr>)}</tbody>
        </table>
      </div>}
    </Panel></main><ConfirmActionDialog open={confirmation !== null} title={confirmation?.title ?? "Confirm action"} description={confirmation?.description ?? ""} confirmLabel={confirmation?.confirmLabel ?? "Confirm"} busy={pending !== null} onCancel={() => setConfirmation(null)} onConfirm={() => { if (!confirmation || pending !== null) return; const selected = confirmation; void perform(selected.incidentId, selected.action).finally(() => setConfirmation(null)); }}/></>;
}
function ActionButton({ label, disabled, busy, onClick }: { label: string; disabled: boolean; busy: boolean; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="rounded border border-slate-300 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700">{busy ? "Saving…" : label}</button>;
}
