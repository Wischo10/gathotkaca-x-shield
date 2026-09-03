import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.THREATFOX_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "THREATFOX_API_KEY is not configured" },
      { status: 500 }
    );
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
      next: { revalidate: 300 } // Cache for 5 minutes to avoid rate limits
    });

    if (!response.ok) {
      throw new Error(`ThreatFox API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    // Gracefully handle ThreatFox API failures by returning empty data instead of 500 error
    // so the frontend doesn't crash or show ugly errors.
    console.warn("ThreatFox API error (gracefully handled):", error.message);
    return NextResponse.json({ data: [] });
  }
}
