import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.ABUSEIPDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ABUSEIPDB_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://api.abuseipdb.com/api/v2/blacklist?limit=10", {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Key": apiKey,
      },
      next: { revalidate: 3600 } // Cache for 1 hour to avoid rate limits
    });

    if (!response.ok) {
      throw new Error(`AbuseIPDB API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("AbuseIPDB API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from AbuseIPDB" },
      { status: 500 }
    );
  }
}
