import "server-only";
import { env } from "@/lib/env";
import type { DemoAlertStatus, Severity, SocWorkflowDemo } from "@/types/soc";

type DemoIncident = {
  id: `DEMO-INC-${string}`;
  status: DemoAlertStatus;
  severity: Severity;
  occurredAt: string;
  detectedAt: string;
  acknowledgedAt: string;
  responseStartedAt: string;
  containedAt: string;
  resolvedAt: string;
};

// Fixed application-layer fixtures. They are never persisted or attached to
// real incidents, and are exposed only when the dummy provider is explicit.
const DEMO_INCIDENTS: readonly DemoIncident[] = [
  { id: "DEMO-INC-001", status: "New", severity: "critical", occurredAt: "2026-09-20T00:00:00.000Z", detectedAt: "2026-09-20T00:08:00.000Z", acknowledgedAt: "2026-09-20T00:12:00.000Z", responseStartedAt: "2026-09-20T00:20:00.000Z", containedAt: "2026-09-20T01:10:00.000Z", resolvedAt: "2026-09-20T03:00:00.000Z" },
  { id: "DEMO-INC-002", status: "New", severity: "high", occurredAt: "2026-09-20T01:00:00.000Z", detectedAt: "2026-09-20T01:12:00.000Z", acknowledgedAt: "2026-09-20T01:18:00.000Z", responseStartedAt: "2026-09-20T01:30:00.000Z", containedAt: "2026-09-20T02:05:00.000Z", resolvedAt: "2026-09-20T04:20:00.000Z" },
  { id: "DEMO-INC-003", status: "In Progress", severity: "high", occurredAt: "2026-09-20T02:00:00.000Z", detectedAt: "2026-09-20T02:05:00.000Z", acknowledgedAt: "2026-09-20T02:09:00.000Z", responseStartedAt: "2026-09-20T02:15:00.000Z", containedAt: "2026-09-20T02:55:00.000Z", resolvedAt: "2026-09-20T05:10:00.000Z" },
  { id: "DEMO-INC-004", status: "In Progress", severity: "medium", occurredAt: "2026-09-20T03:00:00.000Z", detectedAt: "2026-09-20T03:20:00.000Z", acknowledgedAt: "2026-09-20T03:28:00.000Z", responseStartedAt: "2026-09-20T03:45:00.000Z", containedAt: "2026-09-20T04:35:00.000Z", resolvedAt: "2026-09-20T07:15:00.000Z" },
  { id: "DEMO-INC-005", status: "Investigating", severity: "critical", occurredAt: "2026-09-20T04:00:00.000Z", detectedAt: "2026-09-20T04:10:00.000Z", acknowledgedAt: "2026-09-20T04:14:00.000Z", responseStartedAt: "2026-09-20T04:22:00.000Z", containedAt: "2026-09-20T05:00:00.000Z", resolvedAt: "2026-09-20T08:00:00.000Z" },
  { id: "DEMO-INC-006", status: "Investigating", severity: "high", occurredAt: "2026-09-20T05:00:00.000Z", detectedAt: "2026-09-20T05:09:00.000Z", acknowledgedAt: "2026-09-20T05:15:00.000Z", responseStartedAt: "2026-09-20T05:24:00.000Z", containedAt: "2026-09-20T06:20:00.000Z", resolvedAt: "2026-09-20T09:30:00.000Z" },
  { id: "DEMO-INC-007", status: "Resolved", severity: "medium", occurredAt: "2026-09-20T06:00:00.000Z", detectedAt: "2026-09-20T06:07:00.000Z", acknowledgedAt: "2026-09-20T06:11:00.000Z", responseStartedAt: "2026-09-20T06:19:00.000Z", containedAt: "2026-09-20T07:05:00.000Z", resolvedAt: "2026-09-20T10:00:00.000Z" },
  { id: "DEMO-INC-008", status: "Resolved", severity: "medium", occurredAt: "2026-09-20T07:00:00.000Z", detectedAt: "2026-09-20T07:11:00.000Z", acknowledgedAt: "2026-09-20T07:16:00.000Z", responseStartedAt: "2026-09-20T07:29:00.000Z", containedAt: "2026-09-20T08:10:00.000Z", resolvedAt: "2026-09-20T11:20:00.000Z" },
  { id: "DEMO-INC-009", status: "Closed", severity: "low", occurredAt: "2026-09-20T08:00:00.000Z", detectedAt: "2026-09-20T08:06:00.000Z", acknowledgedAt: "2026-09-20T08:10:00.000Z", responseStartedAt: "2026-09-20T08:18:00.000Z", containedAt: "2026-09-20T08:45:00.000Z", resolvedAt: "2026-09-20T10:40:00.000Z" },
  { id: "DEMO-INC-010", status: "Closed", severity: "low", occurredAt: "2026-09-20T09:00:00.000Z", detectedAt: "2026-09-20T09:13:00.000Z", acknowledgedAt: "2026-09-20T09:20:00.000Z", responseStartedAt: "2026-09-20T09:34:00.000Z", containedAt: "2026-09-20T10:10:00.000Z", resolvedAt: "2026-09-20T12:50:00.000Z" },
];

const STATUS_ORDER: DemoAlertStatus[] = ["New", "In Progress", "Investigating", "Resolved", "Closed"];
const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];

function minutesBetween(start: string, end: string): number {
  return (Date.parse(end) - Date.parse(start)) / 60_000;
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Fail-closed selector: only the exact explicit value "dummy" enables fixtures. */
export function getIncidentTicketingDemo(): SocWorkflowDemo | null {
  if (env.incidentTicketing.provider() !== "dummy") return null;

  const severityCounts = Object.fromEntries(SEVERITIES.map((severity) => [
    severity,
    DEMO_INCIDENTS.filter((incident) => incident.severity === severity).length,
  ])) as Record<Severity, number>;

  return {
    provenance: "DEMO",
    sourceLabel: "Demo Incident/Ticketing Workflow",
    fixtureIds: DEMO_INCIDENTS.map((incident) => incident.id),
    alertStatuses: STATUS_ORDER.map((status) => ({
      status,
      count: DEMO_INCIDENTS.filter((incident) => incident.status === status).length,
    })),
    incidentSeverity: { total: DEMO_INCIDENTS.length, ...severityCounts },
    mttdMinutes: average(DEMO_INCIDENTS.map((incident) => minutesBetween(incident.occurredAt, incident.detectedAt))),
    meanTimeToResponseStartMinutes: average(DEMO_INCIDENTS.map((incident) => minutesBetween(incident.detectedAt, incident.responseStartedAt))),
    records: DEMO_INCIDENTS.map((incident) => ({ ...incident })),
  };
}
