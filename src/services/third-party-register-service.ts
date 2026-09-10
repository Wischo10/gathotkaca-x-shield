import "server-only";
import { env } from "@/lib/env";
import { getDb, getPostgresPool } from "@/lib/db";
import {
  THIRD_PARTY_LIFECYCLE_STATUSES, THIRD_PARTY_RISK_LEVELS, THIRD_PARTY_TREATMENT_STATUSES,
  type CompleteThirdPartyAssessmentInput, type CreateThirdPartyInput,
  type ThirdPartyRecord, type ThirdPartySummary,
} from "@/types/third-party";

const CREATE_FIELDS = ["vendorName", "providedService", "internalOwner", "criticality", "lifecycleStatus"] as const;
const ASSESSMENT_FIELDS = ["likelihood", "impact", "riskRating", "assessmentRationale", "treatmentStrategy", "treatmentStatus", "treatmentOwner", "treatmentAction", "dueDate", "nextReviewDate"] as const;

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 10000;
}

function isDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(new Date(`${value}T00:00:00Z`).getTime());
}

export function validateCreateThirdParty(value: unknown): CreateThirdPartyInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some(key => !CREATE_FIELDS.includes(key as typeof CREATE_FIELDS[number]))) return null;
  if (!isText(input.vendorName) || !isText(input.providedService) || !isText(input.internalOwner)) return null;
  if (!THIRD_PARTY_RISK_LEVELS.includes(input.criticality as typeof THIRD_PARTY_RISK_LEVELS[number])) return null;
  if (!THIRD_PARTY_LIFECYCLE_STATUSES.includes(input.lifecycleStatus as typeof THIRD_PARTY_LIFECYCLE_STATUSES[number])) return null;
  return {
    vendorName: input.vendorName.trim(), providedService: input.providedService.trim(),
    internalOwner: input.internalOwner.trim(), criticality: input.criticality as CreateThirdPartyInput["criticality"],
    lifecycleStatus: input.lifecycleStatus as CreateThirdPartyInput["lifecycleStatus"],
  };
}

export function validateCompleteAssessment(value: unknown): CompleteThirdPartyAssessmentInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some(key => !ASSESSMENT_FIELDS.includes(key as typeof ASSESSMENT_FIELDS[number]))) return null;
  for (const field of ["likelihood", "impact", "riskRating"] as const) {
    if (!THIRD_PARTY_RISK_LEVELS.includes(input[field] as typeof THIRD_PARTY_RISK_LEVELS[number])) return null;
  }
  for (const field of ["assessmentRationale", "treatmentStrategy", "treatmentOwner", "treatmentAction"] as const) {
    if (!isText(input[field])) return null;
  }
  if (!THIRD_PARTY_TREATMENT_STATUSES.includes(input.treatmentStatus as typeof THIRD_PARTY_TREATMENT_STATUSES[number])) return null;
  if (!isDate(input.dueDate) || !isDate(input.nextReviewDate)) return null;
  return {
    likelihood: input.likelihood as CompleteThirdPartyAssessmentInput["likelihood"],
    impact: input.impact as CompleteThirdPartyAssessmentInput["impact"],
    riskRating: input.riskRating as CompleteThirdPartyAssessmentInput["riskRating"],
    assessmentRationale: (input.assessmentRationale as string).trim(),
    treatmentStrategy: (input.treatmentStrategy as string).trim(),
    treatmentStatus: input.treatmentStatus as CompleteThirdPartyAssessmentInput["treatmentStatus"],
    treatmentOwner: (input.treatmentOwner as string).trim(), treatmentAction: (input.treatmentAction as string).trim(),
    dueDate: input.dueDate as string, nextReviewDate: input.nextReviewDate as string,
  };
}

function databaseRequired() {
  if (!env.database.url()) throw new Error("third_party_storage_unavailable");
  return getDb();
}

interface ThirdPartyRow {
  id: string; vendor_code: string; vendor_name: string; provided_service: string; internal_owner: string;
  criticality: ThirdPartyRecord["criticality"]; lifecycle_status: ThirdPartyRecord["lifecycleStatus"];
  assessment_status: ThirdPartyRecord["assessmentStatus"]; likelihood: ThirdPartyRecord["likelihood"];
  impact: ThirdPartyRecord["impact"]; risk_rating: ThirdPartyRecord["riskRating"]; assessment_rationale: string | null;
  assessed_at: Date | string | null; assessed_by: string | null; treatment_strategy: string | null;
  treatment_status: ThirdPartyRecord["treatmentStatus"]; treatment_owner: string | null; treatment_action: string | null;
  due_date: Date | string | null; next_review_date: Date | string | null; created_at: Date | string; updated_at: Date | string;
}

const COLUMNS = `id, vendor_code, vendor_name, provided_service, internal_owner, criticality, lifecycle_status,
  assessment_status, likelihood, impact, risk_rating, assessment_rationale, assessed_at, assessed_by,
  treatment_strategy, treatment_status, treatment_owner, treatment_action, due_date, next_review_date, created_at, updated_at`;

