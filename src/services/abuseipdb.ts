import "server-only";
import { env } from "@/lib/env";
import { fetchJson } from "@/lib/http";

const MAX_AGE_IN_DAYS = 90;

interface AbuseIpDbResponse {
  data?: {
    ipAddress?: unknown;
    isPublic?: unknown;
    isWhitelisted?: unknown;
    abuseConfidenceScore?: unknown;
    totalReports?: unknown;
    numDistinctUsers?: unknown;
    lastReportedAt?: unknown;
    countryCode?: unknown;
  };
}

export interface AbuseIpDbEvidence {
  abuseConfidenceScore: number;
  totalReports: number;
  numDistinctUsers: number;
  lastReportedAt: string | null;
  isPublic: boolean;
  isWhitelisted: boolean | null;
  maxAgeInDays: 90;
  countryCode: string | null;
}

export interface AbuseIpDbResult {
  verdict: "confirmed_malicious" | "not_confirmed";
  evidence: AbuseIpDbEvidence;
}

export async function checkIpWithAbuseIpDb(normalizedIp: string): Promise<AbuseIpDbResult> {
  const apiKey = env.threatIntel.abuseIpDbApiKey();
  if (!apiKey) throw new Error("ABUSEIPDB_API_KEY is not configured");
  const params = new URLSearchParams({ ipAddress: normalizedIp, maxAgeInDays: String(MAX_AGE_IN_DAYS) });
  const response = await fetchJson<AbuseIpDbResponse>(
    `https://api.abuseipdb.com/api/v2/check?${params.toString()}`,
    { headers: { Accept: "application/json", Key: apiKey } }
  );
  const data = response.data;
  if (!data || typeof data.ipAddress !== "string" || typeof data.isPublic !== "boolean"
    || typeof data.abuseConfidenceScore !== "number" || !Number.isFinite(data.abuseConfidenceScore)
    || typeof data.totalReports !== "number" || !Number.isFinite(data.totalReports)
    || typeof data.numDistinctUsers !== "number" || !Number.isFinite(data.numDistinctUsers)
    || !(data.isWhitelisted === null || typeof data.isWhitelisted === "boolean")
    || !(data.countryCode === null || typeof data.countryCode === "string")
    || !(data.lastReportedAt === null || typeof data.lastReportedAt === "string")) {
    throw new Error("AbuseIPDB returned an invalid response schema");
  }
  const validLastReportedAt = typeof data.lastReportedAt === "string"
    && data.lastReportedAt.length > 0 && Number.isFinite(Date.parse(data.lastReportedAt));
  const evidence: AbuseIpDbEvidence = {
    abuseConfidenceScore: data.abuseConfidenceScore,
    totalReports: data.totalReports,
    numDistinctUsers: data.numDistinctUsers,
    lastReportedAt: validLastReportedAt ? data.lastReportedAt : null,
    isPublic: data.isPublic,
    isWhitelisted: data.isWhitelisted,
    maxAgeInDays: MAX_AGE_IN_DAYS,
    countryCode: typeof data.countryCode === "string" && /^[A-Za-z]{2}$/.test(data.countryCode)
      ? data.countryCode.toUpperCase() : null,
  };
  const confirmed = data.ipAddress === normalizedIp && data.isPublic === true
    && data.abuseConfidenceScore >= 75 && data.totalReports > 0 && validLastReportedAt;
  return { verdict: confirmed ? "confirmed_malicious" : "not_confirmed", evidence };
}
