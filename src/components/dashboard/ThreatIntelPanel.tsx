"use client";

import { Panel, PanelEmpty, PanelError, PanelLoading } from "@/components/ui/Panel";
import { useApiResult } from "@/hooks/useApiResult";
import type { ThreatIntelligenceOverviewData } from "@/types/threat-intel";

export function ThreatIntelPanel() {
  const state = useApiResult<ThreatIntelligenceOverviewData>(
    "/api/ciso/threat-intelligence"
  );

  return (
    <Panel
      title="Threat Intelligence Overview"
      action={
        <span className="inline-flex items-center rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          Last 7 Days
        </span>
      }
      className="flex flex-col justify-between"
    >
      {state.phase === "loading" && <PanelLoading />}
      {state.phase === "empty" && (
        <PanelEmpty message="No active threat intelligence data available." />
      )}
      {state.phase === "error" && (
        <PanelError message={state.message} onRetry={state.reload} />
      )}
      {state.phase === "ready" && <ThreatIntelContent data={state.data} />}

      {/* FOOTER: Provider Health Status & Navigation */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-[10px]">
        <div className="flex items-center gap-2.5 text-slate-400">
          <span className="flex items-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                state.phase === "ready" && state.data.providers.threatFox.status === "ok"
                  ? "bg-emerald-500"
                  : "bg-amber-500"
              }`}
            />
            ThreatFox
          </span>
          <span className="flex items-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                state.phase === "ready" && state.data.providers.abuseIpDb.status === "ok"
                  ? "bg-emerald-500"
                  : "bg-amber-500"
              }`}
            />
            AbuseIPDB
          </span>
          <span className="flex items-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                state.phase === "ready" && state.data.providers.virusTotal.status === "ok"
                  ? "bg-emerald-500"
                  : "bg-amber-500"
              }`}
            />
            VirusTotal
          </span>
        </div>
        <a
          href="/dashboard/soc-l2"
          className="text-brand-blue hover:underline cursor-pointer font-medium"
        >
          View threat intelligence →
        </a>
      </div>
    </Panel>
  );
}

function ThreatIntelContent({ data }: { data: ThreatIntelligenceOverviewData }) {
  const { kpis, topMalware, iocTypeDistribution } = data;

  return (
    <div className="flex flex-col space-y-2.5">
      {/* 2-COLUMN MAIN BODY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* LEFT COLUMN: Compact Executive Threat KPIs */}
        <div className="flex flex-col justify-between space-y-1.5">
          {/* Row 1: Total IOCs */}
          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🎯</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                IOCs Detected (7d)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-white">
                {kpis.totalIocs.toLocaleString()}
              </span>
              {kpis.totalIocsTrendPct !== null ? (
                <span
                  className={`text-[9px] font-semibold px-1 py-0.2 rounded ${
                    kpis.totalIocsTrendPct >= 0
                      ? "text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400"
                      : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400"
                  }`}
                >
                  {kpis.totalIocsTrendPct >= 0 ? "↑" : "↓"} {Math.abs(kpis.totalIocsTrendPct)}%
                </span>
              ) : (
                <span className="text-[9px] text-slate-400">—</span>
              )}
            </div>
          </div>

          {/* Row 2: Malware Families */}
          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">👾</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                Malware Families
              </span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-white">
              {kpis.malwareCampaignsCount}
            </span>
          </div>

          {/* Row 3: C2 & Botnet Infrastructure */}
          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🤖</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                C2 & Botnet Infrastructure
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-white">
                {kpis.c2BotnetCount.toLocaleString()}
              </span>
              {kpis.c2TrendPct !== null ? (
                <span
                  className={`text-[9px] font-semibold px-1 py-0.2 rounded ${
                    kpis.c2TrendPct >= 0
                      ? "text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400"
                      : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400"
                  }`}
                >
                  {kpis.c2TrendPct >= 0 ? "↑" : "↓"} {Math.abs(kpis.c2TrendPct)}%
                </span>
              ) : (
                <span className="text-[9px] text-slate-400">—</span>
              )}
            </div>
          </div>

          {/* Row 4: High Confidence Indicators */}
          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🛡️</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                High Confidence (≥75%)
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {kpis.highConfidenceCount.toLocaleString()}
            </span>
          </div>

          {/* Row 5: Malicious IPs */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🌐</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                Malicious IP Addresses
              </span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-white">
              {kpis.maliciousIpsCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Top Threat Sources / Malware Horizontal Bars */}
        <div className="flex flex-col justify-between sm:border-l border-slate-100 dark:border-slate-800/80 sm:pl-3 pt-1 sm:pt-0">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 pb-1">
            <span>Top Threat Sources</span>
            <span className="text-[10px] font-normal text-slate-400">Share</span>
          </div>

          <div className="space-y-1.5">
            {topMalware.length > 0 ? (
              topMalware.slice(0, 4).map((item, idx) => (
                <div key={item.name} className="space-y-0.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[120px]">
                      {item.name}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {item.count.toLocaleString()}{" "}
                      <span className="text-[9px] text-slate-400">({item.percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        idx === 0
                          ? "bg-red-500"
                          : idx === 1
                          ? "bg-orange-500"
                          : idx === 2
                          ? "bg-amber-500"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${Math.max(item.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[11px] text-slate-400 py-3 text-center">
                No threat source data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM: IOC Type Distribution */}
      <div className="rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 p-2">
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1.5">
          <span>IOC Type Distribution</span>
          <span>{kpis.totalIocs.toLocaleString()} Total</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
          <div className="flex flex-col rounded bg-white dark:bg-slate-900/60 p-1.5 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 text-[9px]">Domains & URLs</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {kpis.maliciousDomainsCount.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col rounded bg-white dark:bg-slate-900/60 p-1.5 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 text-[9px]">Malicious IPs</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {kpis.maliciousIpsCount.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col rounded bg-white dark:bg-slate-900/60 p-1.5 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 text-[9px]">File Hashes</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {kpis.maliciousHashesCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
