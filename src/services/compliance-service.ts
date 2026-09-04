import "server-only";
import { getDb } from "@/lib/db";
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

function deriveStatus(score: number | null): ComplianceStatus {
  if (score === null) return "not_assessed";
  if (score >= 85) return "compliant";
  if (score >= 50) return "partial";
  return "non_compliant";
}

export async function getComplianceOverview(): Promise<ComplianceOverviewData> {
  let dbAvailable = false;
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

  // 1. Query Real PostgreSQL Database for Assessments & Snapshots
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
    // Database table might not be migrated yet or DB unreachable — fall back cleanly
    dbAvailable = false;
  }

  // 2. Build Frameworks Array
  const frameworks: ComplianceFrameworkItem[] = CANONICAL_FRAMEWORKS.map(
    (def) => {
      const dbData = dbAssessments[def.id];
      let score: number | null = null;
      let trend30d: number | null = null;
      let passedControls: number | undefined;
      let evaluatedControls: number | undefined;
      let lastAssessedAt: string | null = null;

      if (dbData && dbData.evaluated > 0) {
        score = Math.round((dbData.passed / dbData.evaluated) * 100);
        passedControls = dbData.passed;
        evaluatedControls = dbData.evaluated;
        lastAssessedAt = dbData.lastAssessedAt;

        // Calculate real trend if 30-day snapshot exists
        const oldScore = dbTrends[def.id];
        if (oldScore !== undefined && oldScore !== null) {
          trend30d = Math.round(score - oldScore);
        }
      }

      const status = deriveStatus(score);

      return {
        id: def.id,
        name: def.name,
        code: def.code,
        score,
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
      wazuhSca: false,
    },
  };
}
