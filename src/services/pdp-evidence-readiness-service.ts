import "server-only";
import { derivePdpEvidenceMatrix,summarizePdpEvidenceReadiness } from "@/lib/pdp-evidence-readiness";
import { getPdpBaseline } from "@/services/pdp-service";
import { getPdpAccessControlCandidateEvidence } from "@/services/pdp-access-control-evidence-service";
import { getPdpMonitoringCandidateEvidence } from "@/services/pdp-monitoring-evidence-service";
import { getPdpIncidentResponseCandidateEvidence } from "@/services/pdp-incident-response-evidence-service";
import { getPdpThirdPartyProcessingCandidateEvidence } from "@/services/pdp-third-party-evidence-service";
import type { PdpEvidenceMatrixData } from "@/types/pdp";

export async function getPdpEvidenceReadinessMatrix():Promise<PdpEvidenceMatrixData>{
  const [baseline,access,monitoring,incidents,thirdParty]=await Promise.all([getPdpBaseline(),getPdpAccessControlCandidateEvidence(),getPdpMonitoringCandidateEvidence(),getPdpIncidentResponseCandidateEvidence(),getPdpThirdPartyProcessingCandidateEvidence()]);
  const inventory=baseline.inventory,total=inventory.length,count=(field:(item:typeof inventory[number])=>boolean)=>inventory.filter(field).length;
  const technical={
    "PDP-SC-01":access.readiness==="candidate_evidence_available"?"available" as const:"unavailable" as const,
    "PDP-SC-03":monitoring.sources.wazuh.status==="available"||monitoring.sources.bitdefender.status==="available"?"available" as const:"unavailable" as const,
    "PDP-SC-04":monitoring.readiness==="candidate_evidence_available"?"available" as const:"unavailable" as const,
    "PDP-SC-06":incidents.readiness==="candidate_evidence_available"?"available" as const:"unavailable" as const,
    "PDP-PC-06":thirdParty.readiness==="candidate_evidence_available"?"available" as const:"unavailable" as const,
    "PDP-PB-01":incidents.readiness==="candidate_evidence_available"?"available" as const:"unavailable" as const,
  };
  const show=(value:number|null)=>value===null?"Unavailable":String(value);
  const summaries:Record<string,string>={
    "PDP-SC-01":`Wazuh access telemetry: ${show(access.wazuh.authenticationSuccess)} successful authentication, ${show(access.wazuh.authenticationFailure)} failed authentication, ${show(access.wazuh.sudoActivity)} sudo observations`,
    "PDP-SC-02":`No authoritative technical encryption source · ${baseline.controls.find(c=>c.code==="PDP-SC-02")?.evidence.length??0} organizational evidence records`,
    "PDP-SC-03":`Wazuh and Bitdefender candidate evidence ${technical["PDP-SC-03"]==="available"?"available":"unavailable"}`,
    "PDP-SC-04":`Monitoring telemetry and threat-intelligence evidence ${technical["PDP-SC-04"]==="available"?"available":"unavailable"}`,
    "PDP-SC-05":`No authoritative backup or restore-test source · ${baseline.controls.find(c=>c.code==="PDP-SC-05")?.evidence.length??0} organizational evidence records`,
    "PDP-SC-06":`${show(incidents.sources.bitdefender.currentIncidents)} current security incidents · lifecycle detected ${show(incidents.sources.lifecycle.counts.detected)}, acknowledged ${show(incidents.sources.lifecycle.counts.acknowledged)}, contained ${show(incidents.sources.lifecycle.counts.contained)}, resolved ${show(incidents.sources.lifecycle.counts.resolved)}`,
    "PDP-PC-01":`Evidence Registry only · ${baseline.controls.find(c=>c.code==="PDP-PC-01")?.evidence.length??0} organizational evidence records`,
    "PDP-PC-03":`No authoritative DSR source · ${baseline.controls.find(c=>c.code==="PDP-PC-03")?.evidence.length??0} organizational evidence records`,
    "PDP-PC-04":`${count(item=>Boolean(item.retention))} / ${total} retention and ${count(item=>Boolean(item.deletionApproach))} / ${total} deletion approaches recorded`,
    "PDP-PC-06":`${show(thirdParty.source.registered)} vendors registered · ${show(thirdParty.source.assessed)} risk assessed · PDP classification not recorded`,
    "PDP-PB-01":`${show(incidents.sources.lifecycle.counts.detected)} retained detections · ${baseline.breaches.length} confirmed PDP breach timelines`,
    "PDP-PB-06":`${baseline.breaches.length} confirmed PDP breach cases · ${baseline.controls.find(c=>c.code==="PDP-PB-06")?.evidence.length??0} organizational evidence records`,
  };
  const rows=derivePdpEvidenceMatrix(baseline.controls.map(control=>({id:control.id,code:control.code,name:control.title,domain:control.domain,assessment:control.assessmentStatus,references:control.regulatoryBasis,evidence:control.evidence})),{processingActivities:total,ropaRecorded:{total,categories:count(item=>Boolean(item.personalDataCategory)),owners:count(item=>Boolean(item.dataOwner)),purposes:count(item=>Boolean(item.processingPurpose)),dataFlows:count(item=>Boolean(item.dataFlowReference)),retention:count(item=>Boolean(item.retention)),locations:count(item=>Boolean(item.processingLocation)),lawfulBasis:count(item=>Boolean(item.lawfulBasis)),sharingStates:count(item=>item.sharedWithThirdParties!=="not_recorded")},confirmedBreaches:baseline.breaches.length,technical,summaries});
  return {generatedAt:new Date().toISOString(),rows,summary:summarizePdpEvidenceReadiness(rows),sourceStatus:{baseline:"available",technical:Object.values(technical).some(status=>status==="available")?"available":"unavailable",ropa:"available",registry:"available",breachRegister:"available"}};
}
