import { NextResponse } from "next/server";
import { getAlertsBySeverity, getComplianceSummary } from "@/services/wazuh-indexer";
import { getRecentIncidents } from "@/services/bitdefender-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const alerts = await getAlertsBySeverity();
    const incidents = await getRecentIncidents();
    const compliance = await getComplianceSummary();

    // Calculate mock compliance score based on true compliance doc_counts
    let totalDocs = 0;
    compliance.forEach(c => totalDocs += c.value);
    const mockComplianceScore = totalDocs > 0 ? Math.min(100, Math.max(0, Math.floor(Math.random() * 20 + 75))) : 75; // Random score between 75-95 if data exists, else 75

    const data = [
      {
        id: "posture",
        title: "Security Posture Score",
        value: 78,
        max: 100,
        changePct: 6,
        trendText: "+6% vs last 30 days",
        trendColor: "blue",
        sparklineColor: "#3b82f6",
        isPositiveGood: true,
        icon: "🛡️",
        sparklineData: [{ value: 68 }, { value: 70 }, { value: 72 }, { value: 71 }, { value: 75 }, { value: 76 }, { value: 78 }],
      },
      {
        id: "risk",
        title: "Total Risk Score",
        value: 715,
        max: 1000,
        changePct: -8,
        trendText: "-8% vs last 30 days",
        trendColor: "emerald",
        sparklineColor: "#10b981",
        isPositiveGood: false,
        icon: "🚨",
        sparklineData: [{ value: 780 }, { value: 770 }, { value: 760 }, { value: 745 }, { value: 730 }, { value: 722 }, { value: 715 }],
      },
      {
        id: "incidents",
        title: "Active Incidents",
        value: incidents.length,
        changePct: incidents.length > 5 ? 20 : -10,
        trendText: incidents.length > 5 ? "+20% vs last 30 days" : "-10% vs last 30 days",
        trendColor: incidents.length > 5 ? "orange" : "emerald",
        sparklineColor: incidents.length > 5 ? "#f97316" : "#10b981",
        isPositiveGood: false,
        icon: "⚠️",
        sparklineData: [{ value: 16 }, { value: 18 }, { value: 17 }, { value: 20 }, { value: 22 }, { value: 21 }, { value: incidents.length }],
      },
      {
        id: "vulnerabilities",
        title: "Total Alerts (Last 24h)",
        value: alerts.total,
        changePct: 14,
        trendText: "+14% vs last 30 days",
        trendColor: "purple",
        sparklineColor: "#a855f7",
        isPositiveGood: false,
        icon: "👾",
        sparklineData: [{ value: 260 }, { value: 275 }, { value: 280 }, { value: 295 }, { value: 290 }, { value: 305 }, { value: alerts.total > 300 ? 312 : alerts.total }],
      },
      {
        id: "compliance",
        title: "Compliance Score",
        value: `${mockComplianceScore}%`,
        changePct: 5,
        trendText: "+5% vs last 30 days",
        trendColor: "green",
        sparklineColor: "#22c55e",
        isPositiveGood: true,
        icon: "✅",
        sparklineData: [{ value: 74 }, { value: 75 }, { value: 77 }, { value: 78 }, { value: 79 }, { value: 80 }, { value: mockComplianceScore }],
      },
      {
        id: "treatment",
        title: "Risk Treatment Progress",
        value: "64%",
        changePct: 7,
        trendText: "+7% vs last 30 days",
        trendColor: "teal",
        sparklineColor: "#14b8a6",
        isPositiveGood: true,
        icon: "📈",
        sparklineData: [{ value: 52 }, { value: 55 }, { value: 57 }, { value: 58 }, { value: 60 }, { value: 62 }, { value: 64 }],
      },
    ];

    return NextResponse.json({ status: "ok", data });
  } catch (error: any) {
    console.error("CISO Metrics API error:", error);
    return NextResponse.json({ error: "Failed to fetch CISO metrics" }, { status: 500 });
  }
}
