import "server-only";
import https from "node:https";
import { env } from "@/lib/env";
import { getComplianceOverview } from "@/services/compliance-service";
import { calculateRealIncidentKpis } from "@/services/incident-lifecycle-service";
import { getNistPostureAssessment } from "@/services/nist-posture-service";
import { listRisks } from "@/services/risk-register-service";
import { summarizeTotalRisk, summarizeTreatmentProgress } from "@/lib/risk-ranking";
import { type CisoMetricsData, type MetricCardValue, type VulnerabilitySlaOverview, type IncidentKpiOverview, type IncidentKpiItem } from "@/types/ciso";

const httpsAgent = new https.Agent({
  rejectUnauthorized: !env.wazuh.allowSelfSigned(),
});

function indexerAuthHeader(): string {
  const token = Buffer.from(
    `${env.wazuhIndexer.username()}:${env.wazuhIndexer.password()}`
  ).toString("base64");
  return `Basic ${token}`;
}

function bitdefenderAuthHeader(): string {
  const token = Buffer.from(`${env.bitdefender.apiKey()}:`).toString("base64");
  return `Basic ${token}`;
}

export function fetchOpenSearch<T>(
  url: string,
  body: object,
  timeoutMs = 15000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const postData = JSON.stringify(body);

    const req = https.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 9200,
        path: parsedUrl.pathname + parsedUrl.search,
        method: "POST",
        headers: {
          Authorization: indexerAuthHeader(),
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
        agent: httpsAgent,
        timeout: timeoutMs,
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(raw) as T);
            } catch (err) {
              reject(err);
            }
          } else {
            reject(new Error(`OpenSearch error status ${res.statusCode}: ${raw}`));
          }
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error(`OpenSearch query timed out after ${timeoutMs}ms`));
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

type BitdefenderActiveIncidentState = {
  cached: { total: number; timestamp: number } | null;
  inFlight: Promise<{ total: number; timestamp: number }> | null;
};

// Route handlers can load this module through separate Next.js bundles. Keep the
// short-lived authoritative result and its in-flight request process-wide so the
// metrics and AI routes do not race duplicate calls into Bitdefender's rate limit.
const bitdefenderStateHost = globalThis as typeof globalThis & {
  __cisoBitdefenderActiveIncidentState?: BitdefenderActiveIncidentState;
};
const bitdefenderActiveIncidentState = bitdefenderStateHost.__cisoBitdefenderActiveIncidentState
  ??= { cached: null, inFlight: null };
const BITDEFENDER_CACHE_TTL_MS = 60 * 1000; // 1 minute cache to respect 3 req/60s limit

// Used only by the two executive source counts. Never expose credentials or raw payloads.
function unavailableCount(source: string, error: unknown): MetricCardValue {
  const detail = error instanceof Error ? error.message : "";
  const code = /timed out|timeout/i.test(detail) ? "timeout"
    : /partial/i.test(detail) ? "partial_result"
    : /Missing required environment variable/i.test(detail) ? "configuration"
    : /Invalid|aggregation/i.test(detail) ? "invalid_response" : "upstream_error";
  const message = code === "timeout" ? "Source request timed out."
    : code === "partial_result" ? "Source returned incomplete search results."
    : code === "configuration" ? "Required source configuration is missing."
    : code === "invalid_response" ? "Source did not return a valid count."
    : "Source request failed; check the server logs for details.";
  console.warn(`[CISO Metrics] ${source}:`, detail);
  return {
    value: null, trend30d: null, trendAvailable: false,
    source: `${source} (Unavailable)`,
    availability: {
      status: "unavailable", checkedAt: new Date().toISOString(), fetchedAt: null,
      cached: false, error: { code, message },
    },
  };
}

/**
 * 1. Active Incidents from Bitdefender GravityZone API
 */
