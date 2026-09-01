import { NextRequest, NextResponse } from "next/server";
import { getAlertsTrend } from "@/services/wazuh-indexer";
import { toErrorResult } from "@/lib/api-result";
import type { ApiResult, TimeSeriesPoint } from "@/types/soc";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const range = req.nextUrl.searchParams.get("range") ?? "7d";

  try {
    const data = await getAlertsTrend(range);
    const body: ApiResult<TimeSeriesPoint[]> =
      data.length === 0 ? { status: "empty" } : { status: "ok", data };
    return NextResponse.json(body);
  } catch (err) {
    return NextResponse.json(
      toErrorResult(err, "Failed to load the alerts trend."),
      { status: 200 }
    );
  }
}
