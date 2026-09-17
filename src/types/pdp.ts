export type PdpAssessmentStatus = "compliant" | "partial" | "non_compliant" | "not_assessed";
export type FindingSeverity = "Low" | "Medium" | "High" | "Critical";
export type FindingStatus = "Open" | "In Progress" | "Resolved" | "Accepted";
export type RemediationStatus = "Planned" | "In Progress" | "Completed";
export type RegulatoryRelationship = "DIRECT" | "SUPPORTING" | "INTERNAL_IMPLEMENTATION" | "NO_DIRECT_MAPPING";

export interface PdpRegulatoryReference {
  id: string; regulationCode: string; regulationName: string; referenceIdentifier: string | null;
  relationshipType: RegulatoryRelationship; implementationSummary: string; authoritativeSourceUrl: string;
}

export interface PdpControl {
  id: string; code: string; title: string; description: string | null; domain: string;
  assessmentStatus: PdpAssessmentStatus; assessedAt: string | null; assessedBy: string | null;
  assessmentRationale: string | null; assessmentNotes: string | null;
  regulatoryBasis: PdpRegulatoryReference[]; evidence: PdpEvidence[]; findings: PdpFinding[];
}
export type PdpEvidenceReviewStatus="registered"|"pending_review"|"verified"|"rejected";
export interface PdpEvidence { id:string; controlId:string; title:string; evidenceType:string; description:string|null; referenceLocation:string; owner:string; collectedAt:string; reviewStatus:PdpEvidenceReviewStatus; reviewedBy:string|null; reviewedAt:string|null; reviewNotes:string|null; createdBy:string; createdAt:string; updatedBy:string|null; updatedAt:string; notes:string|null; }
export interface PdpFinding { id:string; controlId:string; evidenceId:string|null; evidenceTitle:string|null; title:string; description:string; severity:FindingSeverity; status:FindingStatus; owner:string; createdAt:string; dueDate:string|null; remediations:PdpRemediation[]; }
export interface PdpRemediation { id: string; findingId: string; action: string; owner: string; status: RemediationStatus; targetDate: string | null; completedAt: string | null; notes: string | null; updatedAt: string; }
export type PdpTriState = "yes" | "no" | "not_recorded";
export type PdpInventoryStatus = "draft" | "active" | "retired";
export interface PdpInventoryItem {
  id:string; dataAsset:string; description:string|null; businessUnit:string|null;
  personalDataCategory:string|null; dataSubjectCategories:string|null; sensitiveDataStatus:PdpTriState;
  dataOwner:string|null; processingPurpose:string|null; lawfulBasis:string|null; personalDataSource:string|null;
  dataFlowReference:string|null; retention:string|null; deletionApproach:string|null;
  processingLocation:string|null; storageLocation:string|null; crossBorderTransfer:PdpTriState; transferDestination:string|null;
  sharedWithThirdParties:PdpTriState; thirdPartyId:string|null; thirdPartyName:string|null;
  dataHubEntityId:string|null; recordStatus:PdpInventoryStatus; createdBy:string; updatedBy:string|null;
  createdAt:string; updatedAt:string; nextReviewAt:string|null;
}
export interface PdpBreach { id: string; title: string; timeline: string; impact: string; affectedData: string; affectedSubjects: string; responseStatus: string; notificationStatus: string; occurredAt: string | null; detectedAt: string | null; updatedAt: string; }
export interface PdpKpis { score: number | null; finalComplianceStatus: "compliant" | "partial" | "non_compliant" | null; compliant: number; partial: number; nonCompliant: number; notAssessed: number; assessedControls: number; totalControls: number; assessmentCoveragePercent: number; assessmentComplete: boolean; assessmentProgressStatus: "not_assessed" | "assessment_in_progress" | "assessment_complete"; openFindings: number; overdueFindings: number; criticalFindings: number; remediationProgress: number | null; completedRemediations: number; eligibleRemediations: number; }
export interface PdpInventoryThirdPartyOption { id:string; vendorCode:string; vendorName:string; }
export interface PdpBaselineData { framework: { id: "uu-pdp"; name: string; version: string | null }; kpis: PdpKpis; controls: PdpControl[]; inventory: PdpInventoryItem[]; inventoryThirdParties:PdpInventoryThirdPartyOption[]; breaches: PdpBreach[]; updatedAt: string; }

export interface PdpLoggingEvidenceSource {
  status: "available" | "unavailable";
  observedRecords: number | null;
  latestObservationAt: string | null;
  detail: string;
  monitoredAgents?: number | null;
}

export interface PdpLoggingCandidateEvidence {
  controlCode: "PDP-SC-03";
  readiness: "candidate_evidence_available" | "unavailable";
  generatedAt: string;
  wazuh: PdpLoggingEvidenceSource;
  bitdefender: PdpLoggingEvidenceSource;
}