async function getBitdefenderActiveIncidents(): Promise<MetricCardValue> {
  const now = Date.now();
  const cachedBitdefender = bitdefenderActiveIncidentState.cached;
  if (cachedBitdefender && now - cachedBitdefender.timestamp < BITDEFENDER_CACHE_TTL_MS) {
    return {
      value: cachedBitdefender.total,
      trend30d: null,
      trendAvailable: false,
      source: "Bitdefender GravityZone Incidents API (Cached)",
      availability: {
        status: "available", checkedAt: new Date(now).toISOString(),
        fetchedAt: new Date(cachedBitdefender.timestamp).toISOString(), cached: true,
      },
      details: {
        current: cachedBitdefender.total,
        previous30d: null,
        explanation: "Historical snapshot not stored for Bitdefender incidents",
      },
    };
  }

  try {
    const fetchCurrentCount = async () => {
    const postData = JSON.stringify({
      jsonrpc: "2.0",
      id: "1",
      method: "getIncidentsList",
      params: {
        filters: {
          status: ["open", "in_progress"],
        },
      },
    });

    const parsedUrl = new URL(env.bitdefender.apiUrl());

    const result = await new Promise<{ total: number }>((resolve, reject) => {
      const req = https.request(
        {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || 443,
          path: parsedUrl.pathname + parsedUrl.search,
          method: "POST",
          headers: {
            Authorization: bitdefenderAuthHeader(),
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData),
          },
          timeout: 10000,
        },
        (res) => {
          let raw = "";
          res.on("data", (chunk) => (raw += chunk));
          res.on("end", () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                const parsed = JSON.parse(raw);
                if (!parsed.error && typeof parsed.result?.total === "number"
                  && Number.isInteger(parsed.result.total) && parsed.result.total >= 0) {
                  resolve({ total: parsed.result.total });
                } else {
                  reject(new Error(parsed.error?.message || "Invalid Bitdefender response"));
                }
              } catch (err) {
                reject(err);
              }
            } else {
              reject(new Error(`Bitdefender HTTP error ${res.statusCode}: ${raw}`));
            }
          });
        }
      );

      req.on("timeout", () => {
        req.destroy(new Error("Bitdefender request timed out"));
      });
      req.on("error", (err) => reject(err));
      req.write(postData);
      req.end();
    });

      return { total: result.total, timestamp: Date.now() };
    };

    const existingRequest = bitdefenderActiveIncidentState.inFlight;
    const request = existingRequest ?? fetchCurrentCount();
    if (!existingRequest) {
      bitdefenderActiveIncidentState.inFlight = request;
      void request.finally(() => {
        if (bitdefenderActiveIncidentState.inFlight === request) bitdefenderActiveIncidentState.inFlight = null;
      }).catch(() => undefined);
    }
    const result = await request;
    bitdefenderActiveIncidentState.cached = result;

    return {
      value: result.total,
      trend30d: null,
      trendAvailable: false,
      source: "Bitdefender GravityZone Incidents API",
      availability: {
        status: "available", checkedAt: new Date().toISOString(),
        fetchedAt: new Date(result.timestamp).toISOString(), cached: existingRequest !== null,
      },
      details: {
        current: result.total,
        previous30d: null,
        explanation: "Historical snapshot not stored for Bitdefender incidents",
      },
    };
  } catch (err) {
    // Expired data is never a substitute for a failed current request.
    return unavailableCount("Bitdefender GravityZone Incidents API", err);
  }
}

/**
 * 2. Critical Vulnerabilities from OpenSearch (wazuh-states-vulnerabilities-*)
 * Definition is always unique critical CVEs; findings remain supporting metadata.
 */
