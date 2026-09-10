import "server-only";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { NIST_FUNCTIONS, type NistPostureAssessment } from "@/types/ciso";

export interface NistAssessmentInput {
  function: typeof NIST_FUNCTIONS[number];
  score: number;
  evidence?: string;
  notes: string;
}

/** Strict allowlist: clients cannot submit assessor, source, or timestamps. */
export function validateNistAssessmentInput(value: unknown): NistAssessmentInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some(key => !["function", "score", "evidence", "notes"].includes(key))) return null;
  if (!NIST_FUNCTIONS.includes(input.function as NistAssessmentInput["function"])) return null;
  if (typeof input.score !== "number" || !Number.isInteger(input.score) || input.score < 0 || input.score > 100) return null;
  for (const field of ["evidence", "notes"]) {
    if (input[field] !== undefined && (typeof input[field] !== "string" || (input[field] as string).length > 10000)) return null;
  }
  if (typeof input.notes !== "string" || input.notes.trim().length === 0) return null;
  return input as unknown as NistAssessmentInput;
}

/** Read recorded assessments only. No telemetry conversion, inserts, or file fallback. */
export async function getNistPostureAssessment(): Promise<NistPostureAssessment> {
  const result: NistPostureAssessment = {
    status: "unavailable",
    domains: NIST_FUNCTIONS.map(name => ({
      name, score: null, assessedAt: null, assessedBy: null, source: null,
      evidence: null, notes: null, trend30d: null, previousScore: null, previousAssessedAt: null,
    })),
    overallScore: null,
    explanation: "NIST assessment database is not configured. All six function assessments are required; partial scoring is not supported.",
  };
  if (!env.database.url()) return result;
  try {
    const { rows } = await getDb().query<{
      function_name: string; score: string; assessed_at: Date; assessed_by: string;
      source: string; evidence: string | null; notes: string | null;
      previous_score: string | null; previous_assessed_at: Date | null;
    }>(`
      WITH valid AS (
        SELECT a.* FROM compliance_assessments a
        JOIN compliance_frameworks f ON f.id = a.framework_id
        WHERE f.id = 'nist-csf' AND f.version = '2.0' AND f.is_active = true
          AND a.function_name = ANY($1::text[])
          AND a.source = 'manual_assessment' AND a.control_id IS NULL AND a.status IS NULL
          AND a.score BETWEEN 0 AND 100 AND length(trim(a.assessed_by)) > 0
          AND a.assessed_at <= NOW()
      ), latest AS (
        SELECT DISTINCT ON (function_name) * FROM valid
        ORDER BY function_name, assessed_at DESC, created_at DESC, id DESC
      )
      SELECT l.function_name, l.score, l.assessed_at, l.assessed_by, l.source, l.evidence, l.notes,
             h.score AS previous_score, h.assessed_at AS previous_assessed_at
      FROM latest l LEFT JOIN LATERAL (
        SELECT score, assessed_at FROM valid h
        WHERE h.function_name = l.function_name AND h.assessed_at < l.assessed_at
          AND h.assessed_at BETWEEN NOW() - INTERVAL '35 days' AND NOW() - INTERVAL '30 days'
          AND l.assessed_at > NOW() - INTERVAL '30 days'
        ORDER BY h.assessed_at DESC, h.created_at DESC, h.id DESC LIMIT 1
      ) h ON true
    `, [[...NIST_FUNCTIONS]]);
    for (const domain of result.domains) {
      const row = rows.find(row => row.function_name === domain.name);
      if (!row) continue;
      const score = Number(row.score);
      if (!Number.isFinite(score) || score < 0 || score > 100) continue;
      domain.score = score;
      domain.assessedAt = row.assessed_at.toISOString();
      domain.assessedBy = row.assessed_by;
      domain.source = row.source;
      domain.evidence = row.evidence;
      domain.notes = row.notes;
      if (row.previous_score !== null && row.previous_assessed_at !== null) {
        domain.previousScore = Number(row.previous_score);
        domain.previousAssessedAt = row.previous_assessed_at.toISOString();
        domain.trend30d = Number((score - domain.previousScore).toFixed(2));
      }
    }
    result.status = "available";
    if (result.domains.every(domain => domain.score !== null)) {
      result.overallScore = Number((result.domains.reduce((sum, domain) => sum + domain.score!, 0) / 6).toFixed(2));
    }
    const missing = result.domains.filter(domain => domain.score === null).map(domain => domain.name);
    result.explanation = missing.length
      ? `Missing recorded assessments: ${missing.join(", ")}. All six functions are required; no partial scoring.`
      : "Average of the six latest recorded NIST CSF 2.0 function assessments. Equal weights; no telemetry-derived scores.";
  } catch {
    result.explanation = "NIST assessment database or schema is unavailable. All six function assessments are required; no partial scoring.";
  }
  return result;
}
