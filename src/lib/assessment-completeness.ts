export type AssessmentProgressStatus = "not_assessed" | "assessment_in_progress" | "assessment_complete";

export interface AssessmentCompleteness {
  assessedControls: number;
  totalControls: number;
  assessmentCoveragePercent: number;
  assessmentComplete: boolean;
  assessmentProgressStatus: AssessmentProgressStatus;
}

/** Coverage describes assessment progress only; it never changes or weights a compliance score. */
export function calculateAssessmentCompleteness(assessedControls: number, totalControls: number): AssessmentCompleteness {
  const total = Number.isInteger(totalControls) && totalControls > 0 ? totalControls : 0;
  const assessed = Number.isInteger(assessedControls) && assessedControls > 0
    ? Math.min(assessedControls, total) : 0;
  const assessmentComplete = total > 0 && assessed === total;
  return {
    assessedControls: assessed,
    totalControls: total,
    assessmentCoveragePercent: total === 0 ? 0 : Number((assessed / total * 100).toFixed(2)),
    assessmentComplete,
    assessmentProgressStatus: assessed === 0
      ? "not_assessed" : assessmentComplete ? "assessment_complete" : "assessment_in_progress",
  };
}

export function calculateControlAssessmentSummary(
  compliant: number,
  partial: number,
  nonCompliant: number,
  totalControls: number
) {
  const completeness = calculateAssessmentCompleteness(compliant + partial + nonCompliant, totalControls);
  const scoreEligible = compliant + nonCompliant;
  const score = scoreEligible > 0 ? Math.round(compliant / scoreEligible * 100) : null;
  const finalComplianceStatus = completeness.assessmentComplete && score !== null
    ? score >= 85 ? "compliant" as const : score >= 50 ? "partial" as const : "non_compliant" as const
    : null;
  return { ...completeness, score, finalComplianceStatus };
}
