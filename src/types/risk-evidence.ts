export interface RiskEvidenceSuggestion {
  id: string;
  source: "Wazuh/OpenSearch" | "Bitdefender GravityZone";
  sourceReference: string;
  kind: "vulnerability" | "incident";
  summary: string;
  technicalSeverity: string | null;
  affectedAsset: string | null;
  affectedAssetCount: number | null;
  observedAt: string | null;
  slaState: "Overdue" | "Due Soon" | "Compliant" | "Unclassified" | null;
  status: string | null;
  alertCount: number | null;
  attackTypes: string[];
  collectedAt: string;
}

export interface RiskEvidenceResponse {
  suggestions: RiskEvidenceSuggestion[];
  sources: {
    wazuh: { available: boolean; error?: string };
    bitdefender: { available: boolean; error?: string };
  };
}
