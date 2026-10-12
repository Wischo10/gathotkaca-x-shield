import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/get-session";
import { getDataHubSourceRegistry } from "@/services/data-hub-service";
import type { ApiResult } from "@/types/soc";
import type { DataHubSourceRegistry } from "@/types/data-hub";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!await getSessionFromRequest(request)) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body: ApiResult<DataHubSourceRegistry> = { status: "ok", data: await getDataHubSourceRegistry() };
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
