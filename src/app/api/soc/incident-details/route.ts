import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { toErrorResult } from "@/lib/api-result";
import { getPersistedIncidentDetails } from "@/services/incident-lifecycle-service";
import type { ApiResult, SocIncidentRecord } from "@/types/soc";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!await getSessionFromRequest(request)) return NextResponse.json({ status: "error", message: "Authentication required." }, { status: 401 });
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "25");
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) return NextResponse.json({ status: "error", message: "Invalid incident detail limit." }, { status: 400 });
  try {
    const data = await getPersistedIncidentDetails(7, limit);
    const body: ApiResult<SocIncidentRecord[]> = data.length ? { status: "ok", data } : { status: "empty" };
    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json(toErrorResult(error, "Failed to load persisted incident details."), { status: 200 });
  }
}