const iso = (value: Date | string) => new Date(value).toISOString();
const dateOnly = (value: Date | string | null) => value === null ? null : typeof value === "string" ? value.slice(0, 10) : value.toISOString().slice(0, 10);
function mapThirdParty(row: ThirdPartyRow): ThirdPartyRecord {
  return {
    id: row.id, vendorCode: row.vendor_code, vendorName: row.vendor_name, providedService: row.provided_service,
    internalOwner: row.internal_owner, criticality: row.criticality, lifecycleStatus: row.lifecycle_status,
    assessmentStatus: row.assessment_status, likelihood: row.likelihood, impact: row.impact, riskRating: row.risk_rating,
    assessmentRationale: row.assessment_rationale, assessedAt: row.assessed_at ? iso(row.assessed_at) : null,
    assessedBy: row.assessed_by, treatmentStrategy: row.treatment_strategy, treatmentStatus: row.treatment_status,
    treatmentOwner: row.treatment_owner, treatmentAction: row.treatment_action, dueDate: dateOnly(row.due_date),
    nextReviewDate: dateOnly(row.next_review_date), createdAt: iso(row.created_at), updatedAt: iso(row.updated_at),
  };
}

export function deriveThirdPartySummary(records: ThirdPartyRecord[]): ThirdPartySummary {
  const riskOrder: Record<ThirdPartyRecord["criticality"], number> = {
    Low: 1, Medium: 2, High: 3, Critical: 4,
  };
  // Portfolio risk includes completed manual assessments only. Vendor
  // criticality is intentionally not a substitute for an assessed risk rating.
  const eligible = records.filter((item): item is ThirdPartyRecord & { riskRating: NonNullable<ThirdPartyRecord["riskRating"]> } =>
    item.assessmentStatus === "assessed" && item.riskRating !== null
      && THIRD_PARTY_RISK_LEVELS.includes(item.riskRating));
  const highestAssessedRisk = eligible.reduce<ThirdPartyRecord["riskRating"]>((highest, item) =>
    highest === null || riskOrder[item.riskRating] > riskOrder[highest] ? item.riskRating : highest, null);
  return {
    totalVendors: records.length,
    needsAssessment: records.filter(item => item.assessmentStatus === "needs_assessment").length,
    assessed: records.filter(item => item.assessmentStatus === "assessed").length,
    activeVendors: records.filter(item => item.lifecycleStatus === "active").length,
    eligibleAssessedVendors: eligible.length,
    assessmentCoveragePct: records.length === 0 ? 0 : Number((eligible.length / records.length * 100).toFixed(1)),
    highestAssessedRisk,
    method: "Highest Assessed Risk",
  };
}

export async function listThirdParties(): Promise<ThirdPartyRecord[]> {
  const { rows } = await databaseRequired().query<ThirdPartyRow>(`SELECT ${COLUMNS} FROM third_party_register ORDER BY updated_at DESC, vendor_code ASC`);
  return rows.map(mapThirdParty);
}

export async function getThirdParty(id: string): Promise<ThirdPartyRecord | null> {
  const { rows } = await databaseRequired().query<ThirdPartyRow>(`SELECT ${COLUMNS} FROM third_party_register WHERE id = $1`, [id]);
  return rows[0] ? mapThirdParty(rows[0]) : null;
}

export async function createThirdParty(input: CreateThirdPartyInput): Promise<ThirdPartyRecord> {
  if (!env.database.url()) throw new Error("third_party_storage_unavailable");
  const client = await getPostgresPool().connect();
  try {
    await client.query("BEGIN");
    const yearResult = await client.query<{ year: number }>("SELECT EXTRACT(YEAR FROM CURRENT_DATE)::int AS year");
    const year = yearResult.rows[0].year;
    await client.query("SELECT pg_advisory_xact_lock(hashtext('third_party_register_code'), $1)", [year]);
    const pattern = `^TPR-${year}-([0-9]{3})$`;
    const sequence = await client.query<{ highest: number }>(
      `SELECT COALESCE(MAX(code_match[1]::int), 0)::int AS highest FROM
       (SELECT regexp_match(vendor_code, $1) AS code_match FROM third_party_register WHERE vendor_code ~ $1) matching_codes`, [pattern]
    );
    const next = sequence.rows[0].highest + 1;
    if (next > 999) throw new Error("annual_third_party_code_sequence_exhausted");
    const code = `TPR-${year}-${String(next).padStart(3, "0")}`;
    const { rows } = await client.query<ThirdPartyRow>(
      `INSERT INTO third_party_register
       (vendor_code, vendor_name, provided_service, internal_owner, criticality, lifecycle_status, assessment_status)
       VALUES ($1, $2, $3, $4, $5, $6, 'needs_assessment') RETURNING ${COLUMNS}`,
      [code, input.vendorName, input.providedService, input.internalOwner, input.criticality, input.lifecycleStatus]
    );
    if (!rows[0]) throw new Error("third_party_persistence_failed");
    await client.query("COMMIT");
    return mapThirdParty(rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}

export async function completeThirdPartyAssessment(id: string, input: CompleteThirdPartyAssessmentInput, assessedBy: string): Promise<ThirdPartyRecord | null> {
  const { rows } = await databaseRequired().query<ThirdPartyRow>(
    `UPDATE third_party_register SET likelihood=$2, impact=$3, risk_rating=$4, assessment_rationale=$5,
       assessed_at=NOW(), assessed_by=$6, treatment_strategy=$7, treatment_status=$8, treatment_owner=$9,
       treatment_action=$10, due_date=$11, next_review_date=$12, assessment_status='assessed', updated_at=NOW()
     WHERE id=$1 RETURNING ${COLUMNS}`,
    [id, input.likelihood, input.impact, input.riskRating, input.assessmentRationale, assessedBy,
      input.treatmentStrategy, input.treatmentStatus, input.treatmentOwner, input.treatmentAction, input.dueDate, input.nextReviewDate]
  );
  return rows[0] ? mapThirdParty(rows[0]) : null;
}
