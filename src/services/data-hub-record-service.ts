import "server-only";

import https from "node:https";
import { env } from "@/lib/env";
import { getPostgresPool } from "@/lib/db";
import { getThreatIntelligenceOverview } from "@/services/threat-intel";
import type { DataHubRecord, DataHubRecordPreview, DataHubRecordType } from "@/types/data-hub";
import type { DataProvenance } from "@/types/provenance";

export const DATA_HUB_RECORD_LIMIT_DEFAULT = 20;
export const DATA_HUB_RECORD_LIMIT_MAX = 50;

export const DATA_HUB_RECORD_COMBINATIONS = {
  wazuh: ["SECURITY_ALERT", "VULNERABILITY_FINDING"],
  bitdefender: ["ENDPOINT_INCIDENT"],
  threatfox: ["THREAT_INTEL_IOC"],
  postgresql: ["RISK_RECORD", "INCIDENT_LIFECYCLE", "VULNERABILITY_REMEDIATION", "THIRD_PARTY_ASSESSMENT", "COMPLIANCE_ASSESSMENT"],
} as const satisfies Record<string, readonly DataHubRecordType[]>;

export type DataHubPreviewSourceId = keyof typeof DATA_HUB_RECORD_COMBINATIONS;

const REAL_PROVENANCE = (source: string): DataProvenance => ({
  mode: "REAL",
  sources: [source],
  explanation: `Read directly from the authoritative ${source} source; not persisted by Data Hub.`,
});

function iso(value: unknown): string | null {
  if (typeof value !== "string" && !(value instanceof Date)) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function recordId(source: string, externalId: string | null, fallback: number) {
  return `${source}:${externalId ?? fallback}`;
}

function requestJson<T>(url: string, options: { headers: Record<string, string>; body: object; allowSelfSigned?: boolean }): Promise<T> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const body = JSON.stringify(options.body);
    const request = https.request({
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: { ...options.headers, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
      agent: new https.Agent({ rejectUnauthorized: !options.allowSelfSigned }),
      timeout: 12_000,
    }, response => {
      let raw = "";
      response.on("data", chunk => { raw += chunk; });
      response.on("end", () => {
        if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) return reject(new Error("preview_source_unavailable"));
        try { resolve(JSON.parse(raw) as T); }
        catch { reject(new Error("preview_invalid_response")); }
      });
    });
    request.on("timeout", () => request.destroy(new Error("preview_source_timeout")));
    request.on("error", reject);
    request.write(body);
    request.end();
  });
}

interface OpenSearchHit { _id?: string; _index?: string; _source?: Record<string, unknown> }
interface OpenSearchResponse { timed_out?: boolean; _shards?: { failed?: number }; hits?: { hits?: OpenSearchHit[] } }

async function openSearchPreview(index: string, body: object): Promise<OpenSearchHit[]> {
  const token = Buffer.from(`${env.wazuhIndexer.username()}:${env.wazuhIndexer.password()}`).toString("base64");
  const base = env.wazuhIndexer.url().replace(/\/$/, "");
  const result = await requestJson<OpenSearchResponse>(`${base}/${encodeURIComponent(index)}/_search`, {
    headers: { Authorization: `Basic ${token}` }, body, allowSelfSigned: env.wazuh.allowSelfSigned(),
  });
  if (result.timed_out || (result._shards?.failed ?? 0) > 0 || !Array.isArray(result.hits?.hits)) throw new Error("preview_source_unavailable");
  return result.hits.hits;
}

