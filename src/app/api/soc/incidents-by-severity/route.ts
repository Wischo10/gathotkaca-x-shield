import { NextResponse } from "next/server";
import { getPersistedIncidentSeverityMetrics } from "@/services/incident-lifecycle-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getPersistedIncidentSeverityMetrics(7);
    return NextResponse.json({ status: "ok", data });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Incident severity data unavailable" }, { status: 503 });
  }
}
