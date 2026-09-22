import { NextRequest, NextResponse } from "next/server";
import { getThreatIntelligenceOverview } from "@/services/threat-intel";
import { getSessionFromRequest } from "@/lib/get-session";
import { toErrorResult } from "@/lib/api-result";
import type { ApiResult } from "@/types/soc";
import type { ThreatIntelligenceOverviewData } from "@/types/threat-intel";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!await getSessionFromRequest(request)) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
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
