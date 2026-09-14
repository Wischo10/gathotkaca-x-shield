import { NextResponse } from "next/server";
import { toErrorResult } from "@/lib/api-result";
import { getAttackCountryDetections } from "@/services/ioc-correlation";
import type { ApiResult, AttackCountryDetection } from "@/types/soc";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getAttackCountryDetections();
    const body: ApiResult<AttackCountryDetection[]> = data.length ? { status: "ok", data } : { status: "empty" };
    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json(toErrorResult(error, "Failed to load attack countries."), { status: 200 });
  }
}
