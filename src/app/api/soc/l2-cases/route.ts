import { NextResponse } from "next/server";
import { getLiveEvents } from "@/services/wazuh-indexer";
import type { L2Alert, InvestigationCase } from "@/types/soc";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('id');

    if (!alertId) {
       return NextResponse.json({ error: "Alert ID is required" }, { status: 400 });
    }

    const events = await getLiveEvents(50);
    const event = events.find(e => e.id === alertId);

    if (!event) {
       return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    const alert: L2Alert = {
      id: event.id,
      title: event.event,
      description: `Wazuh Rule ID: ${event.rule} fired on ${event.source}`,
      severity: event.severity,
      source: "Wazuh Indexer",
      asset: event.assetOrUser,
      status: "In Progress",
      firstSeen: event.time,
      lastSeen: event.time,
      totalEvents: 1,
    };

    const caseData: InvestigationCase = {
      alert,
      timeline: [
        {
          id: "t1",
          time: event.time,
          description: "Initial detection of malicious activity."
        }
      ],
      entities: [
        { id: "e1", type: "Asset", value: event.assetOrUser }
      ],
      iocs: []
    };

    return NextResponse.json({ status: "ok", data: caseData });
  } catch (error: any) {
    console.error("L2 Cases API error:", error);
    return NextResponse.json({ error: "Failed to fetch L2 case" }, { status: 500 });
  }
}
