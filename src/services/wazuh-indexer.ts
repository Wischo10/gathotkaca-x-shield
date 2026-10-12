import "server-only";
import https from "https";
import { env } from "@/lib/env";
import { fetchJson } from "@/lib/http";
import { HttpError } from "@/lib/http";
import type {
  AlertsBySeverity,
  LiveEvent,
  Severity,
  TimeSeriesPoint,
  TopAlertingRule,
  SocTelemetry,
  SocAlertDetailResult,
  SocAlertRecord,
  WazuhIpIocCandidate,
} from "@/types/soc";

/**
 * Service Layer for the Wazuh Indexer (OpenSearch-compatible) API.
 *
 * This is the ONLY file that knows the shape of raw Wazuh Indexer
 * responses. Route handlers call these functions and get back types from
 * `@/types/soc` — never raw indexer JSON — so a future change to the
 * indexer's response shape only requires editing this file.
 */

function authHeader(): string {
  const token = Buffer.from(
    `${env.wazuhIndexer.username()}:${env.wazuhIndexer.password()}`
  ).toString("base64");
  return `Basic ${token}`;
}

function indexerUrl(path: string): string {
  return `${env.wazuhIndexer.url().replace(/\/$/, "")}${path}`;
}

interface OpenSearchResponse<TSource> {
  hits: {
    total: { value: number };
    hits: Array<{ _id: string; _source: TSource }>;
  };
  aggregations?: Record<string, { buckets: Array<{ key: string; doc_count: number }> }>;
}

async function fetchIndexerJson<T>(path: string, body: unknown): Promise<T> {
  const url = indexerUrl(path);
  if (!env.wazuhIndexer.allowSelfSigned() || !url.startsWith("https://")) {
    return fetchJson<T>(url, {
      method: "POST",
      headers: { Authorization: authHeader(), "Content-Type": "application/json" },
      timeoutMs: env.wazuh.requestTimeoutMs(),
      body: JSON.stringify(body),
    });
  }

  const payload = JSON.stringify(body);
  const parsedUrl = new URL(url);
  return new Promise<T>((resolve, reject) => {
    const request = https.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: "POST",
      rejectUnauthorized: false,
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
      timeout: env.wazuh.requestTimeoutMs(),
    }, (response) => {
      let raw = "";
      response.on("data", (chunk) => (raw += chunk));
      response.on("end", () => {
        if (response.statusCode === 401 || response.statusCode === 403) {
          reject(new HttpError("Wazuh Indexer authentication failed", "auth", response.statusCode));
          return;
        }
        if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
          reject(new HttpError(`Wazuh Indexer returned HTTP ${response.statusCode ?? "unknown"}`, "server", response.statusCode));
          return;
        }
        try {
          resolve(JSON.parse(raw) as T);
        } catch {
          reject(new HttpError("Wazuh Indexer returned invalid JSON", "invalid_response", response.statusCode));
        }
      });
    });
    request.on("timeout", () => request.destroy(new HttpError("Wazuh Indexer request timed out", "timeout")));
    request.on("error", reject);
    request.write(payload);
    request.end();
  });
}

interface SocAlertCountResponse {
  hits: { total: { value: number } | number };
  aggregations?: { critical_alerts?: { doc_count: number } };
}

interface SeverityAggregationResponse {
  timed_out?: boolean;
  _shards?: { failed: number };
  aggregations?: {
    severity?: {
      buckets?: Record<Severity, { doc_count: number }>;
    };
  };
}

const WAZUH_SEVERITY_LEVELS = {
  criticalMin: 14,
  highMin: 11,
  mediumMin: 7,
} as const;

const RANGE_TO_GTE: Record<string, string> = {
  "24h": "now-24h",
  "7d": "now-7d",
  "30d": "now-30d",
};

type OpenSearchQuery = Record<string, unknown>;

