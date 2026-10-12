import "server-only";

import https from "node:https";
import { env } from "@/lib/env";
import { getPostgresPool } from "@/lib/db";
import { getAgentsSummary } from "@/services/wazuh-manager";
import { getThreatIntelligenceOverview } from "@/services/threat-intel";
import type { DataHubSource, DataHubSourceRegistry, DataHubSourceStatus } from "@/types/data-hub";
import type { DataProvenance, DataProvenanceMode } from "@/types/provenance";

const CHECK_TIMEOUT_MS = 10_000;

function bounded<T>(work: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    work,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("health_check_timeout")), timeoutMs)),
  ]);
}

function provenance(mode: DataProvenanceMode, source: string, explanation: string): DataProvenance {
  return { mode, sources: mode === "NOT_AVAILABLE" ? [] : [source], explanation };
}

function requestJson<T>(url: string, options: { headers?: Record<string, string>; body?: object; allowSelfSigned?: boolean; timeoutMs?: number } = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const body = options.body ? JSON.stringify(options.body) : undefined;
    const request = https.request({
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: body ? "POST" : "GET",
      headers: { ...options.headers, ...(body ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } : {}) },
      agent: new https.Agent({ rejectUnauthorized: !options.allowSelfSigned }),
      timeout: options.timeoutMs ?? CHECK_TIMEOUT_MS,
    }, response => {
      let raw = "";
      response.on("data", chunk => { raw += chunk; });
      response.on("end", () => {
        if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) return reject(new Error("provider_unavailable"));
        try { resolve(JSON.parse(raw) as T); }
        catch { reject(new Error("invalid_provider_response")); }
      });
    });
    request.on("timeout", () => request.destroy(new Error("provider_timeout")));
    request.on("error", reject);
    if (body) request.write(body);
    request.end();
  });
}

function openSearchRequest<T>(index: string, body: object): Promise<T> {
  const token = Buffer.from(`${env.wazuhIndexer.username()}:${env.wazuhIndexer.password()}`).toString("base64");
  const base = env.wazuhIndexer.url().replace(/\/$/, "");
  return requestJson<T>(`${base}/${encodeURIComponent(index)}/_search`, {
    headers: { Authorization: `Basic ${token}` }, body,
    allowSelfSigned: env.wazuh.allowSelfSigned(), timeoutMs: CHECK_TIMEOUT_MS,
  });
}

async function probeWazuh(): Promise<DataHubSource> {
  const checkedAt = new Date().toISOString();
  const [alerts, vulnerabilities, agents] = await Promise.allSettled([
    openSearchRequest<{ timed_out?: boolean; _shards?: { total: number; failed: number }; aggregations?: { latest?: { value_as_string?: string } } }>(
      env.wazuhIndexer.alertsIndex(),
      { size: 0, track_total_hits: false, aggs: { latest: { max: { field: "@timestamp" } } } }
    ),
    openSearchRequest<{ timed_out?: boolean; _shards?: { total: number; failed: number } }>(
      env.wazuhIndexer.vulnerabilityIndex(), { size: 0, track_total_hits: false }
    ),
    getAgentsSummary().then(value => value ?? Promise.reject(new Error("manager_unavailable"))),
  ]);
  const validSearch = (result: PromiseSettledResult<{ timed_out?: boolean; _shards?: { total: number; failed: number } }>) =>
    result.status === "fulfilled" && result.value.timed_out !== true && Boolean(result.value._shards?.total) && result.value._shards?.failed === 0;
  const alertAvailable = validSearch(alerts);
  const vulnerabilityAvailable = validSearch(vulnerabilities);
  const agentAvailable = agents.status === "fulfilled";
  const availableParts = [alertAvailable, vulnerabilityAvailable, agentAvailable].filter(Boolean).length;
  const status: DataHubSourceStatus = availableParts === 3 ? "AVAILABLE" : availableParts > 0 ? "DEGRADED" : "NOT_AVAILABLE";
  const observedAt = alerts.status === "fulfilled" && alertAvailable ? alerts.value.aggregations?.latest?.value_as_string : null;
  return {
    id: "wazuh", name: "Wazuh / OpenSearch", sourceType: "SIEM", category: "Security telemetry / vulnerability state",
    description: "Authoritative Wazuh telemetry used directly by existing platform features; not ingested through Data Hub.",
    status, provenance: provenance("REAL", "Wazuh / OpenSearch", "Genuine configured Wazuh and OpenSearch integrations."),
    capabilities: ["Alerts", "Agents", "Vulnerability State", "MITRE Observations"],
    freshness: observedAt ? { timestamp: observedAt, meaning: "OBSERVED_AT" } : { timestamp: checkedAt, meaning: "CHECKED_AT" },
    healthDetail: status === "AVAILABLE" ? "Alert, vulnerability, and agent source checks succeeded."
      : status === "DEGRADED" ? `${availableParts} of 3 source checks succeeded.` : "Wazuh source checks were unavailable.",
  };
}

