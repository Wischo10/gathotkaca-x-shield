"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { DataProvenanceBadge } from "@/components/ui/DataProvenanceBadge";
import { Panel, PanelEmpty, PanelError, PanelLoading } from "@/components/ui/Panel";
import { useSidebarToggle } from "@/context/sidebar-context";
import { useApiResult } from "@/hooks/useApiResult";
import type { PdpOrganizationalProviderResult } from "@/types/pdp-organizational";
import type { PdpBaselineData } from "@/types/pdp";
import type { DataProvenance } from "@/types/provenance";

const realRegisters: DataProvenance = {
  mode: "REAL",
  sources: ["PostgreSQL application registers"],
  explanation: "Application-owned UU PDP registers. Zero records are genuine persisted zero states.",
};

function DemoRecord({ children, provenance }: { children: ReactNode; provenance: DataProvenance }) {
  return <article className="rounded-lg border border-amber-200 bg-amber-50/40 p-3 text-xs dark:border-amber-900 dark:bg-amber-950/20"><div className="mb-2 flex justify-end"><DataProvenanceBadge provenance={provenance}/></div>{children}</article>;
}

export default function PdpOrganizationalDataPage() {
  const openSidebar = useSidebarToggle();
  const baseline = useApiResult<PdpBaselineData>("/api/ciso/pdp");
  const organization = useApiResult<PdpOrganizationalProviderResult>("/api/ciso/pdp/organizational-data");
  const evidenceCount = baseline.phase === "ready" ? baseline.data.controls.reduce((sum, control) => sum + control.evidence.length, 0) : null;
  const findings = baseline.phase === "ready" ? baseline.data.controls.flatMap(control => control.findings) : [];
  const remediationCount = findings.reduce((sum, finding) => sum + finding.remediations.length, 0);

  return <>
    <Topbar title="PDP Organizational Data" subtitle="Real application registers separated from replaceable organizational source context" onMenuClick={openSidebar}/>
    <main className="flex-1 space-y-4 bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
      <Link href="/dashboard/compliance/uu-pdp" className="text-sm text-brand-blue hover:underline">← Back to UU PDP Assessment</Link>

      <Panel title="REAL APPLICATION REGISTERS" action={<DataProvenanceBadge provenance={realRegisters}/> }>
        {baseline.phase === "loading" && <PanelLoading/>}
        {baseline.phase === "error" && <PanelError message={baseline.message} onRetry={baseline.reload}/>}
        {baseline.phase === "ready" && <>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">{[
            ["RoPA / Processing Activities", baseline.data.inventory.length],
            ["Evidence Registry", evidenceCount ?? 0],
            ["Findings", findings.length],
            ["Remediations", remediationCount],
            ["Confirmed PDP Breaches", baseline.data.breaches.length],
          ].map(([label, value]) => <div key={label} className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 dark:border-emerald-900 dark:bg-emerald-950/20"><div className="text-[10px] text-slate-500">{label}</div><div className="text-2xl font-bold">{value}</div><DataProvenanceBadge provenance={realRegisters} className="mt-1"/></div>)}</div>
          <p className="mt-3 text-xs text-slate-500">These are application-owned PostgreSQL registers. A displayed zero means zero records are currently registered; demo organizational records are never substituted or added.</p>
          <div className="mt-2 text-xs text-slate-500">Manual assessment: {baseline.data.kpis.assessedControls} / {baseline.data.kpis.totalControls} controls assessed ({baseline.data.kpis.assessmentCoveragePercent}% coverage). Demo context does not affect this value.</div>
        </>}
      </Panel>

      <Panel title="DEMO ORGANIZATIONAL SOURCE" action={organization.phase === "ready" ? <DataProvenanceBadge provenance={organization.data.provenance}/> : undefined}>
        {organization.phase === "loading" && <PanelLoading/>}
        {organization.phase === "error" && <PanelError message={organization.message} onRetry={organization.reload}/>}
        {organization.phase === "ready" && organization.data.provenance.mode === "NOT_AVAILABLE" && <PanelEmpty message="PDP organizational provider is not configured or available."/>}
        {organization.phase === "ready" && organization.data.provenance.mode !== "NOT_AVAILABLE" && <p className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200">Temporary synthetic organizational source data. Excluded from formal UU PDP assessment and application registers.</p>}
      </Panel>

      {organization.phase === "ready" && organization.data.provenance.mode !== "NOT_AVAILABLE" && <>
        <Panel title={`Processing Activities · ${organization.data.processingActivities.length} synthetic`} action={<DataProvenanceBadge provenance={organization.data.provenance}/> }><div className="grid gap-3 lg:grid-cols-2">{organization.data.processingActivities.map(item => <DemoRecord key={item.processingActivityId} provenance={item.provenance}><b>{item.processingActivityId} · {item.activityName}</b><p>Owner: {item.businessOwner}</p><p>Purpose: {item.purpose}</p><p>Categories: {item.personalDataCategories.join(", ")}</p><p>Subjects: {item.dataSubjectCategories.join(", ")}</p><p>Lawful basis metadata: {item.lawfulBasis}</p><p>Locations: {item.processingLocations.join(", ")} · Cross-border: {item.crossBorderTransfer ? "Yes" : "No"}</p><p className="mt-1 text-slate-500">Synthetic source metadata only; not copied to the real RoPA and not verified for legal sufficiency.</p></DemoRecord>)}</div></Panel>

        <Panel title={`Organizational Policies · ${organization.data.policies.length} synthetic`} action={<DataProvenanceBadge provenance={organization.data.provenance}/> }><div className="grid gap-3 lg:grid-cols-3">{organization.data.policies.map(item => <DemoRecord key={item.policyId} provenance={item.provenance}><b>{item.policyId} · {item.title}</b><p>Type: {item.policyType} · Version: {item.version}</p><p>Owner: {item.owner} · Source approval state: {item.approvalStatus}</p><p>Review due: {item.reviewDueAt ? new Date(item.reviewDueAt).toLocaleDateString() : "Not recorded"}</p><p>Reference: {item.reference}</p><p className="mt-1 text-slate-500">Demo organizational policy metadata; not proof of legal sufficiency, implementation, or control compliance.</p></DemoRecord>)}</div></Panel>

        <Panel title={`Processor Relationships · ${organization.data.processorRelationships.length} synthetic`} action={<DataProvenanceBadge provenance={organization.data.provenance}/> }><div className="grid gap-3 lg:grid-cols-2">{organization.data.processorRelationships.map(item => <DemoRecord key={item.relationshipId} provenance={item.provenance}><b>{item.relationshipId} · {item.processorName}</b><p>Purpose: {item.processingPurpose}</p><p>Location: {item.processingLocation} · Cross-border: {item.crossBorderTransfer ? "Yes" : "No"}</p><p>DPA metadata: {item.dpaStatus} · PDP review: {item.reviewStatus}</p><p>Owner: {item.owner}</p><p className="mt-1 text-slate-500">Separate from the general vendor risk register; no vendor risk assessment is implied.</p></DemoRecord>)}</div></Panel>

        <Panel title={`DSR Workflows · ${organization.data.dsrWorkflows.length} synthetic`} action={<DataProvenanceBadge provenance={organization.data.provenance}/> }><div className="grid gap-3 lg:grid-cols-2">{organization.data.dsrWorkflows.map(item => <DemoRecord key={item.requestId} provenance={item.provenance}><b>{item.requestId} · {item.requestType}</b><p>Status: {item.status} · Verification: {item.verificationStatus}</p><p>Received: {new Date(item.receivedAt).toLocaleString()}</p><p>Due: {new Date(item.dueAt).toLocaleString()} · Completed: {item.completedAt ? new Date(item.completedAt).toLocaleString() : "Not completed"}</p><p>Owner: {item.owner}</p><p className="mt-1 text-slate-500">Synthetic workflow example; no actual data subject or request is represented.</p></DemoRecord>)}</div></Panel>

        <Panel title={`Breach Notification Workflows · ${organization.data.breachNotificationWorkflows.length} synthetic`} action={<DataProvenanceBadge provenance={organization.data.provenance}/> }><div className="grid gap-3 lg:grid-cols-2">{organization.data.breachNotificationWorkflows.map(item => <DemoRecord key={item.workflowId} provenance={item.provenance}><b>{item.workflowId} · {item.incidentReference}</b><p>Personal-data impact confirmed: {item.personalDataImpactConfirmed ? "Yes — demo scenario only" : "No"}</p><p>Assessment: {item.assessmentStatus}</p><p>Notification required: {item.notificationRequired === null ? "Not decided" : item.notificationRequired ? "Yes" : "No"}</p><p>Notification status: {item.notificationStatus}</p><p>Owner: {item.owner}</p><p className="mt-1 text-slate-500">Not a confirmed company breach and never included in the real PDP Breach Register count.</p></DemoRecord>)}</div></Panel>
      </>}
    </main>
  </>;
}
