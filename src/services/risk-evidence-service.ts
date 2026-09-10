import "server-only";
import { env } from "@/lib/env";
import { fetchOpenSearch, VULNERABILITY_SLA_POLICY } from "@/services/ciso-service";
import { getBitdefenderIncidentsWithLifecycle } from "@/services/incident-lifecycle-service";
import type { RiskEvidenceResponse, RiskEvidenceSuggestion } from "@/types/risk-evidence";

async function getWazuhEvidence(collectedAt: string): Promise<RiskEvidenceSuggestion[]> {
  const asOf = Date.now();
  const index = env.wazuhIndexer.vulnerabilityIndex();
  const response = await fetchOpenSearch<{
    timed_out: boolean;
    _shards: { total: number; failed: number };
    aggregations?: { cves?: { buckets: Array<{
      key: string; doc_count: number;
      affected_assets: { value: number };
      oldest_detection: { value: number | null };
      missing_detection: { doc_count: number };
      future_detection: { doc_count: number };
    }> } };
  }>(`${env.wazuhIndexer.url().replace(/\/$/, "")}/${index}/_search`, {
    size: 0,
    query: { term: { "vulnerability.severity": "Critical" } },
    aggs: { cves: { terms: { field: "vulnerability.id", size: 25, order: { oldest_detection: "asc" } }, aggs: {
      affected_assets: { cardinality: { field: "agent.id" } },
      oldest_detection: { min: { field: "vulnerability.detected_at" } },
      missing_detection: { missing: { field: "vulnerability.detected_at" } },
      future_detection: { filter: { range: { "vulnerability.detected_at": { gt: asOf } } } },
    } } },
  }, 20000);
  if (response.timed_out || !response._shards || response._shards.total <= 0 || response._shards.failed !== 0
    || !Array.isArray(response.aggregations?.cves?.buckets)) throw new Error("OpenSearch evidence query unavailable");

  const dayMs = 86400000;
  return response.aggregations.cves.buckets.map(bucket => {
    const oldest = bucket.oldest_detection?.value;
    const age = typeof oldest === "number" && Number.isFinite(oldest) ? (asOf - oldest) / dayMs : null;
    const slaState = age !== null && age > VULNERABILITY_SLA_POLICY.thresholds.Critical ? "Overdue"
      : age === null || age < 0 || bucket.missing_detection.doc_count > 0 || bucket.future_detection.doc_count > 0 ? "Unclassified"
      : age >= VULNERABILITY_SLA_POLICY.dueSoonThresholdDays ? "Due Soon" : "Compliant";
    return {
      id: `wazuh:${bucket.key}`, source: "Wazuh/OpenSearch" as const,
      sourceReference: bucket.key, kind: "vulnerability" as const,
      summary: `${bucket.key} is currently reported as a Critical vulnerability.`,
      technicalSeverity: "Critical", affectedAsset: null,
      affectedAssetCount: bucket.affected_assets.value,
      observedAt: typeof oldest === "number" ? new Date(oldest).toISOString() : null,
      slaState, status: null, alertCount: null, attackTypes: [], collectedAt,
    };
  });
}

export async function getRiskEvidenceSuggestions(): Promise<RiskEvidenceResponse> {
  const collectedAt = new Date().toISOString();
  const [wazuh, bitdefender] = await Promise.allSettled([
    getWazuhEvidence(collectedAt), getBitdefenderIncidentsWithLifecycle(1, 25),
  ]);
  const suggestions = wazuh.status === "fulfilled" ? [...wazuh.value] : [];
  if (bitdefender.status === "fulfilled") {
    suggestions.push(...bitdefender.value.items.map(incident => ({
      id: `bitdefender:${incident.id}`, source: "Bitdefender GravityZone" as const,
      sourceReference: incident.id, kind: "incident" as const,
      summary: incident.detectionName || incident.name, technicalSeverity: incident.severity,
      affectedAsset: incident.endpoint ?? null, affectedAssetCount: null, observedAt: incident.detectedAt,
      slaState: null, status: incident.status, alertCount: incident.alertCount,
      attackTypes: incident.attackTypes ?? [], collectedAt,
    })));
  }
  return {
    suggestions,
    sources: {
      wazuh: { available: wazuh.status === "fulfilled", ...(wazuh.status === "rejected" ? { error: "Wazuh vulnerability evidence unavailable" } : {}) },
      bitdefender: { available: bitdefender.status === "fulfilled", ...(bitdefender.status === "rejected" ? { error: "Bitdefender incident evidence unavailable" } : {}) },
    },
  };
}