export interface PdpMonitoringCandidateEvidence {
  controlCode: "PDP-SC-04";
  readiness: "candidate_evidence_available" | "unavailable";
  generatedAt: string;
  sources: {
    wazuh: PdpLoggingEvidenceSource;
    bitdefender: PdpLoggingEvidenceSource & { currentIncidents: number | null };
    mitre: { status: "available" | "unavailable"; observedTechniques: number | null; breadthPercent: number | null };
    threatFox: { status: "available" | "unavailable"; observedIocs: number | null; latestObservationAt: string | null };
    abuseIpDb: { status: "available" | "unavailable" };
    virusTotal: { status: "available" | "unavailable" };
  };
}

export interface PdpIncidentResponseCandidateEvidence {
  controlCode: "PDP-SC-06";
  readiness: "candidate_evidence_available" | "unavailable";
  generatedAt: string;
  sources: {
    bitdefender: { status: "available" | "unavailable"; currentIncidents: number | null; retainedDetections: number | null; latestDetectionAt: string | null };
    lifecycle: { status: "available" | "unavailable"; counts: Record<"detected" | "acknowledged" | "contained" | "resolved", number | null>; latestEventAt: string | null };
    pdpBreachRegister: { status: "available" | "unavailable"; confirmedRecords: number | null; timelineRecords: number | null; latestRecordAt: string | null };
  };
  capabilities: { authenticatedAcknowledge: true; authenticatedContainment: true; authenticatedResolution: true };
}

export interface PdpThirdPartyProcessingCandidateEvidence {
  controlCode: "PDP-PC-06";
  readiness: "candidate_evidence_available" | "unavailable";
  generatedAt: string;
  source: {
    status: "available" | "unavailable";
    registered: number | null;
    assessed: number | null;
    awaitingAssessment: number | null;
    assessmentCoveragePercent: number | null;
    riskClassifications: Record<"Low" | "Medium" | "High" | "Critical", number> | null;
    recordsWithInternalOwner: number | null;
    latestAssessmentAt: string | null;
    latestUpdateAt: string | null;
  };
  schemaCapabilities: {
    storedFields: string[];
    missingPdpFields: string[];
  };
}

export interface PdpAccessControlCandidateEvidence {
  controlCode: "PDP-SC-01";
  readiness: "candidate_evidence_available" | "unavailable";
  generatedAt: string;
  wazuh: {
    status: "available" | "unavailable";
    authenticationSuccess: number | null;
    authenticationFailure: number | null;
    sudoActivity: number | null;
    monitoredAgents: number | null;
    latestObservationAt: string | null;
    semanticBasis: string[];
  };
  iamGovernanceSource: "not_available";
}

export interface PdpIncidentTimelineCandidateEvidence {
  controlCode: "PDP-PB-01";
  readiness: "candidate_evidence_available" | "unavailable";
  generatedAt: string;
  sources: PdpIncidentResponseCandidateEvidence["sources"];
  occurrenceTimestamp: "not_available_not_verified";
}

export type PdpInventoryEvidenceReadiness = "awaiting_organizational_data" | "candidate_evidence_available" | "incomplete_evidence" | "unavailable";
export type PdpInventoryEvidenceControl = "PDP-DG-01" | "PDP-DG-02" | "PDP-DG-03" | "PDP-DG-04" | "PDP-DG-06" | "PDP-DG-07" | "PDP-PC-02" | "PDP-PC-05" | "PDP-PC-06";
export interface PdpInventoryEvidenceMetric { recorded:number|null; missing:number|null; readiness:PdpInventoryEvidenceReadiness; }
export interface PdpInventoryCandidateEvidence {
  source:"pdp_data_inventory";
  status:"available"|"unavailable";
  generatedAt:string;
  totalProcessingActivities:number|null;
  latestInventoryUpdateAt:string|null;
  controls:Record<PdpInventoryEvidenceControl,PdpInventoryEvidenceMetric>;
  supportingCounts:{storageLocation:number|null;crossBorderState:number|null;linkedThirdParties:number|null};
}

export type PdpEvidenceReadinessState="candidate_evidence_available"|"verified_evidence_available"|"evidence_registered"|"evidence_pending_review"|"awaiting_organizational_data"|"incomplete_evidence"|"insufficient_evidence"|"unavailable";
export type PdpEvidenceSourceType="Technical"|"RoPA"|"Evidence Registry"|"Third-Party Register"|"Incident Lifecycle"|"PDP Breach Register"|"Threat Intelligence";
export interface PdpEvidenceMatrixRow {controlId:string;controlCode:string;controlName:string;domain:string;regulatoryBasis:string[];relationshipTypes:RegulatoryRelationship[];sourceTypes:PdpEvidenceSourceType[];currentEvidence:string;missingEvidence:string;readiness:PdpEvidenceReadinessState;assessment:PdpAssessmentStatus;nextAction:"Add Processing Activity"|"Register Evidence"|"Review Candidate Evidence"|"Review Breach Evidence"|"Start Assessment";}
export interface PdpEvidenceMatrixData {generatedAt:string;rows:PdpEvidenceMatrixRow[];summary:Record<PdpEvidenceReadinessState,number>;sourceStatus:{baseline:"available";technical:"available"|"unavailable";ropa:"available";registry:"available";breachRegister:"available"};}
