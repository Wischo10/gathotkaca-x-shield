import type { DataProvenance } from "@/types/provenance";

export type IdentityType = "USER" | "SERVICE_ACCOUNT" | "ADMINISTRATIVE" | "OTHER";
export type IdentityPrivilegeLevel = "STANDARD" | "PRIVILEGED" | "ADMINISTRATIVE" | "UNKNOWN";
export type IdentityAccountStatus = "ACTIVE" | "DISABLED" | "LOCKED" | "UNKNOWN";
export type IdentityApprovalStatus = "APPROVED" | "PENDING" | "REJECTED" | "NOT_REQUIRED" | "UNKNOWN";
export type IdentityAccessReviewStatus = "CURRENT" | "DUE" | "OVERDUE" | "NOT_REVIEWED" | "UNKNOWN";
export type IdentityRevocationStatus = "NOT_REQUESTED" | "PENDING" | "COMPLETED" | "UNKNOWN";

export interface NormalizedIdentityGovernanceRecord {
  identityId: string;
  username: string;
  displayName: string;
  /** Explicit configured authentication mapping only; never inferred from username. */
  authenticationPrincipalId: string | null;
  identityType: IdentityType;
  department: string | null;
  organizationalRole: string | null;
  accessRoles: string[];
  privilegeLevel: IdentityPrivilegeLevel;
  accountStatus: IdentityAccountStatus;
  approvalStatus: IdentityApprovalStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  lastAccessReviewAt: string | null;
  nextAccessReviewAt: string | null;
  accessReviewStatus: IdentityAccessReviewStatus;
  reviewedBy: string | null;
  revocationStatus: IdentityRevocationStatus;
  revokedAt: string | null;
  source: string;
  sourceRecordId: string;
  sourceUpdatedAt: string;
  observedAt: string;
  schemaVersion: "1.0";
  provenance: DataProvenance;
}

export interface IdentityGovernanceProviderResult {
  records: NormalizedIdentityGovernanceRecord[];
  provenance: DataProvenance;
}

export interface IdentityGovernanceProvider {
  readonly providerId: string;
  listIdentities(): Promise<IdentityGovernanceProviderResult>;
}

export interface IdentityGovernanceSummary {
  total: number;
  privileged: number;
  active: number;
  disabled: number;
  reviewsCurrent: number;
  reviewsDue: number;
  reviewsOverdue: number;
  notReviewed: number;
}

export interface IdentityGovernanceOverview {
  records: NormalizedIdentityGovernanceRecord[];
  summary: IdentityGovernanceSummary | null;
  provenance: DataProvenance;
}
