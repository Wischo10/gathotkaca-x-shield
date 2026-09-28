import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const apiKey = process.env.ABUSEIPDB_API_KEY;
  const url = new URL(req.url);
  const countryFilter = url.searchParams.get("country");
  const limit = url.searchParams.get("limit") || "10";
  // If we need to filter by country locally, we should fetch a large batch to ensure we get results
  const fetchLimit = countryFilter ? "10000" : limit;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ABUSEIPDB_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`https://api.abuseipdb.com/api/v2/blacklist?limit=${fetchLimit}`, {
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
    let results = data.data || [];

    if (countryFilter) {
      results = results.filter((item: any) => item.countryCode === countryFilter);
    }
    
    // Respect the original limit after filtering
    if (countryFilter && limit) {
      results = results.slice(0, parseInt(limit));
    }

    return NextResponse.json({ data: results });
  } catch (error: any) {
    console.warn("AbuseIPDB API error (gracefully handled):", error.message);
    return NextResponse.json({ data: [] });
  }
}