async function getCriticalVulnerabilities(totalRegisteredAssets?: number): Promise<MetricCardValue & { affectedAssetsCount?: number; totalFindingsCount?: number }> {
  try {
    const vulnIndex = env.wazuhIndexer.vulnerabilityIndex();
    const query = {
      size: 0,
      track_total_hits: true,
      query: {
        term: {
          "vulnerability.severity": "Critical",
        },
      },
      aggs: {
        unique_cves: {
          cardinality: {
            field: "vulnerability.id",
          },
        },
        affected_assets: {
          cardinality: {
            field: "agent.id",
          },
        },
      },
    };

    const res = await fetchOpenSearch<{
      timed_out?: boolean;
      _shards?: { failed: number };
      hits: { total: { value: number } };
      aggregations?: {
        unique_cves?: { value: number };
        affected_assets?: { value: number };
      };
    }>(`${env.wazuhIndexer.url().replace(/\/$/, "")}/${vulnIndex}/_search`, query, 15000);

    if (res.timed_out) throw new Error("OpenSearch query timed out");
    if (res._shards?.failed !== 0) throw new Error("OpenSearch partial shard results");
    const uniqueCves = res.aggregations?.unique_cves?.value;
    if (typeof uniqueCves !== "number" || !Number.isInteger(uniqueCves) || uniqueCves < 0) {
      throw new Error("Invalid unique-CVE aggregation");
    }
    const totalFindings = res.hits?.total?.value;
    // Preserve the existing technical exposure binding; missing values stay unavailable.
    const exposureCount = res.aggregations?.affected_assets?.value;
    const affectedAssets = !res.timed_out && res._shards?.failed === 0
      && typeof exposureCount === "number" && Number.isInteger(exposureCount) && exposureCount >= 0
      ? exposureCount : undefined;
    const fetchedAt = new Date().toISOString();
    return {
      value: uniqueCves,
      trend30d: null,
      trendAvailable: false,
      source: `OpenSearch: ${uniqueCves} unique critical CVEs (${vulnIndex})`,
      availability: { status: "available", checkedAt: fetchedAt, fetchedAt, cached: false },
      affectedAssetsCount: affectedAssets,
      totalFindingsCount: totalFindings,
      details: {
        current: uniqueCves,
        previous30d: null,
        explanation: "Unique critical vulnerability.id cardinality from current vulnerability state; no historical snapshots. Raw findings never substitute for CVEs.",
        criticalAffectedAssets: affectedAssets,
        totalAssets: totalRegisteredAssets,
        criticalFindings: totalFindings,
        uniqueCriticalCVEs: uniqueCves,
      },
    };
  } catch (err) {
    return unavailableCount("OpenSearch Vulnerabilities", err);
  }
}

/**
 * 3. Compliance Score: Derived dynamically from compliance service
 * Calculates average of formal assessed framework scores only.
 * Observation-only telemetry such as MITRE breadth is not compliance.
 */
async function getOverallComplianceScore(): Promise<MetricCardValue> {
  try {
    const overview = await getComplianceOverview();
    const assessedFrameworks = overview.frameworks.filter(
      (f) => f.metricKind !== "telemetry_observation"
        && typeof f.score === "number" && f.score !== null
    );

    if (assessedFrameworks.length === 0) {
      return {
        value: null,
        trend30d: null,
        trendAvailable: false,
        unit: "%",
        source: "Compliance Service (No frameworks assessed)",
      };
    }

    const sumScore = assessedFrameworks.reduce((acc, f) => acc + (f.score ?? 0), 0);
    const avgScore = Math.round(sumScore / assessedFrameworks.length);

    // Collect valid trend30d values
    const validTrends = assessedFrameworks
      .map((f) => f.trend30d)
      .filter((t): t is number => typeof t === "number" && t !== null);

    const trend30d = validTrends.length > 0
      ? Math.round(validTrends.reduce((a, b) => a + b, 0) / validTrends.length)
      : null;

    // Collect previous scores if available
    const prevScores = assessedFrameworks
      .map((f) => f.previousScore)
      .filter((p): p is number => typeof p === "number" && p !== null);

    const previous30d = prevScores.length > 0
      ? Math.round(prevScores.reduce((a, b) => a + b, 0) / prevScores.length)
      : null;

    return {
      value: avgScore,
      trend30d,
      trendAvailable: trend30d !== null,
      unit: "%",
      source: `Formal Compliance Assessments (${assessedFrameworks.map((f) => f.name).join(", ")})`,
      details: {
        current: avgScore,
        previous30d: trend30d !== null ? previous30d : null,
        explanation: "Average of formal assessed framework scores only; observation-only telemetry is excluded.",
      },
    };
  } catch (err) {
    console.warn("[CISO Metrics] Compliance score failed:", err instanceof Error ? err.message : err);
    return {
      value: null,
      trend30d: null,
      trendAvailable: false,
      unit: "%",
      source: "Compliance Service (Unavailable)",
    };
  }
}

