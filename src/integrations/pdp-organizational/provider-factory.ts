import "server-only";
import { DummyPdpOrganizationalProvider } from "@/integrations/pdp-organizational/dummy-provider";
import { env } from "@/lib/env";
import type { PdpOrganizationalProvider } from "@/types/pdp-organizational";

export type PdpOrganizationalProviderSelection =
  | { status: "configured"; provider: PdpOrganizationalProvider }
  | { status: "not_available"; reason: string };

export function selectPdpOrganizationalProvider(): PdpOrganizationalProviderSelection {
  const selected = env.pdpOrganizational.provider()?.trim().toLowerCase();
  if (!selected) return { status: "not_available", reason: "PDP_ORGANIZATIONAL_PROVIDER is not configured." };
  if (selected === "dummy") return { status: "configured", provider: new DummyPdpOrganizationalProvider() };
  return { status: "not_available", reason: `Unsupported PDP organizational provider '${selected}'.` };
}
