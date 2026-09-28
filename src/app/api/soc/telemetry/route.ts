import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getSocTelemetry } from "@/services/wazuh-indexer";
import type { ApiResult, SocTelemetry } from "@/types/soc";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResult<SocTelemetry>>> {
  if (!await getSessionFromRequest(request)) {
    return NextResponse.json({ status: "error", message: "Authentication required." }, { status: 401 });
  }
  try {
    return NextResponse.json({ status: "ok", data: await getSocTelemetry("7d") }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "error", message: "SOC telemetry unavailable." }, { status: 503 });
  }
}
