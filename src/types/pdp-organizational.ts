import type { DataProvenance } from "@/types/provenance";

interface PdpOrganizationalSourceMetadata {
  source: string;
  sourceRecordId: string;
  sourceUpdatedAt: string;
  observedAt: string;
  schemaVersion: "1.0";
  provenance: DataProvenance;
}

export interface OrganizationalProcessingActivity extends PdpOrganizationalSourceMetadata {
  processingActivityId: string;
  activityName: string;
  businessOwner: string;
  purpose: string;
  personalDataCategories: string[];
  dataSubjectCategories: string[];
  lawfulBasis: string;
  processingLocations: string[];
  crossBorderTransfer: boolean;
  thirdPartyProcessing: boolean;
  retentionPolicyRef: string | null;
  deletionPolicyRef: string | null;
}

export type OrganizationalPolicyType = "PRIVACY" | "RETENTION" | "DELETION" | "ACCESS_CONTROL" | "INCIDENT_RESPONSE" | "BREACH_NOTIFICATION";
export type OrganizationalApprovalStatus = "DRAFT" | "PENDING" | "APPROVED" | "RETIRED" | "UNKNOWN";
export interface OrganizationalPolicy extends PdpOrganizationalSourceMetadata {
  policyId: string;
  policyType: OrganizationalPolicyType;
  title: string;
  owner: string;
  approvalStatus: OrganizationalApprovalStatus;
  approvedAt: string | null;
  effectiveAt: string | null;
  reviewDueAt: string | null;
  version: string;
  reference: string;
}

export type ProcessorDpaStatus = "NOT_RECORDED" | "DRAFT" | "SIGNED" | "EXPIRED" | "UNKNOWN";
export type ProcessorReviewStatus = "CURRENT" | "DUE" | "OVERDUE" | "NOT_REVIEWED" | "UNKNOWN";
export interface ProcessorRelationship extends PdpOrganizationalSourceMetadata {
  relationshipId: string;
  processorName: string;
  processingPurpose: string;
  personalDataCategories: string[];
  dataSubjectCategories: string[];
  processingLocation: string;
  crossBorderTransfer: boolean;
  agreementReference: string | null;
  dpaStatus: ProcessorDpaStatus;
  reviewStatus: ProcessorReviewStatus;
  owner: string;
}

export type DsrRequestType = "ACCESS" | "CORRECTION" | "DELETION" | "WITHDRAWAL" | "OBJECTION" | "OTHER";
export type DsrWorkflowStatus = "RECEIVED" | "IN_REVIEW" | "COMPLETED" | "REJECTED";
export type DsrVerificationStatus = "NOT_STARTED" | "PENDING" | "VERIFIED" | "FAILED";
export interface DsrWorkflow extends PdpOrganizationalSourceMetadata {
  requestId: string;
  requestType: DsrRequestType;
  receivedAt: string;
  dueAt: string;
  status: DsrWorkflowStatus;
  owner: string;
  completedAt: string | null;
  verificationStatus: DsrVerificationStatus;
}

export type BreachAssessmentStatus = "PENDING" | "IN_REVIEW" | "COMPLETED";
export type BreachNotificationStatus = "NOT_ASSESSED" | "NOT_REQUIRED" | "PENDING" | "NOTIFIED";
export interface BreachNotificationWorkflow extends PdpOrganizationalSourceMetadata {
  workflowId: string;
  incidentReference: string;
  personalDataImpactConfirmed: boolean;
  assessmentStatus: BreachAssessmentStatus;
  notificationRequired: boolean | null;
  notificationStatus: BreachNotificationStatus;
  decisionAt: string | null;
  notifiedAt: string | null;
  owner: string;
}

export interface PdpOrganizationalData {
  processingActivities: OrganizationalProcessingActivity[];
  policies: OrganizationalPolicy[];
  processorRelationships: ProcessorRelationship[];
  dsrWorkflows: DsrWorkflow[];
  breachNotificationWorkflows: BreachNotificationWorkflow[];
}

export interface PdpOrganizationalProviderResult extends PdpOrganizationalData {
  provenance: DataProvenance;
}

export interface PdpOrganizationalProvider {
  readonly providerId: string;
  getOrganizationalData(): Promise<PdpOrganizationalProviderResult>;
}