// Application classification priority. A document matching multiple metadata
// rules is assigned only to the first rule, so displayed source counts remain
// mutually exclusive and never double-count an alert document.
const DETECTION_SOURCE_RULES: Array<{ key: string; label: string; query: OpenSearchQuery }> = [
  { key: "nginx", label: "Nginx", query: { prefix: { location: "/var/log/nginx/" } } },
  { key: "suricata", label: "Suricata IDS", query: { term: { location: "/var/log/suricata/eve.json" } } },
  { key: "linux_audit", label: "Linux Audit", query: { term: { location: "/var/log/audit/audit.log" } } },
  { key: "container_logs", label: "Container Logs", query: { prefix: { location: "/var/log/containers/" } } },
  { key: "journald", label: "Journald", query: { term: { location: "journald" } } },
  { key: "windows_event_channel", label: "Windows Event Channel", query: { exists: { field: "data.win.system.channel" } } },
  { key: "virustotal", label: "VirusTotal Integration", query: { bool: { should: [{ term: { location: "virustotal" } }, { term: { "data.integration": "virustotal" } }], minimum_should_match: 1 } } },
  { key: "wazuh_fim", label: "Wazuh FIM", query: { term: { location: "syscheck" } } },
  { key: "wazuh_rootcheck", label: "Wazuh Rootcheck", query: { term: { location: "rootcheck" } } },
  { key: "opnsense", label: "OPNsense", query: { prefix: { location: "/var/ossec/logs/opnsense" } } },
  { key: "apache", label: "Apache", query: { prefix: { location: "/var/log/apache2/" } } },
  { key: "system_syslog", label: "System Syslog", query: { term: { location: "/var/log/syslog" } } },
];

function mutuallyExclusiveDetectionSourceFilters(): Record<string, OpenSearchQuery> {
  const higherPriorityQueries: OpenSearchQuery[] = [];
  return Object.fromEntries(DETECTION_SOURCE_RULES.map((rule) => {
    const exclusiveQuery = higherPriorityQueries.length === 0
      ? rule.query
      : { bool: { filter: [rule.query], must_not: [...higherPriorityQueries] } };
    higherPriorityQueries.push(rule.query);
    return [rule.key, exclusiveQuery];
  }));
}

export const SOC_DETECTION_SOURCE_LABELS = [...DETECTION_SOURCE_RULES.map((rule) => rule.label), "Unclassified"] as const;

export interface SocAlertDetailFilters {
  severity?: Severity;
  ruleId?: string;
  agent?: string;
  sourceIp?: string;
  tactic?: string;
  ageBucket?: "0-15m" | "15-60m" | "1-4h" | "4-24h" | ">24h";
  day?: string;
  detectionSource?: string;
  limit?: number;
  offset?: number;
}

/** Bounded read-only alert evidence query with a fixed source allowlist. */
export async function getSocAlertDetails(filters: SocAlertDetailFilters = {}): Promise<SocAlertDetailResult> {
  const limit = Math.min(Math.max(Math.trunc(filters.limit ?? 25), 1), 50);
  const offset = Math.min(Math.max(Math.trunc(filters.offset ?? 0), 0), 500);
  const clauses: OpenSearchQuery[] = [{ range: { "@timestamp": { gte: "now-7d", lte: "now" } } }];
  if (filters.severity === "critical") clauses.push({ range: { "rule.level": { gte: WAZUH_SEVERITY_LEVELS.criticalMin } } });
  if (filters.severity === "high") clauses.push({ range: { "rule.level": { gte: WAZUH_SEVERITY_LEVELS.highMin, lt: WAZUH_SEVERITY_LEVELS.criticalMin } } });
  if (filters.severity === "medium") clauses.push({ range: { "rule.level": { gte: WAZUH_SEVERITY_LEVELS.mediumMin, lt: WAZUH_SEVERITY_LEVELS.highMin } } });
  if (filters.severity === "low") clauses.push({ range: { "rule.level": { lt: WAZUH_SEVERITY_LEVELS.mediumMin } } });
  if (filters.ruleId) clauses.push({ term: { "rule.id": filters.ruleId } });
  if (filters.agent) clauses.push({ term: { "agent.name": filters.agent } });
  if (filters.sourceIp) clauses.push({ term: { "data.srcip": filters.sourceIp } });
  if (filters.tactic) clauses.push({ term: { "rule.mitre.tactic": filters.tactic } });
  if (filters.day) clauses.push({ range: { "@timestamp": { gte: `${filters.day}T00:00:00.000Z`, lt: `${filters.day}T00:00:00.000Z||+1d` } } });
  const ageRanges: Record<NonNullable<SocAlertDetailFilters["ageBucket"]>, OpenSearchQuery> = {
    "0-15m": { range: { "@timestamp": { gte: "now-15m", lte: "now" } } },
    "15-60m": { range: { "@timestamp": { gte: "now-60m", lt: "now-15m" } } },
    "1-4h": { range: { "@timestamp": { gte: "now-4h", lt: "now-60m" } } },
    "4-24h": { range: { "@timestamp": { gte: "now-24h", lt: "now-4h" } } },
    ">24h": { range: { "@timestamp": { gte: "now-7d", lt: "now-24h" } } },
  };
  if (filters.ageBucket) clauses.push(ageRanges[filters.ageBucket]);
  if (filters.detectionSource) {
    const exclusive = mutuallyExclusiveDetectionSourceFilters();
    const rule = DETECTION_SOURCE_RULES.find((item) => item.label === filters.detectionSource);
    if (rule) clauses.push(exclusive[rule.key]);
    else if (filters.detectionSource === "Unclassified") clauses.push({ bool: { must_not: DETECTION_SOURCE_RULES.map((item) => item.query) } });
  }
  const response = await fetchIndexerJson<{ timed_out?: boolean; _shards?: { failed: number }; hits: { total: { value: number } | number; hits: Array<{ _id: string; _source?: Record<string, unknown> }> } }>(
    `/${encodeURIComponent(env.wazuhIndexer.alertsIndex())}/_search`,
    { size: limit, from: offset, track_total_hits: true, sort: [{ "@timestamp": { order: "desc" } }], query: { bool: { filter: clauses } }, _source: [
      "@timestamp", "rule.id", "rule.level", "rule.description", "rule.mitre.id", "rule.mitre.tactic",
      "agent.id", "agent.name", "agent.ip", "data.srcip", "data.dstuser", "user", "location",
      "data.win.system.channel", "data.integration",
    ] }
  );
  if (response.timed_out || (response._shards?.failed ?? 0) > 0) throw new Error("Wazuh alert detail query was incomplete");
  const total = typeof response.hits.total === "number" ? response.hits.total : response.hits.total.value;
  return { records: response.hits.hits.map((hit) => mapAlertRecord(hit._id, hit._source ?? {})), total, limit, offset, range: "7d", provenance: "REAL", sourceLabel: "Wazuh / OpenSearch" };
}

