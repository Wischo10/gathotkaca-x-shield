import { NextResponse } from "next/server";
import { toErrorResult } from "@/lib/api-result";
import { getTopIocDetections } from "@/services/ioc-correlation";
import type { ApiResult, TopIocDetection } from "@/types/soc";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getTopIocDetections();
    const body: ApiResult<TopIocDetection[]> = data.length ? { status: "ok", data } : { status: "empty" };
    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json(toErrorResult(error, "Failed to load IOC detections."), { status: 200 });
  }
}
