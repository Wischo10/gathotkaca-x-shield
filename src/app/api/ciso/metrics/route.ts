import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getCisoMetrics } from "@/services/ciso-service";
import { getSessionFromRequest } from "@/lib/get-session";
import { toErrorResult } from "@/lib/api-result";
import type { ApiResult } from "@/types/soc";
import type { CisoMetricsData } from "@/types/ciso";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!await getSessionFromRequest(request)) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const data = await getCisoMetrics();
    const body: ApiResult<CisoMetricsData> = {
      status: "ok",
      data,
    };
    return NextResponse.json(body, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    return NextResponse.json(
      toErrorResult(err, "Failed to load CISO dashboard metrics."),
      { status: 500 }
    );
  }
}
