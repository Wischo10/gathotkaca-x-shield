import "server-only";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { fetchJson } from "@/lib/http";
import type {
  ComplianceFrameworkItem,
  ComplianceOverviewData,
  ComplianceStatus,
} from "@/types/compliance";

interface FrameworkDefinition {
  id: string;
  name: string;
  code: string;
}

const CANONICAL_FRAMEWORKS: FrameworkDefinition[] = [
  { id: "iso27001", name: "ISO/IEC 27001:2022", code: "ISO-27001" },
  { id: "nist-csf", name: "NIST CSF 2.0", code: "NIST-CSF" },
  { id: "uu-pdp", name: "UU PDP No. 27/2022", code: "UU-PDP" },
  { id: "mitre", name: "MITRE ATT&CK Coverage", code: "MITRE-ATTACK" },
  { id: "cis-v8", name: "CIS Controls v8", code: "CIS-V8" },
];

// MITRE ATT&CK Enterprise Matrix base technique denominator (196 core techniques)
const TOTAL_ENTERPRISE_MITRE_TECHNIQUES = 196;

function deriveStatus(score: number | null): ComplianceStatus {
  if (score === null) return "not_assessed";
  if (score >= 85) return "compliant";
  if (score >= 50) return "partial";
  return "non_compliant";
}

function indexerAuthHeader(): string {
  const token = Buffer.from(
    `${env.wazuhIndexer.username()}:${env.wazuhIndexer.password()}`
  ).toString("base64");
  return `Basic ${token}`;
}

function getIndexerUrl(path: string): string {
  return `${env.wazuhIndexer.url().replace(/\/$/, "")}${path}`;
}

import https from "node:https";

const httpsAgent = new https.Agent({
  rejectUnauthorized: !env.wazuh.allowSelfSigned(),
});

