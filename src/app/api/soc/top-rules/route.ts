import { NextRequest, NextResponse } from "next/server";
import { getTopAlertingRules } from "@/services/wazuh-indexer";
import { toErrorResult } from "@/lib/api-result";
import { getSessionFromRequest } from "@/lib/auth";
import type { ApiResult, TopAlertingRule } from "@/types/soc";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!await getSessionFromRequest(req)) {
    return NextResponse.json({ status: "error", message: "Authentication required." }, { status: 401 });
  }
  const range = req.nextUrl.searchParams.get("range") ?? "7d";

  try {
    const data = await getTopAlertingRules(range);
    const body: ApiResult<TopAlertingRule[]> =
      data.length === 0 ? { status: "empty" } : { status: "ok", data };
    return NextResponse.json(body);
  } catch (err) {
    return NextResponse.json(
      toErrorResult(err, "Failed to load top alerting rules."),
      { status: 200 }
    );
  }
}
