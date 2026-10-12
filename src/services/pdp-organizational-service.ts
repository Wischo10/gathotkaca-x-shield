import "server-only";
import { selectPdpOrganizationalProvider } from "@/integrations/pdp-organizational/provider-factory";
import type { PdpOrganizationalProviderResult } from "@/types/pdp-organizational";
import { aggregateProvenance } from "@/types/provenance";

const unavailable = (explanation: string): PdpOrganizationalProviderResult => ({
  processingActivities: [], policies: [], processorRelationships: [], dsrWorkflows: [], breachNotificationWorkflows: [],
  provenance: { mode: "NOT_AVAILABLE", sources: [], explanation },
});

export async function getPdpOrganizationalData(): Promise<PdpOrganizationalProviderResult> {
  const selection = selectPdpOrganizationalProvider();
  if (selection.status === "not_available") return unavailable(selection.reason);
  try {
    const result = await selection.provider.getOrganizationalData();
    return {
      ...result,
      provenance: aggregateProvenance(
        [result.provenance],
        "Temporary organizational source context only; excluded from UU PDP registers, assessment coverage, scores, evidence verification, findings, remediations, and breach counts."
      ),
    };
  } catch (error) {
    return unavailable(error instanceof Error ? error.message : "PDP organizational provider failed.");
  }
}
