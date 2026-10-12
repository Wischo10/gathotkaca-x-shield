import { NextRequest, NextResponse } from "next/server";
import { getSocMetrics } from "@/services/soc-metrics";
import { getSessionFromRequest } from "@/lib/auth";
import type { ApiResult, SocMetrics } from "@/types/soc";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResult<SocMetrics>>> {
  if (!await getSessionFromRequest(request)) {
    return NextResponse.json({ status: "error", message: "Authentication required." }, { status: 401 });
  }
  const data = await getSocMetrics(request.nextUrl.searchParams.get("wazuh") !== "false");
  return NextResponse.json({ status: "ok", data }, { headers: { "Cache-Control": "no-store" } });
}
