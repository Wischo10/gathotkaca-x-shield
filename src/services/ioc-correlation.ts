import "server-only";
import { getDb } from "@/lib/db";
import { HttpError } from "@/lib/http";
import { normalizePublicIpv4 } from "@/lib/ip-ioc";
import { checkIpWithAbuseIpDb } from "@/services/abuseipdb";
import { getIpIocCandidates } from "@/services/wazuh-indexer";
import type { AttackCountryDetection, TopIocDetection, WazuhIpIocCandidate } from "@/types/soc";

const ENRICHMENT_TTL_MS = 24 * 60 * 60 * 1000;

export interface IocCorrelationRunResult {
  wazuhCandidatesReturned: number;
  publicIpv4Accepted: number;
  rejectedPrivateReserved: number;
  freshCacheSkipped: number;
  abuseIpDbRequests: number;
  confirmedMalicious: number;
  notConfirmed: number;
  enrichmentErrors: number;
  databaseRows: number;
}

interface CachedCorrelation {
  correlation_status: string;
  enriched_at: Date | string | null;
}

function mergeCandidates(candidates: WazuhIpIocCandidate[]): { accepted: WazuhIpIocCandidate[]; rejected: number } {
  const merged = new Map<string, WazuhIpIocCandidate>();
  let rejected = 0;
  for (const candidate of candidates) {
    const ip = normalizePublicIpv4(candidate.ip);
    if (!ip) { rejected++; continue; }
    const current = merged.get(ip);
    if (!current) { merged.set(ip, { ...candidate, ip }); continue; }
    current.observationCount += candidate.observationCount;
    if (candidate.firstObserved < current.firstObserved) current.firstObserved = candidate.firstObserved;
    if (candidate.lastObserved > current.lastObserved) current.lastObserved = candidate.lastObserved;
    current.representativeRuleIds = [...new Set([...current.representativeRuleIds, ...candidate.representativeRuleIds])].slice(0, 5);
  }
  return { accepted: [...merged.values()], rejected };
}

function errorCode(error: unknown): string {
  if (error instanceof HttpError) return error.kind;
  return "invalid_response";
}