import { getAgentsSummary, type AgentsSummary } from "@/services/wazuh-manager";
import type { PostureComponent } from "@/types/ciso";

/**
 * Policy Configurations for Security Posture Scoring
 * 
 * Note: These scoring weights and penalty coefficients are application policy rules,
 * not formal ISO/NIST certification standards.
 */
export const POSTURE_SCORING_POLICY = {
  weights: {
    endpointVisibility: 0.25,
    vulnerabilitySurface: 0.25,
    incidentContainment: 0.25,
    mitreDetectionCoverage: 0.25,
  },
  incidentPenaltyPerCase: 1.5, // Existing application policy per active incident; not containment evidence
};

/**
 * Vulnerability SLA Policy — Application-Defined Thresholds
 *
 * These thresholds define the maximum acceptable remediation time per severity.
 * NOTE: This is an internal application policy, not based on formal organizational
 * governance, regulatory requirements, or industry certification standards.
 */
export const VULNERABILITY_SLA_POLICY = {
  thresholds: {
    Critical: 15,  // 15 days
    High: 30,      // 30 days
    Medium: 90,    // 90 days
    Low: 180,      // 180 days
  } as Record<string, number>,
  dueSoonThresholdDays: 11, // Critical due soon: 11 through 15 days
  policyNote: "Application-defined SLA thresholds. Not based on formal organizational policy or regulatory requirement.",
};

/**
 * Existing application policy: four components at 25% each; no partial reweighting.
 * Endpoint = active / total * 100; vulnerability = (1 - exposed / total) * 100;
 * incident load = max(0, 100 - active incidents * 1.5).
 * Missing/invalid inputs remain null, including zero asset denominators.
 * Observed MITRE IDs do not establish coverage of a validated technique inventory:
 * MITRE scoring remains unavailable, so the composite remains N/A.
 */
