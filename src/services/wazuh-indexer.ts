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
  };
}

/** Daily alert volume broken down by severity, for the area/line trend chart. */
export async function getAlertsTrend(
  range: string = "7d"
): Promise<TimeSeriesPoint[]> {
  const telemetry = await getSocTelemetry(range);
  return telemetry.trend.map((point) => ({ date: point.timestamp, critical: point.critical, high: point.high, medium: point.medium, low: point.low }));
}

/** Most recent N events for the "Live Events" table. */
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
  return telemetry.topRules.slice(0, limit).map((rule) => ({ ruleName: `${rule.id} — ${rule.description}`, count: rule.count }));
}

function levelToSeverity(level: number): Severity {
  if (level >= WAZUH_SEVERITY_LEVELS.criticalMin) return "critical";
  if (level >= WAZUH_SEVERITY_LEVELS.highMin) return "high";
  if (level >= WAZUH_SEVERITY_LEVELS.mediumMin) return "medium";
  return "low";
}
