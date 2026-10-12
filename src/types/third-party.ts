export const THIRD_PARTY_RISK_LEVELS = ["Low", "Medium", "High", "Critical"] as const;
export const THIRD_PARTY_LIFECYCLE_STATUSES = ["active", "inactive"] as const;
export const THIRD_PARTY_ASSESSMENT_STATUSES = ["needs_assessment", "assessed"] as const;
export const THIRD_PARTY_TREATMENT_STATUSES = ["Planned", "In Progress", "Completed"] as const;

export type ThirdPartyRiskLevel = typeof THIRD_PARTY_RISK_LEVELS[number];
export type ThirdPartyLifecycleStatus = typeof THIRD_PARTY_LIFECYCLE_STATUSES[number];
export type ThirdPartyAssessmentStatus = typeof THIRD_PARTY_ASSESSMENT_STATUSES[number];
export type ThirdPartyTreatmentStatus = typeof THIRD_PARTY_TREATMENT_STATUSES[number];

export interface ThirdPartyRecord {
  id: string;
  vendorCode: string;
  vendorName: string;
  providedService: string;
  internalOwner: string;
  criticality: ThirdPartyRiskLevel;
  lifecycleStatus: ThirdPartyLifecycleStatus;
  assessmentStatus: ThirdPartyAssessmentStatus;
  likelihood: ThirdPartyRiskLevel | null;
  impact: ThirdPartyRiskLevel | null;
  riskRating: ThirdPartyRiskLevel | null;
  assessmentRationale: string | null;
  assessedAt: string | null;
  assessedBy: string | null;
  treatmentStrategy: string | null;
  treatmentStatus: ThirdPartyTreatmentStatus | null;
  treatmentOwner: string | null;
  treatmentAction: string | null;
  dueDate: string | null;
  nextReviewDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ThirdPartySummary {
  totalVendors: number;
  needsAssessment: number;
  assessed: number;
  activeVendors: number;
  eligibleAssessedVendors: number;
  assessmentCoveragePct: number;
  highestAssessedRisk: ThirdPartyRiskLevel | null;
  method: "Highest Assessed Risk";
}

export interface ThirdPartyRegisterResponse {
  items: ThirdPartyRecord[];
  summary: ThirdPartySummary;
  storageAvailable: true;
}

export interface CreateThirdPartyInput {
  vendorName: string;
  providedService: string;
  internalOwner: string;
  criticality: ThirdPartyRiskLevel;
  lifecycleStatus: ThirdPartyLifecycleStatus;
}

export interface CompleteThirdPartyAssessmentInput {
  likelihood: ThirdPartyRiskLevel;
  impact: ThirdPartyRiskLevel;
  riskRating: ThirdPartyRiskLevel;
  assessmentRationale: string;
  treatmentStrategy: string;
  treatmentStatus: ThirdPartyTreatmentStatus;
  treatmentOwner: string;
  treatmentAction: string;
  dueDate: string;
  nextReviewDate: string;
}