function fetchOpenSearch<T>(
  url: string,
  body: object,
  timeoutMs = 25000
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

/**
 * Fetch real MITRE ATT&CK technique coverage from Wazuh Indexer alerts.
 * Aggregates unique 'rule.mitre.id' values in current 30 days (now-30d to now)
 * and compares against previous 30 days (now-60d to now-30d).
 */
async function getMitreAttackCoverage(): Promise<{
  score: number;
  evaluated: number;
  passed: number;
  trend30d: number | null;
  previousScore: number | null;
} | null> {
  try {
    const alertsIndex = env.wazuhIndexer.alertsIndex();
    const query = {
      size: 0,
      aggs: {
        current_30d: {
          filter: {
            range: {
              "@timestamp": {
                gte: "now-30d/d",
                lte: "now",
              },
            },
          },
          aggs: {
            unique_mitre_ids: {
              cardinality: {
                field: "rule.mitre.id",
              },
            },
          },
        },
        previous_30d: {
          filter: {
            range: {
              "@timestamp": {
                gte: "now-60d/d",
                lt: "now-30d/d",
              },
            },
          },
          aggs: {
            unique_mitre_ids: {
              cardinality: {
                field: "rule.mitre.id",
              },
            },
          },
        },
      },
    };

    const res = await fetchOpenSearch<{
      aggregations?: {
        current_30d?: { unique_mitre_ids?: { value: number } };
        previous_30d?: { unique_mitre_ids?: { value: number } };
      };
    }>(getIndexerUrl(`/${alertsIndex}/_search`), query, 25000);

    const currentUnique = res?.aggregations?.current_30d?.unique_mitre_ids?.value || 0;
    const previousUnique = res?.aggregations?.previous_30d?.unique_mitre_ids?.value || 0;

    if (currentUnique <= 0) {
      return null;
    }

    const currentScore = Math.min(
      100,
      Math.round((currentUnique / TOTAL_ENTERPRISE_MITRE_TECHNIQUES) * 100)
    );

    let trend30d: number | null = null;
    let previousScore: number | null = null;

    if (previousUnique > 0) {
      previousScore = Math.min(
        100,
        Math.round((previousUnique / TOTAL_ENTERPRISE_MITRE_TECHNIQUES) * 100)
      );
      // Formula: ((current - previous) / previous) * 100
      trend30d = Math.round(((currentScore - previousScore) / previousScore) * 100);
    }

    return {
      score: currentScore,
      passed: currentUnique,
      evaluated: TOTAL_ENTERPRISE_MITRE_TECHNIQUES,
      trend30d,
      previousScore,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch CIS Controls coverage from Wazuh Indexer alerts / SCA telemetry.
 * Queries 'rule.compliance.cis' tagged alerts or SCA checks.
 * Returns null if data is not available.
 */
async function getCisCoverage(): Promise<{
  score: number;
  evaluated: number;
  passed: number;
} | null> {
  try {
    const alertsIndex = env.wazuhIndexer.alertsIndex();
    const query = {
      size: 0,
      query: {
        bool: {
          should: [
            { exists: { field: "rule.compliance.cis" } },
            { exists: { field: "rule.compliance.cis.keyword" } },
            { exists: { field: "rule.cis" } },
          ],
          minimum_should_match: 1,
        },
      },
      aggs: {
        unique_cis_rules: {
          cardinality: {
            field: "rule.compliance.cis.keyword",
          },
        },
        unique_cis_raw: {
          cardinality: {
            field: "rule.compliance.cis",
          },
        },
      },
    };

    const res = await fetchJson<{
      aggregations?: {
        unique_cis_rules?: { value: number };
        unique_cis_raw?: { value: number };
      };
    }>(getIndexerUrl(`/${alertsIndex}/_search`), {
      method: "POST",
      headers: {
        Authorization: indexerAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(query),
      timeoutMs: 5000,
    });

    const activeCisRules =
      res?.aggregations?.unique_cis_rules?.value ||
      res?.aggregations?.unique_cis_raw?.value ||
      0;

    if (activeCisRules <= 0) {
      return null;
    }

    // CIS Controls v8 has 153 safeguards across 18 control groups
    const totalSafeguards = 153;
    const score = Math.min(
      100,
      Math.round((activeCisRules / totalSafeguards) * 100)
    );

    return {
      score,
      passed: activeCisRules,
      evaluated: totalSafeguards,
    };
  } catch {
    return null;
  }
}

export async function getComplianceOverview(): Promise<ComplianceOverviewData> {
  let dbAvailable = false;
  let telemetryAvailable = false;

  const dbAssessments: Record<
    string,
    {
      passed: number;
      failed: number;
      evaluated: number;
      lastAssessedAt: string | null;
    }
  > = {};
  const dbTrends: Record<string, number | null> = {};

  // 1. Query PostgreSQL Database for Formal Assessments & Snapshots
  try {
    const db = getDb();

    // Query evaluated controls summary
    const assessmentsRes = await db.query<{
      framework_id: string;
      passed_count: string;
      failed_count: string;
      last_assessed: string | null;
    }>(
      `SELECT
         framework_id,
         COUNT(*) FILTER (WHERE status = 'passed') as passed_count,
         COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
         MAX(assessed_at) as last_assessed
       FROM compliance_assessments
       GROUP BY framework_id`
    );

    dbAvailable = true;

    for (const row of assessmentsRes.rows) {
      const passed = parseInt(row.passed_count, 10) || 0;
      const failed = parseInt(row.failed_count, 10) || 0;
      const evaluated = passed + failed;
      dbAssessments[row.framework_id] = {
        passed,
        failed,
        evaluated,
        lastAssessedAt: row.last_assessed,
      };
    }

    // Query 30-day historical trend from snapshots
    const snapshotsRes = await db.query<{
      framework_id: string;
      score: string;
    }>(
      `SELECT DISTINCT ON (framework_id)
         framework_id,
         score
       FROM compliance_snapshots
       WHERE snapshot_at <= NOW() - INTERVAL '25 days'
         AND snapshot_at >= NOW() - INTERVAL '35 days'
       ORDER BY framework_id, snapshot_at DESC`
    );

    for (const row of snapshotsRes.rows) {
      dbTrends[row.framework_id] = parseFloat(row.score);
    }
  } catch {
    dbAvailable = false;
  }

  // 2. Fetch live telemetry for automated frameworks (Sprint 1: MITRE & CIS)
  const [mitreTelemetry, cisTelemetry] = await Promise.all([
    getMitreAttackCoverage(),
    getCisCoverage(),
  ]);

  if (mitreTelemetry || cisTelemetry) {
    telemetryAvailable = true;
  }

  // 3. Build Frameworks Array
  const frameworks: ComplianceFrameworkItem[] = CANONICAL_FRAMEWORKS.map(
    (def) => {
      const dbData = dbAssessments[def.id];
      let score: number | null = null;
      let trend30d: number | null = null;
      let passedControls: number | undefined;
      let evaluatedControls: number | undefined;
      let lastAssessedAt: string | null = null;

      // Priority 1: Use explicit Database Assessment if available
      if (dbData && dbData.evaluated > 0) {
        score = Math.round((dbData.passed / dbData.evaluated) * 100);
        passedControls = dbData.passed;
        evaluatedControls = dbData.evaluated;
        lastAssessedAt = dbData.lastAssessedAt;
      }
      // Priority 2: Fall back to real Telemetry for MITRE and CIS if DB has no manual assessments
      else if (def.id === "mitre" && mitreTelemetry) {
        score = mitreTelemetry.score;
        passedControls = mitreTelemetry.passed;
        evaluatedControls = mitreTelemetry.evaluated;
        trend30d = mitreTelemetry.trend30d;
      } else if (def.id === "cis-v8" && cisTelemetry) {
        score = cisTelemetry.score;
        passedControls = cisTelemetry.passed;
        evaluatedControls = cisTelemetry.evaluated;
      }
      // For iso27001, nist-csf, and uu-pdp without DB assessment: score remains null (Not Assessed)

      // Calculate real trend if 30-day snapshot exists in DB (takes precedence if DB snapshots exist)
      if (score !== null && dbTrends[def.id] !== undefined && dbTrends[def.id] !== null) {
        const oldScore = dbTrends[def.id]!;
        if (oldScore > 0) {
          trend30d = Math.round(((score - oldScore) / oldScore) * 100);
        }
      }

      const status = deriveStatus(score);

      return {
        id: def.id,
        name: def.name,
        code: def.code,
        score,
        previousScore: def.id === "mitre" ? (mitreTelemetry?.previousScore ?? null) : (dbTrends[def.id] ?? null),
        trend30d,
        status,
        passedControls,
        evaluatedControls,
        lastAssessedAt,
      };
    }
  );

  return {
    frameworks,
    updatedAt: new Date().toISOString(),
    sources: {
      database: dbAvailable,
      wazuhSca: telemetryAvailable,
    },
  };
}

