import { NextRequest, NextResponse } from "next/server";
import { getAlertsBySeverity } from "@/services/wazuh-indexer";
import { toErrorResult } from "@/lib/api-result";
import type { ApiResult, AlertsBySeverity } from "@/types/soc";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const range = req.nextUrl.searchParams.get("range") ?? "7d";

  try {
    const data = await getAlertsBySeverity(range);
    const body: ApiResult<AlertsBySeverity> =
      data.total === 0 ? { status: "empty" } : { status: "ok", data };
    return NextResponse.json(body);
  } catch (err) {
    return NextResponse.json(
      toErrorResult(err, "Failed to load alert severity data."),
      { status: 200 }
    );
  }
}
