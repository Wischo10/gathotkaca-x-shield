import "server-only";
import { env } from "@/lib/env";
import { getDb } from "@/lib/db";
import { calculateControlAssessmentSummary } from "@/lib/assessment-completeness";
import type { PdpBaselineData, PdpBreach, PdpControl, PdpEvidence, PdpFinding, PdpInventoryItem, PdpRegulatoryReference, PdpRemediation } from "@/types/pdp";

export class PdpStorageError extends Error {}
const iso = (value: Date | string) => new Date(value).toISOString();
const dateOnly = (value: Date | string | null) => value === null ? null : typeof value === "string" ? value.slice(0, 10) : value.toISOString().slice(0, 10);

export async function getPdpBaseline(): Promise<PdpBaselineData> {
  if (!env.database.url()) throw new PdpStorageError("PDP database is not configured");
  try {
    const db = getDb();
    const [frameworkResult, controlResult, referenceResult, evidenceResult, findingResult, remediationResult, inventoryResult, breachResult, thirdPartyResult] = await Promise.all([
      db.query<{ id: "uu-pdp"; name: string; version: string | null }>("SELECT id, name, version FROM compliance_frameworks WHERE id='uu-pdp' AND is_active=true"),
      db.query<any>(`SELECT c.id,c.control_code,c.title,c.description,c.category,a.status,a.assessed_at,a.assessed_by,a.evidence,a.notes FROM compliance_controls c LEFT JOIN LATERAL (SELECT status,assessed_at,assessed_by,evidence,notes FROM compliance_assessments WHERE control_id=c.id AND source IN ('manual','audit') ORDER BY assessed_at DESC,created_at DESC,id DESC LIMIT 1) a ON true WHERE c.framework_id='uu-pdp' ORDER BY c.control_code`),
      db.query<any>(`SELECT r.* FROM compliance_control_regulatory_references r JOIN compliance_controls c ON c.id=r.control_id WHERE c.framework_id='uu-pdp' ORDER BY r.regulation_code,r.reference_identifier NULLS LAST`),
      db.query<any>(`SELECT e.* FROM compliance_evidence e JOIN compliance_controls c ON c.id=e.control_id WHERE c.framework_id='uu-pdp' ORDER BY e.updated_at DESC`),
      db.query<any>(`SELECT f.*,e.title AS evidence_title FROM compliance_findings f JOIN compliance_controls c ON c.id=f.control_id LEFT JOIN compliance_evidence e ON e.id=f.evidence_id WHERE c.framework_id='uu-pdp' ORDER BY f.created_at DESC`),
      db.query<any>(`SELECT r.* FROM compliance_remediations r JOIN compliance_findings f ON f.id=r.finding_id JOIN compliance_controls c ON c.id=f.control_id WHERE c.framework_id='uu-pdp' ORDER BY r.updated_at DESC`),
      db.query<any>("SELECT i.*,t.vendor_name AS third_party_name FROM pdp_data_inventory i LEFT JOIN third_party_register t ON t.id=i.third_party_id ORDER BY i.updated_at DESC"),
      db.query<any>("SELECT * FROM pdp_breaches WHERE explicitly_classified_personal_data=true ORDER BY created_at DESC"),
      db.query<any>("SELECT id,vendor_code,vendor_name FROM third_party_register ORDER BY vendor_name,vendor_code"),
    ]);
    if (!frameworkResult.rows[0]) throw new PdpStorageError("UU PDP framework is unavailable");
    const regulatoryReferences = referenceResult.rows.map((r): { controlId:string; reference:PdpRegulatoryReference } => ({ controlId:r.control_id,reference:{ id:r.id,regulationCode:r.regulation_code,regulationName:r.regulation_name,referenceIdentifier:r.reference_identifier,relationshipType:r.relationship_type,implementationSummary:r.implementation_summary,authoritativeSourceUrl:r.authoritative_source_url } }));
    const evidence = evidenceResult.rows.map((r):PdpEvidence=>({id:r.id,controlId:r.control_id,title:r.title,evidenceType:r.evidence_type,description:r.description,referenceLocation:r.reference_location,owner:r.owner,collectedAt:iso(r.collected_at),reviewStatus:r.review_status??"registered",reviewedBy:r.reviewed_by,reviewedAt:r.reviewed_at?iso(r.reviewed_at):null,reviewNotes:r.review_notes,createdBy:r.created_by,createdAt:iso(r.created_at),updatedBy:r.updated_by,updatedAt:iso(r.updated_at),notes:r.notes}));
    const remediations = remediationResult.rows.map((r): PdpRemediation => ({ id:r.id,findingId:r.finding_id,action:r.action,owner:r.owner,status:r.status,targetDate:dateOnly(r.target_date),completedAt:r.completed_at?iso(r.completed_at):null,notes:r.notes,updatedAt:iso(r.updated_at) }));
    const findings = findingResult.rows.map((r):PdpFinding=>({id:r.id,controlId:r.control_id,evidenceId:r.evidence_id,evidenceTitle:r.evidence_title,title:r.title,description:r.description,severity:r.severity,status:r.status,owner:r.owner,createdAt:iso(r.created_at),dueDate:dateOnly(r.due_date),remediations:remediations.filter(x=>x.findingId===r.id)}));
    const mapStatus = (status: string | null): PdpControl["assessmentStatus"] => status === "passed" ? "compliant" : status === "partial" ? "partial" : status === "failed" ? "non_compliant" : "not_assessed";
    const controls = controlResult.rows.map((r): PdpControl => ({ id:r.id,code:r.control_code,title:r.title,description:r.description,domain:r.category,assessmentStatus:mapStatus(r.status),assessedAt:r.assessed_at?iso(r.assessed_at):null,assessedBy:r.assessed_by,assessmentRationale:r.evidence,assessmentNotes:r.notes,regulatoryBasis:regulatoryReferences.filter(x=>x.controlId===r.id).map(x=>x.reference),evidence:evidence.filter(x=>x.controlId===r.id),findings:findings.filter(x=>x.controlId===r.id) }));
    const compliant=controls.filter(x=>x.assessmentStatus==="compliant").length, partial=controls.filter(x=>x.assessmentStatus==="partial").length, nonCompliant=controls.filter(x=>x.assessmentStatus==="non_compliant").length;
    const assessed=compliant+partial+nonCompliant;
    const assessmentSummary=calculateControlAssessmentSummary(compliant,partial,nonCompliant,controls.length);
    // Reuse the formal compliance methodology: passed / (passed + failed).
    // Partial remains visible but does not silently gain a numeric weight.
    const unresolved=findings.filter(x=>x.status!=="Resolved"&&x.status!=="Accepted");
    const eligible=remediations.length, completed=remediations.filter(x=>x.status==="Completed").length;
    const today=new Date().toISOString().slice(0,10);
    const inventory=inventoryResult.rows.map((r):PdpInventoryItem=>({id:r.id,dataAsset:r.data_asset,description:r.description,businessUnit:r.business_unit,personalDataCategory:r.personal_data_category,dataSubjectCategories:r.data_subject_categories,sensitiveDataStatus:r.sensitive_data_status??"not_recorded",dataOwner:r.data_owner,processingPurpose:r.processing_purpose,lawfulBasis:r.lawful_basis,personalDataSource:r.personal_data_source,dataFlowReference:r.data_flow_reference,retention:r.retention,deletionApproach:r.deletion_approach,processingLocation:r.processing_location,storageLocation:r.storage_location,crossBorderTransfer:r.cross_border_transfer??"not_recorded",transferDestination:r.transfer_destination,sharedWithThirdParties:r.shared_with_third_parties??"not_recorded",thirdPartyId:r.third_party_id,thirdPartyName:r.third_party_name,dataHubEntityId:r.data_hub_entity_id,recordStatus:r.record_status??"draft",createdBy:r.created_by,updatedBy:r.updated_by,createdAt:iso(r.created_at),updatedAt:iso(r.updated_at),nextReviewAt:dateOnly(r.next_review_at)}));
    const breaches=breachResult.rows.map((r):PdpBreach=>({id:r.id,title:r.title,timeline:r.timeline,impact:r.impact,affectedData:r.affected_data,affectedSubjects:r.affected_subjects,responseStatus:r.response_status,notificationStatus:r.notification_status,occurredAt:r.occurred_at?iso(r.occurred_at):null,detectedAt:r.detected_at?iso(r.detected_at):null,updatedAt:iso(r.updated_at)}));
    const inventoryThirdParties=thirdPartyResult.rows.map(r=>({id:r.id,vendorCode:r.vendor_code,vendorName:r.vendor_name}));
    return { framework:frameworkResult.rows[0], controls, inventory, inventoryThirdParties, breaches, kpis:{ ...assessmentSummary,compliant,partial,nonCompliant,notAssessed:controls.length-assessed,openFindings:unresolved.length,overdueFindings:unresolved.filter(x=>x.dueDate&&x.dueDate<today).length,criticalFindings:unresolved.filter(x=>x.severity==="Critical").length,remediationProgress:eligible?Math.round(completed/eligible*100):null,completedRemediations:completed,eligibleRemediations:eligible }, updatedAt:new Date().toISOString() };
  } catch (error) { if (error instanceof PdpStorageError) throw error; throw new PdpStorageError(error instanceof Error?error.message:"PDP storage unavailable"); }
}