async function probeBitdefender(): Promise<DataHubSource> {
  const checkedAt = new Date().toISOString();
  try {
    const token = Buffer.from(`${env.bitdefender.apiKey()}:`).toString("base64");
    const response = await requestJson<{ error?: unknown; result?: { total?: number } }>(env.bitdefender.apiUrl(), {
      headers: { Authorization: `Basic ${token}` },
      body: { jsonrpc: "2.0", id: "data_hub_health", method: "getIncidentsList", params: { filters: { status: ["open", "in_progress"] }, page: 1, perPage: 1 } },
      timeoutMs: CHECK_TIMEOUT_MS,
    });
    if (response.error || !Number.isInteger(response.result?.total) || response.result!.total! < 0) throw new Error("invalid_provider_response");
    return {
      id: "bitdefender", name: "Bitdefender GravityZone", sourceType: "ENDPOINT_SECURITY", category: "Endpoint security / incidents",
      description: "Endpoint incident source used directly by existing platform features; not ingested through Data Hub.",
      status: "AVAILABLE", provenance: provenance("REAL", "Bitdefender GravityZone", "Genuine configured endpoint-security integration."),
      capabilities: ["Endpoint Incidents", "Detection Metadata"], freshness: { timestamp: checkedAt, meaning: "CHECKED_AT" },
      healthDetail: "A minimal read-only incident-list check succeeded; no lifecycle records were created.",
    };
  } catch {
    return {
      id: "bitdefender", name: "Bitdefender GravityZone", sourceType: "ENDPOINT_SECURITY", category: "Endpoint security / incidents",
      description: "Endpoint incident source used directly by existing platform features; not ingested through Data Hub.",
      status: "NOT_AVAILABLE", provenance: provenance("REAL", "Bitdefender GravityZone", "Configured endpoint-security source; current health check unavailable."),
      capabilities: ["Endpoint Incidents", "Detection Metadata"], freshness: { timestamp: checkedAt, meaning: "CHECKED_AT" },
      healthDetail: "The read-only provider check did not complete successfully.",
    };
  }
}

async function probePostgres(): Promise<DataHubSource> {
  const checkedAt = new Date().toISOString();
  try {
    if (!env.database.url()) throw new Error("database_not_configured");
    await getPostgresPool().query("SELECT 1");
    return {
      id: "postgresql", name: "PostgreSQL", sourceType: "DATABASE", category: "Operational / governance data",
      description: "Application-owned operational and governance records used directly by platform workflows.", status: "AVAILABLE",
      provenance: provenance("REAL", "PostgreSQL", "Genuine persisted application records."),
      capabilities: ["Incident Lifecycle", "Risk Register", "Assessments", "Vulnerability Remediation", "Third-Party Register", "UU PDP Operational Records"],
      freshness: { timestamp: checkedAt, meaning: "CHECKED_AT" }, healthDetail: "A minimal read-only database check succeeded.",
    };
  } catch {
    return {
      id: "postgresql", name: "PostgreSQL", sourceType: "DATABASE", category: "Operational / governance data",
      description: "Application-owned operational and governance records used directly by platform workflows.", status: "NOT_AVAILABLE",
      provenance: provenance("REAL", "PostgreSQL", "Persisted application source; current health check unavailable."),
      capabilities: ["Incident Lifecycle", "Risk Register", "Assessments", "Vulnerability Remediation", "Third-Party Register", "UU PDP Operational Records"],
      freshness: { timestamp: checkedAt, meaning: "CHECKED_AT" }, healthDetail: "The read-only database check did not complete successfully.",
    };
  }
}