export async function runIpIocCorrelation(maxProviderRequests = 10): Promise<IocCorrelationRunResult> {
  const now = new Date();
  const windowEnd = now.toISOString();
  const windowStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const candidates = await getIpIocCandidates(windowStart, windowEnd, 100);
  const { accepted, rejected } = mergeCandidates(candidates);
  const counts: IocCorrelationRunResult = {
    wazuhCandidatesReturned: candidates.length, publicIpv4Accepted: accepted.length,
    rejectedPrivateReserved: rejected, freshCacheSkipped: 0, abuseIpDbRequests: 0,
    confirmedMalicious: 0, notConfirmed: 0, enrichmentErrors: 0, databaseRows: 0,
  };
  const db = getDb();

  for (const candidate of accepted) {
    const cached = (await db.query<CachedCorrelation>(
      `SELECT correlation_status, enriched_at FROM ioc_correlations
       WHERE indicator_type = 'ip' AND indicator_value = $1 AND ti_provider = 'abuseipdb'`, [candidate.ip]
    )).rows[0];
    const enrichedAt = cached?.enriched_at ? new Date(cached.enriched_at).getTime() : NaN;
    const isFreshSuccess = (cached?.correlation_status === "confirmed_malicious" || cached?.correlation_status === "not_confirmed")
      && Number.isFinite(enrichedAt) && now.getTime() - enrichedAt < ENRICHMENT_TTL_MS;
    if (isFreshSuccess) {
      await db.query(
        `UPDATE ioc_correlations SET wazuh_observation_count = $2, wazuh_first_observed_at = $3,
         wazuh_last_observed_at = $4, wazuh_rule_ids = $5, source_window_start = $6,
         source_window_end = $7, updated_at = $8
         WHERE indicator_type = 'ip' AND indicator_value = $1 AND ti_provider = 'abuseipdb'`,
        [candidate.ip, candidate.observationCount, candidate.firstObserved, candidate.lastObserved,
          candidate.representativeRuleIds, windowStart, windowEnd, now]
      );
      counts.freshCacheSkipped++;
      continue;
    }
    if (counts.abuseIpDbRequests >= Math.min(Math.max(maxProviderRequests, 0), 100)) continue;

    counts.abuseIpDbRequests++;
    try {
      const result = await checkIpWithAbuseIpDb(candidate.ip);
      await db.query(
        `INSERT INTO ioc_correlations
         (indicator_type, indicator_value, wazuh_observation_count, wazuh_first_observed_at,
          wazuh_last_observed_at, wazuh_rule_ids, source_window_start, source_window_end,
          ti_provider, provider_verdict, provider_evidence, enriched_at, correlation_status,
          last_error_code, last_error_at, updated_at)
         VALUES ('ip', $1, $2, $3, $4, $5, $6, $7, 'abuseipdb', $8, $9::jsonb, $10, $8, NULL, NULL, $10)
         ON CONFLICT (indicator_type, indicator_value, ti_provider) DO UPDATE SET
          wazuh_observation_count = EXCLUDED.wazuh_observation_count,
          wazuh_first_observed_at = EXCLUDED.wazuh_first_observed_at,
          wazuh_last_observed_at = EXCLUDED.wazuh_last_observed_at,
          wazuh_rule_ids = EXCLUDED.wazuh_rule_ids,
          source_window_start = EXCLUDED.source_window_start,
          source_window_end = EXCLUDED.source_window_end,
          provider_verdict = EXCLUDED.provider_verdict,
          provider_evidence = EXCLUDED.provider_evidence,
          enriched_at = EXCLUDED.enriched_at,
          correlation_status = EXCLUDED.correlation_status,
          last_error_code = NULL, last_error_at = NULL, updated_at = EXCLUDED.updated_at`,
        [candidate.ip, candidate.observationCount, candidate.firstObserved, candidate.lastObserved,
          candidate.representativeRuleIds, windowStart, windowEnd, result.verdict,
          JSON.stringify(result.evidence), now]
      );
      if (result.verdict === "confirmed_malicious") counts.confirmedMalicious++;
      else counts.notConfirmed++;
    } catch (error) {
      const code = errorCode(error);
      await db.query(
        `INSERT INTO ioc_correlations
         (indicator_type, indicator_value, wazuh_observation_count, wazuh_first_observed_at,
          wazuh_last_observed_at, wazuh_rule_ids, source_window_start, source_window_end,
          ti_provider, provider_verdict, provider_evidence, correlation_status, last_error_code, last_error_at, updated_at)
         VALUES ('ip', $1, $2, $3, $4, $5, $6, $7, 'abuseipdb', 'enrichment_error', '{}'::jsonb,
          'enrichment_error', $8, $9, $9)
         ON CONFLICT (indicator_type, indicator_value, ti_provider) DO UPDATE SET
          wazuh_observation_count = EXCLUDED.wazuh_observation_count,
          wazuh_first_observed_at = EXCLUDED.wazuh_first_observed_at,
          wazuh_last_observed_at = EXCLUDED.wazuh_last_observed_at,
          wazuh_rule_ids = EXCLUDED.wazuh_rule_ids,
          source_window_start = EXCLUDED.source_window_start,
          source_window_end = EXCLUDED.source_window_end,
          correlation_status = 'enrichment_error', last_error_code = EXCLUDED.last_error_code,
          last_error_at = EXCLUDED.last_error_at, updated_at = EXCLUDED.updated_at`,
        [candidate.ip, candidate.observationCount, candidate.firstObserved, candidate.lastObserved,
          candidate.representativeRuleIds, windowStart, windowEnd, code, now]
      );
      counts.enrichmentErrors++;
      if (error instanceof HttpError && error.kind === "rate_limit") break;
    }
  }
  counts.databaseRows = Number((await db.query(`SELECT COUNT(*)::int AS count FROM ioc_correlations`)).rows[0]?.count ?? 0);
  return counts;
}

