import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getPersistedIncidentSeverityMetrics } from "@/services/incident-lifecycle-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!await getSessionFromRequest(request)) {
    return NextResponse.json({ status: "error", message: "Authentication required." }, { status: 401 });
  }
  try {
    const data = await getPersistedIncidentSeverityMetrics(7);
    return NextResponse.json({ status: "ok", data });
  } catch {
    return NextResponse.json({ status: "error", message: "Incident severity data unavailable." }, { status: 503 });
  }
}
