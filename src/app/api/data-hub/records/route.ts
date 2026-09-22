import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/get-session";
import {
  DATA_HUB_RECORD_LIMIT_DEFAULT,
  DATA_HUB_RECORD_LIMIT_MAX,
  getDataHubRecordPreview,
  isDataHubRecordCombination,
  type DataHubPreviewSourceId,
} from "@/services/data-hub-record-service";
import type { DataHubRecordPreview, DataHubRecordType } from "@/types/data-hub";
import type { ApiResult } from "@/types/soc";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!await getSessionFromRequest(request)) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const source = request.nextUrl.searchParams.get("source") ?? "";
  const recordType = request.nextUrl.searchParams.get("recordType") ?? "";
  const requestedLimit = request.nextUrl.searchParams.get("limit");
  const parsedLimit = requestedLimit === null ? DATA_HUB_RECORD_LIMIT_DEFAULT : Number(requestedLimit);
  if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > DATA_HUB_RECORD_LIMIT_MAX) {
    return NextResponse.json({ error: `Limit must be an integer from 1 to ${DATA_HUB_RECORD_LIMIT_MAX}.` }, { status: 400 });
  }
  if (!isDataHubRecordCombination(source, recordType)) {
    return NextResponse.json({ error: "Unsupported source and record type combination." }, { status: 400 });
  }

  try {
    const data = await getDataHubRecordPreview(source as DataHubPreviewSourceId, recordType as DataHubRecordType, parsedLimit);
    const body: ApiResult<DataHubRecordPreview> = { status: "ok", data };
    return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "The selected source preview is currently unavailable." }, { status: 503 });
  }
}
