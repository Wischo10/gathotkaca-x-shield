import "server-only";
import { getPdpIncidentResponseCandidateEvidence } from "@/services/pdp-incident-response-evidence-service";
import type { PdpIncidentTimelineCandidateEvidence } from "@/types/pdp";

export async function getPdpIncidentTimelineCandidateEvidence():Promise<PdpIncidentTimelineCandidateEvidence>{
  const evidence=await getPdpIncidentResponseCandidateEvidence();
  return {controlCode:"PDP-PB-01",readiness:evidence.readiness,generatedAt:evidence.generatedAt,sources:evidence.sources,occurrenceTimestamp:"not_available_not_verified"};
}
