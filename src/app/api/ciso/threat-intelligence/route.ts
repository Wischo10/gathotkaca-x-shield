import { NextRequest, NextResponse } from "next/server";
import { getThreatIntelligenceOverview } from "@/services/threat-intel";
import { toErrorResult } from "@/lib/api-result";
import type { ApiResult } from "@/types/soc";
import type { ThreatIntelligenceOverviewData } from "@/types/threat-intel";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const data = await getThreatIntelligenceOverview();
    const body: ApiResult<ThreatIntelligenceOverviewData> = {
      status: "ok",
      data,
    };
    return NextResponse.json(body);
  } catch (err) {
    return NextResponse.json(
      toErrorResult(err, "Failed to load threat intelligence data."),
      { status: 200 }
    );
  }
}
