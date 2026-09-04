export type ComplianceStatus =
  | "compliant"
  | "partial"
  | "non_compliant"
  | "not_assessed";

export interface ComplianceFrameworkItem {
  id: string;
  name: string;
  code: string;
  score: number | null; // Raw calculated percentage (e.g. 84.5) or null if not assessed
  trend30d: number | null; // 30-day difference in percentage points (+4, -2) or null if unavailable
  status: ComplianceStatus;
  passedControls?: number;
  evaluatedControls?: number;
  lastAssessedAt?: string | null;
}

export interface ComplianceOverviewData {
  frameworks: ComplianceFrameworkItem[];
  updatedAt: string;
  sources: {
    database: boolean;
    wazuhSca: boolean;
  };
}