export function calculateSecurityPostureScore(
  agentsSummary: AgentsSummary | null,
  criticalVulnAssets: number | null,
  activeIncidentsCount: number | null
): MetricCardValue {
  const { weights, incidentPenaltyPerCase } = POSTURE_SCORING_POLICY;
  const validCount = (value: number | null | undefined): value is number =>
    typeof value === "number" && Number.isInteger(value) && value >= 0;
  const total = agentsSummary?.total;
  const endpointRaw = validCount(total) && total > 0
    && validCount(agentsSummary?.active) && agentsSummary.active <= total
    ? (agentsSummary.active / total) * 100 : null;
  const vulnRaw = validCount(total) && total > 0
    && validCount(criticalVulnAssets) && criticalVulnAssets <= total
    ? (1 - criticalVulnAssets / total) * 100 : null;
  const incidentCount = validCount(activeIncidentsCount) ? activeIncidentsCount : null;
  const incidentRaw = incidentCount !== null
    ? Math.max(0, 100 - incidentCount * incidentPenaltyPerCase) : null;
  const normalize = (value: number | null) => value === null ? null : Math.round(value);
  const contribution = (value: number | null, weight: number) =>
    value === null ? null : Number((Math.round(value) * weight).toFixed(2));

  const components: PostureComponent[] = [
    {
      key: "endpoint_visibility",
      name: "Endpoint Visibility",
      rawValue: endpointRaw === null ? null : Number(endpointRaw.toFixed(1)),
      rawUnit: "%",
      normalizedScore: normalize(endpointRaw),
      weight: weights.endpointVisibility,
      contribution: contribution(endpointRaw, weights.endpointVisibility),
      source: endpointRaw !== null
        ? `Wazuh Manager (${agentsSummary!.active}/${total} active agents)`
        : "Wazuh Manager (valid active count and positive total unavailable)",
    },
    {
      key: "vulnerability_surface",
      name: "Vulnerability Surface Health",
      rawValue: vulnRaw === null ? null : Number(vulnRaw.toFixed(1)),
      rawUnit: "%",
      normalizedScore: normalize(vulnRaw),
      weight: weights.vulnerabilitySurface,
      contribution: contribution(vulnRaw, weights.vulnerabilitySurface),
      source: vulnRaw !== null
        ? `OpenSearch Vulnerability State (${criticalVulnAssets}/${total} critical-exposed assets)`
        : "OpenSearch / Wazuh (valid exposed count and matching asset total unavailable)",
    },
    {
      key: "incident_containment",
      name: "Incident Load",
      rawValue: incidentCount,
      rawUnit: "active incidents",
      normalizedScore: normalize(incidentRaw),
      weight: weights.incidentContainment,
      contribution: contribution(incidentRaw, weights.incidentContainment),
      source: incidentCount !== null
        ? `Bitdefender GravityZone (${incidentCount} active incidents)`
        : "Bitdefender GravityZone (current incident count unavailable)",
      policyNote: `Existing application policy: max(0, 100 - active incidents * ${incidentPenaltyPerCase}). This measures incident load, not verified containment.`,
    },
    {
      key: "mitre_detection_coverage",
      name: "MITRE Threat Coverage",
      rawValue: null,
      rawUnit: "%",
      normalizedScore: null,
      weight: weights.mitreDetectionCoverage,
      contribution: null,
      source: "Unavailable: no validated MITRE coverage input",
      policyNote: "Observed alert technique IDs are not a coverage score. No compliance-derived count or fixed technique denominator is used.",
    },
  ];

  const included = components.filter(component => component.contribution !== null);
  const unavailable = components.filter(component => component.contribution === null);
  // All four policy dimensions are required. Never turn incomplete data into a /100 score.
  const compositeScore = unavailable.length === 0
    ? Math.round(included.reduce((sum, component) => sum + component.contribution!, 0)) : null;
  const explanation = `Available components: ${included.map(c => c.name).join(", ") || "none"}. Unavailable: ${unavailable.map(c => c.name).join(", ") || "none"}. All four components are required at 25% each; partial scoring is not supported.`;

  return {
    value: compositeScore,
    ...(compositeScore !== null ? { max: 100 } : {}),
    trend30d: null,
    trendAvailable: false,
    source: "Security Posture Engine (existing application policy; complete inputs required)",
    components,
    details: {
      current: compositeScore,
      previous30d: null,
      explanation,
      agentsActive: agentsSummary?.active,
      agentsDisconnected: agentsSummary?.disconnected,
      agentsNeverConnected: agentsSummary?.never_connected,
      agentsPending: agentsSummary?.pending,
      agentsTotal: total,
      criticalAffectedAssets: criticalVulnAssets ?? undefined,
      totalAssets: total,
    },
  };
}

/**
 * 5. Vulnerability SLA Overview
 * Group current critical findings by CVE BEFORE age classification.
 * Oldest detection wins; proven overdue takes precedence over missing dates.
 * Otherwise missing/future dates make worst-case age unknown, never compliant.
 */