async function probeThreatProviders(): Promise<DataHubSource[]> {
  const checkedAt = new Date().toISOString();
  try {
    const overview = await getThreatIntelligenceOverview();
    const mapStatus = (status: "ok" | "degraded" | "error"): DataHubSourceStatus => status === "ok" ? "AVAILABLE" : status === "degraded" ? "DEGRADED" : "NOT_AVAILABLE";
    const provider = (id: string, name: string, health: typeof overview.providers.abuseIpDb, type: "THREAT_INTELLIGENCE" | "ENRICHMENT", capabilities: string[], detail: string, freshness: DataHubSource["freshness"]): DataHubSource => ({
      id, name, sourceType: type, category: type === "THREAT_INTELLIGENCE" ? "Threat intelligence" : "Threat-intelligence enrichment",
      description: detail, status: mapStatus(health.status), provenance: provenance("REAL", name, `Genuine ${type === "ENRICHMENT" ? "optional enrichment" : "threat-intelligence"} integration.`),
      capabilities, freshness, healthDetail: health.status === "ok" ? (type === "ENRICHMENT" ? "A bounded sample enrichment check succeeded; this does not prove feed coverage." : "The primary IOC feed request succeeded.") : health.status === "degraded" ? "The provider is configured partially or returned limited health evidence." : "The provider check was unavailable.",
    });
    return [
      provider("threatfox", "ThreatFox", overview.providers.threatFox, "THREAT_INTELLIGENCE", ["IOC Feed"], "Primary IOC feed used directly by the threat-intelligence feature.", overview.observedAt ? { timestamp: overview.observedAt, meaning: "RETRIEVED_AT" } : { timestamp: checkedAt, meaning: "CHECKED_AT" }),
      provider("abuseipdb", "AbuseIPDB", overview.providers.abuseIpDb, "ENRICHMENT", ["IOC Enrichment"], "Optional IP enrichment and provider-health context; not an event feed.", { timestamp: checkedAt, meaning: "CHECKED_AT" }),
      provider("virustotal", "VirusTotal", overview.providers.virusTotal, "ENRICHMENT", ["IOC Enrichment"], "Optional IOC enrichment and provider-health context; not an event feed.", { timestamp: checkedAt, meaning: "CHECKED_AT" }),
    ];
  } catch {
    return [
      ["threatfox", "ThreatFox", "THREAT_INTELLIGENCE", "Threat intelligence", "Primary IOC feed used directly by the threat-intelligence feature."],
      ["abuseipdb", "AbuseIPDB", "ENRICHMENT", "Threat-intelligence enrichment", "Optional IP enrichment and provider-health context; not an event feed."],
      ["virustotal", "VirusTotal", "ENRICHMENT", "Threat-intelligence enrichment", "Optional IOC enrichment and provider-health context; not an event feed."],
    ].map(([id, name, sourceType, category, description]) => ({
      id, name, sourceType, category, description, status: "NOT_AVAILABLE",
      provenance: provenance("REAL", name, "Configured provider source; current health check unavailable."),
      capabilities: sourceType === "THREAT_INTELLIGENCE" ? ["IOC Feed"] : ["IOC Enrichment"],
      freshness: { timestamp: checkedAt, meaning: "CHECKED_AT" }, healthDetail: "The provider check was unavailable.",
    } as DataHubSource));
  }
}

