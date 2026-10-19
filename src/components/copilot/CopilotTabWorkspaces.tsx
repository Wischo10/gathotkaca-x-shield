"use client";

import React, { useState } from "react";
import { AiKpiCard } from "./AiKpiCard";
import { AiAssistantCard } from "./AiAssistantCard";
import {
  AI_RECOMMENDED_NEXT_STEPS,
  type AiKpiMetric,
  type AiRecommendationItem,
} from "@/services/ai-copilot-demo-provider";

// ==========================================
// IOC ANALYSIS WORKSPACE
// ==========================================
const IOC_KPIS: AiKpiMetric[] = [
  {
    id: "ioc-evaluated",
    label: "Total IOCs Evaluated",
    value: "3,892",
    trendText: "14% vs last week",
    isTrendUp: true,
    trendPositive: true,
    icon: "shield",
    sparkline: [
      { day: "Mon", value: 480 },
      { day: "Tue", value: 520 },
      { day: "Wed", value: 610 },
      { day: "Thu", value: 590 },
      { day: "Fri", value: 640 },
      { day: "Sat", value: 490 },
      { day: "Sun", value: 562 },
    ],
  },
  {
    id: "ioc-malicious",
    label: "Confirmed Malicious",
    value: "284",
    trendText: "8% vs last week",
    isTrendUp: true,
    trendPositive: false,
    icon: "zap",
    sparkline: [
      { day: "Mon", value: 34 },
      { day: "Tue", value: 42 },
      { day: "Wed", value: 48 },
      { day: "Thu", value: 41 },
      { day: "Fri", value: 52 },
      { day: "Sat", value: 32 },
      { day: "Sun", value: 35 },
    ],
  },
  {
    id: "ioc-automated-block",
    label: "Automated Blocks",
    value: "216",
    trendText: "19% vs last week",
    isTrendUp: true,
    trendPositive: true,
    icon: "document",
    sparkline: [
      { day: "Mon", value: 26 },
      { day: "Tue", value: 32 },
      { day: "Wed", value: 38 },
      { day: "Thu", value: 34 },
      { day: "Fri", value: 41 },
      { day: "Sat", value: 22 },
      { day: "Sun", value: 23 },
    ],
  },
  {
    id: "ioc-correlation-rate",
    label: "Correlation Accuracy",
    value: "95.6%",
    trendText: "1.2% improvement",
    isTrendUp: true,
    trendPositive: true,
    icon: "sparkles",
    sparkline: [
      { day: "Mon", value: 94 },
      { day: "Tue", value: 94.5 },
      { day: "Wed", value: 95 },
      { day: "Thu", value: 95.2 },
      { day: "Fri", value: 95.8 },
      { day: "Sat", value: 95.4 },
      { day: "Sun", value: 95.6 },
    ],
  },
  {
    id: "ioc-enrichment-time",
    label: "Avg. Enrichment Time",
    value: "420ms",
    trendText: "85ms faster",
    isTrendUp: true,
    trendPositive: true,
    icon: "clock",
    sparkline: [
      { day: "Mon", value: 560 },
      { day: "Tue", value: 510 },
      { day: "Wed", value: 480 },
      { day: "Thu", value: 440 },
      { day: "Fri", value: 410 },
      { day: "Sat", value: 430 },
      { day: "Sun", value: 420 },
    ],
  },
];

