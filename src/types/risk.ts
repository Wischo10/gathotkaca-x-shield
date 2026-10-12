export interface RiskRecord {
  id: string;
  riskCode: string;
  title: string;
  scenarioDescription: string;
  businessService: string | null;
  businessUnit: string | null;
  threatNarrative: string;
  vulnerabilityNarrative: string;
  likelihood: string | null;
  likelihoodRationale: string | null;
  impact: string | null;
  impactRationale: string | null;
  inherentRisk: string | null;
  residualRisk: string | null;
  severity: string | null;
  riskOwner: string | null;
  treatmentStrategy: string | null;
  treatmentStatus: string | null;
  treatmentOwner: string | null;
  treatmentAction: string | null;
  dueDate: string | null;
  reviewDate: string | null;
  notes: string | null;
  assessmentSource: "manual_risk_assessment";
  assessmentStatus: "needs_assessment" | "assessed";
  createdAt: string;
  updatedAt: string;
}

export interface RiskRegisterResponse {
  items: RiskRecord[];
  storageAvailable: true;
}

export type NewRiskAssessment = Omit<
  RiskRecord,
  "id" | "assessmentSource" | "createdAt" | "updatedAt"
>;

export type CreateRiskAssessment = Omit<NewRiskAssessment, "riskCode">;
