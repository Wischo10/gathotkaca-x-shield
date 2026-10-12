import "server-only";
import { selectRemediationWorkflowProvider } from "@/integrations/vulnerability-remediation/provider-factory";
import type { RemediationWorkflowOverview, RemediationWorkflowProviderResult } from "@/types/vulnerability-remediation";
import { aggregateProvenance } from "@/types/provenance";

const unavailable = (explanation: string): RemediationWorkflowOverview => ({
  records: [], summary: null,
  provenance: { mode: "NOT_AVAILABLE", sources: [], explanation },
});

function summarize(result: RemediationWorkflowProviderResult): RemediationWorkflowOverview {
  return {
    records: result.records,
    summary: {
      total: result.records.length,
      planned: result.records.filter(record => record.status === "PLANNED").length,
      inProgress: result.records.filter(record => record.status === "IN_PROGRESS").length,
      resolved: result.records.filter(record => record.status === "RESOLVED").length,
      acceptedException: result.records.filter(record => record.status === "ACCEPTED_EXCEPTION").length,
    },
    provenance: aggregateProvenance(
      [result.provenance],
      "Enterprise remediation workflow demonstration only; separate from Wazuh findings, PostgreSQL remediation records, CVE age buckets, and formal SLA metrics."
    ),
  };
}

export async function getRemediationWorkflowOverview(): Promise<RemediationWorkflowOverview> {
  const selection = selectRemediationWorkflowProvider();
  if (selection.status === "not_available") return unavailable(selection.reason);
  try {
    return summarize(await selection.provider.listRemediations());
  } catch (error) {
    return unavailable(error instanceof Error ? error.message : "Vulnerability-remediation provider failed.");
  }
}
