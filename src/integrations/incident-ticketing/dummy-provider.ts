import "server-only";
import type { DataProvenance } from "@/types/provenance";
import type { IncidentTicketingProvider, NormalizedIncidentTicket } from "@/types/incident-ticketing";

const provenance: DataProvenance = {
  mode: "DEMO",
  sources: ["dummy-ticketing"],
  explanation: "Deterministic synthetic incident lifecycle data for workflow demonstration only.",
  segments: [{
    name: "Ticketing lifecycle",
    mode: "DEMO",
    source: "dummy-ticketing",
    explanation: "Not correlated with Bitdefender incidents and not persisted.",
  }],
};

const records: readonly NormalizedIncidentTicket[] = [
  {
    incidentId: "DEMO-INC-001", externalIncidentId: null, externalTicketId: "DEMO-TKT-001",
    title: "Suspicious PowerShell Execution (Synthetic)", severity: "high", status: "resolved",
    owner: "Demo Analyst A", team: "Demo Security Operations",
    occurredAt: "2026-09-14T08:00:00.000Z", detectedAt: "2026-09-14T08:10:00.000Z",
    acknowledgedAt: "2026-09-14T08:25:00.000Z", containedAt: "2026-09-14T09:10:00.000Z",
    resolvedAt: "2026-09-14T12:10:00.000Z", createdAt: "2026-09-14T08:10:00.000Z",
    updatedAt: "2026-09-14T12:10:00.000Z", source: "dummy-ticketing", provenance,
  },
  {
    incidentId: "DEMO-INC-002", externalIncidentId: null, externalTicketId: "DEMO-TKT-002",
    title: "Repeated Authentication Failures (Synthetic)", severity: "medium", status: "contained",
    owner: "Demo Analyst B", team: "Demo Security Operations",
    occurredAt: "2026-09-15T09:00:00.000Z", detectedAt: "2026-09-15T09:08:00.000Z",
    acknowledgedAt: "2026-09-15T09:20:00.000Z", containedAt: "2026-09-15T10:00:00.000Z",
    resolvedAt: null, createdAt: "2026-09-15T09:08:00.000Z", updatedAt: "2026-09-15T10:00:00.000Z",
    source: "dummy-ticketing", provenance,
  },
  {
    incidentId: "DEMO-INC-003", externalIncidentId: null, externalTicketId: "DEMO-TKT-003",
    title: "Malware Detection Investigation (Synthetic)", severity: "critical", status: "acknowledged",
    owner: "Demo Analyst C", team: "Demo Incident Response",
    occurredAt: "2026-09-16T10:00:00.000Z", detectedAt: "2026-09-16T10:05:00.000Z",
    acknowledgedAt: "2026-09-16T10:35:00.000Z", containedAt: null, resolvedAt: null,
    createdAt: "2026-09-16T10:05:00.000Z", updatedAt: "2026-09-16T10:35:00.000Z",
    source: "dummy-ticketing", provenance,
  },
  {
    incidentId: "DEMO-INC-004", externalIncidentId: null, externalTicketId: "DEMO-TKT-004",
    title: "Credential Abuse Investigation (Synthetic)", severity: "high", status: "detected",
    owner: null, team: "Demo Security Operations",
    occurredAt: "2026-09-17T11:00:00.000Z", detectedAt: "2026-09-17T11:04:00.000Z",
    acknowledgedAt: null, containedAt: null, resolvedAt: null,
    createdAt: "2026-09-17T11:04:00.000Z", updatedAt: "2026-09-17T11:04:00.000Z",
    source: "dummy-ticketing", provenance,
  },
];

export class DummyIncidentTicketingProvider implements IncidentTicketingProvider {
  readonly providerId = "dummy";

  async listIncidents() {
    return { records: records.map(record => ({ ...record })), provenance };
  }
}
