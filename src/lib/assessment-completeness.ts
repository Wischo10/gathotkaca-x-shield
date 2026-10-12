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
  // Formal score methodology: fully compliant controls receive credit; Partial
  // and Non-Compliant controls remain in the assessed-result denominator.
  // No unapproved fractional credit is assigned to Partial outcomes.
  const assessedResults = compliant + partial + nonCompliant;
  const score = assessedResults > 0 ? Math.round(compliant / assessedResults * 100) : null;
  const finalComplianceStatus = completeness.assessmentComplete && score !== null
    ? partial > 0 ? "partial" as const
      : score >= 85 ? "compliant" as const : score >= 50 ? "partial" as const : "non_compliant" as const
    : null;
  return { ...completeness, score, finalComplianceStatus };
}
