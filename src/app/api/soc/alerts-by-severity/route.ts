import { NextRequest, NextResponse } from "next/server";
import { getAlertsBySeverity } from "@/services/wazuh-indexer";
import { toErrorResult } from "@/lib/api-result";
import { getSessionFromRequest } from "@/lib/auth";
import type { ApiResult, AlertsBySeverity } from "@/types/soc";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!await getSessionFromRequest(req)) {
    return NextResponse.json({ status: "error", message: "Authentication required." }, { status: 401 });
  }
  const range = req.nextUrl.searchParams.get("range") ?? "7d";

  try {
    const data = await getAlertsBySeverity(range);
    const body: ApiResult<AlertsBySeverity> = { status: "ok", data };
    return NextResponse.json(body);
  } catch (err) {
    return NextResponse.json(
      toErrorResult(err, "Failed to load alert severity data."),
      { status: 200 }
    );
  }
}
