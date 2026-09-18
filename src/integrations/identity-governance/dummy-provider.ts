import "server-only";
import type { IdentityGovernanceProvider, NormalizedIdentityGovernanceRecord } from "@/types/identity-governance";
import type { DataProvenance } from "@/types/provenance";

const provenance: DataProvenance = {
  mode: "DEMO",
  sources: ["dummy-iam"],
  explanation: "Deterministic synthetic identity-governance context for demonstration only.",
  segments: [{
    name: "Identity governance",
    mode: "DEMO",
    source: "dummy-iam",
    explanation: "Standalone synthetic identities with no Wazuh authentication mapping or database persistence.",
  }],
};

const records: readonly NormalizedIdentityGovernanceRecord[] = [
  {
    identityId: "DEMO-IAM-001", username: "demo.standard.user", displayName: "Demo Standard User",
    authenticationPrincipalId: null, identityType: "USER", department: "Demo Operations",
    organizationalRole: "Demo Operations Member", accessRoles: ["Demo Standard Access"], privilegeLevel: "STANDARD",
    accountStatus: "ACTIVE", approvalStatus: "APPROVED", approvedBy: "Demo Governance Team",
    approvedAt: "2026-06-01T08:00:00.000Z", lastAccessReviewAt: "2026-09-01T09:00:00.000Z",
    nextAccessReviewAt: "2026-12-01T09:00:00.000Z", accessReviewStatus: "CURRENT",
    reviewedBy: "Demo Governance Team", revocationStatus: "NOT_REQUESTED", revokedAt: null,
    source: "dummy-iam", sourceRecordId: "DEMO-IAM-SRC-001", sourceUpdatedAt: "2026-09-01T09:00:00.000Z",
    observedAt: "2026-09-01T09:00:00.000Z", schemaVersion: "1.0", provenance,
  },
  {
    identityId: "DEMO-IAM-002", username: "demo.privileged.user", displayName: "Demo Privileged User",
    authenticationPrincipalId: null, identityType: "ADMINISTRATIVE", department: "Demo Technology",
    organizationalRole: "Demo Platform Administrator", accessRoles: ["Demo Administration", "Demo Support"],
    privilegeLevel: "ADMINISTRATIVE", accountStatus: "ACTIVE", approvalStatus: "APPROVED",
    approvedBy: "Demo Governance Team", approvedAt: "2026-03-01T08:00:00.000Z",
    lastAccessReviewAt: "2026-03-15T09:00:00.000Z", nextAccessReviewAt: "2026-09-15T09:00:00.000Z",
    accessReviewStatus: "OVERDUE", reviewedBy: "Demo Security Team", revocationStatus: "NOT_REQUESTED",
    revokedAt: null, source: "dummy-iam", sourceRecordId: "DEMO-IAM-SRC-002",
    sourceUpdatedAt: "2026-09-17T10:00:00.000Z", observedAt: "2026-09-17T10:00:00.000Z",
    schemaVersion: "1.0", provenance,
  },
  {
    identityId: "DEMO-IAM-003", username: "demo.service.account", displayName: "Demo Service Account",
    authenticationPrincipalId: null, identityType: "SERVICE_ACCOUNT", department: "Demo Applications",
    organizationalRole: "Demo Application Integration", accessRoles: ["Demo Service Integration"],
    privilegeLevel: "PRIVILEGED", accountStatus: "ACTIVE", approvalStatus: "APPROVED",
    approvedBy: "Demo Application Team", approvedAt: "2026-07-01T07:30:00.000Z",
    lastAccessReviewAt: "2026-07-01T08:00:00.000Z", nextAccessReviewAt: "2026-09-30T08:00:00.000Z",
    accessReviewStatus: "DUE", reviewedBy: "Demo Application Team", revocationStatus: "NOT_REQUESTED",
    revokedAt: null, source: "dummy-iam", sourceRecordId: "DEMO-IAM-SRC-003",
    sourceUpdatedAt: "2026-09-16T11:00:00.000Z", observedAt: "2026-09-16T11:00:00.000Z",
    schemaVersion: "1.0", provenance,
  },
  {
    identityId: "DEMO-IAM-004", username: "demo.disabled.user", displayName: "Demo Disabled User",
    authenticationPrincipalId: null, identityType: "USER", department: "Demo Operations",
    organizationalRole: "Demo Former User", accessRoles: [], privilegeLevel: "STANDARD",
    accountStatus: "DISABLED", approvalStatus: "NOT_REQUIRED", approvedBy: null, approvedAt: null,
    lastAccessReviewAt: null, nextAccessReviewAt: null, accessReviewStatus: "NOT_REVIEWED",
    reviewedBy: null, revocationStatus: "COMPLETED", revokedAt: "2026-09-10T12:00:00.000Z",
    source: "dummy-iam", sourceRecordId: "DEMO-IAM-SRC-004", sourceUpdatedAt: "2026-09-10T12:00:00.000Z",
    observedAt: "2026-09-10T12:00:00.000Z", schemaVersion: "1.0", provenance,
  },
];

export class DummyIdentityGovernanceProvider implements IdentityGovernanceProvider {
  readonly providerId = "dummy";

  async listIdentities() {
    return { records: records.map(record => ({ ...record, accessRoles: [...record.accessRoles] })), provenance };
  }
}
