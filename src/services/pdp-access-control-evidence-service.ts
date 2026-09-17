import "server-only";
import { env } from "@/lib/env";
import { fetchOpenSearch } from "@/services/ciso-service";
import type { PdpAccessControlCandidateEvidence } from "@/types/pdp";

type FilterBucket={doc_count?:number};

export async function getPdpAccessControlCandidateEvidence():Promise<PdpAccessControlCandidateEvidence>{
  const unavailable:PdpAccessControlCandidateEvidence={controlCode:"PDP-SC-01",readiness:"unavailable",generatedAt:new Date().toISOString(),wazuh:{status:"unavailable",authenticationSuccess:null,authenticationFailure:null,sudoActivity:null,monitoredAgents:null,latestObservationAt:null,semanticBasis:[]},iamGovernanceSource:"not_available"};
  try {
    const index=env.wazuhIndexer.alertsIndex();
    const response=await fetchOpenSearch<{timed_out?:boolean;_shards?:{total:number;failed:number};aggregations?:{access_events?:FilterBucket&{authentication_success?:FilterBucket;authentication_failure?:FilterBucket;sudo_activity?:FilterBucket;monitored_agents?:{value?:number};latest_observation?:{value_as_string?:string}}}}>(`${env.wazuhIndexer.url().replace(/\/$/,"")}/${index}/_search`,{
      size:0,query:{range:{"@timestamp":{gte:"now-30d",lte:"now"}}},aggs:{access_events:{filter:{bool:{should:[{term:{"rule.groups":"authentication_success"}},{term:{"rule.groups":"authentication_failed"}},{term:{"rule.groups":"sudo"}}],minimum_should_match:1}},aggs:{authentication_success:{filter:{term:{"rule.groups":"authentication_success"}}},authentication_failure:{filter:{term:{"rule.groups":"authentication_failed"}}},sudo_activity:{filter:{term:{"rule.groups":"sudo"}}},monitored_agents:{cardinality:{field:"agent.id"}},latest_observation:{max:{field:"@timestamp"}}}}}
    },20000);
    const agg=response.aggregations?.access_events;
    const values=[agg?.authentication_success?.doc_count,agg?.authentication_failure?.doc_count,agg?.sudo_activity?.doc_count,agg?.monitored_agents?.value];
    if(response.timed_out||!response._shards||response._shards.total<=0||response._shards.failed!==0||values.some(value=>!Number.isInteger(value)||value!<0))return unavailable;
    const latest=agg?.latest_observation?.value_as_string;
    return {controlCode:"PDP-SC-01",readiness:"candidate_evidence_available",generatedAt:new Date().toISOString(),wazuh:{status:"available",authenticationSuccess:values[0]!,authenticationFailure:values[1]!,sudoActivity:values[2]!,monitoredAgents:values[3]!,latestObservationAt:latest&&Number.isFinite(Date.parse(latest))?latest:null,semanticBasis:["Wazuh rule.groups=authentication_success","Wazuh rule.groups=authentication_failed","Wazuh rule.groups=sudo"]},iamGovernanceSource:"not_available"};
  } catch { return unavailable; }
}
