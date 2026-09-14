import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { toErrorResult } from "@/lib/api-result";
import { runIpIocCorrelation } from "@/services/ioc-correlation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;
  if (!user || user.role !== "admin") {
    return NextResponse.json({ status: "error", message: "Administrator authentication required." }, { status: 401 });
  }
  try {
    // Controlled Phase 1 second-batch cap. IOC values are never accepted from the request.
    const data = await runIpIocCorrelation(25);
    return NextResponse.json({ status: "ok", data });
  } catch (error) {
    return NextResponse.json(toErrorResult(error, "IOC correlation sync failed."), { status: 500 });
  }
}
