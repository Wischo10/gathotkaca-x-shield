import "server-only";
import { env } from "@/lib/env";
import type { IncidentTicketingProvider } from "@/types/incident-ticketing";
import { DummyIncidentTicketingProvider } from "@/integrations/incident-ticketing/dummy-provider";

export type IncidentTicketingProviderSelection =
  | { status: "configured"; provider: IncidentTicketingProvider }
  | { status: "not_available"; reason: string };

export function selectIncidentTicketingProvider(): IncidentTicketingProviderSelection {
  const selected = env.incidentTicketing.provider()?.trim().toLowerCase();
  if (!selected) return { status: "not_available", reason: "INCIDENT_TICKETING_PROVIDER is not configured." };
  if (selected === "dummy") return { status: "configured", provider: new DummyIncidentTicketingProvider() };
  return { status: "not_available", reason: `Unsupported incident/ticketing provider '${selected}'.` };
}
