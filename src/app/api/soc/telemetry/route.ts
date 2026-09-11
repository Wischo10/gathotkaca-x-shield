import { NextResponse } from "next/server";
import { getSocTelemetry } from "@/services/wazuh-indexer";
import type { ApiResult, SocTelemetry } from "@/types/soc";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<ApiResult<SocTelemetry>>> {
  try {
    return NextResponse.json({ status: "ok", data: await getSocTelemetry("7d") }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Failed to load SOC telemetry." });
  }
}
