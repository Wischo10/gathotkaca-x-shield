import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { toErrorResult } from "@/lib/api-result";
import { getAttackCountryDetections } from "@/services/ioc-correlation";
import type { ApiResult, AttackCountryDetection } from "@/types/soc";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!await getSessionFromRequest(request)) {
    return NextResponse.json({ status: "error", message: "Authentication required." }, { status: 401 });
  }
  try {
    const data = await getAttackCountryDetections();
    const body: ApiResult<AttackCountryDetection[]> = data.length ? { status: "ok", data } : { status: "empty" };
    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json(toErrorResult(error, "Failed to load attack countries."), { status: 200 });
  }
}