export async function getTopIocDetections(): Promise<TopIocDetection[]> {
  const result = await getDb().query<{
    indicator_value: string; wazuh_observation_count: string | number;
    enriched_at: Date | string; wazuh_last_observed_at: Date | string;
  }>(
    `SELECT indicator_value, wazuh_observation_count, enriched_at, wazuh_last_observed_at
     FROM ioc_correlations
     WHERE indicator_type = 'ip' AND ti_provider = 'abuseipdb'
       AND correlation_status = 'confirmed_malicious'
       AND wazuh_last_observed_at >= NOW() - INTERVAL '7 days'
     ORDER BY wazuh_observation_count DESC LIMIT 10`
  );
  return result.rows.map((row) => ({
    iocValue: row.indicator_value, type: "IP", detectionCount: Number(row.wazuh_observation_count),
    provider: "abuseipdb", enrichedAt: new Date(row.enriched_at).toISOString(),
    lastObservedAt: new Date(row.wazuh_last_observed_at).toISOString(),
  }));
}

export interface CountryBackfillResult {
  candidates: number;
  providerRequests: number;
  rowsUpdated: number;
  rowsWithCountry: number;
  errors: number;
}

/** Bounded repair for already-confirmed rows whose original evidence predated country persistence. */
export async function backfillConfirmedIocCountries(limit = 10): Promise<CountryBackfillResult> {
  const boundedLimit = Math.min(Math.max(Math.trunc(limit), 0), 10);
  const db = getDb();
  const candidates = (await db.query<{ indicator_value: string }>(
    `SELECT indicator_value FROM ioc_correlations
     WHERE indicator_type = 'ip' AND ti_provider = 'abuseipdb'
       AND correlation_status = 'confirmed_malicious'
       AND wazuh_last_observed_at >= NOW() - INTERVAL '7 days'
       AND NULLIF(provider_evidence->>'countryCode', '') IS NULL
     ORDER BY wazuh_observation_count DESC LIMIT $1`, [boundedLimit]
  )).rows;
  const result: CountryBackfillResult = {
    candidates: candidates.length, providerRequests: 0, rowsUpdated: 0, rowsWithCountry: 0, errors: 0,
  };
  for (const candidate of candidates) {
    result.providerRequests++;
    try {
      const enrichment = await checkIpWithAbuseIpDb(candidate.indicator_value);
      await db.query(
        `UPDATE ioc_correlations SET provider_verdict = $2, provider_evidence = $3::jsonb,
         enriched_at = $4, correlation_status = $2, last_error_code = NULL,
         last_error_at = NULL, updated_at = $4
         WHERE indicator_type = 'ip' AND indicator_value = $1 AND ti_provider = 'abuseipdb'`,
        [candidate.indicator_value, enrichment.verdict, JSON.stringify(enrichment.evidence), new Date()]
      );
      result.rowsUpdated++;
      if (enrichment.evidence.countryCode) result.rowsWithCountry++;
    } catch (error) {
      result.errors++;
      if (error instanceof HttpError && error.kind === "rate_limit") break;
    }
  }
  return result;
}

/** PostgreSQL-only attack-country read model; no provider or Wazuh access. */
export async function getAttackCountryDetections(): Promise<AttackCountryDetection[]> {
  const rows = (await getDb().query<{ country_code: string; detection_count: string | number }>(
    `SELECT provider_evidence->>'countryCode' AS country_code,
            SUM(wazuh_observation_count)::bigint AS detection_count
     FROM ioc_correlations
     WHERE indicator_type = 'ip' AND ti_provider = 'abuseipdb'
       AND correlation_status = 'confirmed_malicious'
       AND wazuh_last_observed_at >= NOW() - INTERVAL '7 days'
       AND provider_evidence->>'countryCode' ~ '^[A-Z]{2}$'
     GROUP BY provider_evidence->>'countryCode'
     ORDER BY detection_count DESC`
  )).rows;
  return rows.map((row) => ({
    countryCode: row.country_code,
    countryName: null,
    detectionCount: Number(row.detection_count),
  }));
}
