import { NextRequest, NextResponse } from "next/server";
import { getSocMetrics } from "@/services/soc-metrics";
import type { ApiResult, SocMetrics } from "@/types/soc";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResult<SocMetrics>>> {
  const data = await getSocMetrics(request.nextUrl.searchParams.get("wazuh") !== "false");
  return NextResponse.json({ status: "ok", data }, { headers: { "Cache-Control": "no-store" } });
}