function holdSource(id: string, name: string, configured: string | undefined, futureTarget?: string): DataHubSource {
  const dummy = configured?.trim().toLowerCase() === "dummy";
  return {
    id, name, sourceType: "ENTERPRISE_INTEGRATION", category: "Planned enterprise integration",
    description: "Future enterprise source remains on hold and is not included in operational totals.", status: "HOLD",
    provenance: dummy
      ? provenance("DEMO", "Explicit dummy provider", "A deterministic dummy provider is explicitly configured; it is not a live enterprise integration.")
      : provenance("NOT_AVAILABLE", "Unconfigured provider", "No provider is currently configured; the enterprise integration remains on hold."),
    capabilities: [], freshness: { timestamp: null, meaning: null },
    healthDetail: dummy ? "Demo provider configured; no runtime health probe performed." : "No provider configured; no runtime health probe performed.",
    ...(futureTarget ? { futureTarget } : {}),
  };
}

export async function getDataHubSourceRegistry(): Promise<DataHubSourceRegistry> {
  const results = await Promise.allSettled([
    bounded(probeWazuh(), 20_000),
    bounded(probeBitdefender(), 12_000),
    bounded(probePostgres(), 8_000),
    bounded(probeThreatProviders(), 30_000),
  ]);
  const fallback = (id: string, name: string, sourceType: DataHubSource["sourceType"], category: string, capabilities: string[]): DataHubSource => ({
    id, name, sourceType, category, description: "Existing platform source; Data Hub health check unavailable.", status: "NOT_AVAILABLE",
    provenance: provenance("REAL", name, "Existing platform source; current health check unavailable."), capabilities,
    freshness: { timestamp: new Date().toISOString(), meaning: "CHECKED_AT" }, healthDetail: "The isolated health probe was unavailable.",
  });
  const sources: DataHubSource[] = [
    results[0].status === "fulfilled" ? results[0].value : fallback("wazuh", "Wazuh / OpenSearch", "SIEM", "Security telemetry / vulnerability state", ["Alerts", "Agents", "Vulnerability State", "MITRE Observations"]),
    results[1].status === "fulfilled" ? results[1].value : fallback("bitdefender", "Bitdefender GravityZone", "ENDPOINT_SECURITY", "Endpoint security / incidents", ["Endpoint Incidents", "Detection Metadata"]),
    results[2].status === "fulfilled" ? results[2].value : fallback("postgresql", "PostgreSQL", "DATABASE", "Operational / governance data", ["Incident Lifecycle", "Risk Register", "Assessments"]),
    ...(results[3].status === "fulfilled" ? results[3].value : [
      fallback("threatfox", "ThreatFox", "THREAT_INTELLIGENCE", "Threat intelligence", ["IOC Feed"]),
      fallback("abuseipdb", "AbuseIPDB", "ENRICHMENT", "Threat-intelligence enrichment", ["IOC Enrichment"]),
      fallback("virustotal", "VirusTotal", "ENRICHMENT", "Threat-intelligence enrichment", ["IOC Enrichment"]),
    ]),
    holdSource("incident-ticketing", "Incident / Ticketing", env.incidentTicketing.provider(), "Service Desk SISI"),
    holdSource("asset-management", "Asset Management / CMDB", env.assetManagement.provider(), "Asset Management PT SISI"),
    holdSource("identity-governance", "IAM / Identity Governance", env.iam.provider(), "Sivora"),
    holdSource("enterprise-remediation", "Vulnerability Remediation Enterprise Provider", env.vulnerabilityRemediation.provider()),
    holdSource("pdp-organizational", "PDP Organizational Data", env.pdpOrganizational.provider()),
  ];
  const count = (status: DataHubSourceStatus) => sources.filter(source => source.status === status).length;
  return { sources, summary: { registered: sources.length, available: count("AVAILABLE"), degraded: count("DEGRADED"), unavailable: count("NOT_AVAILABLE"), hold: count("HOLD") } };
}
