"use client";

import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { DataProvenanceBadge } from "@/components/ui/DataProvenanceBadge";
import { Panel, PanelEmpty, PanelError, PanelLoading } from "@/components/ui/Panel";
import { useSidebarToggle } from "@/context/sidebar-context";
import { useApiResult } from "@/hooks/useApiResult";
import type { IdentityGovernanceOverview } from "@/types/identity-governance";
import type { PdpAccessControlCandidateEvidence } from "@/types/pdp";
import type { DataProvenance } from "@/types/provenance";

const unavailableComposition: DataProvenance = {
  mode: "NOT_AVAILABLE",
  sources: [],
  explanation: "No explicit deterministic identity mapping is configured, so Wazuh and IAM data remain separate.",
};

export default function IdentityGovernancePage() {
  const openSidebar = useSidebarToggle();
  const iam = useApiResult<IdentityGovernanceOverview>("/api/ciso/identity-governance");
  const access = useApiResult<PdpAccessControlCandidateEvidence>("/api/ciso/pdp/access-control-evidence");
  const wazuhProvenance: DataProvenance = access.phase === "ready" && access.data.wazuh.status === "available"
    ? { mode: "REAL", sources: ["Wazuh/OpenSearch"], explanation: "Observed authentication and sudo security telemetry from Wazuh." }
    : { mode: "NOT_AVAILABLE", sources: ["Wazuh/OpenSearch"], explanation: "Wazuh authentication and sudo telemetry is unavailable." };

  return <>
    <Topbar title="Identity Governance" subtitle="Separate operational access telemetry and replaceable IAM governance context" onMenuClick={openSidebar}/>
    <main className="flex-1 space-y-4 bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
      <Link href="/dashboard/ciso" className="text-sm text-brand-blue hover:underline">← Back to CISO dashboard</Link>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Authentication / Sudo Telemetry" action={<DataProvenanceBadge provenance={wazuhProvenance}/> }>
          {access.phase === "loading" && <PanelLoading/>}
          {access.phase === "error" && <PanelError message={access.message} onRetry={access.reload}/>}
          {access.phase === "ready" && access.data.wazuh.status === "unavailable" && <PanelEmpty message="Wazuh authentication/access telemetry is unavailable."/>}
          {access.phase === "ready" && access.data.wazuh.status === "available" && <dl className="grid grid-cols-2 gap-3 text-xs">
            <div><dt className="text-slate-500">Authentication successes</dt><dd className="text-xl font-bold">{access.data.wazuh.authenticationSuccess}</dd></div>
            <div><dt className="text-slate-500">Authentication failures</dt><dd className="text-xl font-bold">{access.data.wazuh.authenticationFailure}</dd></div>
            <div><dt className="text-slate-500">Sudo observations</dt><dd className="text-xl font-bold">{access.data.wazuh.sudoActivity}</dd></div>
            <div><dt className="text-slate-500">Monitored agents</dt><dd className="text-xl font-bold">{access.data.wazuh.monitoredAgents}</dd></div>
          </dl>}
          <p className="mt-3 text-[10px] text-slate-500">Source: Wazuh/OpenSearch. Observed technical activity supports review but does not determine formal control status.</p>
        </Panel>

        <Panel title="Combined Access-Control Evidence" action={<DataProvenanceBadge provenance={unavailableComposition}/> }>
          <PanelEmpty message="No combined evidence is produced because no explicit Wazuh-to-IAM identity mapping is configured."/>
          <p className="mt-3 text-[10px] text-slate-500">Username similarity, display names, timing, roles, and positional ordering are not used for correlation.</p>
        </Panel>
      </div>

      <Panel title="IAM / Identity Governance" action={iam.phase === "ready" ? <DataProvenanceBadge provenance={iam.data.provenance}/> : undefined}>
        {iam.phase === "loading" && <PanelLoading/>}
        {iam.phase === "error" && <PanelError message={iam.message} onRetry={iam.reload}/>}
        {iam.phase === "ready" && iam.data.provenance.mode === "NOT_AVAILABLE" && <PanelEmpty message="IAM provider is not configured or available."/>}
        {iam.phase === "ready" && iam.data.records.length > 0 && <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">{[
            ["Total Demo Identities", iam.data.summary?.total ?? 0],
            ["Privileged", iam.data.summary?.privileged ?? 0],
            ["Active", iam.data.summary?.active ?? 0],
            ["Disabled", iam.data.summary?.disabled ?? 0],
            ["Reviews Current", iam.data.summary?.reviewsCurrent ?? 0],
            ["Reviews Due", iam.data.summary?.reviewsDue ?? 0],
            ["Reviews Overdue", iam.data.summary?.reviewsOverdue ?? 0],
            ["Not Reviewed", iam.data.summary?.notReviewed ?? 0],
          ].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 dark:border-slate-800 dark:bg-slate-900/30"><div className="text-[10px] text-slate-500">{label}</div><div className="text-lg font-bold">{value}</div><DataProvenanceBadge provenance={iam.data.provenance} className="mt-1"/></div>)}</div>

          <div className="overflow-x-auto"><table className="w-full min-w-[1250px] text-left text-xs">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800"><tr><th className="py-2">Identity</th><th>Type</th><th>Organizational Role</th><th>Access Roles</th><th>Privilege</th><th>Account</th><th>Approval</th><th>Access Review</th><th>Next Review</th><th>Revocation</th><th>Provenance</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{iam.data.records.map(identity => <tr key={identity.identityId}>
              <td className="py-3 pr-3"><b>{identity.displayName}</b><div>{identity.username}</div><div className="text-slate-500">{identity.identityId}</div></td>
              <td className="pr-3">{identity.identityType.replaceAll("_", " ")}</td><td className="pr-3">{identity.organizationalRole ?? "Unassigned"}</td>
              <td className="pr-3">{identity.accessRoles.length ? identity.accessRoles.join(", ") : "None"}</td><td className="pr-3 font-semibold">{identity.privilegeLevel}</td>
              <td className="pr-3">{identity.accountStatus}</td><td className="pr-3">{identity.approvalStatus}<div className="text-slate-500">{identity.approvedBy ?? "No approver"}</div></td>
              <td className="pr-3">{identity.accessReviewStatus}<div className="text-slate-500">{identity.reviewedBy ?? "No reviewer"}</div></td><td className="pr-3">{identity.nextAccessReviewAt ? new Date(identity.nextAccessReviewAt).toLocaleDateString() : "None"}</td>
              <td className="pr-3">{identity.revocationStatus}<div className="text-slate-500">{identity.revokedAt ? new Date(identity.revokedAt).toLocaleString() : "Not revoked"}</div></td><td><DataProvenanceBadge provenance={identity.provenance}/></td>
            </tr>)}</tbody>
          </table></div>
          <p className="text-xs text-slate-500">Standalone Demo Data only. These are not company IAM statistics, verified PDP evidence, or proof of IAM governance.</p>
        </div>}
      </Panel>
    </main>
  </>;
}
