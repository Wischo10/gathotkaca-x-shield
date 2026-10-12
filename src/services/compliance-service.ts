import "server-only";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { getNistPostureAssessment } from "@/services/nist-posture-service";
import { calculateControlAssessmentSummary } from "@/lib/assessment-completeness";
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
  { id: "mitre", name: "MITRE ATT&CK Observed Breadth", code: "MITRE-ATTACK" },
  { id: "cis-v8", name: "CIS Controls v8", code: "CIS-V8" },
];

// Static reference scope for this telemetry ratio. It is not fetched from MITRE,
// version-managed dynamically, or evidence of formal compliance/detection coverage.
const MITRE_ENTERPRISE_BASE_TECHNIQUE_REFERENCE_SCOPE = 196;

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
 * Fetch real MITRE ATT&CK observed-technique breadth from Wazuh Indexer alerts.
 * Aggregates unique 'rule.mitre.id' values in current 30 days (now-30d to now)
 * and compares against previous 30 days (now-60d to now-30d).
 */
export async function getMitreAttackCoverage(): Promise<{
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
      timed_out?: boolean;
      _shards?: { total: number; failed: number };
      aggregations?: {
        current_30d?: { unique_mitre_ids?: { value: number } };
        previous_30d?: { unique_mitre_ids?: { value: number } };
      };
    }>(getIndexerUrl(`/${alertsIndex}/_search`), query, 25000);

    if (res.timed_out !== false || !res._shards || res._shards.total <= 0 || res._shards.failed !== 0) {
      return null;
    }
    const currentUnique = res.aggregations?.current_30d?.unique_mitre_ids?.value;
    const previousUnique = res.aggregations?.previous_30d?.unique_mitre_ids?.value;
    if (![currentUnique, previousUnique].every(
      value => typeof value === "number" && Number.isInteger(value) && value >= 0
    )) return null;

    const currentScore = Math.min(
      100,
      Math.round((currentUnique! / MITRE_ENTERPRISE_BASE_TECHNIQUE_REFERENCE_SCOPE) * 100)
    );
    const previousScore = Math.min(
      100,
      Math.round((previousUnique! / MITRE_ENTERPRISE_BASE_TECHNIQUE_REFERENCE_SCOPE) * 100)
    );
    const trend30d = currentScore - previousScore;

    return {
      score: currentScore,
      passed: currentUnique!,
      evaluated: MITRE_ENTERPRISE_BASE_TECHNIQUE_REFERENCE_SCOPE,
      trend30d,
      previousScore,
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
      partial: number;
      pending: number;
      notApplicable: number;
      evaluated: number;
      totalControls: number;
      lastAssessedAt: string | null;
    }
  > = {};
  // 1. Query PostgreSQL for current formal assessment outcomes.
  try {
    const db = getDb();

    // Use only the latest explicit human assessment for each catalog control.
    const assessmentsRes = await db.query<{
      framework_id: string;
      passed_count: string;
      failed_count: string;
      partial_count: string;
      pending_count: string;
      not_applicable_count: string;
      last_assessed: string | null;
    }>(
      `WITH latest AS (
         SELECT DISTINCT ON (framework_id, control_id)
           framework_id, control_id, status, assessed_at
         FROM compliance_assessments
         WHERE control_id IS NOT NULL
           AND status IN ('passed', 'partial', 'failed', 'not_applicable', 'pending')
           AND source IN ('manual', 'audit')
           AND assessed_at <= NOW()
         ORDER BY framework_id, control_id, assessed_at DESC, created_at DESC, id DESC
       )
       SELECT
         framework_id,
         COUNT(*) FILTER (WHERE status = 'passed') as passed_count,
          COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
          COUNT(*) FILTER (WHERE status = 'partial') as partial_count,
         COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
         COUNT(*) FILTER (WHERE status = 'not_applicable') as not_applicable_count,
         MAX(assessed_at) as last_assessed
       FROM latest
       GROUP BY framework_id`
    );

    const controlCountsRes = await db.query<{ framework_id: string; control_count: string }>(
      `SELECT framework_id, COUNT(*) AS control_count
       FROM compliance_controls GROUP BY framework_id`
    );
    const controlCounts = Object.fromEntries(controlCountsRes.rows.map(row => [row.framework_id, Number(row.control_count)]));

    dbAvailable = true;

    for (const row of assessmentsRes.rows) {
      const passed = parseInt(row.passed_count, 10) || 0;
      const failed = parseInt(row.failed_count, 10) || 0;
      const partial = parseInt(row.partial_count, 10) || 0;
      const pending = parseInt(row.pending_count, 10) || 0;
      const notApplicable = parseInt(row.not_applicable_count, 10) || 0;
      const evaluated = passed + partial + failed;
      dbAssessments[row.framework_id] = {
        passed, failed, partial, pending, notApplicable, evaluated,
        totalControls: controlCounts[row.framework_id] ?? 0,
        lastAssessedAt: row.last_assessed,
      };
    }
    for (const [frameworkId, totalControls] of Object.entries(controlCounts)) {
      dbAssessments[frameworkId] ??= {
        passed: 0, partial: 0, failed: 0, pending: 0, notApplicable: 0,
        evaluated: 0, totalControls, lastAssessedAt: null,
      };
    }

  } catch {
    dbAvailable = false;
  }

  // MITRE remains observation-only. NIST reads its separate, explicit manual workflow.
  const [mitreTelemetry, nistPosture] = await Promise.all([
    getMitreAttackCoverage(),
    getNistPostureAssessment(),
  ]);

  if (mitreTelemetry) {
    telemetryAvailable = true;
  }

  // 3. Build Frameworks Array
  const frameworks: ComplianceFrameworkItem[] = CANONICAL_FRAMEWORKS.map(
    (def) => {
      const dbData = dbAssessments[def.id];
      let score: number | null = null;
      let trend30d: number | null = null;
      let passedControls: number | undefined;
      let partialControls: number | undefined;
      let failedControls: number | undefined;
      let notAssessedControls: number | undefined;
      let evaluatedControls: number | undefined;
      let assessedControls: number | undefined;
      let totalApplicableControls: number | undefined;
      let assessmentScopeLabel: string | undefined;
      let lastAssessedAt: string | null = null;
      let controlSummary: ReturnType<typeof calculateControlAssessmentSummary> | null = null;

      // MITRE is an observation-only telemetry row, not a formal assessment.
      if (def.id === "mitre") {
        if (mitreTelemetry) {
          score = mitreTelemetry.score;
          passedControls = mitreTelemetry.passed;
          evaluatedControls = mitreTelemetry.evaluated;
          trend30d = mitreTelemetry.trend30d;
          assessmentScopeLabel = "techniques observed";
        }
      }
      // NIST uses the explicit six-function assessment contract from migration 004.
      else if (def.id === "nist-csf" && nistPosture.overallScore !== null) {
        score = nistPosture.overallScore;
        assessedControls = nistPosture.domains.filter(domain => domain.score !== null).length;
        totalApplicableControls = nistPosture.domains.length;
        assessmentScopeLabel = "functions assessed";
        lastAssessedAt = nistPosture.domains.reduce<string | null>((latest, domain) =>
          domain.assessedAt && (!latest || domain.assessedAt > latest) ? domain.assessedAt : latest, null);
      }
      // Control-based formal scores award credit only to Passed outcomes while
      // retaining Partial and Failed outcomes in the denominator.
      else if (dbData) {
        controlSummary = calculateControlAssessmentSummary(
          dbData.passed, dbData.partial, dbData.failed,
          Math.max(0, dbData.totalControls - dbData.notApplicable)
        );
        score = controlSummary.score;
        passedControls = dbData.passed;
        partialControls = dbData.partial;
        failedControls = dbData.failed;
        evaluatedControls = dbData.evaluated;
        assessedControls = dbData.passed + dbData.partial + dbData.failed;
        totalApplicableControls = Math.max(0, dbData.totalControls - dbData.notApplicable);
        notAssessedControls = Math.max(0, totalApplicableControls - dbData.passed - dbData.partial - dbData.failed);
        assessmentScopeLabel = "controls assessed";
        lastAssessedAt = dbData.lastAssessedAt;
      }
      // Frameworks without genuine formal assessments remain Not Assessed.

      const completeness = controlSummary ?? (assessedControls !== undefined && totalApplicableControls !== undefined
        ? calculateControlAssessmentSummary(assessedControls, 0, 0, totalApplicableControls) : null);
      const scoreIsInterim = def.id !== "mitre" && score !== null && completeness?.assessmentComplete === false;
      const status: ComplianceStatus = def.id === "mitre" && score !== null
        ? "telemetry" : completeness?.assessmentComplete
          ? controlSummary?.finalComplianceStatus ?? deriveStatus(score) : "not_assessed";

      return {
        id: def.id,
        name: def.name,
        code: def.code,
        score,
        previousScore: def.id === "mitre" ? (mitreTelemetry?.previousScore ?? null) : null,
        trend30d,
        trendUnit: trend30d !== null ? "percentage_points" : undefined,
        status,
        metricKind: def.id === "mitre" ? "telemetry_observation" : "formal_assessment",
        passedControls,
        partialControls,
        failedControls,
        notAssessedControls,
        evaluatedControls,
        assessedControls,
        totalApplicableControls,
        assessmentCoveragePercent: completeness?.assessmentCoveragePercent,
        assessmentComplete: completeness?.assessmentComplete,
        assessmentProgressStatus: completeness?.assessmentProgressStatus,
        scoreIsInterim,
        assessmentScopeLabel,
        lastAssessedAt,
        context: def.id === "mitre" && score !== null
          ? `${passedControls} / ${evaluatedControls} techniques observed; denominator is a static Enterprise base-technique reference scope, not formal compliance.`
          : scoreIsInterim ? "Interim formal score: Passed / (Passed + Partial + Failed); framework assessment is incomplete."
            : score !== null ? "Formal score: Passed / (Passed + Partial + Failed). Partial receives no compliant credit." : "No genuine formal assessment is recorded.",
      };
    }
  );

  // Existing snapshots have no scoring-methodology version. Formal trends fail
  // closed rather than comparing the new inclusive denominator with old scores.
  for (const framework of frameworks) {
    if (framework.metricKind === "formal_assessment") {
      framework.trend30d = null;
      framework.previousScore = null;
      framework.trendUnit = undefined;
      framework.trendStatus = framework.score === null ? "not_assessed" : "unavailable";
    }
  }

  return {
    frameworks,
    updatedAt: new Date().toISOString(),
    sources: {
      database: dbAvailable,
      wazuhSca: telemetryAvailable,
    },
  };
}
