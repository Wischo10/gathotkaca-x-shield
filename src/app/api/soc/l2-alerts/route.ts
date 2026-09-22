import { NextResponse } from "next/server";
import { getLiveEvents } from "@/services/wazuh-indexer";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const severitiesParam = searchParams.get('severities');
    const severities = severitiesParam ? severitiesParam.split(',') : [];

    const events = await getLiveEvents(500, severities);
    
    // Map LiveEvents to L2Alerts
    const alerts = events.map(e => ({
      id: e.id,
      title: e.event,
      description: `Wazuh Rule ID: ${e.rule} fired on ${e.source}`,
      severity: e.severity,
      source: "Wazuh Indexer",
      asset: e.assetOrUser,
      status: "New",
      firstSeen: e.time,
      lastSeen: e.time,
      totalEvents: 1,
    }));

    return NextResponse.json({ status: "ok", data: alerts });
  } catch (error: any) {
    console.error("L2 Alerts API error:", error);
    return NextResponse.json({ error: "Failed to fetch L2 alerts" }, { status: 500 });
  }
}
