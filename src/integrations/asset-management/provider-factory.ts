import "server-only";
import { env } from "@/lib/env";
import { DummyAssetManagementProvider } from "@/integrations/asset-management/dummy-provider";
import type { AssetManagementProvider } from "@/types/asset-management";

export type AssetManagementProviderSelection =
  | { status: "configured"; provider: AssetManagementProvider }
  | { status: "not_available"; reason: string };

export function selectAssetManagementProvider(): AssetManagementProviderSelection {
  const selected = env.assetManagement.provider()?.trim().toLowerCase();
  if (!selected) return { status: "not_available", reason: "ASSET_MANAGEMENT_PROVIDER is not configured." };
  if (selected === "dummy") return { status: "configured", provider: new DummyAssetManagementProvider() };
  return { status: "not_available", reason: `Unsupported asset-management provider '${selected}'.` };
}
