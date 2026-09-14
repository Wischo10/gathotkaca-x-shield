import "server-only";
import https from "https";
import { env } from "@/lib/env";
<<<<<<< HEAD
=======
import { fetchJson } from "@/lib/http";
import { HttpError } from "@/lib/http";
>>>>>>> origin/soc-dashboard
import type {
  AlertsBySeverity,
  LiveEvent,
  Severity,
  TimeSeriesPoint,
  TopAlertingRule,
  SocTelemetry,
} from "@/types/soc";

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
  aggregations?: Record<string, { buckets: Array<{ key: string; doc_count: number; key_as_string?: string }> }>;
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

<<<<<<< HEAD
async function fetchIndexer<T>(path: string, body: any): Promise<T | null> {
  try {
    const res = await fetch(indexerUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader(),
      },
      body: JSON.stringify(body),
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (!res.ok) {
      console.error(`Wazuh Indexer error ${res.status}: ${await res.text()}`);
      return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error("Wazuh Indexer network error:", error);
    return null;
  }
}

function levelToSeverity(level: number): Severity {
  if (level >= 12) return "critical";
  if (level >= 8) return "high";
  if (level >= 4) return "medium";
  return "low";
}

export async function getAlertsBySeverity(
  range: string = "7d"
): Promise<AlertsBySeverity> {
  const gte = RANGE_TO_GTE[range] || "now-7d";
  const index = env.wazuhIndexer.alertsIndex();
  
  const query = {
    size: 0,
    query: {
      range: {
        timestamp: { gte }
      }
    },
    aggs: {
      severities: {
        range: {
          field: "rule.level",
          ranges: [
            { key: "low", from: 0, to: 4 },
            { key: "medium", from: 4, to: 8 },
            { key: "high", from: 8, to: 12 },
            { key: "critical", from: 12 }
          ]
        }
      }
    }
=======
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
    top_rules?: { buckets?: Array<{ key: string; doc_count: number; descriptions?: { buckets?: Array<{ key: string; doc_count: number }> } }> };
    live_events?: unknown;
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
        trend: { date_histogram: { field: "@timestamp", fixed_interval: "1d", min_doc_count: 0, extended_bounds: { min: "now-7d", max: "now" } }, aggs: {
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
        top_rules: { terms: { field: "rule.id", size: 10 }, aggs: { descriptions: { terms: { field: "rule.description.keyword", size: 1 } } } },
        live_events: { top_hits: { size: 10, sort: [{ "@timestamp": { order: "desc" } }], _source: ["@timestamp", "rule.id", "rule.description", "rule.level", "agent.name", "agent.ip", "data.srcip", "data.dstuser", "data.dstuser", "user"] } },
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
    topRules: (response.aggregations.top_rules?.buckets ?? []).map((bucket) => ({ id: bucket.key, description: bucket.descriptions?.buckets?.[0]?.key ?? "-", count: bucket.doc_count })),
    liveEvents,
  };
}

function mapLiveEvent(source: Record<string, unknown>): LiveEvent {
  const rule = (source.rule ?? {}) as Record<string, unknown>;
  const agent = (source.agent ?? {}) as Record<string, unknown>;
  const data = (source.data ?? {}) as Record<string, unknown>;
  const level = Number(rule.level);
  return {
    id: `${String(rule.id ?? "-")}-${String(source["@timestamp"] ?? "-")}`,
    time: String(source["@timestamp"] ?? ""),
    event: String(rule.description ?? "-"),
    source: String(agent.name ?? "-"),
    severity: levelToSeverity(Number.isFinite(level) ? level : 0),
    rule: String(rule.id ?? "-"),
    assetOrUser: String(data.srcip ?? data.dstuser ?? (source.user ?? "-")),
>>>>>>> origin/soc-dashboard
  };

  const res = await fetchIndexer<OpenSearchResponse<any>>(`/${index}/_search`, query);
  
  const buckets = res?.aggregations?.severities?.buckets || [];
  const total = buckets.reduce((sum, bucket) => sum + bucket.doc_count, 0);

  const result: AlertsBySeverity = {
    total: total,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  buckets.forEach(b => {
    if (b.key === "critical") result.critical = b.doc_count;
    else if (b.key === "high") result.high = b.doc_count;
    else if (b.key === "medium") result.medium = b.doc_count;
    else if (b.key === "low") result.low = b.doc_count;
  });

  return result;
}

export async function getTopVictims(limit = 10, range: string = "30d") {
  const gte = RANGE_TO_GTE[range] || "now-30d";
  const index = env.wazuhIndexer.alertsIndex();
  const query = {
    size: 0,
    query: { range: { timestamp: { gte } } },
    aggs: { victims: { terms: { field: "agent.name", size: limit } } }
  };
  const res = await fetchIndexer<OpenSearchResponse<any>>(`/${index}/_search`, query);
  const buckets = res?.aggregations?.victims?.buckets || [];
  return buckets.map(b => ({ name: b.key, count: b.doc_count }));
}

/**
 * Returns the top N unique source IPs from Wazuh alerts.
 * Used as input for GeoIP lookups (Attack Country Heatmap).
 */
export async function getTopSourceIPs(limit = 50, range: string = "30d"): Promise<Array<{ ip: string; count: number }>> {
  const gte = RANGE_TO_GTE[range] || "now-30d";
  const index = env.wazuhIndexer.alertsIndex();
  const query = {
    size: 0,
    query: {
      bool: {
        must: [{ range: { timestamp: { gte } } }],
        must_not: [
          // Exclude private/reserved IP ranges
          { prefix: { "data.srcip": "10." } },
          { prefix: { "data.srcip": "192.168." } },
          { prefix: { "data.srcip": "172.16." } },
          { prefix: { "data.srcip": "127." } },
        ],
        filter: [{ exists: { field: "data.srcip" } }],
      },
    },
    aggs: {
      src_ips: {
        terms: { field: "data.srcip", size: limit },
      },
    },
  };

  const res = await fetchIndexer<any>(`/${index}/_search`, query);
  const buckets: Array<{ key: string; doc_count: number }> =
    res?.aggregations?.src_ips?.buckets || [];

  return buckets.map((b) => ({ ip: b.key, count: b.doc_count }));
}


export async function getAttackMethods(limit = 5, range: string = "30d") {
  const gte = RANGE_TO_GTE[range] || "now-30d";
  const index = env.wazuhIndexer.alertsIndex();
  const query = {
    size: 0,
    query: { range: { timestamp: { gte } } },
    aggs: { methods: { terms: { field: "rule.groups", size: limit } } }
  };
  const res = await fetchIndexer<OpenSearchResponse<any>>(`/${index}/_search`, query);
  const buckets = res?.aggregations?.methods?.buckets || [];
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];
  return buckets.map((b, i) => ({ 
    name: b.key, 
    value: b.doc_count, 
    color: colors[i % colors.length] 
  }));
}

export async function getMitreTactics(limit = 5, range: string = "30d") {
  const gte = RANGE_TO_GTE[range] || "now-30d";
  const index = env.wazuhIndexer.alertsIndex();
  const query = {
    size: 0,
    query: { range: { timestamp: { gte } } },
    aggs: { tactics: { terms: { field: "rule.mitre.tactic", size: limit } } }
  };
  const res = await fetchIndexer<OpenSearchResponse<any>>(`/${index}/_search`, query);
  const buckets = res?.aggregations?.tactics?.buckets || [];
  const colors = ["#8b5cf6", "#d946ef", "#f43f5e", "#f97316", "#eab308"];
  return buckets.map((b, i) => ({ 
    name: b.key, 
    value: b.doc_count, 
    color: colors[i % colors.length] 
  }));
}

export async function getAuthStatus(limit = 5) {
  const index = env.wazuhIndexer.alertsIndex();
  const query = {
    size: 0,
    query: {
      bool: {
        must: [
          { range: { timestamp: { gte: "now-7d/d", lte: "now/d" } } },
          { terms: { "rule.groups": ["authentication_success", "authentication_failed", "authentication_failures"] } }
        ]
      }
    },
    aggs: { auth_status: { terms: { field: "rule.groups", size: limit } } }
  };
  const res = await fetchIndexer<OpenSearchResponse<any>>(`/${index}/_search`, query);
  const buckets = res?.aggregations?.auth_status?.buckets || [];
  
  let success = 0;
  let failed = 0;
  buckets.forEach(b => {
    if (b.key === "authentication_success") success += b.doc_count;
    else failed += b.doc_count;
  });
  
  return [
    { name: "Success", value: success, color: "#22c55e" },
    { name: "Failed", value: failed, color: "#ef4444" }
  ];
}

export async function getComplianceSummary() {
  const index = env.wazuhIndexer.alertsIndex();
  const query = {
    size: 0,
    query: { range: { timestamp: { gte: "now-7d/d", lte: "now/d" } } },
    aggs: { 
      pci: { filter: { exists: { field: "rule.pci_dss" } } },
      gdpr: { filter: { exists: { field: "rule.gdpr" } } },
      hipaa: { filter: { exists: { field: "rule.hipaa" } } },
      nist: { filter: { exists: { field: "rule.nist_800_53" } } }
    }
  };
  const res = await fetchIndexer<any>(`/${index}/_search`, query);
  
  return [
    { name: "PCI DSS", value: res?.aggregations?.pci?.doc_count || 0 },
    { name: "GDPR", value: res?.aggregations?.gdpr?.doc_count || 0 },
    { name: "HIPAA", value: res?.aggregations?.hipaa?.doc_count || 0 },
    { name: "NIST 800-53", value: res?.aggregations?.nist?.doc_count || 0 },
  ].sort((a, b) => b.value - a.value);
}

export async function getVulnerabilityStats() {
  const index = env.wazuhIndexer.vulnerabilityIndex();
  
  // Total vulns by severity
  const query = {
    size: 0,
    query: { match_all: {} },
    aggs: { severity: { terms: { field: "vulnerability.severity", size: 10 } } }
  };
  
  try {
    const res = await fetchIndexer<OpenSearchResponse<any>>(`/${index}/_search`, query);
    const buckets = res?.aggregations?.severity?.buckets || [];
    
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;
    
    buckets.forEach(b => {
      const key = b.key.toLowerCase();
      if (key === "critical") critical = b.doc_count;
      else if (key === "high") high = b.doc_count;
      else if (key === "medium") medium = b.doc_count;
      else low += b.doc_count;
    });
    
    return {
      total: critical + high + medium + low,
      critical,
      high,
      medium,
      low
    };
  } catch (error) {
    console.error("Failed to get vulnerability stats", error);
    return { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
  }
}

export async function getAlertsTrend(
  range: string = "7d"
): Promise<TimeSeriesPoint[]> {
<<<<<<< HEAD
  const gte = RANGE_TO_GTE[range] || "now-7d";
  const index = env.wazuhIndexer.alertsIndex();
  
  const query = {
    size: 0,
    query: {
      range: {
        timestamp: { gte }
      }
    },
    aggs: {
      daily: {
        date_histogram: {
          field: "timestamp",
          calendar_interval: "day"
        },
        aggs: {
          severities: {
            range: {
              field: "rule.level",
              ranges: [
                { key: "low", from: 0, to: 4 },
                { key: "medium", from: 4, to: 8 },
                { key: "high", from: 8, to: 12 },
                { key: "critical", from: 12 }
              ]
            }
          }
        }
      }
    }
  };

  const res = await fetchIndexer<any>(`/${index}/_search`, query);
  
  if (!res?.aggregations?.daily?.buckets) {
    return [];
  }

  return res.aggregations.daily.buckets.map((dayBucket: any) => {
    const point: TimeSeriesPoint = {
      date: dayBucket.key_as_string || new Date(dayBucket.key).toISOString(),
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    
    if (dayBucket.severities?.buckets) {
       dayBucket.severities.buckets.forEach((b: any) => {
          if (b.key === "critical") point.critical = b.doc_count;
          else if (b.key === "high") point.high = b.doc_count;
          else if (b.key === "medium") point.medium = b.doc_count;
          else if (b.key === "low") point.low = b.doc_count;
       });
    }
    return point;
  });
}

export async function getLiveEvents(limit = 10, severities?: string[]): Promise<LiveEvent[]> {
  const index = env.wazuhIndexer.alertsIndex();
  
  let queryObj: any = { match_all: {} };

  if (severities && severities.length > 0) {
    const shouldClauses = [];
    if (severities.includes("critical")) shouldClauses.push({ range: { "rule.level": { gte: 12 } } });
    if (severities.includes("high")) shouldClauses.push({ range: { "rule.level": { gte: 8, lt: 12 } } });
    if (severities.includes("medium")) shouldClauses.push({ range: { "rule.level": { gte: 4, lt: 8 } } });
    if (severities.includes("low")) shouldClauses.push({ range: { "rule.level": { lt: 4 } } });

    if (shouldClauses.length > 0) {
      queryObj = {
        bool: {
          should: shouldClauses,
          minimum_should_match: 1
        }
      };
    }
  }

  const query = {
    size: limit,
    sort: [
      { timestamp: { order: "desc" } }
    ],
    query: queryObj
  };

  const res = await fetchIndexer<OpenSearchResponse<any>>(`/${index}/_search`, query);
  
  if (!res?.hits?.hits) return [];

  return res.hits.hits.map(hit => {
    const s = hit._source;
    return {
      id: hit._id,
      time: s.timestamp,
      event: s.rule?.description || "Unknown event",
      source: s.agent?.name || "Unknown",
      severity: levelToSeverity(s.rule?.level || 0),
      rule: s.rule?.id || "N/A",
      assetOrUser: s.data?.srcip || s.data?.dstip || s.agent?.ip || "Unknown",
    };
  });
}

export interface DomainRisk {
  domain: string;
  score: number;       // 0-100
  level: "critical" | "high" | "medium" | "low";
  alertCount: number;
  criticalCount: number;
  highCount: number;
}

export async function getTopRisksByDomain(range: string = "30d"): Promise<DomainRisk[]> {
  const gte = RANGE_TO_GTE[range] || "now-30d";
  const index = env.wazuhIndexer.alertsIndex();

  // --- Domain group mappings ---
  const domainConfig: Array<{ domain: string; filter: any }> = [
    { 
      domain: "Network",     
      filter: { terms: { "rule.groups": ["network", "firewall", "ids", "idsalert", "ddos", "web", "cisco", "pfsense"] } } 
    },
    { 
      domain: "Endpoint",   
      filter: { terms: { "rule.groups": ["windows", "linux", "sysmon", "osquery", "malware", "rootcheck", "fim"] } } 
    },
    { 
      domain: "Identity",   
      filter: { terms: { "rule.groups": ["authentication_success", "authentication_failed", "authentication_failures", "brute_force", "sudo"] } } 
    },
    { 
      domain: "Application",
      filter: { terms: { "rule.groups": ["web", "sql_injection", "xss", "application", "apache", "nginx"] } } 
    },
    { 
      domain: "Compliance", 
      filter: { 
        bool: { 
          should: [
            { exists: { field: "rule.pci_dss" } },
            { exists: { field: "rule.gdpr" } },
            { exists: { field: "rule.hipaa" } },
            { exists: { field: "rule.nist_800_53" } },
            { exists: { field: "rule.tsc" } }
          ] 
        } 
      } 
    },
  ];

  // For each domain we run a filtered aggregation split by severity
  const query = {
    size: 0,
    query: { range: { timestamp: { gte } } },
    aggs: Object.fromEntries(
      domainConfig.map(({ domain, filter }) => [
        domain,
        {
          filter,
          aggs: {
            severities: {
              range: {
                field: "rule.level",
                ranges: [
                  { key: "low",      from: 0,  to: 4  },
                  { key: "medium",   from: 4,  to: 8  },
                  { key: "high",     from: 8,  to: 12 },
                  { key: "critical", from: 12          },
                ],
              },
            },
          },
        },
      ])
    ),
  };

  const res = await fetchIndexer<any>(`/${index}/_search`, query);
  if (!res?.aggregations) return [];

  const results: DomainRisk[] = domainConfig.map(({ domain }) => {
    const agg = res.aggregations[domain];
    const buckets: Array<{ key: string; doc_count: number }> =
      agg?.severities?.buckets || [];

    let low = 0, medium = 0, high = 0, critical = 0;
    buckets.forEach((b) => {
      if (b.key === "critical") critical = b.doc_count;
      else if (b.key === "high")     high = b.doc_count;
      else if (b.key === "medium") medium = b.doc_count;
      else if (b.key === "low")       low = b.doc_count;
    });

    const alertCount = critical + high + medium + low;

    // Weighted risk score: critical=4, high=2, medium=1, low=0.25
    const rawScore = critical * 4 + high * 2 + medium * 1 + low * 0.25;

    // Normalize to 0-100 using a more realistic scale for live environments.
    // If rawScore reaches ~2000, it becomes 50. If 10000, it becomes ~83.
    const score = Math.min(100, Math.round((rawScore / (rawScore + 2000)) * 100));

    const level: DomainRisk["level"] =
      score >= 75 ? "critical" :
      score >= 50 ? "high" :
      score >= 25 ? "medium" : "low";

    return { domain, score, level, alertCount, criticalCount: critical, highCount: high };
  });

  // Sort descending by score
  return results.sort((a, b) => b.score - a.score);
=======
  const telemetry = await getSocTelemetry(range);
  return telemetry.trend.map((point) => ({ date: point.timestamp, critical: point.critical, high: point.high, medium: point.medium, low: point.low }));
}

/** Most recent N events for the "Live Events" table. */
export async function getLiveEvents(limit = 10): Promise<LiveEvent[]> {
  const telemetry = await getSocTelemetry("7d");
  return telemetry.liveEvents.slice(0, Math.min(limit, 10));
>>>>>>> origin/soc-dashboard
}

export async function getTopAlertingRules(
  range: string = "7d",
  limit = 8
): Promise<TopAlertingRule[]> {
<<<<<<< HEAD
  const gte = RANGE_TO_GTE[range] || "now-7d";
  const index = env.wazuhIndexer.alertsIndex();
  
  const query = {
    size: 0,
    query: {
      range: {
        timestamp: { gte }
      }
    },
    aggs: {
      top_rules: {
        terms: {
          field: "rule.description",
          size: limit
        }
      }
    }
  };

  const res = await fetchIndexer<any>(`/${index}/_search`, query);
  
  if (!res?.aggregations?.top_rules?.buckets) {
    return [];
  }

  return res.aggregations.top_rules.buckets.map((b: any) => ({
    ruleName: b.key,
    count: b.doc_count
  }));
}

export async function getTopVulnerableAgents(limit = 10) {
  const index = env.wazuhIndexer.vulnerabilityIndex();
  const query = {
    size: 0,
    query: { match_all: {} },
    aggs: {
      agents: {
        terms: { field: "agent.name", size: limit },
        aggs: {
          severity: {
            terms: { field: "vulnerability.severity" }
          }
        }
      }
    }
  };

  try {
    const res = await fetchIndexer<any>(`/${index}/_search`, query);
    const buckets = res?.aggregations?.agents?.buckets || [];
    
    return buckets.map((b: any) => {
      let critical = 0, high = 0, medium = 0, low = 0;
      const severityBuckets = b.severity?.buckets || [];
      severityBuckets.forEach((sb: any) => {
        const key = sb.key.toLowerCase();
        if (key === "critical") critical = sb.doc_count;
        else if (key === "high") high = sb.doc_count;
        else if (key === "medium") medium = sb.doc_count;
        else low += sb.doc_count;
      });
      
      return {
        agentName: b.key,
        total: b.doc_count,
        critical,
        high,
        medium,
        low
      };
    }).sort((a: any, b: any) => (b.critical * 10 + b.high) - (a.critical * 10 + a.high));
  } catch (error) {
    console.error("Failed to get top vulnerable agents", error);
    return [];
  }
}

export async function getMostCommonCVEs(limit = 10) {
  const index = env.wazuhIndexer.vulnerabilityIndex();
  const query = {
    size: 0,
    query: { match_all: {} },
    aggs: {
      cves: {
        terms: { field: "vulnerability.id", size: limit },
        aggs: {
          severity: {
            terms: { field: "vulnerability.severity", size: 1 }
          }
        }
      }
    }
  };

  try {
    const res = await fetchIndexer<any>(`/${index}/_search`, query);
    const buckets = res?.aggregations?.cves?.buckets || [];
    
    return buckets.map((b: any) => {
      const severity = b.severity?.buckets?.[0]?.key || "Unknown";
      return {
        cve: b.key,
        count: b.doc_count,
        severity
      };
    });
  } catch (error) {
    console.error("Failed to get most common CVEs", error);
    return [];
  }
}

export async function getTopVulnerablePackages(limit = 10) {
  const index = env.wazuhIndexer.vulnerabilityIndex();
  const query = {
    size: 0,
    query: { match_all: {} },
    aggs: {
      packages: {
        terms: { field: "package.name", size: limit }
      }
    }
  };

  try {
    const res = await fetchIndexer<any>(`/${index}/_search`, query);
    const buckets = res?.aggregations?.packages?.buckets || [];
    
    return buckets.map((b: any) => ({
      packageName: b.key,
      count: b.doc_count
    }));
  } catch (error) {
    console.error("Failed to get top vulnerable packages", error);
    return [];
  }
=======
  const telemetry = await getSocTelemetry(range);
  return telemetry.topRules.slice(0, limit).map((rule) => ({ ruleName: `${rule.id} — ${rule.description}`, count: rule.count }));
}

function levelToSeverity(level: number): Severity {
  if (level >= WAZUH_SEVERITY_LEVELS.criticalMin) return "critical";
  if (level >= WAZUH_SEVERITY_LEVELS.highMin) return "high";
  if (level >= WAZUH_SEVERITY_LEVELS.mediumMin) return "medium";
  return "low";
>>>>>>> origin/soc-dashboard
}
