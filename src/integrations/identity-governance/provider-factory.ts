import "server-only";
import { DummyIdentityGovernanceProvider } from "@/integrations/identity-governance/dummy-provider";
import { env } from "@/lib/env";
import type { IdentityGovernanceProvider } from "@/types/identity-governance";

export type IdentityGovernanceProviderSelection =
  | { status: "configured"; provider: IdentityGovernanceProvider }
  | { status: "not_available"; reason: string };

export function selectIdentityGovernanceProvider(): IdentityGovernanceProviderSelection {
  const selected = env.iam.provider()?.trim().toLowerCase();
  if (!selected) return { status: "not_available", reason: "IAM_PROVIDER is not configured." };
  if (selected === "dummy") return { status: "configured", provider: new DummyIdentityGovernanceProvider() };
  return { status: "not_available", reason: `Unsupported IAM provider '${selected}'.` };
}
