import "server-only";
import { env } from "@/lib/env";
import type {
  AlertsBySeverity,
  LiveEvent,
  Severity,
  TimeSeriesPoint,
  TopAlertingRule,
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

const RANGE_TO_GTE: Record<string, string> = {
  "24h": "now-24h",
  "7d": "now-7d",
  "30d": "now-30d",
};

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

export async function getMitreTactics(limit = 5) {
  const index = env.wazuhIndexer.alertsIndex();
  const query = {
    size: 0,
    query: { range: { timestamp: { gte: "now-30d/d", lte: "now/d" } } },
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

export async function getLiveEvents(limit = 10): Promise<LiveEvent[]> {
  const index = env.wazuhIndexer.alertsIndex();
  const query = {
    size: limit,
    sort: [
      { timestamp: { order: "desc" } }
    ],
    query: {
      match_all: {}
    }
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

/**
 * Derives security domain risk scores from Wazuh alert data.
 * Maps rule.groups → security domains and calculates a risk score (0-100)
 * based on weighted critical/high alert counts.
 */
export async function getTopRisksByDomain(range: string = "30d"): Promise<DomainRisk[]> {
  const gte = RANGE_TO_GTE[range] || "now-30d";
  const index = env.wazuhIndexer.alertsIndex();

  // --- Domain group mappings ---
  const domainConfig: Array<{ domain: string; groups: string[] }> = [
    { domain: "Network",     groups: ["network", "firewall", "ids", "idsalert", "ddos", "web", "cisco", "pfsense"] },
    { domain: "Endpoint",   groups: ["windows", "linux", "sysmon", "osquery", "malware", "rootcheck", "fim"] },
    { domain: "Identity",   groups: ["authentication_success", "authentication_failed", "authentication_failures", "brute_force", "sudo"] },
    { domain: "Application",groups: ["web", "sql_injection", "xss", "application", "apache", "nginx"] },
    { domain: "Compliance", groups: ["pci_dss", "gdpr", "hipaa", "nist_800_53", "tsc"] },
  ];

  // For each domain we run a filtered aggregation split by severity
  const query = {
    size: 0,
    query: { range: { timestamp: { gte } } },
    aggs: Object.fromEntries(
      domainConfig.map(({ domain, groups }) => [
        domain,
        {
          filter: {
            terms: { "rule.groups": groups },
          },
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

    // Normalize to 0-100 using soft logarithmic scale
    const score = Math.min(100, Math.round((rawScore / (rawScore + 200)) * 200));

    const level: DomainRisk["level"] =
      score >= 75 ? "critical" :
      score >= 50 ? "high" :
      score >= 25 ? "medium" : "low";

    return { domain, score, level, alertCount, criticalCount: critical, highCount: high };
  });

  // Sort descending by score
  return results.sort((a, b) => b.score - a.score);
}

export async function getTopAlertingRules(
  range: string = "7d",
  limit = 8
): Promise<TopAlertingRule[]> {
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