export function IocAnalysisWorkspace() {
  const demoIocs = [
    { ioc: "194.26.29.112", type: "IPv4", confidence: 98, reputation: "Malicious (100%)", source: "AbuseIPDB & Wazuh", hits: 1420, verdict: "C2 / Brute Force", status: "Active Block" },
    { ioc: "45.142.214.8", type: "IPv4", confidence: 92, reputation: "High Risk (90%)", source: "AlienVault OTX", hits: 86, verdict: "Port Scanner", status: "Perimeter Drop" },
    { ioc: "7a8b9c0d1e2f3a4b...", type: "SHA-256", confidence: 96, reputation: "Malicious (98%)", source: "VirusTotal / EDR", hits: 1, verdict: "Trojan Dropper", status: "Quarantined" },
    { ioc: "update-sync-service.com", type: "Domain", confidence: 85, reputation: "Suspicious (82%)", source: "DNS Passive Logs", hits: 14, verdict: "C2 DGA Beacon", status: "DNS Sinkhole" },
    { ioc: "185.220.101.5", type: "IPv4", confidence: 89, reputation: "High Risk (86%)", source: "Tor Exit Node DB", hits: 28, verdict: "Anonymized Probe", status: "Monitored" },
  ];

  return (
    <div className="space-y-4">
      {/* KPI Row (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-stretch">
        {IOC_KPIS.map((metric) => (
          <AiKpiCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Main Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Table of active IOCs (8 cols) */}
        <div className="lg:col-span-8 flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Active IOC Threat Correlation
              </h2>
              <p className="text-[11px] text-slate-400">
                Real-time indicator verification across internal telemetry and global intelligence
              </p>
            </div>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              DEMO DATA
            </span>
          </div>

          <div className="my-2 flex flex-1 flex-col overflow-x-auto py-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400 dark:border-slate-800">
                  <th className="pb-2 font-medium">Indicator</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Reputation</th>
                  <th className="pb-2 font-medium">Hits</th>
                  <th className="pb-2 font-medium">AI Classification</th>
                  <th className="pb-2 text-right font-medium">Mitigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                {demoIocs.map((item, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {item.ioc}
                    </td>
                    <td className="py-2.5 text-slate-500 whitespace-nowrap text-[11px]">{item.type}</td>
                    <td className="py-2.5 font-semibold text-red-600 dark:text-red-400 whitespace-nowrap text-[11px]">
                      {item.reputation}
                    </td>
                    <td className="py-2.5 whitespace-nowrap font-mono text-slate-700 dark:text-slate-300 text-[11px]">
                      {item.hits.toLocaleString()}
                    </td>
                    <td className="py-2.5 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200 text-[11px]">
                      {item.verdict}
                    </td>
                    <td className="py-2.5 text-right whitespace-nowrap">
                      <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-300">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
              Export correlated indicators (STIX/TAXII) →
            </button>
          </div>
        </div>

        {/* IOC Assistant side card (4 cols) */}
        <div className="lg:col-span-4 h-full">
          <AiAssistantCard />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// INVESTIGATION ASSISTANT WORKSPACE
// ==========================================
const INVESTIGATION_KPIS: AiKpiMetric[] = [
  {
    id: "inv-active-cases",
    label: "Active Investigations",
    value: "18",
    trendText: "3 resolved today",
    isTrendUp: true,
    trendPositive: true,
    icon: "shield",
    sparkline: [
      { day: "Mon", value: 24 },
      { day: "Tue", value: 22 },
      { day: "Wed", value: 25 },
      { day: "Thu", value: 20 },
      { day: "Fri", value: 19 },
      { day: "Sat", value: 18 },
      { day: "Sun", value: 18 },
    ],
  },
  {
    id: "inv-hypotheses",
    label: "Hypotheses Evaluated",
    value: "64",
    trendText: "12 confirmed",
    isTrendUp: true,
    trendPositive: true,
    icon: "sparkles",
    sparkline: [
      { day: "Mon", value: 8 },
      { day: "Tue", value: 10 },
      { day: "Wed", value: 14 },
      { day: "Thu", value: 12 },
      { day: "Fri", value: 15 },
      { day: "Sat", value: 7 },
      { day: "Sun", value: 10 },
    ],
  },
  {
    id: "inv-pivot-speed",
    label: "Investigation Speedup",
    value: "3.8x",
    trendText: "vs manual analysis",
    isTrendUp: true,
    trendPositive: true,
    icon: "zap",
    sparkline: [
      { day: "Mon", value: 3.2 },
      { day: "Tue", value: 3.4 },
      { day: "Wed", value: 3.5 },
      { day: "Thu", value: 3.6 },
      { day: "Fri", value: 3.8 },
      { day: "Sat", value: 3.7 },
      { day: "Sun", value: 3.8 },
    ],
  },
  {
    id: "inv-mitre-tactics",
    label: "MITRE Tactics Mapped",
    value: "9",
    trendText: "T1110, T1059, T1071...",
    isTrendUp: true,
    trendPositive: true,
    icon: "document",
    sparkline: [
      { day: "Mon", value: 6 },
      { day: "Tue", value: 7 },
      { day: "Wed", value: 8 },
      { day: "Thu", value: 8 },
      { day: "Fri", value: 9 },
      { day: "Sat", value: 9 },
      { day: "Sun", value: 9 },
    ],
  },
  {
    id: "inv-time-saved",
    label: "Analyst Time Saved",
    value: "36h 40m",
    trendText: "This week",
    isTrendUp: true,
    trendPositive: true,
    icon: "clock",
    sparkline: [
      { day: "Mon", value: 4.8 },
      { day: "Tue", value: 5.5 },
      { day: "Wed", value: 6.2 },
      { day: "Thu", value: 5.8 },
      { day: "Fri", value: 7.1 },
      { day: "Sat", value: 4.2 },
      { day: "Sun", value: 5.4 },
    ],
  },
];

export function InvestigationAssistantWorkspace() {
  return (
    <div className="space-y-4">
      {/* KPI Row (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-stretch">
        {INVESTIGATION_KPIS.map((metric) => (
          <AiKpiCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Main Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Investigation Hypothesis Workspace (8 cols) */}
        <div className="lg:col-span-8 flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                  CASE-2025-0842
                </span>
                <span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 dark:border-red-900/50 dark:bg-red-950/60 dark:text-red-400">
                  Active Hypothesis
                </span>
              </div>
              <h2 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                Distributed Credential Stuffing & Password Spray Evaluation
              </h2>
            </div>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              DEMO DATA
            </span>
          </div>

          <div className="my-2 flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                AI Hypothesis Statement:
              </span>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Threat actor is utilizing leaked credential dumps to test single sign-on authentication endpoints. The attack pattern matches known BOTNET-MIRAI variants routing through residential proxy nodes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-800/60">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Correlated Telemetry:</span>
                <ul className="mt-2 space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                  <li>• 1,420 failed auth attempts across 8 distinct destination URIs</li>
                  <li>• High entropy User-Agent distribution (92% randomized)</li>
                  <li>• Source IP geolocation concentrated in AS200017 subnet</li>
                </ul>
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50/30 p-3 shadow-2xs dark:border-blue-900/40 dark:bg-blue-950/20">
                <span className="font-semibold text-blue-900 dark:text-blue-300">AI Suggested Next Pivot:</span>
                <p className="mt-2 text-[11px] leading-relaxed text-blue-950 dark:text-blue-300">
                  Execute query across VPN connection logs for any successful authentication from identical AS200017 IP pool in the preceding 72 hours.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
              Run automated playbook verification →
            </button>
          </div>
        </div>

        {/* Right side Assistant (4 cols) */}
        <div className="lg:col-span-4 h-full">
          <AiAssistantCard />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// RECOMMENDATIONS WORKSPACE
// ==========================================
const RECOMMENDATIONS_KPIS: AiKpiMetric[] = [
  {
    id: "rec-total",
    label: "Total Recommendations",
    value: "42",
    trendText: "8 generated this week",
    isTrendUp: true,
    trendPositive: true,
    icon: "sparkles",
    sparkline: [
      { day: "Mon", value: 34 },
      { day: "Tue", value: 36 },
      { day: "Wed", value: 38 },
      { day: "Thu", value: 40 },
      { day: "Fri", value: 42 },
      { day: "Sat", value: 42 },
      { day: "Sun", value: 42 },
    ],
  },
  {
    id: "rec-high-priority",
    label: "High Priority Remediation",
    value: "14",
    trendText: "Immediate attention",
    isTrendUp: false,
    trendPositive: true,
    icon: "shield",
    sparkline: [
      { day: "Mon", value: 18 },
      { day: "Tue", value: 17 },
      { day: "Wed", value: 16 },
      { day: "Thu", value: 15 },
      { day: "Fri", value: 14 },
      { day: "Sat", value: 14 },
      { day: "Sun", value: 14 },
    ],
  },
  {
    id: "rec-implemented",
    label: "Actions Implemented",
    value: "28",
    trendText: "67% adoption rate",
    isTrendUp: true,
    trendPositive: true,
    icon: "document",
    sparkline: [
      { day: "Mon", value: 20 },
      { day: "Tue", value: 22 },
      { day: "Wed", value: 24 },
      { day: "Thu", value: 25 },
      { day: "Fri", value: 27 },
      { day: "Sat", value: 28 },
      { day: "Sun", value: 28 },
    ],
  },
  {
    id: "rec-posture-gain",
    label: "Posture Score Gain",
    value: "+8.4%",
    trendText: "Post remediation",
    isTrendUp: true,
    trendPositive: true,
    icon: "zap",
    sparkline: [
      { day: "Mon", value: 2.1 },
      { day: "Tue", value: 3.5 },
      { day: "Wed", value: 4.8 },
      { day: "Thu", value: 6.2 },
      { day: "Fri", value: 7.5 },
      { day: "Sat", value: 8.0 },
      { day: "Sun", value: 8.4 },
    ],
  },
  {
    id: "rec-risk-reduction",
    label: "Attack Surface Reduced",
    value: "32%",
    trendText: "Over 30 days",
    isTrendUp: true,
    trendPositive: true,
    icon: "clock",
    sparkline: [
      { day: "Mon", value: 18 },
      { day: "Tue", value: 21 },
      { day: "Wed", value: 24 },
      { day: "Thu", value: 26 },
      { day: "Fri", value: 29 },
      { day: "Sat", value: 31 },
      { day: "Sun", value: 32 },
    ],
  },
];

export function RecommendationsWorkspace() {
  const getPriorityBadge = (priority: AiRecommendationItem["priority"]) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/40";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40";
      case "Low":
      default:
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/40";
    }
  };

  return (
    <div className="space-y-4">
      {/* KPI Row (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-stretch">
        {RECOMMENDATIONS_KPIS.map((metric) => (
          <AiKpiCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Main Grid: Recommended Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {AI_RECOMMENDED_NEXT_STEPS.map((rec) => (
          <div
            key={rec.id}
            className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {rec.title}
              </h3>
              <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${getPriorityBadge(rec.priority)}`}>
                {rec.priority} Priority
              </span>
            </div>
            <p className="my-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {rec.explanation}
            </p>
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400 dark:border-slate-800/80">
              <span>Category: {rec.category}</span>
              <button className="font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
                Generate Remediation Script →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