async function getVulnerabilitySlaOverview(): Promise<VulnerabilitySlaOverview> {
  const slaThresholdDays = VULNERABILITY_SLA_POLICY.thresholds.Critical;
  const dueSoonDays = VULNERABILITY_SLA_POLICY.dueSoonThresholdDays;
  const asOf = Date.now();
  const unavailable: VulnerabilitySlaOverview = {
    available: false, dataAvailable: false, total: null, totalCritical: null,
    overdue: null, overduePct: null, dueSoon: null, dueSoonPct: null,
    compliant: null, compliantPct: null, unclassified: null, unclassifiedPct: null,
    inProgress: null, inProgressPct: null, scope: "Critical",
    policy: {
      criticalSlaDays: slaThresholdDays, dueSoonThresholdDays: dueSoonDays,
      thresholds: VULNERABILITY_SLA_POLICY.thresholds,
      policyNote: VULNERABILITY_SLA_POLICY.policyNote,
    },
    source: "OpenSearch Vulnerability State (Unavailable)",
    explanation: "Complete current CVE detection-age data could not be obtained.",
    ageField: "vulnerability.detected_at", asOf: new Date(asOf).toISOString(),
  };
  try {
    const vulnIndex = env.wazuhIndexer.vulnerabilityIndex();
    const query = {
      size: 0,
      // Same critical population as the summary card; no historical alert index.
      query: { term: { "vulnerability.severity": "Critical" } },
      aggs: {
        cves: {
          // Reject truncation instead of publishing a partial population.
          terms: { field: "vulnerability.id", size: 10000, shard_size: 10000 },
          aggs: {
            oldest_detection: { min: { field: "vulnerability.detected_at" } },
            missing_detection: { missing: { field: "vulnerability.detected_at" } },
            future_detection: { filter: { range: { "vulnerability.detected_at": { gt: asOf } } } },
          },
        },
      },
    };
    interface CveBucket {
      key: string; doc_count: number;
      oldest_detection: { value: number | null };
      missing_detection: { doc_count: number };
      future_detection: { doc_count: number };
    }
    const res = await fetchOpenSearch<{
      timed_out: boolean;
      _shards: { total: number; failed: number };
      aggregations?: { cves?: {
        sum_other_doc_count: number; doc_count_error_upper_bound: number; buckets: CveBucket[];
      } };
    }>(`${env.wazuhIndexer.url().replace(/\/$/, "")}/${vulnIndex}/_search`, query, 20000);
    const cves = res.aggregations?.cves;
    if (res.timed_out !== false || !res._shards || res._shards.total <= 0 || res._shards.failed !== 0
      || !cves || !Array.isArray(cves.buckets)
      || cves.sum_other_doc_count !== 0 || cves.doc_count_error_upper_bound !== 0) {
      throw new Error("Incomplete or truncated SLA aggregation");
    }
    const counts = { overdue: 0, dueSoon: 0, compliant: 0, unclassified: 0 };
    const seen = new Set<string>();
    const dayMs = 24 * 60 * 60 * 1000;
    for (const cve of cves.buckets) {
      if (typeof cve.key !== "string" || !cve.key || seen.has(cve.key)
        || !Number.isInteger(cve.doc_count) || cve.doc_count <= 0
        || !cve.oldest_detection || !("value" in cve.oldest_detection)
        || !Number.isInteger(cve.missing_detection?.doc_count) || cve.missing_detection.doc_count < 0
        || !Number.isInteger(cve.future_detection?.doc_count) || cve.future_detection.doc_count < 0) {
        throw new Error("Missing or invalid per-CVE SLA aggregation");
      }
      seen.add(cve.key);
      const oldest = cve.oldest_detection.value;
      const age = typeof oldest === "number" && Number.isFinite(oldest) ? (asOf - oldest) / dayMs : null;
      // Exclusive branches: precisely one increment per CVE.
      if (age !== null && age > slaThresholdDays) counts.overdue++;
      else if (age === null || age < 0 || cve.missing_detection.doc_count > 0 || cve.future_detection.doc_count > 0) counts.unclassified++;
      else if (age >= dueSoonDays) counts.dueSoon++;
      else counts.compliant++;
    }
    const total = seen.size;
    if (Object.values(counts).reduce((sum, count) => sum + count, 0) !== total) {
      throw new Error("SLA counts do not partition the CVE population");
    }
    // Largest-remainder rounding to two decimals keeps displayed percentages at 100%.
    // This adjusts rounding only; all bucket counts remain exact.
    const portions = Object.entries(counts).map(([key, count]) => {
      const raw = total === 0 ? 0 : count / total * 10000;
      return { key, units: Math.floor(raw), remainder: raw - Math.floor(raw) };
    }).sort((a, b) => b.remainder - a.remainder);
    const remaining = total === 0 ? 0 : 10000 - portions.reduce((sum, portion) => sum + portion.units, 0);
    for (let i = 0; i < remaining; i++) portions[i].units++;
    const percentages = Object.fromEntries(portions.map(portion => [portion.key, portion.units / 100]));
    return {
      ...unavailable,
      available: true, dataAvailable: true, total, totalCritical: total, ...counts,
      overduePct: percentages.overdue, dueSoonPct: percentages.dueSoon,
      compliantPct: percentages.compliant, unclassifiedPct: percentages.unclassified,
      source: `OpenSearch ${vulnIndex} (${total} unique critical CVEs; oldest detection per CVE)`,
      explanation: `Each CVE appears once. Age uses vulnerability.detected_at across current affected findings: overdue > ${slaThresholdDays}d; due soon >= ${dueSoonDays}d and <= ${slaThresholdDays}d; compliant >= 0d and < ${dueSoonDays}d. A proven overdue finding takes precedence; otherwise any missing/invalid/future detection makes the CVE unclassified. In Progress is unavailable without remediation workflow data.`,
    };
  } catch (err) {
    console.warn("[CISO Metrics] Vulnerability SLA overview failed:", err instanceof Error ? err.message : err);
    return unavailable;
  }
}

