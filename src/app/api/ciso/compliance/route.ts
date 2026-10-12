import { NextRequest, NextResponse } from "next/server";
import { getComplianceOverview } from "@/services/compliance-service";
import { getSessionFromRequest } from "@/lib/get-session";
import { toErrorResult } from "@/lib/api-result";
import type { ApiResult } from "@/types/soc";
import type { ComplianceOverviewData } from "@/types/compliance";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!await getSessionFromRequest(request)) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const data = await getComplianceOverview();
    const body: ApiResult<ComplianceOverviewData> = {
      status: "ok",
      data,
    };
    return NextResponse.json(body);
  } catch (err) {
    return NextResponse.json(
      toErrorResult(err, "Failed to load compliance data."),
      { status: 200 }
    );
  }
}