function mapAlertRecord(id: string, source: Record<string, unknown>): SocAlertRecord {
  const rule = objectValue(source.rule); const agent = objectValue(source.agent); const data = objectValue(source.data);
  const mitre = objectValue(rule.mitre); const win = objectValue(data.win); const system = objectValue(win.system);
  const level = Number(rule.level);
  const location = stringValue(source.location);
  const integration = stringValue(data.integration);
  return {
    id, timestamp: stringValue(source["@timestamp"]) ?? "", severity: levelToSeverity(Number.isFinite(level) ? level : 0),
    ruleLevel: Number.isFinite(level) ? level : 0, ruleId: stringValue(rule.id) ?? "-", ruleDescription: stringValue(rule.description) ?? "-",
    agentId: stringValue(agent.id), agentName: stringValue(agent.name), agentIp: stringValue(agent.ip), sourceIp: stringValue(data.srcip),
    user: stringValue(source.user), destinationUser: stringValue(data.dstuser), location, channel: stringValue(system.channel), integration,
    mitreTactics: stringArray(mitre.tactic), mitreTechniqueIds: stringArray(mitre.id), detectionSource: classifyDetectionSource(location, stringValue(system.channel), integration),
  };
}

function objectValue(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function stringValue(value: unknown): string | null { return typeof value === "string" && value.trim() ? value.trim() : typeof value === "number" ? String(value) : null; }
function stringArray(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : typeof value === "string" ? [value] : []; }
function classifyDetectionSource(location: string | null, channel: string | null, integration: string | null): string | null {
  if (location?.startsWith("/var/log/nginx/")) return "Nginx";
  if (location === "/var/log/suricata/eve.json") return "Suricata IDS";
  if (location === "/var/log/audit/audit.log") return "Linux Audit";
  if (location?.startsWith("/var/log/containers/")) return "Container Logs";
  if (location === "journald") return "Journald";
  if (channel) return "Windows Event Channel";
  if (location === "virustotal" || integration === "virustotal") return "VirusTotal Integration";
  if (location === "syscheck") return "Wazuh FIM";
  if (location === "rootcheck") return "Wazuh Rootcheck";
  if (location?.startsWith("/var/ossec/logs/opnsense")) return "OPNsense";
  if (location?.startsWith("/var/log/apache2/")) return "Apache";
  if (location === "/var/log/syslog") return "System Syslog";
  return null;
}

/**
 * Real document counts from the configured Wazuh alerts index.
 * The project severity convention maps Wazuh rule levels >= 14 to Critical.
 * The alerts index is the only authoritative SOC event/alert telemetry source
 * configured on this branch, so its document total backs both headline counts.
 */
export async function getSocAlertCounts(range = "7d"): Promise<{
  totalEvents: number;
  totalAlerts: number;
  criticalAlerts: number;
}> {
  const gte = RANGE_TO_GTE[range];
  if (!gte) throw new Error(`Unsupported SOC range: ${range}`);

  const response = await fetchIndexerJson<SocAlertCountResponse>(
    `/${encodeURIComponent(env.wazuhIndexer.alertsIndex())}/_search`,
    {
        size: 0,
        track_total_hits: true,
        query: { range: { "@timestamp": { gte, lte: "now" } } },
        aggs: {
          critical_alerts: {
            filter: { range: { "rule.level": { gte: WAZUH_SEVERITY_LEVELS.criticalMin } } },
          },
        },
    }
  );

  const total = typeof response.hits.total === "number"
    ? response.hits.total
    : response.hits.total.value;
  const critical = response.aggregations?.critical_alerts?.doc_count;
  if (!Number.isFinite(total) || !Number.isFinite(critical)) {
    throw new Error("Wazuh Indexer returned invalid SOC count data");
  }

  return { totalEvents: total, totalAlerts: total, criticalAlerts: critical! };
}

/** Alerts grouped by severity (rule.level bucketed) for the donut chart. */
export async function getAlertsBySeverity(
  range: string = "7d"
): Promise<AlertsBySeverity> {
  const gte = RANGE_TO_GTE[range];
  if (!gte) throw new Error(`Unsupported SOC range: ${range}`);

  const response = await fetchIndexerJson<SeverityAggregationResponse>(
    `/${encodeURIComponent(env.wazuhIndexer.alertsIndex())}/_search`,
    {
        size: 0,
        query: { range: { "@timestamp": { gte, lte: "now" } } },
        aggs: {
          severity: {
            filters: {
              filters: {
                critical: { range: { "rule.level": { gte: WAZUH_SEVERITY_LEVELS.criticalMin } } },
                high: { range: { "rule.level": { gte: WAZUH_SEVERITY_LEVELS.highMin, lt: WAZUH_SEVERITY_LEVELS.criticalMin } } },
                medium: { range: { "rule.level": { gte: WAZUH_SEVERITY_LEVELS.mediumMin, lt: WAZUH_SEVERITY_LEVELS.highMin } } },
                low: { range: { "rule.level": { lt: WAZUH_SEVERITY_LEVELS.mediumMin } } },
              },
            },
          },
        },
    }
  );

  if (response.timed_out || (response._shards?.failed ?? 0) > 0) {
    throw new Error("Wazuh severity aggregation was incomplete");
  }
  const buckets = response.aggregations?.severity?.buckets;
  const critical = buckets?.critical?.doc_count;
  const high = buckets?.high?.doc_count;
  const medium = buckets?.medium?.doc_count;
  const low = buckets?.low?.doc_count;
  if (![critical, high, medium, low].every((count) => Number.isFinite(count))) {
    throw new Error("Wazuh severity aggregation returned invalid buckets");
  }
  const counts = { critical: critical!, high: high!, medium: medium!, low: low! };
  const total = counts.critical + counts.high + counts.medium + counts.low;
  const percentage = (count: number) => total === 0 ? 0 : (count / total) * 100;
  return {
    total,
    totalAlerts: total,
    ...counts,
    percentages: {
      critical: percentage(counts.critical),
      high: percentage(counts.high),
      medium: percentage(counts.medium),
      low: percentage(counts.low),
    },
  };
}

interface SocTelemetryResponse {
  timed_out?: boolean;
  _shards?: { failed: number };
  hits?: { total: { value: number } | number; hits?: Array<{ _source?: Record<string, unknown> }> };
  aggregations?: {
    severity?: { buckets?: Record<Severity, { doc_count: number }> };
    trend?: { buckets?: Array<{ key_as_string?: string; key: number; critical?: { doc_count: number }; high?: { doc_count: number }; medium?: { doc_count: number }; low?: { doc_count: number } }> };
    aging?: { buckets?: Record<string, { doc_count: number }> };
    mitre?: { buckets?: Array<{ key: string; doc_count: number }> };
    top_rules?: { buckets?: Array<{ key: string; doc_count: number; representative_description?: { hits?: { hits?: Array<{ _source?: { rule?: { description?: unknown } } }> } } }> };
    live_events?: unknown;
    detection_sources?: { buckets?: Record<string, { doc_count: number }> };
  };
}

/** One shared read-only request for the targeted SOC Wazuh panels. */
export async function getSocTelemetry(range = "7d"): Promise<SocTelemetry> {
  const gte = RANGE_TO_GTE[range];
  if (!gte) throw new Error(`Unsupported SOC range: ${range}`);
  const observedAt = new Date().toISOString();
  const response = await fetchIndexerJson<SocTelemetryResponse>(
    `/${encodeURIComponent(env.wazuhIndexer.alertsIndex())}/_search`,
    {
      size: 0,
      track_total_hits: true,
      query: { range: { "@timestamp": { gte, lte: "now" } } },
      aggs: {
        severity: { filters: { filters: {
          critical: { range: { "rule.level": { gte: WAZUH_SEVERITY_LEVELS.criticalMin } } },
          high: { range: { "rule.level": { gte: WAZUH_SEVERITY_LEVELS.highMin, lt: WAZUH_SEVERITY_LEVELS.criticalMin } } },
          medium: { range: { "rule.level": { gte: WAZUH_SEVERITY_LEVELS.mediumMin, lt: WAZUH_SEVERITY_LEVELS.highMin } } },
          low: { range: { "rule.level": { lt: WAZUH_SEVERITY_LEVELS.mediumMin } } },
        } } },
        trend: { date_histogram: { field: "@timestamp", calendar_interval: "1d", time_zone: "UTC", min_doc_count: 0, extended_bounds: { min: "now-7d", max: "now" } }, aggs: {
          critical: { filter: { range: { "rule.level": { gte: WAZUH_SEVERITY_LEVELS.criticalMin } } } },
          high: { filter: { range: { "rule.level": { gte: WAZUH_SEVERITY_LEVELS.highMin, lt: WAZUH_SEVERITY_LEVELS.criticalMin } } } },
          medium: { filter: { range: { "rule.level": { gte: WAZUH_SEVERITY_LEVELS.mediumMin, lt: WAZUH_SEVERITY_LEVELS.highMin } } } },
          low: { filter: { range: { "rule.level": { lt: WAZUH_SEVERITY_LEVELS.mediumMin } } } },
        } },
        aging: { filters: { filters: {
          "0-15m": { range: { "@timestamp": { gte: "now-15m", lte: "now" } } },
          "15-60m": { range: { "@timestamp": { gte: "now-60m", lt: "now-15m" } } },
          "1-4h": { range: { "@timestamp": { gte: "now-4h", lt: "now-60m" } } },
          "4-24h": { range: { "@timestamp": { gte: "now-24h", lt: "now-4h" } } },
          ">24h": { range: { "@timestamp": { lt: "now-24h" } } },
        } } },
        mitre: { terms: { field: "rule.mitre.tactic", size: 20 } },
        top_rules: { terms: { field: "rule.id", size: 10 }, aggs: { representative_description: { top_hits: { size: 1, _source: ["rule.description"] } } } },
        live_events: { top_hits: { size: 10, sort: [{ "@timestamp": { order: "desc" } }], _source: ["@timestamp", "rule.id", "rule.description", "rule.level", "agent.name", "agent.ip", "data.srcip", "data.dstuser", "user", "location", "data.win.system.channel", "data.integration"] } },
        detection_sources: { filters: { filters: mutuallyExclusiveDetectionSourceFilters(), other_bucket: true, other_bucket_key: "unclassified" } },
      },
    }
  );
  if (response.timed_out || (response._shards?.failed ?? 0) > 0 || !response.aggregations || !response.hits) {
    throw new Error("Wazuh SOC telemetry aggregation was incomplete");
  }
  const severityBuckets = response.aggregations.severity?.buckets;
  const severity = {
    critical: severityBuckets?.critical?.doc_count ?? NaN,
    high: severityBuckets?.high?.doc_count ?? NaN,
    medium: severityBuckets?.medium?.doc_count ?? NaN,
    low: severityBuckets?.low?.doc_count ?? NaN,
  };
  if (!Object.values(severity).every(Number.isFinite)) throw new Error("Missing Wazuh severity buckets");
  const severityTotal = severity.critical + severity.high + severity.medium + severity.low;
  const totalEvents = typeof response.hits.total === "number" ? response.hits.total : response.hits.total.value;
  if (!Number.isFinite(totalEvents)) throw new Error("Invalid Wazuh total document count");
  const percentages = (count: number) => severityTotal === 0 ? 0 : count / severityTotal * 100;
  const agingBuckets = response.aggregations.aging?.buckets ?? {};
  const agingCounts = ["0-15m", "15-60m", "1-4h", "4-24h", ">24h"].map((bucket) => ({ bucket: bucket as SocTelemetry["aging"][number]["bucket"], count: agingBuckets[bucket]?.doc_count ?? 0 }));
  const trend = (response.aggregations.trend?.buckets ?? []).map((bucket) => ({ timestamp: bucket.key_as_string ?? new Date(bucket.key).toISOString(), critical: bucket.critical?.doc_count ?? 0, high: bucket.high?.doc_count ?? 0, medium: bucket.medium?.doc_count ?? 0, low: bucket.low?.doc_count ?? 0 }));
  const liveEvents = (response.aggregations.live_events as unknown as { hits?: { hits?: Array<{ _source?: Record<string, unknown> }> } } | undefined)?.hits?.hits?.map((hit) => mapLiveEvent(hit._source ?? {})) ?? [];
  const sourceBuckets = response.aggregations.detection_sources?.buckets;
  if (!sourceBuckets) throw new Error("Missing Wazuh detection source buckets");
  const detectionSourceItems = DETECTION_SOURCE_RULES
    .map(({ key, label }) => ({ source: label, count: sourceBuckets[key]?.doc_count ?? 0 }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
  const sourceUnclassified = sourceBuckets.unclassified?.doc_count ?? 0;
  const sourceClassified = detectionSourceItems.reduce((sum, item) => sum + item.count, 0);
  const sourceTotal = sourceClassified + sourceUnclassified;
  if (sourceTotal !== totalEvents || sourceClassified > totalEvents) {
    throw new Error("Wazuh detection source aggregation was inconsistent");
  }
  return {
    range: "7d",
    observedAt,
    totalEvents,
    totalAlerts: severityTotal,
    criticalAlerts: severity.critical,
    severity: { total: severityTotal, totalAlerts: severityTotal, ...severity, percentages: { critical: percentages(severity.critical), high: percentages(severity.high), medium: percentages(severity.medium), low: percentages(severity.low) } },
    trend,
    aging: agingCounts.map((item) => ({ ...item, percentage: totalEvents === 0 ? 0 : item.count / totalEvents * 100 })),
    mitre: (response.aggregations.mitre?.buckets ?? []).map((bucket) => ({ tactic: bucket.key, count: bucket.doc_count })),
    topRules: (response.aggregations.top_rules?.buckets ?? []).map((bucket) => {
      const value = bucket.representative_description?.hits?.hits?.[0]?._source?.rule?.description;
      return { id: bucket.key, description: typeof value === "string" ? value.trim() : "", count: bucket.doc_count };
    }),
    liveEvents,
    detectionSources: {
      total: totalEvents,
      classified: sourceClassified,
      unclassified: sourceUnclassified,
      coveragePercent: totalEvents === 0 ? 0 : Math.min(100, sourceClassified / totalEvents * 100),
      sources: detectionSourceItems,
    },
  };
}

function mapLiveEvent(source: Record<string, unknown>): LiveEvent {
  const rule = (source.rule ?? {}) as Record<string, unknown>;
  const agent = (source.agent ?? {}) as Record<string, unknown>;
  const data = (source.data ?? {}) as Record<string, unknown>;
  const win = objectValue(data.win);
  const system = objectValue(win.system);
  const level = Number(rule.level);
  return {
    id: `${String(rule.id ?? "-")}-${String(source["@timestamp"] ?? "-")}`,
    time: String(source["@timestamp"] ?? ""),
    event: String(rule.description ?? "-"),
    source: String(agent.name ?? "-"),
    severity: levelToSeverity(Number.isFinite(level) ? level : 0),
    rule: String(rule.id ?? "-"),
    assetOrUser: String(data.srcip ?? data.dstuser ?? (source.user ?? "-")),
    detectionSource: classifyDetectionSource(stringValue(source.location), stringValue(system.channel), stringValue(data.integration)),
  };
}

/** Daily alert volume broken down by severity, for the area/line trend chart. */
export async function getAlertsTrend(
  range: string = "7d"
): Promise<TimeSeriesPoint[]> {
  const telemetry = await getSocTelemetry(range);
  return telemetry.trend.map((point) => ({ date: point.timestamp, critical: point.critical, high: point.high, medium: point.medium, low: point.low }));
}

/** Most recent N alert documents for the "Recent Alerts" table. */
export async function getLiveEvents(limit = 10): Promise<LiveEvent[]> {
  const telemetry = await getSocTelemetry("7d");
  return telemetry.liveEvents.slice(0, Math.min(limit, 10));
}

/** Top alerting rules ranked by count, for the "Top Alerting Rules" panel. */
export async function getTopAlertingRules(
  range: string = "7d",
  limit = 8
): Promise<TopAlertingRule[]> {
  const telemetry = await getSocTelemetry(range);
  return telemetry.topRules.slice(0, limit).map((rule) => ({
    ruleName: rule.description ? `${rule.id} — ${rule.description}` : `Rule ${rule.id}`,
    count: rule.count,
  }));
}

function levelToSeverity(level: number): Severity {
  if (level >= WAZUH_SEVERITY_LEVELS.criticalMin) return "critical";
  if (level >= WAZUH_SEVERITY_LEVELS.highMin) return "high";
  if (level >= WAZUH_SEVERITY_LEVELS.mediumMin) return "medium";
  return "low";
}

interface IpCandidateAggregationResponse {
  timed_out?: boolean;
  _shards?: { failed: number };
  aggregations?: {
    candidate_ips?: {
      buckets?: Array<{
        key: string;
        doc_count: number;
        first_observed?: { value?: number; value_as_string?: string };
        last_observed?: { value?: number; value_as_string?: string };
        representative_rule_ids?: { buckets?: Array<{ key: string; doc_count: number }> };
      }>;
    };
  };
}

/** Bounded aggregation only; this never retrieves raw Wazuh alert hits. */
export async function getIpIocCandidates(
  windowStart: string,
  windowEnd: string,
  limit = 100
): Promise<WazuhIpIocCandidate[]> {
  const boundedLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const response = await fetchIndexerJson<IpCandidateAggregationResponse>(
    `/${encodeURIComponent(env.wazuhIndexer.alertsIndex())}/_search`,
    {
      size: 0,
      track_total_hits: false,
      query: { bool: { filter: [
        { range: { "@timestamp": { gte: windowStart, lte: windowEnd } } },
        { exists: { field: "data.srcip" } },
      ] } },
      aggs: {
        candidate_ips: {
          terms: { field: "data.srcip", size: boundedLimit, shard_size: 500, order: { _count: "desc" } },
          aggs: {
            first_observed: { min: { field: "@timestamp" } },
            last_observed: { max: { field: "@timestamp" } },
            representative_rule_ids: { terms: { field: "rule.id", size: 5 } },
          },
        },
      },
    }
  );
  if (response.timed_out || (response._shards?.failed ?? 0) > 0) throw new Error("Wazuh IOC candidate aggregation was incomplete");
  const buckets = response.aggregations?.candidate_ips?.buckets;
  if (!Array.isArray(buckets)) throw new Error("data.srcip is not aggregatable or the IOC aggregation response was invalid");
  return buckets.map((bucket) => {
    const first = bucket.first_observed?.value_as_string
      ?? (Number.isFinite(bucket.first_observed?.value) ? new Date(bucket.first_observed!.value!).toISOString() : "");
    const last = bucket.last_observed?.value_as_string
      ?? (Number.isFinite(bucket.last_observed?.value) ? new Date(bucket.last_observed!.value!).toISOString() : "");
    if (!bucket.key || !Number.isFinite(bucket.doc_count) || !first || !last) throw new Error("Wazuh IOC candidate bucket was invalid");
    return { ip: String(bucket.key), observationCount: bucket.doc_count, firstObserved: first, lastObserved: last,
      representativeRuleIds: (bucket.representative_rule_ids?.buckets ?? []).map((rule) => String(rule.key)) };
  });
}
