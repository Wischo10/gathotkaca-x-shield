import "server-only";
import { env } from "@/lib/env";
import { fetchJson } from "@/lib/http";
import type {
  AlertsBySeverity,
  LiveEvent,
  Severity,
  TimeSeriesPoint,
  TopAlertingRule,
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

const RANGE_TO_GTE: Record<string, string> = {
  "24h": "now-24h",
  "7d": "now-7d",
  "30d": "now-30d",
};

/** Alerts grouped by severity (rule.level bucketed) for the donut chart. */
export async function getAlertsBySeverity(
  range: string = "7d"
): Promise<AlertsBySeverity> {
  // --- MOCK DATA IMPLEMENTATION ---
  return {
    total: 1200,
    critical: 12,
    high: 88,
    medium: 300,
    low: 800,
  };
}

/** Daily alert volume broken down by severity, for the area/line trend chart. */
export async function getAlertsTrend(
  range: string = "7d"
): Promise<TimeSeriesPoint[]> {
  // --- MOCK DATA IMPLEMENTATION ---
  const points: TimeSeriesPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    points.push({
      date: d.toISOString().split("T")[0] + "T00:00:00.000Z",
      critical: Math.floor(Math.random() * 5),
      high: Math.floor(Math.random() * 20),
      medium: Math.floor(Math.random() * 50),
      low: Math.floor(Math.random() * 100),
    });
  }
  return points;
}

/** Most recent N events for the "Live Events" table. */
export async function getLiveEvents(limit = 10): Promise<LiveEvent[]> {
  // --- MOCK DATA IMPLEMENTATION ---
  const events: LiveEvent[] = [];
  for (let i = 0; i < limit; i++) {
    events.push({
      id: `mock-event-${i}`,
      time: new Date(Date.now() - i * 60000).toISOString(),
      event: "Authentication failed",
      source: "sshd",
      severity: "high",
      rule: "5716",
      assetOrUser: "192.168.1.100",
    });
  }
  return events;
}

/** Top alerting rules ranked by count, for the "Top Alerting Rules" panel. */
export async function getTopAlertingRules(
  range: string = "7d",
  limit = 8
): Promise<TopAlertingRule[]> {
  // --- MOCK DATA IMPLEMENTATION ---
  return [
    { ruleName: "sshd: authentication failed", count: 120 },
    { ruleName: "Windows: Logon failure", count: 85 },
    { ruleName: "Sudo command executed", count: 64 },
    { ruleName: "Web attack: SQL injection attempt", count: 42 },
    { ruleName: "Firewall: Connection dropped", count: 35 },
  ];
}

function levelToSeverity(level: number): Severity {
  if (level >= 14) return "critical";
  if (level >= 11) return "high";
  if (level >= 7) return "medium";
  return "low";
}
