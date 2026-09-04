import "server-only";
import { env } from "@/lib/env";
import { fetchJson } from "@/lib/http";
import type {
  ThreatIntelligenceOverviewData,
  ThreatCategoryItem,
  ProviderHealth,
} from "@/types/threat-intel";

interface ThreatFoxIOC {
  id: string;
  ioc: string;
  threat_type: string;
  threat_type_desc?: string;
  ioc_type: string;
  ioc_type_desc?: string;
  malware?: string;
  malware_printable?: string;
  confidence_level?: number;
  first_seen?: string;
  tags?: string[] | null;
}

interface ThreatFoxResponse {
  query_status: string;
  data?: ThreatFoxIOC[];
}

interface AbuseIpDbResponse {
  data?: {
    ipAddress?: string;
    abuseConfidenceScore?: number;
    totalReports?: number;
  };
}

interface VirusTotalResponse {
  data?: {
    id?: string;
    type?: string;
    attributes?: {
      last_analysis_stats?: {
        malicious: number;
        suspicious: number;
        undetected: number;
        harmless: number;
      };
    };
  };
}

// In-memory cache to strictly avoid exhausting API rate limits
interface CacheEntry {
  data: ThreatIntelligenceOverviewData;
  timestamp: number;
}

let cachedData: CacheEntry | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function getThreatIntelligenceOverview(): Promise<ThreatIntelligenceOverviewData> {
  const now = Date.now();
  if (
    cachedData &&
    cachedData.data.kpis.totalIocs > 0 &&
    now - cachedData.timestamp < CACHE_TTL_MS
  ) {
    return cachedData.data;
  }

  const threatFoxKey = env.threatIntel.threatFoxApiKey();
  const abuseIpDbKey = env.threatIntel.abuseIpDbApiKey();
  const virusTotalKey = env.threatIntel.virusTotalApiKey();

  const providerHealth: Record<string, ProviderHealth> = {
    threatFox: { name: "ThreatFox (abuse.ch)", status: "error", detail: "Not reachable" },
    abuseIpDb: { name: "AbuseIPDB", status: "error", detail: "Not reachable" },
    virusTotal: { name: "VirusTotal", status: "error", detail: "Not reachable" },
  };

  let iocs: ThreatFoxIOC[] = [];

  // 1. Fetch ThreatFox (Primary Feed)
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (threatFoxKey) {
      headers["Auth-Key"] = threatFoxKey;
    }

    const response = await fetchJson<ThreatFoxResponse>("https://threatfox-api.abuse.ch/api/v1/", {
      method: "POST",
      headers,
      body: JSON.stringify({ query: "get_iocs", days: 7 }),
      timeoutMs: 25000,
    });

    if (response.query_status === "ok" && Array.isArray(response.data)) {
      iocs = response.data;
      providerHealth.threatFox = {
        name: "ThreatFox",
        status: "ok",
        detail: `${iocs.length} IOCs loaded (7d)`,
      };
    } else {
      providerHealth.threatFox = {
        name: "ThreatFox",
        status: "degraded",
        detail: response.query_status || "No data returned",
      };
    }
  } catch (err) {
    // If we have previously cached data, return that instead of failing completely
    if (cachedData && cachedData.data.kpis.totalIocs > 0) {
      return cachedData.data;
    }
    providerHealth.threatFox = {
      name: "ThreatFox",
      status: "error",
      detail: "Failed to connect to ThreatFox API",
    };
  }

  // 2. Perform Real Aggregations
  const totalIocs = iocs.length;
  let c2BotnetCount = 0;
  let highConfidenceCount = 0;
  let maliciousIpsCount = 0;
  let maliciousHashesCount = 0;
  let maliciousDomainsCount = 0;

  const malwareCounts: Record<string, number> = {};
  const threatTypeCounts: Record<string, number> = {};
  const iocTypeCounts: Record<string, number> = {};

  const sampleIps: string[] = [];
  const sampleHashes: string[] = [];

  // Trend window calculation: 3.5 days current vs 3.5 days prior
  const halfWindowMs = 3.5 * 24 * 60 * 60 * 1000;
  const fullWindowMs = 7 * 24 * 60 * 60 * 1000;
  let currentPeriodIocs = 0;
  let prevPeriodIocs = 0;
  let currentPeriodC2 = 0;
  let prevPeriodC2 = 0;

  for (const item of iocs) {
    // IOC Type classification
    if (item.ioc_type === "ip:port" || item.ioc_type === "ip") {
      maliciousIpsCount++;
      iocTypeCounts["Malicious IP"] = (iocTypeCounts["Malicious IP"] || 0) + 1;
      const cleanIp = item.ioc.split(":")[0];
      if (cleanIp && sampleIps.length < 3 && !sampleIps.includes(cleanIp)) {
        sampleIps.push(cleanIp);
      }
    } else if (item.ioc_type.includes("hash") || item.ioc_type === "sha256_hash" || item.ioc_type === "md5_hash" || item.ioc_type === "sha1_hash") {
      maliciousHashesCount++;
      iocTypeCounts["File Hashes"] = (iocTypeCounts["File Hashes"] || 0) + 1;
      if (sampleHashes.length < 2) {
        sampleHashes.push(item.ioc);
      }
    } else if (item.ioc_type === "domain" || item.ioc_type === "url") {
      maliciousDomainsCount++;
      iocTypeCounts["Domains & URLs"] = (iocTypeCounts["Domains & URLs"] || 0) + 1;
    } else {
      const typeLabel = item.ioc_type_desc || item.ioc_type || "Other";
      iocTypeCounts[typeLabel] = (iocTypeCounts[typeLabel] || 0) + 1;
    }

    // Threat Type classification
    if (item.threat_type === "botnet_cc") {
      c2BotnetCount++;
      threatTypeCounts["Botnet / C2 Server"] = (threatTypeCounts["Botnet / C2 Server"] || 0) + 1;
    } else if (item.threat_type === "payload_delivery") {
      threatTypeCounts["Payload Delivery"] = (threatTypeCounts["Payload Delivery"] || 0) + 1;
    } else if (item.threat_type === "payload") {
      threatTypeCounts["Malware Payload"] = (threatTypeCounts["Malware Payload"] || 0) + 1;
    } else {
      const label = item.threat_type_desc || item.threat_type || "Other Threat";
      threatTypeCounts[label] = (threatTypeCounts[label] || 0) + 1;
    }

    // Malware family classification
    const malwareName = item.malware_printable?.trim();
    if (malwareName && malwareName !== "Unknown malware" && malwareName !== "Unknown") {
      malwareCounts[malwareName] = (malwareCounts[malwareName] || 0) + 1;
    }

    // High confidence
    if ((item.confidence_level ?? 0) >= 75) {
      highConfidenceCount++;
    }

    // Trend timestamp evaluation
    if (item.first_seen) {
      const ts = new Date(item.first_seen.replace(" UTC", "Z").replace(" ", "T")).getTime();
      const age = now - ts;
      if (age <= halfWindowMs) {
        currentPeriodIocs++;
        if (item.threat_type === "botnet_cc") currentPeriodC2++;
      } else if (age <= fullWindowMs) {
        prevPeriodIocs++;
        if (item.threat_type === "botnet_cc") prevPeriodC2++;
      }
    }
  }

  // Trend calculations
  let totalIocsTrendPct: number | null = null;
  if (prevPeriodIocs > 0) {
    totalIocsTrendPct = Math.round(((currentPeriodIocs - prevPeriodIocs) / prevPeriodIocs) * 100);
  }

  let c2TrendPct: number | null = null;
  if (prevPeriodC2 > 0) {
    c2TrendPct = Math.round(((currentPeriodC2 - prevPeriodC2) / prevPeriodC2) * 100);
  }

  const malwareCampaignsCount = Object.keys(malwareCounts).length;

  // Format Top Malware Breakdown
  const topMalware: ThreatCategoryItem[] = Object.entries(malwareCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalIocs > 0 ? Math.round((count / totalIocs) * 100) : 0,
    }));

  // Format Top Threat Types Breakdown
  const topThreatTypes: ThreatCategoryItem[] = Object.entries(threatTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalIocs > 0 ? Math.round((count / totalIocs) * 100) : 0,
    }));

  // Format IOC Type Distribution
  const iocTypeDistribution: ThreatCategoryItem[] = Object.entries(iocTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalIocs > 0 ? Math.round((count / totalIocs) * 100) : 0,
    }));

  // 3. AbuseIPDB Enrichment (Sample check to verify provider connectivity & health)
  if (abuseIpDbKey) {
    try {
      const ipToCheck = sampleIps[0] || "118.25.6.39";
      const abuseRes = await fetchJson<AbuseIpDbResponse>(
        `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ipToCheck)}&maxAgeInDays=90`,
        {
          headers: {
            Key: abuseIpDbKey,
            Accept: "application/json",
          },
          timeoutMs: 6000,
        }
      );
      if (abuseRes.data) {
        providerHealth.abuseIpDb = {
          name: "AbuseIPDB",
          status: "ok",
          detail: `Enrichment Active (Checked IP ${abuseRes.data.ipAddress})`,
        };
      }
    } catch {
      providerHealth.abuseIpDb = {
        name: "AbuseIPDB",
        status: "degraded",
        detail: "Enrichment request timed out or throttled",
      };
    }
  } else {
    providerHealth.abuseIpDb = {
      name: "AbuseIPDB",
      status: "degraded",
      detail: "API key not configured",
    };
  }

  // 4. VirusTotal Enrichment (Targeted single sample check to protect the 4 req/min limit)
  if (virusTotalKey) {
    try {
      const ipToCheck = sampleIps[0] || "1.1.1.1";
      const vtRes = await fetchJson<VirusTotalResponse>(
        `https://www.virustotal.com/api/v3/ip_addresses/${encodeURIComponent(ipToCheck)}`,
        {
          headers: {
            "x-apikey": virusTotalKey,
            Accept: "application/json",
          },
          timeoutMs: 6000,
        }
      );
      if (vtRes.data?.attributes?.last_analysis_stats) {
        providerHealth.virusTotal = {
          name: "VirusTotal",
          status: "ok",
          detail: "Validation Active (Sample checked)",
        };
      }
    } catch {
      providerHealth.virusTotal = {
        name: "VirusTotal",
        status: "degraded",
        detail: "Validation request timed out or rate-limited",
      };
    }
  } else {
    providerHealth.virusTotal = {
      name: "VirusTotal",
      status: "degraded",
      detail: "API key not configured",
    };
  }

  const result: ThreatIntelligenceOverviewData = {
    period: "7d",
    updatedAt: new Date().toISOString(),
    kpis: {
      totalIocs,
      totalIocsTrendPct,
      c2BotnetCount,
      c2TrendPct,
      malwareCampaignsCount,
      highConfidenceCount,
      maliciousIpsCount,
      maliciousHashesCount,
      maliciousDomainsCount,
    },
    topMalware,
    topThreatTypes,
    iocTypeDistribution,
    providers: {
      threatFox: providerHealth.threatFox,
      abuseIpDb: providerHealth.abuseIpDb,
      virusTotal: providerHealth.virusTotal,
    },
  };

  if (result.kpis.totalIocs > 0 || !cachedData) {
    cachedData = {
      data: result,
      timestamp: now,
    };
  }

  return result;
}
