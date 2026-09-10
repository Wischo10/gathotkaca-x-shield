import "server-only";
import { getDb, getPostgresPool } from "@/lib/db";
import { env } from "@/lib/env";
import type { CreateRiskAssessment, NewRiskAssessment, RiskRecord } from "@/types/risk";

const TEXT_FIELDS = [
  "riskCode", "title", "scenarioDescription", "businessService", "businessUnit",
  "threatNarrative", "vulnerabilityNarrative", "likelihood", "likelihoodRationale",
  "impact", "impactRationale", "inherentRisk", "residualRisk", "severity", "riskOwner",
  "treatmentStrategy", "treatmentStatus", "treatmentOwner", "treatmentAction",
] as const;

const CORE_FIELDS = ["title", "scenarioDescription", "threatNarrative", "vulnerabilityNarrative"] as const;
const CREATE_TEXT_FIELDS = TEXT_FIELDS.filter(field => field !== "riskCode");
const ASSESSMENT_FIELDS = CREATE_TEXT_FIELDS.filter(field => !CORE_FIELDS.includes(field as typeof CORE_FIELDS[number]));
const INPUT_FIELDS = [...CREATE_TEXT_FIELDS, "dueDate", "reviewDate", "notes", "assessmentStatus"] as const;

function validDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(new Date(`${value}T00:00:00Z`).getTime());
}

export function validateRiskAssessment(value: unknown): CreateRiskAssessment | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some(key => !INPUT_FIELDS.includes(key as typeof INPUT_FIELDS[number]))) return null;
  if (input.assessmentStatus !== "needs_assessment" && input.assessmentStatus !== "assessed") return null;
  for (const field of CORE_FIELDS) {
    if (typeof input[field] !== "string" || !input[field].trim() || input[field].length > 10000) return null;
  }
  for (const field of ASSESSMENT_FIELDS) {
    if (input[field] !== null && input[field] !== undefined
      && (typeof input[field] !== "string" || !input[field].trim() || input[field].length > 10000)) return null;
  }
  if (input.assessmentStatus === "assessed") {
    if (ASSESSMENT_FIELDS.some(field => typeof input[field] !== "string" || !(input[field] as string).trim())) return null;
    if (!validDate(input.dueDate) || !validDate(input.reviewDate)) return null;
  } else if ((input.dueDate !== null && input.dueDate !== undefined && !validDate(input.dueDate))
    || (input.reviewDate !== null && input.reviewDate !== undefined && !validDate(input.reviewDate))) return null;
  if (input.notes !== null && input.notes !== undefined
    && (typeof input.notes !== "string" || input.notes.length > 10000)) return null;
  return Object.fromEntries(INPUT_FIELDS.map(field => {
    const fieldValue = input[field];
    if (field === "assessmentStatus") return [field, fieldValue];
    if (field === "dueDate" || field === "reviewDate") return [field, fieldValue ?? null];
    if (field === "notes") return [field, typeof fieldValue === "string" ? fieldValue.trim() || null : null];
    return [field, typeof fieldValue === "string" ? fieldValue.trim() : null];
  })) as unknown as CreateRiskAssessment;
}

export function validateRiskUpdate(value: unknown): NewRiskAssessment | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (typeof input.riskCode !== "string" || !input.riskCode.trim() || input.riskCode.length > 10000) return null;
  const { riskCode, ...createFields } = input;
  const validated = validateRiskAssessment(createFields);
  return validated ? { ...validated, riskCode: riskCode.trim() } : null;
}

function databaseRequired() {
  if (!env.database.url()) throw new Error("risk_storage_unavailable");
  return getDb();
}

interface RiskRow {
  id: string; risk_code: string; title: string; scenario_description: string;
  business_service: string | null; business_unit: string | null; threat_narrative: string;
  vulnerability_narrative: string; likelihood: string | null; likelihood_rationale: string | null;
  impact: string | null; impact_rationale: string | null; inherent_risk: string | null; residual_risk: string | null;
  severity: string | null; risk_owner: string | null; treatment_strategy: string | null; treatment_status: string | null;
  treatment_owner: string | null; treatment_action: string | null; due_date: string | Date | null;
  review_date: string | Date | null; notes: string | null; assessment_source: "manual_risk_assessment";
  assessment_status: "needs_assessment" | "assessed";
  created_at: Date; updated_at: Date;
}

