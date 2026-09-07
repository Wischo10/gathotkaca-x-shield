import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getBitdefenderIncidentsWithLifecycle } from "@/services/incident-lifecycle-service";
import { toErrorResult } from "@/lib/api-result";
import type { ApiResult } from "@/types/soc";
import type { IncidentListResponse } from "@/types/ciso";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResult<IncidentListResponse>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get("perPage") || "10", 10)));

    const data = await getBitdefenderIncidentsWithLifecycle(page, perPage);

    return NextResponse.json(
      {
        status: "ok",
        data,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (err) {
    return NextResponse.json(
      toErrorResult(err, "Failed to load Bitdefender incidents with lifecycle."),
      { status: 500 }
    );
  }
}
