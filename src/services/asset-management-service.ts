import "server-only";
import { selectAssetManagementProvider } from "@/integrations/asset-management/provider-factory";
import type { AssetManagementOverview, AssetManagementProviderResult } from "@/types/asset-management";
import { aggregateProvenance } from "@/types/provenance";

const unavailable = (explanation: string): AssetManagementOverview => ({
  records: [],
  summary: null,
  provenance: { mode: "NOT_AVAILABLE", sources: [], explanation },
});

function summarize(result: AssetManagementProviderResult): AssetManagementOverview {
  const services = new Set(result.records.flatMap(record => record.businessService ? [record.businessService] : []));
  return {
    records: result.records,
    summary: {
      totalAssets: result.records.length,
      criticalAssets: result.records.filter(record => record.criticality === "Critical").length,
      highCriticalityAssets: result.records.filter(record => record.criticality === "High").length,
      businessServicesRepresented: services.size,
    },
    provenance: aggregateProvenance(
      [result.provenance],
      "Asset-management context only; excluded from operational, risk, security-posture, and compliance scores."
    ),
  };
}

export async function getAssetManagementOverview(): Promise<AssetManagementOverview> {
  const selection = selectAssetManagementProvider();
  if (selection.status === "not_available") return unavailable(selection.reason);
  try {
    return summarize(await selection.provider.listAssets());
  } catch (error) {
    return unavailable(error instanceof Error ? error.message : "Asset-management provider failed.");
  }
}
