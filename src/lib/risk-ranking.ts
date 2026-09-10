import type { RiskRecord } from "@/types/risk";

export type RecognizedRiskCategory = "Low" | "Medium" | "High" | "Critical";

const RISK_ORDINAL: Readonly<Record<RecognizedRiskCategory, number>> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
};

export function normalizeRiskCategory(value: string | null): RecognizedRiskCategory | null {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "low") return "Low";
  if (normalized === "medium") return "Medium";
  if (normalized === "high") return "High";
  if (normalized === "critical") return "Critical";
  return null;
}

function ordinal(value: string | null): number {
  const category = normalizeRiskCategory(value);
  return category ? RISK_ORDINAL[category] : 0;
}

export interface TotalRiskSummary {
  category: RecognizedRiskCategory;
  portfolioMean: number;
  eligibleCount: number;
}

type RecognizedTreatmentStatus = "Planned" | "In Progress" | "Completed";

function normalizeTreatmentStatus(value: string | null): RecognizedTreatmentStatus | null {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "planned") return "Planned";
  if (normalized === "in progress") return "In Progress";
  if (normalized === "completed") return "Completed";
  return null;
}

export interface TreatmentProgressSummary {
  eligibleCount: number;
  completedCount: number;
  plannedCount: number;
  inProgressCount: number;
  percentage: number;
}

/** Project-defined completion rate; no partial credit for outstanding work. */
export function summarizeTreatmentProgress(risks: RiskRecord[]): TreatmentProgressSummary | null {
  const statuses = risks
    .filter(risk => risk.assessmentStatus === "assessed" && Boolean(risk.treatmentStrategy?.trim()))
    .map(risk => normalizeTreatmentStatus(risk.treatmentStatus))
    .filter((status): status is RecognizedTreatmentStatus => status !== null);
  if (statuses.length === 0) return null;
  const completedCount = statuses.filter(status => status === "Completed").length;
  return {
    eligibleCount: statuses.length,
    completedCount,
    plannedCount: statuses.filter(status => status === "Planned").length,
    inProgressCount: statuses.filter(status => status === "In Progress").length,
    percentage: Number(((completedCount / statuses.length) * 100).toFixed(2)),
  };
}

/** Project-defined portfolio summary; values are ordinal, never percentages. */
export function summarizeTotalRisk(risks: RiskRecord[]): TotalRiskSummary | null {
  const values = risks.filter(risk => risk.assessmentStatus === "assessed")
    .map(risk => ordinal(risk.residualRisk)).filter(value => value > 0);
  if (values.length === 0) return null;
  const portfolioMean = Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
  const category: RecognizedRiskCategory = portfolioMean < 1.5 ? "Low"
    : portfolioMean < 2.5 ? "Medium"
    : portfolioMean < 3.5 ? "High" : "Critical";
  return { category, portfolioMean, eligibleCount: values.length };
}

function validDateValue(value: string | null): number | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) ? timestamp : null;
}

/** Project-defined ordering for completed manual business-risk assessments only. */
export function rankTopRisks(risks: RiskRecord[]): RiskRecord[] {
  return risks
    .filter(risk => risk.assessmentStatus === "assessed" && normalizeRiskCategory(risk.residualRisk) !== null)
    .sort((left, right) => {
      const residual = ordinal(right.residualRisk) - ordinal(left.residualRisk);
      if (residual) return residual;
      const inherent = ordinal(right.inherentRisk) - ordinal(left.inherentRisk);
      if (inherent) return inherent;
      const severity = ordinal(right.severity) - ordinal(left.severity);
      if (severity) return severity;
      const leftDue = validDateValue(left.dueDate);
      const rightDue = validDateValue(right.dueDate);
      if (leftDue !== null && rightDue !== null && leftDue !== rightDue) return leftDue - rightDue;
      if (leftDue !== null && rightDue === null) return -1;
      if (leftDue === null && rightDue !== null) return 1;
      return left.riskCode.localeCompare(right.riskCode);
    })
    .slice(0, 5);
}
