import { NextRequest, NextResponse } from "next/server";
import { getTopSourceIPs } from "@/services/wazuh-indexer";

export const dynamic = "force-dynamic";

export interface CountryAttackData {
  countryCode: string;   // ISO alpha-2, e.g. "CN"
  country: string;       // "China"
  count: number;         // total alert count from this country
  latitude: number;
  longitude: number;
  topIPs: string[];      // up to 3 example IPs
}

/**
 * Fetches top source IPs from Wazuh alerts, enriches them with GeoIP data
 * from ipwho.is (free, no key required), and aggregates by country.
 *
 * Flow:
 *   Wazuh Indexer (data.srcip agg) → ipwho.is/{ip} → group by country_code
 */
export async function GET(req: NextRequest) {
  try {
    const range = req.nextUrl.searchParams.get("range") ?? "30d";

    // Step 1: Get top source IPs from Wazuh
    const sourceIPs = await getTopSourceIPs(40, range);

    if (sourceIPs.length === 0) {
      return NextResponse.json({ status: "ok", data: [] });
    }

    // Step 2: GeoIP lookup — limit concurrency to avoid rate limits
    const BATCH_SIZE = 8;
    const geoResults: Array<{
      ip: string;
      count: number;
      country: string;
      countryCode: string;
      latitude: number;
      longitude: number;
    }> = [];

    for (let i = 0; i < sourceIPs.length; i += BATCH_SIZE) {
      const batch = sourceIPs.slice(i, i + BATCH_SIZE);

      const settled = await Promise.allSettled(
        batch.map(async ({ ip, count }) => {
          const geoRes = await fetch(`https://ipwho.is/${ip}`, {
            headers: { "Accept": "application/json" },
            next: { revalidate: 3600 }, // Cache GeoIP for 1 hour
          });

          if (!geoRes.ok) return null;

          const geo = await geoRes.json();
          if (!geo.success || !geo.country_code) return null;

          return {
            ip,
            count,
            country: geo.country as string,
            countryCode: geo.country_code as string,
            latitude: geo.latitude as number,
            longitude: geo.longitude as number,
          };
        })
      );

      for (const result of settled) {
        if (result.status === "fulfilled" && result.value !== null) {
          geoResults.push(result.value);
        }
      }
    }

    // Step 3: Aggregate by country
    const countryMap = new Map<string, CountryAttackData>();

    for (const r of geoResults) {
      const existing = countryMap.get(r.countryCode);
      if (existing) {
        existing.count += r.count;
        if (existing.topIPs.length < 3) existing.topIPs.push(r.ip);
      } else {
        countryMap.set(r.countryCode, {
          countryCode: r.countryCode,
          country: r.country,
          count: r.count,
          latitude: r.latitude,
          longitude: r.longitude,
          topIPs: [r.ip],
        });
      }
    }

    const data = Array.from(countryMap.values()).sort((a, b) => b.count - a.count);

    return NextResponse.json({ status: "ok", data });
  } catch (error) {
    console.error("[/api/executive/attack-heatmap] Error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to generate attack heatmap" },
      { status: 500 }
    );
  }
}
