import "server-only";
import { getDb } from "@/lib/db";
import { OPERATIONAL_LIFECYCLE_SQL } from "@/lib/incident-data-integrity";
import { getBitdefenderActiveIncidents } from "@/services/ciso-service";
import type { PdpIncidentResponseCandidateEvidence } from "@/types/pdp";

type LifecycleRow = { detected:string; acknowledged:string; contained:string; resolved:string; latest_event_at:Date|string|null; latest_detection_at:Date|string|null };
const iso=(value:Date|string|null|undefined)=>value?new Date(value).toISOString():null;

async function lifecycleEvidence() {
  try {
    const result=await getDb().query<LifecycleRow>(`SELECT COUNT(*) FILTER (WHERE event_type='detected') AS detected,COUNT(*) FILTER (WHERE event_type='acknowledged') AS acknowledged,COUNT(*) FILTER (WHERE event_type='contained') AS contained,COUNT(*) FILTER (WHERE event_type='resolved') AS resolved,MAX(event_timestamp) AS latest_event_at,MAX(event_timestamp) FILTER (WHERE event_type='detected') AS latest_detection_at FROM incident_lifecycle_events WHERE event_type IN ('detected','acknowledged','contained','resolved') AND ${OPERATIONAL_LIFECYCLE_SQL}`);
    const row=result.rows[0],values=[row?.detected,row?.acknowledged,row?.contained,row?.resolved].map(Number);
    if(!row||values.some(value=>!Number.isInteger(value)||value<0))throw new Error("Invalid lifecycle aggregate");
    return {status:"available" as const,counts:{detected:values[0],acknowledged:values[1],contained:values[2],resolved:values[3]},latestEventAt:iso(row.latest_event_at),latestDetectionAt:iso(row.latest_detection_at)};
  } catch {
    return {status:"unavailable" as const,counts:{detected:null,acknowledged:null,contained:null,resolved:null},latestEventAt:null,latestDetectionAt:null};
  }
}

async function breachEvidence():Promise<PdpIncidentResponseCandidateEvidence["sources"]["pdpBreachRegister"]>{
  try {
    const result=await getDb().query<{count:string;timeline_count:string;latest_record_at:Date|string|null}>("SELECT COUNT(*) AS count,COUNT(*) FILTER (WHERE length(btrim(timeline))>0) AS timeline_count,MAX(created_at) AS latest_record_at FROM pdp_breaches WHERE explicitly_classified_personal_data=true");
    const count=Number(result.rows[0]?.count),timelineRecords=Number(result.rows[0]?.timeline_count);if(!Number.isInteger(count)||count<0||!Number.isInteger(timelineRecords)||timelineRecords<0)throw new Error("Invalid breach aggregate");
    return {status:"available",confirmedRecords:count,timelineRecords,latestRecordAt:iso(result.rows[0]?.latest_record_at)};
  } catch { return {status:"unavailable",confirmedRecords:null,timelineRecords:null,latestRecordAt:null}; }
}

export async function getPdpIncidentResponseCandidateEvidence():Promise<PdpIncidentResponseCandidateEvidence>{
  const [incident,lifecycle,pdpBreachRegister]=await Promise.all([getBitdefenderActiveIncidents().catch(()=>null),lifecycleEvidence(),breachEvidence()]);
  const currentIncidents=incident?.availability?.status==="available"&&typeof incident.value==="number"?incident.value:null;
  const sources:PdpIncidentResponseCandidateEvidence["sources"]={bitdefender:{status:currentIncidents!==null||lifecycle.counts.detected!==null?"available":"unavailable",currentIncidents,retainedDetections:lifecycle.counts.detected,latestDetectionAt:lifecycle.latestDetectionAt},lifecycle:{status:lifecycle.status,counts:lifecycle.counts,latestEventAt:lifecycle.latestEventAt},pdpBreachRegister};
  return {controlCode:"PDP-SC-06",readiness:Object.values(sources).some(source=>source.status==="available")?"candidate_evidence_available":"unavailable",generatedAt:new Date().toISOString(),sources,capabilities:{authenticatedAcknowledge:true,authenticatedContainment:true,authenticatedResolution:true}};
}