function dateOnly(value: string | Date | null): string | null {
  if (value === null) return null;
  if (typeof value === "string") return value.slice(0, 10);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mapRisk(row: RiskRow): RiskRecord {
  return {
    id: row.id, riskCode: row.risk_code, title: row.title,
    scenarioDescription: row.scenario_description, businessService: row.business_service,
    businessUnit: row.business_unit, threatNarrative: row.threat_narrative,
    vulnerabilityNarrative: row.vulnerability_narrative, likelihood: row.likelihood,
    likelihoodRationale: row.likelihood_rationale, impact: row.impact,
    impactRationale: row.impact_rationale, inherentRisk: row.inherent_risk,
    residualRisk: row.residual_risk, severity: row.severity, riskOwner: row.risk_owner,
    treatmentStrategy: row.treatment_strategy, treatmentStatus: row.treatment_status,
    treatmentOwner: row.treatment_owner, treatmentAction: row.treatment_action,
    dueDate: dateOnly(row.due_date), reviewDate: dateOnly(row.review_date), notes: row.notes,
    assessmentSource: row.assessment_source, createdAt: row.created_at.toISOString(),
    assessmentStatus: row.assessment_status,
    updatedAt: row.updated_at.toISOString(),
  };
}

const SELECT_COLUMNS = `id, risk_code, title, scenario_description, business_service,
  business_unit, threat_narrative, vulnerability_narrative, likelihood,
  likelihood_rationale, impact, impact_rationale, inherent_risk, residual_risk,
  severity, risk_owner, treatment_strategy, treatment_status, treatment_owner,
  treatment_action, due_date, review_date, notes, assessment_source, assessment_status, created_at, updated_at`;

export async function listRisks(): Promise<RiskRecord[]> {
  const { rows } = await databaseRequired().query<RiskRow>(
    `SELECT ${SELECT_COLUMNS} FROM risk_register ORDER BY updated_at DESC, risk_code ASC`
  );
  return rows.map(mapRisk);
}

export async function createRisk(input: CreateRiskAssessment): Promise<RiskRecord> {
  const values = CREATE_TEXT_FIELDS.map(field => input[field]?.trim() || null);
  const client = await getPostgresPool().connect();
  try {
    await client.query("BEGIN");
    const yearResult = await client.query<{ year: number }>("SELECT EXTRACT(YEAR FROM CURRENT_DATE)::int AS year");
    const year = yearResult.rows[0].year;
    await client.query("SELECT pg_advisory_xact_lock(hashtext('risk_register_code'), $1)", [year]);
    const pattern = `^RSK-${year}-([0-9]{3})$`;
    const sequenceResult = await client.query<{ highest: number }>(
      `SELECT COALESCE(MAX(code_match[1]::int), 0)::int AS highest
       FROM (SELECT regexp_match(risk_code, $1) AS code_match
             FROM risk_register WHERE risk_code ~ $1) matching_codes`,
      [pattern]
    );
    const nextSequence = sequenceResult.rows[0].highest + 1;
    if (nextSequence > 999) throw new Error("annual_risk_code_sequence_exhausted");
    const riskCode = `RSK-${year}-${String(nextSequence).padStart(3, "0")}`;
    const { rows } = await client.query<RiskRow>(
      `INSERT INTO risk_register
      (risk_code, title, scenario_description, business_service, business_unit,
       threat_narrative, vulnerability_narrative, likelihood, likelihood_rationale,
       impact, impact_rationale, inherent_risk, residual_risk, severity, risk_owner,
       treatment_strategy, treatment_status, treatment_owner, treatment_action,
       due_date, review_date, notes, assessment_source, assessment_status)
     VALUES ($1, ${values.map((_, index) => `$${index + 2}`).join(", ")}, $20, $21, $22, 'manual_risk_assessment', $23)
     RETURNING ${SELECT_COLUMNS}`,
      [riskCode, ...values, input.dueDate, input.reviewDate, input.notes?.trim() || null, input.assessmentStatus]
    );
    if (!rows[0]) throw new Error("risk_persistence_failed");
    await client.query("COMMIT");
    return mapRisk(rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateRisk(id: string, input: NewRiskAssessment): Promise<RiskRecord> {
  const values = TEXT_FIELDS.map(field => input[field]?.trim() || null);
  const assignments = [
    "risk_code", "title", "scenario_description", "business_service", "business_unit",
    "threat_narrative", "vulnerability_narrative", "likelihood", "likelihood_rationale",
    "impact", "impact_rationale", "inherent_risk", "residual_risk", "severity", "risk_owner",
    "treatment_strategy", "treatment_status", "treatment_owner", "treatment_action",
  ].map((column, index) => `${column} = $${index + 2}`).join(", ");
  const { rows } = await databaseRequired().query<RiskRow>(
    `UPDATE risk_register SET ${assignments}, due_date = $21, review_date = $22,
       notes = $23, assessment_status = $24, updated_at = NOW()
     WHERE id = $1 RETURNING ${SELECT_COLUMNS}`,
    [id, ...values, input.dueDate, input.reviewDate, input.notes?.trim() || null, input.assessmentStatus]
  );
  if (!rows[0]) throw new Error("risk_not_found");
  return mapRisk(rows[0]);
}
