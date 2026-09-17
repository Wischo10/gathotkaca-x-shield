export interface ThreatIntelKpi {
  totalIocs: number;
  totalIocsTrendPct: number | null;
  c2BotnetCount: number;
  c2TrendPct: number | null;
  malwareCampaignsCount: number;
  highConfidenceCount: number;
  maliciousIpsCount: number;
  maliciousHashesCount: number;
  maliciousDomainsCount: number;
}

export interface ThreatCategoryItem {
  name: string;
  count: number;
  percentage: number;
}

export interface ProviderHealth {
  status: "ok" | "degraded" | "error";
  name: string;
  detail?: string;
}
export interface ObservedThreatIoc { id: string; indicator: string; iocType: string; provider: "ThreatFox"; confidence: number | null; observedAt: string | null; malware: string | null; }

export interface ThreatIntelligenceOverviewData {
  period: "7d";
  availability: "available" | "cached" | "unavailable";
  observedAt: string | null;
  updatedAt: string;
  kpis: ThreatIntelKpi | null;
  topMalware: ThreatCategoryItem[];
  topThreatTypes: ThreatCategoryItem[];
  iocTypeDistribution: ThreatCategoryItem[];
  observedIocs: ObservedThreatIoc[];
  providers: {
    threatFox: ProviderHealth;
    abuseIpDb: ProviderHealth;
    virusTotal: ProviderHealth;
  };
}
