import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.THREATFOX_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "THREATFOX_API_KEY is not configured" }, { status: 500 });
  }

  try {
    const response = await fetch("https://threatfox-api.abuse.ch/api/v1/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": apiKey,
      },
      body: JSON.stringify({
        query: "get_iocs",
        days: 1, // Get IOCs from the last 1 day
      }),
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`ThreatFox API error: ${response.statusText}`);
    }

    const json = await response.json();
    const data = json.data || [];

    // Aggregation logic
    let totalIoc = data.length;
    let malwareCount = 0;
    let botnetCount = 0;
    let payloadCount = 0;
    let otherCount = 0;
    
    let sourceMap: Record<string, number> = {};

    data.forEach((ioc: any) => {
      // Type breakdown
      if (ioc.threat_type === "botnet_cc") botnetCount++;
      else if (ioc.threat_type === "payload_delivery") payloadCount++;
      else if (ioc.threat_type === "malware") malwareCount++;
      else otherCount++;

      // Source breakdown
      const reporter = ioc.reporter || "Unknown";
      if (!sourceMap[reporter]) sourceMap[reporter] = 0;
      sourceMap[reporter]++;
    });

    // Sort top sources
    const topSources = Object.entries(sourceMap)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4); // Top 4

    const formattedData = {
      metrics: [
        { label: "Total New IOCs (24h)", value: totalIoc, change: "+New" },
        { label: "Botnet / C2", value: botnetCount, change: "Active" },
        { label: "Payload Delivery", value: payloadCount, change: "Active" },
        { label: "Other Malware", value: malwareCount, change: "Active" },
      ],
      topSources: topSources.length > 0 ? topSources : [{ source: "No data", count: 0 }]
    };

    return NextResponse.json({ status: "ok", data: formattedData });
  } catch (error: any) {
    console.error("CISO Threat Intel error:", error);
    // Graceful fallback
    const fallbackData = {
      metrics: [
        { label: "Total New IOCs (24h)", value: 0, change: "-" },
        { label: "Botnet / C2", value: 0, change: "-" },
        { label: "Payload Delivery", value: 0, change: "-" },
        { label: "Other Malware", value: 0, change: "-" },
      ],
      topSources: [{ source: "No data available", count: 0 }]
    };
    return NextResponse.json({ status: "ok", data: fallbackData });
  }
}
