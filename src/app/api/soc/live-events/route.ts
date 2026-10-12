import { NextRequest, NextResponse } from "next/server";
import { getLiveEvents } from "@/services/wazuh-indexer";
import { toErrorResult } from "@/lib/api-result";
import { getSessionFromRequest } from "@/lib/auth";
import type { ApiResult, LiveEvent } from "@/types/soc";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!await getSessionFromRequest(req)) {
    return NextResponse.json({ status: "error", message: "Authentication required." }, { status: 401 });
  }
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "10");

  try {
    const data = await getLiveEvents(limit);
    const body: ApiResult<LiveEvent[]> =
      data.length === 0 ? { status: "empty" } : { status: "ok", data };
    return NextResponse.json(body);
  } catch (err) {
    return NextResponse.json(
      toErrorResult(err, "Failed to load live events."),
      { status: 200 }
    );
  }
}
