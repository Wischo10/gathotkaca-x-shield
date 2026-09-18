import "server-only";
import { selectIdentityGovernanceProvider } from "@/integrations/identity-governance/provider-factory";
import type { IdentityGovernanceOverview, IdentityGovernanceProviderResult } from "@/types/identity-governance";
import { aggregateProvenance } from "@/types/provenance";

const unavailable = (explanation: string): IdentityGovernanceOverview => ({
  records: [], summary: null,
  provenance: { mode: "NOT_AVAILABLE", sources: [], explanation },
});

function summarize(result: IdentityGovernanceProviderResult): IdentityGovernanceOverview {
  return {
    records: result.records,
    summary: {
      total: result.records.length,
      privileged: result.records.filter(record => ["PRIVILEGED", "ADMINISTRATIVE"].includes(record.privilegeLevel)).length,
      active: result.records.filter(record => record.accountStatus === "ACTIVE").length,
      disabled: result.records.filter(record => record.accountStatus === "DISABLED").length,
      reviewsCurrent: result.records.filter(record => record.accessReviewStatus === "CURRENT").length,
      reviewsDue: result.records.filter(record => record.accessReviewStatus === "DUE").length,
      reviewsOverdue: result.records.filter(record => record.accessReviewStatus === "OVERDUE").length,
      notReviewed: result.records.filter(record => record.accessReviewStatus === "NOT_REVIEWED").length,
    },
    provenance: aggregateProvenance(
      [result.provenance],
      "Synthetic identity-governance context only; excluded from Wazuh telemetry, PDP assessment, compliance, risk, and CISO KPI calculations."
    ),
  };
}

export async function getIdentityGovernanceOverview(): Promise<IdentityGovernanceOverview> {
  const selection = selectIdentityGovernanceProvider();
  if (selection.status === "not_available") return unavailable(selection.reason);
  try {
    return summarize(await selection.provider.listIdentities());
  } catch (error) {
    return unavailable(error instanceof Error ? error.message : "IAM provider failed.");
  }
}
