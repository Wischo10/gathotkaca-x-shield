"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import worldMap from "@svg-maps/world";
import { AiKpiCard } from "./AiKpiCard";
import {
  IOC_ANALYSIS_KPIS,
  IOC_TYPE_DISTRIBUTION,
  TOTAL_IOC_COUNT,
  IOC_TREND_SERIES,
  TOP_MALICIOUS_IOCS,
  IOC_RISK_LEVEL_DISTRIBUTION,
  RECENT_IOC_ANALYSES,
  IOC_REPUTATION_SOURCES,
  GEOGRAPHIC_IOC_DISTRIBUTION,
  IOC_MATCHING_SUMMARY,
  IOC_ANALYSIS_SUMMARY_STATS,
  type TopMaliciousIocItem,
  type RecentIocAnalysisRecord,
} from "@/services/ai-copilot-demo-provider";

type WorldMapGeometry = {
  viewBox: string;
  locations: Array<{ id: string; name: string; path: string }>;
};

const worldGeometry = worldMap as unknown as WorldMapGeometry;

export function IocAnalysisWorkspace() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Daily");

  const getThreatBadge = (threat: TopMaliciousIocItem["threatLevel"]) => {
    switch (threat) {
      case "Critical":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-900/50";
      case "High":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-400 dark:border-orange-900/50";
      case "Medium":
        return "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/60 dark:text-yellow-400 dark:border-yellow-900/50";
      case "Low":
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/50";
    }
  };

  const getVerdictBadge = (verdict: RecentIocAnalysisRecord["verdict"]) => {
    switch (verdict) {
      case "Malicious":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/40";
      case "Suspicious":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/40";
      case "Benign":
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/40";
    }
  };

  // Map intensity lookup for geographic IP distribution
  const geoMap = new Map(
    GEOGRAPHIC_IOC_DISTRIBUTION.map((g) => [g.countryCode.toLowerCase(), g])
  );

  return (
    <div className="space-y-4">
      {/* =========================================================================
          ROW 1: KPI ROW (6 Equal-Height Cards)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 items-stretch">
        {IOC_ANALYSIS_KPIS.map((metric) => (
          <AiKpiCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* =========================================================================
          ROW 2: MAIN ANALYTICS ROW (3 Equal-Height Cards)
          LEFT: IOC Type Distribution
          CENTER: IOC Trend (This Week)
          RIGHT: Top Malicious IOCs
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* 3A. IOC Type Distribution (Donut Chart) */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                IOC Type Distribution
              </h2>
              <p className="text-[11px] text-slate-400">
                Breakdown by indicator format
              </p>
            </div>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              DEMO DATA
            </span>
          </div>

          <div className="my-auto flex flex-1 flex-col items-center justify-center py-2 sm:flex-row sm:justify-around sm:gap-4">
            <div className="relative h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={IOC_TYPE_DISTRIBUTION}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={65}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {IOC_TYPE_DISTRIBUTION.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as typeof IOC_TYPE_DISTRIBUTION[0];
                        return (
                          <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-md dark:border-slate-700 dark:bg-slate-800">
                            <div className="text-xs font-semibold" style={{ color: item.color }}>
                              {item.name}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-300">
                              {item.count.toLocaleString()} ({item.percentage}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold leading-none text-slate-800 dark:text-white">
                  {TOTAL_IOC_COUNT.toLocaleString()}
                </span>
                <span className="mt-1 text-[9px] uppercase font-medium tracking-wide text-slate-400">
                  Total IOCs
                </span>
              </div>
            </div>

            <div className="flex w-full flex-col justify-center gap-1.5 px-2 sm:w-auto sm:px-0">
              {IOC_TYPE_DISTRIBUTION.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {item.count.toLocaleString()}{" "}
                    <span className="text-[10px] font-normal text-slate-400">({item.percentage}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
              View full breakdown →
            </button>
          </div>
        </div>

        {/* 3B. IOC Trend (This Week) (Line Chart) */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                IOC Trend (This Week)
              </h2>
              <p className="text-[11px] text-slate-400">
                Classification volume over 7 days
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <option value="Daily">Daily</option>
                <option value="Hourly">Hourly</option>
              </select>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                DEMO DATA
              </span>
            </div>
          </div>

          <div className="my-auto flex flex-1 flex-col justify-center py-2">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={IOC_TREND_SERIES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.5rem",
                      fontSize: "11px",
                      color: "#fff",
                    }}
                  />
                  <Line type="monotone" dataKey="Malicious" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Benign" stroke="#22c55e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Suspicious" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Unknown" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[10px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span>Malicious</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Benign</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Suspicious</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span>Unknown</span>
              </div>
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <span className="text-[10px] text-slate-400">
              Aggregated across active threat sensors
            </span>
          </div>
        </div>

        {/* 3C. Top Malicious IOCs (Compact Table) */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Top Malicious IOCs
              </h2>
              <p className="text-[11px] text-slate-400">
                Critical priority threat indicators
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                DEMO DATA
              </span>
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
                View All
              </button>
            </div>
          </div>

          <div className="my-auto flex flex-1 flex-col overflow-x-auto py-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-medium text-slate-400 dark:border-slate-800">
                  <th className="pb-2 font-medium">IOC Value</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Threat</th>
                  <th className="pb-2 font-medium">Last Seen</th>
                  <th className="pb-2 text-right font-medium">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                {TOP_MALICIOUS_IOCS.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate" title={item.iocValue}>
                      {item.iocValue}
                    </td>
                    <td className="py-2.5 text-slate-500 whitespace-nowrap text-[11px]">{item.type}</td>
                    <td className="py-2.5 whitespace-nowrap">
                      <span className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold ${getThreatBadge(item.threatLevel)}`}>
                        {item.threatLevel}
                      </span>
                    </td>
                    <td className="py-2.5 whitespace-nowrap text-slate-400 text-[10px]">{item.lastSeen}</td>
                    <td className="py-2.5 text-right whitespace-nowrap text-[10px] text-slate-500 dark:text-slate-400">
                      {item.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <span className="text-[10px] text-slate-400">
              5 of {TOTAL_IOC_COUNT.toLocaleString()} indicators displayed
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 3: SECOND ROW (3 Equal-Height Cards)
          LEFT: IOC Risk Level
          CENTER: Recent IOC Analysis
          RIGHT: IOC Reputation Sources
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* 4A. IOC Risk Level (Donut Chart) */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                IOC Risk Level
              </h2>
              <p className="text-[11px] text-slate-400">
                Severity classification distribution
              </p>
            </div>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              DEMO DATA
            </span>
          </div>

          <div className="my-auto flex flex-1 flex-col items-center justify-center py-2 sm:flex-row sm:justify-around sm:gap-4">
            <div className="relative h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={IOC_RISK_LEVEL_DISTRIBUTION}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={65}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {IOC_RISK_LEVEL_DISTRIBUTION.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as typeof IOC_RISK_LEVEL_DISTRIBUTION[0];
                        return (
                          <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-md dark:border-slate-700 dark:bg-slate-800">
                            <div className="text-xs font-semibold" style={{ color: item.color }}>
                              {item.name}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-300">
                              {item.count.toLocaleString()} ({item.percentage}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold leading-none text-slate-800 dark:text-white">
                  {TOTAL_IOC_COUNT.toLocaleString()}
                </span>
                <span className="mt-1 text-[9px] uppercase font-medium tracking-wide text-slate-400">
                  Total IOCs
                </span>
              </div>
            </div>

            <div className="flex w-full flex-col justify-center gap-2 px-2 sm:w-auto sm:px-0">
              {IOC_RISK_LEVEL_DISTRIBUTION.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {item.count.toLocaleString()}{" "}
                    <span className="text-[10px] font-normal text-slate-400">({item.percentage}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
              View full report →
            </button>
          </div>
        </div>

        {/* 4B. Recent IOC Analysis (Compact Table) */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Recent IOC Analysis
              </h2>
              <p className="text-[11px] text-slate-400">
                Live evaluated indicators
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                DEMO DATA
              </span>
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
                View All
              </button>
            </div>
          </div>

          <div className="my-auto flex flex-1 flex-col overflow-x-auto py-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-medium text-slate-400 dark:border-slate-800">
                  <th className="pb-2 font-medium">IOC Value</th>
                  <th className="pb-2 font-medium">Verdict</th>
                  <th className="pb-2 font-medium">Risk</th>
                  <th className="pb-2 font-medium">Confidence</th>
                  <th className="pb-2 text-right font-medium">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                {RECENT_IOC_ANALYSES.map((rec) => (
                  <tr key={rec.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="py-2 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200 max-w-[110px] truncate" title={rec.iocValue}>
                      {rec.iocValue}
                    </td>
                    <td className="py-2 whitespace-nowrap">
                      <span className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold ${getVerdictBadge(rec.verdict)}`}>
                        {rec.verdict}
                      </span>
                    </td>
                    <td className="py-2 whitespace-nowrap text-[11px]">
                      <span className={`font-semibold ${rec.riskLevel === "High" ? "text-red-600 dark:text-red-400" : rec.riskLevel === "Medium" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {rec.riskLevel}
                      </span>
                    </td>
                    <td className="py-2 whitespace-nowrap">
                      <span className="rounded bg-blue-50 px-1 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                        {rec.confidence}%
                      </span>
                    </td>
                    <td className="py-2 text-right whitespace-nowrap text-[10px] text-slate-500 dark:text-slate-400">
                      {rec.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <span className="text-[10px] text-slate-400">
              Evaluated against multi-feed reputation DB
            </span>
          </div>
        </div>

        {/* 4C. IOC Reputation Sources (Horizontal Progress Bars) */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                IOC Reputation Sources
              </h2>
              <p className="text-[11px] text-slate-400">
                Threat feed distribution & volume
              </p>
            </div>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              DEMO DATA
            </span>
          </div>

          <div className="my-auto flex flex-1 flex-col justify-center space-y-3 py-2">
            {IOC_REPUTATION_SOURCES.map((src) => (
              <div key={src.source} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {src.source}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {src.count.toLocaleString()}{" "}
                    <span className="text-[10px] font-normal text-slate-400">({src.percentage}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${src.percentage}%`, backgroundColor: src.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <span className="text-[10px] text-slate-400">
              5 threat feeds active • Continuous synchronization
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 4: THIRD ROW (3 Equal-Height Cards)
          LEFT: Geographic Distribution (IP IOCs)
          CENTER: IOC Matching Summary
          RIGHT: IOC Analysis Summary (This Week)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* 5A. Geographic Distribution (IP IOCs) */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Geographic Distribution (IP IOCs)
              </h2>
              <p className="text-[11px] text-slate-400">
                Observed origin country density
              </p>
            </div>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              DEMO DATA
            </span>
          </div>

          <div className="my-auto flex flex-1 flex-col justify-center py-2">
            <div className="relative h-44 w-full overflow-hidden rounded-lg bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50">
              <svg
                aria-label="World map showing geographic distribution of IP IOCs"
                className="block h-full w-full"
                preserveAspectRatio="xMidYMid meet"
                viewBox={worldGeometry.viewBox}
              >
                {worldGeometry.locations.map((loc) => {
                  const entry = geoMap.get(loc.id);
                  let fill = "#E2E8F0";
                  if (entry) {
                    if (entry.intensity === "Very High") fill = "#B91C1C";
                    else if (entry.intensity === "High") fill = "#EF4444";
                    else if (entry.intensity === "Medium") fill = "#F87171";
                    else if (entry.intensity === "Low") fill = "#FCA5A5";
                    else fill = "#FEE2E2";
                  }
                  return (
                    <path
                      key={loc.id}
                      d={loc.path}
                      fill={fill}
                      stroke="#ffffff"
                      strokeWidth="0.6"
                      className="transition-colors hover:brightness-110"
                    >
                      <title>{entry ? `${loc.name}: ${entry.count} IOCs (${entry.intensity})` : `${loc.name}: 0 IOCs`}</title>
                    </path>
                  );
                })}
              </svg>

              {/* Legend overlay */}
              <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1.5 rounded bg-white/90 px-2 py-0.5 text-[9px] text-slate-600 shadow-2xs backdrop-blur-xs dark:bg-slate-900/90 dark:text-slate-400">
                <span>Low</span>
                <span className="h-2 w-12 rounded-sm" style={{ backgroundImage: "linear-gradient(to right, #FEE2E2, #FCA5A5, #EF4444, #B91C1C)" }} />
                <span>High</span>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between text-[10px] text-slate-500">
              <span>Top: US (1,420), RU (980), CN (840)</span>
              <span>8 Countries highlighted</span>
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
              View full map →
            </button>
          </div>
        </div>

        {/* 5B. IOC Matching Summary */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                IOC Matching Summary
              </h2>
              <p className="text-[11px] text-slate-400">
                Correlation precision with internal events
              </p>
            </div>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              DEMO DATA
            </span>
          </div>

          <div className="my-auto flex flex-1 flex-col items-center justify-center py-2 sm:flex-row sm:justify-around sm:gap-4">
            {/* Left 3 KPI blocks */}
            <div className="flex flex-1 flex-col gap-2 w-full">
              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2 text-xs dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Exact Matches</span>
                  <span className="text-[10px] font-semibold text-emerald-600">{IOC_MATCHING_SUMMARY.exactMatches.change}</span>
                </div>
                <div className="mt-0.5 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {IOC_MATCHING_SUMMARY.exactMatches.count.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400">{IOC_MATCHING_SUMMARY.exactMatches.percentage}%</span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2 text-xs dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Fuzzy Matches</span>
                  <span className="text-[10px] font-semibold text-emerald-600">{IOC_MATCHING_SUMMARY.fuzzyMatches.change}</span>
                </div>
                <div className="mt-0.5 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {IOC_MATCHING_SUMMARY.fuzzyMatches.count.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400">{IOC_MATCHING_SUMMARY.fuzzyMatches.percentage}%</span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2 text-xs dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-medium text-slate-700 dark:text-slate-300">No Matches</span>
                  <span className="text-[10px] font-semibold text-blue-600">{IOC_MATCHING_SUMMARY.noMatches.change}</span>
                </div>
                <div className="mt-0.5 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {IOC_MATCHING_SUMMARY.noMatches.count.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400">{IOC_MATCHING_SUMMARY.noMatches.percentage}%</span>
                </div>
              </div>
            </div>

            {/* Right Donut */}
            <div className="relative h-36 w-36 shrink-0 mt-3 sm:mt-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={IOC_MATCHING_SUMMARY.donutData}
                    dataKey="value"
                    innerRadius={42}
                    outerRadius={58}
                    stroke="none"
                  >
                    {IOC_MATCHING_SUMMARY.donutData.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-bold leading-none text-slate-800 dark:text-white">
                  {IOC_MATCHING_SUMMARY.total.toLocaleString()}
                </span>
                <span className="mt-1 text-[8px] uppercase font-medium tracking-wide text-slate-400">
                  Total IOCs
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
              View matching details →
            </button>
          </div>
        </div>

        {/* 5C. IOC Analysis Summary (This Week) */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                IOC Analysis Summary (This Week)
              </h2>
              <p className="text-[11px] text-slate-400">
                Operational KPIs & confidence benchmark
              </p>
            </div>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              DEMO DATA
            </span>
          </div>

          <div className="my-auto flex flex-1 flex-col items-center justify-center py-2 sm:flex-row sm:justify-around sm:gap-4">
            {/* 6 Metrics list */}
            <div className="flex flex-1 flex-col gap-1.5 w-full text-xs">
              <div className="flex items-center justify-between border-b border-slate-50 pb-1 dark:border-slate-800/50">
                <span className="text-slate-500">Total IOCs Analyzed</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {IOC_ANALYSIS_SUMMARY_STATS.totalAnalyzed.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-1 dark:border-slate-800/50">
                <span className="text-slate-500">New IOCs Identified</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {IOC_ANALYSIS_SUMMARY_STATS.newIdentified}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-1 dark:border-slate-800/50">
                <span className="text-slate-500">Matched with Threat Intel</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {IOC_ANALYSIS_SUMMARY_STATS.matchedThreatIntel.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-1 dark:border-slate-800/50">
                <span className="text-slate-500">False Positive / Benign</span>
                <span className="font-semibold text-emerald-600">
                  {IOC_ANALYSIS_SUMMARY_STATS.falsePositiveBenign.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-1 dark:border-slate-800/50">
                <span className="text-slate-500">High Risk IOCs</span>
                <span className="font-semibold text-red-600">
                  {IOC_ANALYSIS_SUMMARY_STATS.highRisk}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Auto Resolved</span>
                <span className="font-semibold text-blue-600">
                  {IOC_ANALYSIS_SUMMARY_STATS.autoResolved}
                </span>
              </div>
            </div>

            {/* Right ring visualization */}
            <div className="relative h-36 w-36 shrink-0 mt-3 sm:mt-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Confidence", value: IOC_ANALYSIS_SUMMARY_STATS.maliciousConfidencePercent, color: "#10b981" },
                      { name: "Remaining", value: 100 - IOC_ANALYSIS_SUMMARY_STATS.maliciousConfidencePercent, color: "#e2e8f0" },
                    ]}
                    dataKey="value"
                    innerRadius={42}
                    outerRadius={56}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#e2e8f0" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-bold leading-none text-slate-800 dark:text-white">
                  {IOC_ANALYSIS_SUMMARY_STATS.maliciousConfidencePercent}%
                </span>
                <span className="mt-1 text-[8px] uppercase font-medium tracking-wide text-slate-400 text-center leading-tight">
                  Malicious<br />Confidence
                </span>
              </div>
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
              View full summary →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
