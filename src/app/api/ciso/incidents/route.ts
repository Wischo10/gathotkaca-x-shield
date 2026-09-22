import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getBitdefenderIncidentsWithLifecycle } from "@/services/incident-lifecycle-service";
import { toErrorResult } from "@/lib/api-result";
import { HttpError } from "@/lib/http";
import { getSessionFromRequest } from "@/lib/get-session";

export async function GET(
  request: NextRequest
) {
  if (!await getSessionFromRequest(request)) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const perPage = Math.min(50, Math.max(10, parseInt(searchParams.get("perPage") || "10", 10)));

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
      { status: err instanceof HttpError ? (err.kind === "timeout" ? 504 : 502) : 500 }
    );
  }
}
