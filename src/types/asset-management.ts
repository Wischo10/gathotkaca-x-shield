import type { DataProvenance } from "@/types/provenance";

export type AssetCriticality = "Critical" | "High" | "Medium" | "Low" | "Unknown";
export type AssetType = "Server" | "Workstation" | "Network Device" | "Application" | "Unknown";
export type AssetEnvironment = "Production" | "Staging" | "Development" | "Corporate" | "Unknown";
export type AssetStatus = "Active" | "Inactive" | "Maintenance" | "Retired" | "Unknown";

export interface NormalizedAsset {
  assetId: string;
  hostname: string | null;
  /** Exact Wazuh agent ID only. Null means no linkage; never infer it from hostname or IP. */
  wazuhAgentId: string | null;
  ipAddress: string | null;
  assetType: AssetType;
  businessService: string | null;
  businessOwner: string | null;
  technicalOwner: string | null;
  criticality: AssetCriticality;
  environment: AssetEnvironment;
  location: string | null;
  status: AssetStatus;
  lastSeen: string | null;
  source: string;
  sourceRecordId: string;
  sourceUpdatedAt: string;
  observedAt: string;
  schemaVersion: "1.0";
  provenance: DataProvenance;
}

export interface AssetManagementProviderResult {
  records: NormalizedAsset[];
  provenance: DataProvenance;
}

export interface AssetManagementProvider {
  readonly providerId: string;
  listAssets(): Promise<AssetManagementProviderResult>;
}

export interface AssetManagementSummary {
  totalAssets: number;
  criticalAssets: number;
  highCriticalityAssets: number;
  businessServicesRepresented: number;
}

export interface AssetManagementOverview {
  records: NormalizedAsset[];
  summary: AssetManagementSummary | null;
  provenance: DataProvenance;
}
