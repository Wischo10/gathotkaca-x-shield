import type { DataProvenance } from "@/types/provenance";
import type { IncidentKpiOverview } from "@/types/ciso";

export type NormalizedIncidentSeverity = "critical" | "high" | "medium" | "low" | "unknown";
export type NormalizedIncidentStatus = "detected" | "acknowledged" | "contained" | "resolved";

export interface NormalizedIncidentTicket {
  incidentId: string;
  /** Stable ID from the authoritative incident source. Never inferred from descriptive fields. */
  externalIncidentId: string | null;
  externalTicketId: string;
  title: string;
  severity: NormalizedIncidentSeverity;
  status: NormalizedIncidentStatus;
  owner: string | null;
  team: string | null;
  occurredAt: string | null;
  detectedAt: string;
  acknowledgedAt: string | null;
  containedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  source: string;
  provenance: DataProvenance;
}

export interface IncidentTicketingProviderResult {
  records: NormalizedIncidentTicket[];
  provenance: DataProvenance;
}

export interface IncidentTicketingProvider {
  readonly providerId: string;
  listIncidents(): Promise<IncidentTicketingProviderResult>;
}

export interface IncidentTicketingOverview {
  records: NormalizedIncidentTicket[];
  incidentKpi: IncidentKpiOverview | null;
  provenance: DataProvenance;
}
