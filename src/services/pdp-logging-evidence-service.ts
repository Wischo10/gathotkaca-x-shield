import "server-only";
import { env } from "@/lib/env";
import { getDb } from "@/lib/db";
import { OPERATIONAL_LIFECYCLE_SQL } from "@/lib/incident-data-integrity";
import { fetchOpenSearch } from "@/services/ciso-service";
import type { PdpLoggingCandidateEvidence, PdpLoggingEvidenceSource } from "@/types/pdp";

function unavailable(detail: string): PdpLoggingEvidenceSource {
  return { status: "unavailable", observedRecords: null, latestObservationAt: null, detail };
}

async function wazuhEvidence(): Promise<PdpLoggingEvidenceSource> {
  try {
    const index = env.wazuhIndexer.alertsIndex();
    const result = await fetchOpenSearch<{
      timed_out?: boolean;
      _shards?: { total: number; failed: number };
      hits?: { total?: { value: number } };
      aggregations?: { latest_observation?: { value_as_string?: string }; monitored_agents?: { value?: number } };
    }>(`${env.wazuhIndexer.url().replace(/\/$/, "")}/${index}/_search`, {
      size: 0,
      track_total_hits: true,
      query: { range: { "@timestamp": { gte: "now-30d", lte: "now" } } },
      aggs: {
        latest_observation: { max: { field: "@timestamp" } },
        monitored_agents: { cardinality: { field: "agent.id" } },
      },
    }, 20000);
    const count = result.hits?.total?.value;
    const agents = result.aggregations?.monitored_agents?.value;
    const latest = result.aggregations?.latest_observation?.value_as_string;
    if (result.timed_out || !result._shards || result._shards.total <= 0 || result._shards.failed !== 0
      || !Number.isInteger(count) || count! < 0 || !Number.isInteger(agents) || agents! < 0) {
      throw new Error("Incomplete Wazuh aggregation");
    }
    return {
      status: "available",
      observedRecords: count!,
      latestObservationAt: latest && Number.isFinite(Date.parse(latest)) ? latest : null,
      monitoredAgents: agents!,
      detail: "Timestamped Wazuh security-alert observations during the last 30 days.",
    };
  } catch {
    return unavailable("Wazuh/OpenSearch candidate evidence is currently unavailable.");
  }
}

async function bitdefenderEvidence(): Promise<PdpLoggingEvidenceSource> {
  try {
    const result = await getDb().query<{ count: string; latest_observation: Date | null }>(
      `SELECT COUNT(*) AS count, MAX(event_timestamp) AS latest_observation
       FROM incident_lifecycle_events
       WHERE event_type = 'detected' AND source = 'bitdefender_sensor'
         AND ${OPERATIONAL_LIFECYCLE_SQL}`
    );
    const count = Number(result.rows[0]?.count);
    const latest = result.rows[0]?.latest_observation;
    if (!Number.isInteger(count) || count < 0) throw new Error("Invalid Bitdefender observation count");
    return {
      status: "available",
      observedRecords: count,
      latestObservationAt: latest ? new Date(latest).toISOString() : null,
      detail: "Persisted genuine Bitdefender sensor-detection observations with source provenance.",
    };
  } catch {
    return unavailable("Bitdefender candidate evidence is currently unavailable.");
  }
}

export async function getPdpLoggingCandidateEvidence(): Promise<PdpLoggingCandidateEvidence> {
  const [wazuh, bitdefender] = await Promise.all([wazuhEvidence(), bitdefenderEvidence()]);
  return {
    controlCode: "PDP-SC-03",
    readiness: wazuh.status === "available" || bitdefender.status === "available"
      ? "candidate_evidence_available" : "unavailable",
    generatedAt: new Date().toISOString(),
    wazuh,
    bitdefender,
  };
}