/**
 * 6. Incident KPI Engine (Last 30 Days)
 *
 * Evaluates live Bitdefender GravityZone incidents:
 * - MTTD (Mean Time to Detect) = mean(detected_at - occurred_at)
 * - MTTA (Mean Time to Acknowledge) = mean(acknowledged_at - detected_at)
 * - MTTR (Mean Time to Respond) = mean(responded_at - detected_at)
 * - MTTC (Mean Time to Contain) = mean(contained_at - detected_at)
 *
 * Audit findings on Bitdefender GravityZone API:
 * - `created`: Timestamp when incident was created/detected by GravityZone.
 * - `lastUpdated`: Timestamp when incident was last modified in GravityZone.
 * - `lastProcessed`: Pipeline processing timestamp.
 * - `details.alerts[].date`: Timestamp of the sensor detection event (detection timestamp).
 * - `status`: 'open' or 'closed' (no 'in_progress' lifecycle events).
 * - Acknowledgement timestamp: None in API (no `acknowledged_at`, `assigned_at`, or triage lifecycle timestamp).
 * - Occurrence timestamp: None in API (sensor detection time is the earliest record; true pre-detection occurrence timestamp is not captured).
 * - Response / Containment timestamp: No dedicated `responded_at` or `contained_at` field.
 *
 * According to strict rule: "Jika source tidak menyediakan timestamp yang diperlukan, nilai KPI harus null / N/A. JANGAN mengasumsikan timestamp."
 */
/**
 * Real Incident KPI calculation.
 * 
 * Sourced from:
 * 1. Bitdefender sensor alert timestamps (`details.alerts[].date`) for detection
 * 2. Real analyst lifecycle events in `incident_lifecycle_events` table (acknowledge, respond, contain)
 * 3. MTTD remains N/A due to absence of pre-detection occurrence timestamp (`occurred_at`).
 */
async function getIncidentKpiOverview(totalIncidentsBaseline?: number): Promise<IncidentKpiOverview> {
  try {
    const bitdefenderTotal = totalIncidentsBaseline ?? bitdefenderActiveIncidentState.cached?.total ?? 0;
    return await calculateRealIncidentKpis(bitdefenderTotal);
  } catch (err) {
    console.warn("[CISO Metrics] Incident KPI overview failed:", err instanceof Error ? err.message : err);
    return calculateRealIncidentKpis(0);
  }
}

