import "server-only";
import type { AssetManagementProvider, NormalizedAsset } from "@/types/asset-management";
import type { DataProvenance } from "@/types/provenance";

const provenance: DataProvenance = {
  mode: "DEMO",
  sources: ["dummy-cmdb"],
  explanation: "Deterministic synthetic asset-management context for demonstration only.",
  segments: [{
    name: "Asset context",
    mode: "DEMO",
    source: "dummy-cmdb",
    explanation: "Standalone synthetic assets; no Wazuh agent linkage and no database persistence.",
  }],
};

const records: readonly NormalizedAsset[] = [
  {
    assetId: "DEMO-ASSET-001", hostname: "demo-app-001.invalid", wazuhAgentId: null,
    ipAddress: "192.0.2.10", assetType: "Server", businessService: "Demo Customer Portal",
    businessOwner: "Demo Application Team", technicalOwner: "Demo Infrastructure Team",
    criticality: "Critical", environment: "Production", location: "Demo Data Center A", status: "Active",
    lastSeen: "2026-09-17T08:00:00.000Z", source: "dummy-cmdb", sourceRecordId: "DEMO-CMDB-001",
    sourceUpdatedAt: "2026-09-17T08:00:00.000Z", observedAt: "2026-09-17T08:00:00.000Z",
    schemaVersion: "1.0", provenance,
  },
  {
    assetId: "DEMO-ASSET-002", hostname: "demo-api-001.invalid", wazuhAgentId: null,
    ipAddress: "198.51.100.20", assetType: "Application", businessService: "Demo Integration Service",
    businessOwner: "Demo Application Team", technicalOwner: "Demo Security Team",
    criticality: "High", environment: "Production", location: "Demo Data Center B", status: "Active",
    lastSeen: "2026-09-16T09:30:00.000Z", source: "dummy-cmdb", sourceRecordId: "DEMO-CMDB-002",
    sourceUpdatedAt: "2026-09-16T09:30:00.000Z", observedAt: "2026-09-16T09:30:00.000Z",
    schemaVersion: "1.0", provenance,
  },
  {
    assetId: "DEMO-ASSET-003", hostname: "demo-workstation-001.invalid", wazuhAgentId: null,
    ipAddress: "203.0.113.30", assetType: "Workstation", businessService: "Demo Corporate Operations",
    businessOwner: "Demo Infrastructure Team", technicalOwner: "Demo Infrastructure Team",
    criticality: "Medium", environment: "Corporate", location: "Demo Office A", status: "Maintenance",
    lastSeen: "2026-09-15T11:15:00.000Z", source: "dummy-cmdb", sourceRecordId: "DEMO-CMDB-003",
    sourceUpdatedAt: "2026-09-15T11:15:00.000Z", observedAt: "2026-09-15T11:15:00.000Z",
    schemaVersion: "1.0", provenance,
  },
  {
    assetId: "DEMO-ASSET-004", hostname: "demo-network-001.invalid", wazuhAgentId: null,
    ipAddress: "192.0.2.40", assetType: "Network Device", businessService: "Demo Shared Network",
    businessOwner: "Demo Infrastructure Team", technicalOwner: "Demo Security Team",
    criticality: "Low", environment: "Development", location: "Demo Lab A", status: "Inactive",
    lastSeen: "2026-09-14T14:45:00.000Z", source: "dummy-cmdb", sourceRecordId: "DEMO-CMDB-004",
    sourceUpdatedAt: "2026-09-14T14:45:00.000Z", observedAt: "2026-09-14T14:45:00.000Z",
    schemaVersion: "1.0", provenance,
  },
];

export class DummyAssetManagementProvider implements AssetManagementProvider {
  readonly providerId = "dummy";

  async listAssets() {
    return { records: records.map(record => ({ ...record })), provenance };
  }
}
