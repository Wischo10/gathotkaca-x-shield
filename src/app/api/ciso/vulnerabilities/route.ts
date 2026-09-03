import { NextResponse } from "next/server";
import { getVulnerabilityStats } from "@/services/wazuh-indexer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getVulnerabilityStats();

    // Map to the Vulnerability SLA format
    const data = [
      { name: "Overdue", value: stats.critical, color: "#ef4444", percentage: stats.total > 0 ? Math.round(stats.critical / stats.total * 100) + "%" : "0%" },
      { name: "Due Soon", value: stats.high, color: "#f97316", percentage: stats.total > 0 ? Math.round(stats.high / stats.total * 100) + "%" : "0%" },
      { name: "In Progress", value: stats.medium, color: "#eab308", percentage: stats.total > 0 ? Math.round(stats.medium / stats.total * 100) + "%" : "0%" },
      { name: "Compliant", value: stats.low, color: "#22c55e", percentage: stats.total > 0 ? Math.round(stats.low / stats.total * 100) + "%" : "0%" },
    ];

    return NextResponse.json({ status: "ok", data });
  } catch (error: any) {
    console.error("CISO Vulnerabilities API error:", error);
    return NextResponse.json({ error: "Failed to fetch CISO vulnerabilities" }, { status: 500 });
  }
}
