import { NextResponse } from "next/server";
import { generateExecutiveSummary } from "@/services/ollama-service";
import { getAggregatedKPIs } from "@/services/kpi-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const kpis = await getAggregatedKPIs("daily");

    const stats = {
      totalAlerts: kpis.soc.totalAlerts,
      criticalAlerts: kpis.ciso.significantIncidents, // Mapped for context
      topVictim: "Unknown (Data from unified taxonomy pending)", 
      topAttackMethod: "Unknown",
      criticalIncidents: kpis.ciso.significantIncidents,
      // Injecting new unified stats
      overallCompliance: kpis.executive.overallComplianceScore,
      riskExposure: kpis.executive.riskExposureUsd,
      topRisks: kpis.executive.topRisks.join(", ")
    };

    const data = await generateExecutiveSummary(stats as any);
    return NextResponse.json({ status: "ok", data });
  } catch (error: any) {
    console.error("AI Executive Summary API error:", error);
    return NextResponse.json({ error: "Failed to generate AI summary" }, { status: 500 });
  }
}
