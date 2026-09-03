import { NextResponse } from "next/server";
import { generateExecutiveSummary } from "@/services/ollama-service";
import { getAlertsBySeverity, getTopVictims, getAttackMethods } from "@/services/wazuh-indexer";
import { getRecentIncidents } from "@/services/bitdefender-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [alerts, victims, methods, incidents] = await Promise.all([
      getAlertsBySeverity("7d"),
      getTopVictims(1),
      getAttackMethods(1),
      getRecentIncidents(10)
    ]);

    const stats = {
      totalAlerts: alerts.total,
      criticalAlerts: alerts.critical,
      topVictim: victims.length > 0 ? victims[0].name : "Unknown",
      topAttackMethod: methods.length > 0 ? methods[0].name : "Unknown",
      criticalIncidents: incidents.length
    };

    const data = await generateExecutiveSummary(stats);
    return NextResponse.json({ status: "ok", data });
  } catch (error: any) {
    console.error("AI Executive Summary API error:", error);
    return NextResponse.json({ error: "Failed to generate AI summary" }, { status: 500 });
  }
}
