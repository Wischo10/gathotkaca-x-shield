import "server-only";
import type { PdpOrganizationalProvider } from "@/types/pdp-organizational";
import type { DataProvenance } from "@/types/provenance";

const provenance: DataProvenance = {
  mode: "DEMO",
  sources: ["dummy-pdp-organizational"],
  explanation: "Temporary synthetic PDP organizational source data excluded from formal assessment and application registers.",
  segments: [{ name: "PDP organizational context", mode: "DEMO", source: "dummy-pdp-organizational", explanation: "Read-only candidate context; not verified evidence or a compliance conclusion." }],
};
const meta = (sourceRecordId: string, timestamp: string) => ({ source: "dummy-pdp-organizational", sourceRecordId, sourceUpdatedAt: timestamp, observedAt: timestamp, schemaVersion: "1.0" as const, provenance });

const processingActivities = [
  { processingActivityId: "DEMO-PROC-001", activityName: "Demo Service Registration", businessOwner: "Demo Privacy Team", purpose: "Synthetic service-registration workflow", personalDataCategories: ["Demo contact attributes"], dataSubjectCategories: ["Synthetic service users"], lawfulBasis: "Demo contractual basis metadata", processingLocations: ["Demo Region A"], crossBorderTransfer: false, thirdPartyProcessing: false, retentionPolicyRef: "DEMO-POL-002", deletionPolicyRef: "DEMO-POL-003", ...meta("DEMO-PROC-SRC-001", "2026-09-15T08:00:00.000Z") },
  { processingActivityId: "DEMO-PROC-002", activityName: "Demo Support Request", businessOwner: "Demo Support Team", purpose: "Synthetic support-request workflow", personalDataCategories: ["Demo support attributes"], dataSubjectCategories: ["Synthetic requestors"], lawfulBasis: "Demo legitimate-interest metadata", processingLocations: ["Demo Region B"], crossBorderTransfer: true, thirdPartyProcessing: true, retentionPolicyRef: "DEMO-POL-002", deletionPolicyRef: "DEMO-POL-003", ...meta("DEMO-PROC-SRC-002", "2026-09-16T09:00:00.000Z") },
] as const;

const policies = [
  { policyId: "DEMO-POL-001", policyType: "PRIVACY" as const, title: "Demo Privacy Policy Metadata", owner: "Demo Privacy Team", approvalStatus: "APPROVED" as const, approvedAt: "2026-06-01T08:00:00.000Z", effectiveAt: "2026-06-15T08:00:00.000Z", reviewDueAt: "2027-06-01T08:00:00.000Z", version: "DEMO-1.0", reference: "DEMO-POLICY-REF-001", ...meta("DEMO-POL-SRC-001", "2026-06-15T08:00:00.000Z") },
  { policyId: "DEMO-POL-002", policyType: "RETENTION" as const, title: "Demo Retention Policy Metadata", owner: "Demo Records Team", approvalStatus: "PENDING" as const, approvedAt: null, effectiveAt: null, reviewDueAt: "2026-11-01T08:00:00.000Z", version: "DEMO-0.2", reference: "DEMO-POLICY-REF-002", ...meta("DEMO-POL-SRC-002", "2026-09-14T10:00:00.000Z") },
  { policyId: "DEMO-POL-003", policyType: "DELETION" as const, title: "Demo Deletion Policy Metadata", owner: "Demo Records Team", approvalStatus: "DRAFT" as const, approvedAt: null, effectiveAt: null, reviewDueAt: null, version: "DEMO-0.1", reference: "DEMO-POLICY-REF-003", ...meta("DEMO-POL-SRC-003", "2026-09-13T10:00:00.000Z") },
];

const processorRelationships = [
  { relationshipId: "DEMO-PROCREL-001", processorName: "Demo Processor Alpha", processingPurpose: "Synthetic hosted-support processing", personalDataCategories: ["Demo support attributes"], dataSubjectCategories: ["Synthetic requestors"], processingLocation: "Demo Region B", crossBorderTransfer: true, agreementReference: "DEMO-DPA-001", dpaStatus: "DRAFT" as const, reviewStatus: "DUE" as const, owner: "Demo Privacy Team", ...meta("DEMO-PROCREL-SRC-001", "2026-09-16T09:30:00.000Z") },
  { relationshipId: "DEMO-PROCREL-002", processorName: "Demo Processor Beta", processingPurpose: "Synthetic notification delivery", personalDataCategories: ["Demo contact attributes"], dataSubjectCategories: ["Synthetic service users"], processingLocation: "Demo Region A", crossBorderTransfer: false, agreementReference: null, dpaStatus: "NOT_RECORDED" as const, reviewStatus: "NOT_REVIEWED" as const, owner: "Demo Procurement Team", ...meta("DEMO-PROCREL-SRC-002", "2026-09-15T11:00:00.000Z") },
];

const dsrWorkflows = [
  { requestId: "DEMO-DSR-001", requestType: "ACCESS" as const, receivedAt: "2026-09-01T08:00:00.000Z", dueAt: "2026-10-01T08:00:00.000Z", status: "IN_REVIEW" as const, owner: "Demo Privacy Team", completedAt: null, verificationStatus: "VERIFIED" as const, ...meta("DEMO-DSR-SRC-001", "2026-09-16T08:00:00.000Z") },
  { requestId: "DEMO-DSR-002", requestType: "DELETION" as const, receivedAt: "2026-08-15T08:00:00.000Z", dueAt: "2026-09-14T08:00:00.000Z", status: "COMPLETED" as const, owner: "Demo Privacy Team", completedAt: "2026-09-10T08:00:00.000Z", verificationStatus: "VERIFIED" as const, ...meta("DEMO-DSR-SRC-002", "2026-09-10T08:00:00.000Z") },
];

const breachNotificationWorkflows = [
  { workflowId: "DEMO-BNW-001", incidentReference: "DEMO-PDP-INC-001", personalDataImpactConfirmed: false, assessmentStatus: "COMPLETED" as const, notificationRequired: false, notificationStatus: "NOT_REQUIRED" as const, decisionAt: "2026-09-12T10:00:00.000Z", notifiedAt: null, owner: "Demo Privacy Team", ...meta("DEMO-BNW-SRC-001", "2026-09-12T10:00:00.000Z") },
  { workflowId: "DEMO-BNW-002", incidentReference: "DEMO-PDP-INC-002", personalDataImpactConfirmed: true, assessmentStatus: "IN_REVIEW" as const, notificationRequired: null, notificationStatus: "NOT_ASSESSED" as const, decisionAt: null, notifiedAt: null, owner: "Demo Incident Team", ...meta("DEMO-BNW-SRC-002", "2026-09-17T09:00:00.000Z") },
];

export class DummyPdpOrganizationalProvider implements PdpOrganizationalProvider {
  readonly providerId = "dummy";
  async getOrganizationalData() {
    return {
      processingActivities: processingActivities.map(record => ({ ...record, personalDataCategories: [...record.personalDataCategories], dataSubjectCategories: [...record.dataSubjectCategories], processingLocations: [...record.processingLocations] })),
      policies: policies.map(record => ({ ...record })),
      processorRelationships: processorRelationships.map(record => ({ ...record, personalDataCategories: [...record.personalDataCategories], dataSubjectCategories: [...record.dataSubjectCategories] })),
      dsrWorkflows: dsrWorkflows.map(record => ({ ...record })),
      breachNotificationWorkflows: breachNotificationWorkflows.map(record => ({ ...record })),
      provenance,
    };
  }
}
