import "server-only";
import { deriveThirdPartySummary, listThirdParties } from "@/services/third-party-register-service";
import type { PdpThirdPartyProcessingCandidateEvidence } from "@/types/pdp";

export async function getPdpThirdPartyProcessingCandidateEvidence():Promise<PdpThirdPartyProcessingCandidateEvidence>{
  const schemaCapabilities={
    storedFields:["Vendor identity","Provided service","Internal owner","Criticality","Lifecycle status","Third-party risk assessment","Risk treatment","Assessment and review timestamps"],
    missingPdpFields:["Personal-data processing relationship","Processor/controller role","Personal-data categories","Processing purpose","DPA/agreement status","Written processing instructions","Processing/storage location","Cross-border transfer applicability","Privacy/PDP review status"],
  };
  try {
    const records=await listThirdParties(),summary=deriveThirdPartySummary(records);
    const riskClassifications={Low:0,Medium:0,High:0,Critical:0};
    for(const record of records)if(record.assessmentStatus==="assessed"&&record.riskRating)riskClassifications[record.riskRating]++;
    const dates=(key:"assessedAt"|"updatedAt")=>records.map(record=>record[key]).filter((value):value is string=>Boolean(value)).sort().at(-1)??null;
    return {controlCode:"PDP-PC-06",readiness:"candidate_evidence_available",generatedAt:new Date().toISOString(),source:{status:"available",registered:summary.totalVendors,assessed:summary.assessed,awaitingAssessment:summary.needsAssessment,assessmentCoveragePercent:summary.assessmentCoveragePct,riskClassifications,recordsWithInternalOwner:records.filter(record=>Boolean(record.internalOwner.trim())).length,latestAssessmentAt:dates("assessedAt"),latestUpdateAt:dates("updatedAt")},schemaCapabilities};
  } catch {
    return {controlCode:"PDP-PC-06",readiness:"unavailable",generatedAt:new Date().toISOString(),source:{status:"unavailable",registered:null,assessed:null,awaitingAssessment:null,assessmentCoveragePercent:null,riskClassifications:null,recordsWithInternalOwner:null,latestAssessmentAt:null,latestUpdateAt:null},schemaCapabilities};
  }
}
