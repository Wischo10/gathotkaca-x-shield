import type { DataProvenance } from "@/types/provenance";

export type DataHubSourceStatus = "AVAILABLE" | "DEGRADED" | "NOT_AVAILABLE" | "HOLD";
export type DataHubSourceType = "SIEM" | "ENDPOINT_SECURITY" | "DATABASE" | "THREAT_INTELLIGENCE" | "ENRICHMENT" | "ENTERPRISE_INTEGRATION";
export type DataHubFreshnessMeaning = "OBSERVED_AT" | "RETRIEVED_AT" | "PERSISTED_AT" | "CHECKED_AT";

export interface DataHubSourceFreshness {
  timestamp: string | null;
  meaning: DataHubFreshnessMeaning | null;
}

export interface DataHubSource {
  id: string;
  name: string;
  sourceType: DataHubSourceType;
  category: string;
  description: string;
  status: DataHubSourceStatus;
  provenance: DataProvenance;
  capabilities: string[];
  freshness: DataHubSourceFreshness;
  healthDetail: string;
  futureTarget?: string;
}

export interface DataHubRegistrySummary {
  registered: number;
  available: number;
  degraded: number;
  unavailable: number;
  hold: number;
}

export interface DataHubSourceRegistry {
  sources: DataHubSource[];
  summary: DataHubRegistrySummary;
}

export type DataHubRecordType =
  | "SECURITY_ALERT"
  | "VULNERABILITY_FINDING"
  | "ENDPOINT_INCIDENT"
  | "THREAT_INTEL_IOC"
  | "INCIDENT_LIFECYCLE"
  | "RISK_RECORD"
  | "COMPLIANCE_ASSESSMENT"
  | "THIRD_PARTY_ASSESSMENT"
  | "VULNERABILITY_REMEDIATION"
  | "PDP_OPERATIONAL_RECORD";

export type DataHubRecordTimestampMeaning =
  | "OBSERVED_AT"
  | "DETECTED_AT"
  | "FIRST_SEEN"
  | "PERSISTED_AT"
  | "UPDATED_AT"
  | "ASSESSED_AT";

export type DataHubRecordMetadataValue = string | number | boolean | null | string[];

export interface DataHubRecord {
  id: string;
  sourceId: string;
  sourceName: string;
  recordType: DataHubRecordType;
  externalId: string | null;
  title: string | null;
  severity: string | null;
  entity: { type: string; value: string } | null;
  timestamp: { value: string | null; meaning: DataHubRecordTimestampMeaning | null };
  provenance: DataProvenance;
  metadata: Record<string, DataHubRecordMetadataValue>;
}

export interface DataHubRecordPreview {
  sourceId: string;
  recordType: DataHubRecordType;
  limit: number;
  records: DataHubRecord[];
}