function nested(source: Record<string, unknown>, key: string): Record<string, unknown> {
  const value = source[key];
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

async function previewWazuhAlerts(limit: number): Promise<DataHubRecord[]> {
  const hits = await openSearchPreview(env.wazuhIndexer.alertsIndex(), {
    size: limit,
    sort: [{ "@timestamp": { order: "desc", unmapped_type: "date" } }],
    _source: ["@timestamp", "rule.id", "rule.description", "rule.level", "rule.mitre.id", "agent.id", "agent.name"],
  });
  return hits.map((hit, index) => {
    const source = hit._source ?? {};
    const rule = nested(source, "rule");
    const agent = nested(source, "agent");
    const externalId = text(hit._id);
    const mitre = nested(rule, "mitre");
    const mitreIds = Array.isArray(mitre.id) ? mitre.id.map(String).slice(0, 20) : [];
    return {
      id: recordId("wazuh-alert", externalId, index), sourceId: "wazuh", sourceName: "Wazuh / OpenSearch",
      recordType: "SECURITY_ALERT", externalId, title: text(rule.description),
      severity: rule.level === undefined || rule.level === null ? null : `Wazuh level ${String(rule.level)}`,
      entity: text(agent.name) ? { type: "Agent", value: text(agent.name)! } : null,
      timestamp: { value: iso(source["@timestamp"]), meaning: iso(source["@timestamp"]) ? "OBSERVED_AT" : null },
      provenance: REAL_PROVENANCE("Wazuh / OpenSearch"),
      metadata: { ruleId: text(rule.id), wazuhLevel: typeof rule.level === "number" ? rule.level : text(rule.level), agentId: text(agent.id), mitreIds },
    };
  });
}

async function previewWazuhVulnerabilities(limit: number): Promise<DataHubRecord[]> {
  const hits = await openSearchPreview(env.wazuhIndexer.vulnerabilityIndex(), {
    size: limit,
    sort: [{ "vulnerability.detected_at": { order: "desc", unmapped_type: "date" } }],
    _source: ["vulnerability.id", "vulnerability.title", "vulnerability.severity", "vulnerability.detected_at", "agent.id", "agent.name", "package.name", "package.version"],
  });
  return hits.map((hit, index) => {
    const source = hit._source ?? {};
    const vulnerability = nested(source, "vulnerability");
    const agent = nested(source, "agent");
    const pkg = nested(source, "package");
    const externalId = text(hit._id);
    const cve = text(vulnerability.id);
    const vulnerabilityTitle = text(vulnerability.title);
    const detectedAt = iso(vulnerability.detected_at);
    return {
      id: recordId("wazuh-vulnerability", externalId, index), sourceId: "wazuh", sourceName: "Wazuh / OpenSearch",
      recordType: "VULNERABILITY_FINDING", externalId,
      title: [cve, vulnerabilityTitle].filter(Boolean).join(" - ") || null,
      severity: text(vulnerability.severity),
      entity: text(agent.name) ? { type: "Affected agent", value: text(agent.name)! } : null,
      timestamp: { value: detectedAt, meaning: detectedAt ? "OBSERVED_AT" : null },
      provenance: REAL_PROVENANCE("Wazuh / OpenSearch"),
      metadata: { cve, agentId: text(agent.id), package: text(pkg.name), packageVersion: text(pkg.version) },
    };
  });
}

interface BitdefenderListResponse { error?: unknown; result?: { items?: Array<Record<string, unknown>> } }
interface BitdefenderDetailsResponse { error?: unknown; result?: Array<Record<string, unknown>> }

async function bitdefenderRpc<T>(body: object): Promise<T> {
  const token = Buffer.from(`${env.bitdefender.apiKey()}:`).toString("base64");
  return requestJson<T>(env.bitdefender.apiUrl(), { headers: { Authorization: `Basic ${token}` }, body });
}

async function previewBitdefender(limit: number): Promise<DataHubRecord[]> {
  const list = await bitdefenderRpc<BitdefenderListResponse>({
    jsonrpc: "2.0", id: "data_hub_preview_list", method: "getIncidentsList",
    params: { filters: { status: ["open", "in_progress"] }, page: 1, perPage: limit },
  });
  if (list.error || !Array.isArray(list.result?.items)) throw new Error("preview_source_unavailable");
  const ids = list.result.items.map(item => text(item.incidentId) ?? text(item.id)).filter((value): value is string => Boolean(value));
  let details: Array<Record<string, unknown>> = [];
  if (ids.length) {
    const detailResult = await bitdefenderRpc<BitdefenderDetailsResponse>({ jsonrpc: "2.0", id: "data_hub_preview_details", method: "getIncidentsByIds", params: { ids } });
    if (!detailResult.error && Array.isArray(detailResult.result)) details = detailResult.result;
  }
  const detailsById = new Map(details.map(item => [text(item.incidentId) ?? text(item.id), item]));
  return list.result.items.map((item, index) => {
    const externalId = text(item.incidentId) ?? text(item.id);
    const detail = (externalId && detailsById.get(externalId)) || item;
    const detailBody = nested(detail, "details");
    const alerts = Array.isArray(detailBody.alerts) ? detailBody.alerts as Array<Record<string, unknown>> : [];
    const detectedAt = alerts.map(alert => iso(alert.date)).filter((value): value is string => Boolean(value)).sort()[0] ?? null;
    const severityScore = typeof detail.severityScore === "number" ? detail.severityScore : Number(detail.severityScore);
    const severity = Number.isFinite(severityScore) ? severityScore >= 70 ? "Critical" : severityScore >= 50 ? "High" : severityScore >= 20 ? "Medium" : "Low" : null;
    const attackTypes = Array.isArray(detail.attackTypes) ? detail.attackTypes.map(String).slice(0, 20) : [];
    return {
      id: recordId("bitdefender", externalId, index), sourceId: "bitdefender", sourceName: "Bitdefender GravityZone",
      recordType: "ENDPOINT_INCIDENT", externalId,
      title: text(detailBody.detectionName) ?? text(detail.name) ?? (externalId ? `Endpoint incident ${externalId}` : null),
      severity,
      entity: text(detailBody.computerName) ? { type: "Endpoint", value: text(detailBody.computerName)! } : null,
      timestamp: { value: detectedAt, meaning: detectedAt ? "DETECTED_AT" : null },
      provenance: REAL_PROVENANCE("Bitdefender GravityZone"),
      metadata: { status: text(detail.status), attackTypes, alertCount: alerts.length },
    };
  });
}

async function previewThreatFox(limit: number): Promise<DataHubRecord[]> {
  const overview = await getThreatIntelligenceOverview();
  if (overview.availability === "unavailable") throw new Error("preview_source_unavailable");
  return overview.observedIocs.slice(0, limit).map((ioc, index) => ({
    id: recordId("threatfox", ioc.id, index), sourceId: "threatfox", sourceName: "ThreatFox",
    recordType: "THREAT_INTEL_IOC", externalId: ioc.id, title: ioc.indicator, severity: null,
    entity: { type: ioc.iocType || "IOC", value: ioc.indicator },
    timestamp: { value: ioc.observedAt, meaning: ioc.observedAt ? "FIRST_SEEN" : null },
    provenance: REAL_PROVENANCE("ThreatFox"),
    metadata: { iocType: ioc.iocType, malware: ioc.malware, confidence: ioc.confidence },
  }));
}

type DbRow = Record<string, unknown>;

async function previewPostgres(recordType: DataHubRecordType, limit: number): Promise<DataHubRecord[]> {
  if (!env.database.url()) throw new Error("preview_source_unavailable");
  const pool = getPostgresPool();
  let rows: DbRow[];
  if (recordType === "RISK_RECORD") {
    ({ rows } = await pool.query("SELECT id, risk_code, title, residual_risk, severity, assessment_status, treatment_status, updated_at FROM risk_register ORDER BY updated_at DESC, risk_code ASC LIMIT $1", [limit]));
  } else if (recordType === "INCIDENT_LIFECYCLE") {
    ({ rows } = await pool.query("SELECT id, incident_id, event_type, source, created_at FROM incident_lifecycle_events ORDER BY created_at DESC, id DESC LIMIT $1", [limit]));
  } else if (recordType === "VULNERABILITY_REMEDIATION") {
    ({ rows } = await pool.query("SELECT id, cve, agent_id, agent_name, status, target_date, updated_at FROM vulnerability_remediations ORDER BY updated_at DESC, id DESC LIMIT $1", [limit]));
  } else if (recordType === "THIRD_PARTY_ASSESSMENT") {
    ({ rows } = await pool.query("SELECT id, vendor_code, vendor_name, criticality, lifecycle_status, assessment_status, risk_rating, assessed_at, updated_at FROM third_party_register ORDER BY updated_at DESC, vendor_code ASC LIMIT $1", [limit]));
  } else if (recordType === "COMPLIANCE_ASSESSMENT") {
    ({ rows } = await pool.query("SELECT a.id, a.framework_id, c.control_code, c.title, a.status, a.source, a.assessed_at FROM compliance_assessments a JOIN compliance_controls c ON c.id = a.control_id WHERE a.source IN ('manual', 'audit') ORDER BY a.assessed_at DESC, a.id DESC LIMIT $1", [limit]));
  } else throw new Error("invalid_preview_combination");

  return rows.map((row, index): DataHubRecord => {
    const externalId = text(row.id);
    const base = {
      id: recordId(`postgresql-${recordType.toLowerCase()}`, externalId, index), sourceId: "postgresql", sourceName: "PostgreSQL",
      recordType, externalId, provenance: REAL_PROVENANCE("PostgreSQL"),
    };
    if (recordType === "RISK_RECORD") return { ...base, title: text(row.title), severity: text(row.residual_risk) ?? text(row.severity), entity: text(row.risk_code) ? { type: "Risk", value: text(row.risk_code)! } : null, timestamp: { value: iso(row.updated_at), meaning: iso(row.updated_at) ? "UPDATED_AT" : null }, metadata: { assessmentStatus: text(row.assessment_status), treatmentStatus: text(row.treatment_status) } };
    if (recordType === "INCIDENT_LIFECYCLE") return { ...base, title: text(row.event_type) ? `Incident lifecycle: ${text(row.event_type)!.replaceAll("_", " ")}` : null, severity: null, entity: text(row.incident_id) ? { type: "Incident", value: text(row.incident_id)! } : null, timestamp: { value: iso(row.created_at), meaning: iso(row.created_at) ? "PERSISTED_AT" : null }, metadata: { eventType: text(row.event_type), source: text(row.source) } };
    if (recordType === "VULNERABILITY_REMEDIATION") return { ...base, title: text(row.cve) ? `Remediation for ${text(row.cve)}` : "Vulnerability remediation", severity: null, entity: text(row.agent_name) || text(row.agent_id) ? { type: "Affected agent", value: text(row.agent_name) ?? text(row.agent_id)! } : null, timestamp: { value: iso(row.updated_at), meaning: iso(row.updated_at) ? "UPDATED_AT" : null }, metadata: { cve: text(row.cve), status: text(row.status), targetDate: row.target_date instanceof Date ? row.target_date.toISOString().slice(0, 10) : text(row.target_date) } };
    if (recordType === "THIRD_PARTY_ASSESSMENT") {
      const assessedAt = iso(row.assessed_at); const updatedAt = iso(row.updated_at);
      return { ...base, title: text(row.vendor_name), severity: text(row.risk_rating) ?? text(row.criticality), entity: text(row.vendor_code) ? { type: "Vendor", value: text(row.vendor_code)! } : null, timestamp: assessedAt ? { value: assessedAt, meaning: "ASSESSED_AT" } : { value: updatedAt, meaning: updatedAt ? "UPDATED_AT" : null }, metadata: { assessmentStatus: text(row.assessment_status), lifecycleStatus: text(row.lifecycle_status) } };
    }
    const assessedAt = iso(row.assessed_at);
    return { ...base, title: text(row.title), severity: null, entity: text(row.control_code) ? { type: "Control", value: text(row.control_code)! } : null, timestamp: { value: assessedAt, meaning: assessedAt ? "ASSESSED_AT" : null }, metadata: { framework: text(row.framework_id), result: text(row.status), assessmentSource: text(row.source) } };
  });
}

export function isDataHubRecordCombination(sourceId: string, recordType: string): sourceId is DataHubPreviewSourceId {
  const types = DATA_HUB_RECORD_COMBINATIONS[sourceId as DataHubPreviewSourceId];
  return Boolean(types?.includes(recordType as never));
}

export async function getDataHubRecordPreview(sourceId: DataHubPreviewSourceId, recordType: DataHubRecordType, limit: number): Promise<DataHubRecordPreview> {
  if (!isDataHubRecordCombination(sourceId, recordType)) throw new Error("invalid_preview_combination");
  let records: DataHubRecord[];
  if (sourceId === "wazuh" && recordType === "SECURITY_ALERT") records = await previewWazuhAlerts(limit);
  else if (sourceId === "wazuh" && recordType === "VULNERABILITY_FINDING") records = await previewWazuhVulnerabilities(limit);
  else if (sourceId === "bitdefender" && recordType === "ENDPOINT_INCIDENT") records = await previewBitdefender(limit);
  else if (sourceId === "threatfox" && recordType === "THREAT_INTEL_IOC") records = await previewThreatFox(limit);
  else if (sourceId === "postgresql") records = await previewPostgres(recordType, limit);
  else throw new Error("invalid_preview_combination");
  return { sourceId, recordType, limit, records: records.slice(0, limit) };
}
