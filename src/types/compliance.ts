export type ComplianceStatus =
  | "compliant"
  | "partial"
  | "non_compliant"
  | "telemetry"
  | "not_assessed";

export type AssessmentProgressStatus = "not_assessed" | "assessment_in_progress" | "assessment_complete";

export interface ComplianceFrameworkItem {
  id: string;
  name: string;
  code: string;
  score: number | null; // Raw calculated percentage (e.g. 84.5) or null if not assessed
  previousScore?: number | null;
  trend30d: number | null; // 30-day difference in percentage points (+4, -2) or null if unavailable
  trendStatus?: "available" | "insufficient_history" | "not_assessed" | "unavailable";
  trendUnit?: "percentage_points";
  status: ComplianceStatus;
  metricKind?: "formal_assessment" | "telemetry_observation";
  passedControls?: number;
  partialControls?: number;
  failedControls?: number;
  notAssessedControls?: number;
  evaluatedControls?: number;
  assessedControls?: number;
  totalApplicableControls?: number;
  assessmentCoveragePercent?: number;
  assessmentComplete?: boolean;
  assessmentProgressStatus?: AssessmentProgressStatus;
  scoreIsInterim?: boolean;
  assessmentScopeLabel?: string;
  lastAssessedAt?: string | null;
  context?: string;
}

export interface ComplianceOverviewData {
  frameworks: ComplianceFrameworkItem[];
  updatedAt: string;
  sources: {
    database: boolean;
    wazuhSca: boolean;
  };
}