/**
 * Aggregate all CISO Dashboard metrics strictly based on data availability
 */
export async function getCisoMetrics(): Promise<CisoMetricsData> {
  // First fetch agents summary to know total registered assets for vulnerability denominator
  const agentsSummary = await getAgentsSummary();
  const totalAgents = agentsSummary?.total;

  const [activeIncidents, criticalVulnerabilities, complianceScore, vulnerabilitySla, incidentKpi, nistPosture, risks] = await Promise.all([
    getBitdefenderActiveIncidents(),
    getCriticalVulnerabilities(totalAgents),
    getOverallComplianceScore(),
    getVulnerabilitySlaOverview(),
    getIncidentKpiOverview(),
    getNistPostureAssessment(),
    listRisks().catch(() => []),
  ]);

  // Missing inputs stay unavailable. An expired incident cache cannot score current posture.
  const affectedVulnAssets = criticalVulnerabilities.affectedAssetsCount ?? null;
  const currentBitdefenderCache = bitdefenderActiveIncidentState.cached;
  const incidentsCount = currentBitdefenderCache
    && Date.now() - currentBitdefenderCache.timestamp < BITDEFENDER_CACHE_TTL_MS
    ? activeIncidents.value : null;

  const securityPostureScore = calculateSecurityPostureScore(
    agentsSummary,
    affectedVulnAssets,
    incidentsCount
  );
  // Retain technical components as evidence, but score only recorded NIST assessments.
  securityPostureScore.value = nistPosture.overallScore;
  securityPostureScore.max = nistPosture.overallScore === null ? undefined : 100;
  securityPostureScore.source = "Recorded NIST CSF 2.0 function assessments";
  securityPostureScore.details = {
    ...securityPostureScore.details,
    current: nistPosture.overallScore,
    explanation: nistPosture.explanation,
  };

  const totalRiskSummary = summarizeTotalRisk(risks);
  // Project-defined ordinal portfolio summary of completed residual-risk assessments.
  const totalRiskScore: MetricCardValue = {
    value: totalRiskSummary?.portfolioMean ?? null,
    max: totalRiskSummary ? 4 : undefined,
    category: totalRiskSummary?.category,
    eligibleCount: totalRiskSummary?.eligibleCount,
    trend30d: null,
    trendAvailable: false,
    source: "Project-defined assessed residual-risk portfolio summary",
    details: {
      explanation: totalRiskSummary
        ? "Portfolio summary of assessed residual risks using the project-defined Low–Critical ordinal scale. Preliminary and unrecognized residual risks are excluded."
        : "No assessed risks with a recognized residual-risk category are available.",
    },
  };

  const treatmentSummary = summarizeTreatmentProgress(risks);
  // Completed actions divided by eligible assessed treatments; no partial weighting.
  const riskTreatmentProgress: MetricCardValue = {
    value: treatmentSummary?.percentage ?? null,
    trend30d: null,
    trendAvailable: false,
    unit: "%",
    eligibleCount: treatmentSummary?.eligibleCount,
    completedCount: treatmentSummary?.completedCount,
    plannedCount: treatmentSummary?.plannedCount,
    inProgressCount: treatmentSummary?.inProgressCount,
    source: "Project-defined assessed risk treatment completion",
    details: {
      explanation: treatmentSummary
        ? "Percentage of eligible assessed risk treatments marked Completed. Planned and In Progress treatments remain outstanding."
        : "No assessed risks with a genuine strategy and recognized treatment status are available.",
    },
  };

  return {
    securityPostureScore,
    nistPosture,
    totalRiskScore,
    activeIncidents,
    criticalVulnerabilities,
    complianceScore,
    riskTreatmentProgress,
    vulnerabilitySla,
    vulnerabilitySlaOverview: vulnerabilitySla,
    incidentKpi,
    updatedAt: new Date().toISOString(),
  };
}
