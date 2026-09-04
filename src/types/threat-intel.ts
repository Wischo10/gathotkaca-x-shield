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

export interface ThreatIntelligenceOverviewData {
  period: "7d";
  updatedAt: string;
  kpis: ThreatIntelKpi;
  topMalware: ThreatCategoryItem[];
  topThreatTypes: ThreatCategoryItem[];
  iocTypeDistribution: ThreatCategoryItem[];
  providers: {
    threatFox: ProviderHealth;
    abuseIpDb: ProviderHealth;
    virusTotal: ProviderHealth;
  };
}
