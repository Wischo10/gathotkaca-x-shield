import "server-only";
import { NextResponse } from "next/server";
import { getCisoMetrics } from "@/services/ciso-service";
import { toErrorResult } from "@/lib/api-result";
import type { ApiResult } from "@/types/soc";
import type { CisoMetricsData } from "@/types/ciso";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<ApiResult<CisoMetricsData>>> {
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
