import { NextRequest, NextResponse } from "next/server";
import { getComplianceOverview } from "@/services/compliance-service";
import { toErrorResult } from "@/lib/api-result";
import type { ApiResult } from "@/types/soc";
import type { ComplianceOverviewData } from "@/types/compliance";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
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
