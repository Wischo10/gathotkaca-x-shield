"use client";

import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  INCIDENT_SUMMARIZATION_KPIS,
  RECENT_SUMMARIZED_INCIDENTS,
  INCIDENT_CATEGORIES_SUMMARY,
  TOTAL_INCIDENTS_THIS_WEEK,
  RECENT_ANALYST_REVIEWS,
  type SummarizedIncidentItem,
} from "@/services/ai-copilot-demo-provider";
import { AiKpiCard } from "./AiKpiCard";

export function IncidentSummarizationWorkspace() {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    RECENT_SUMMARIZED_INCIDENTS[0].id
  );
  const [copied, setCopied] = useState<boolean>(false);

  const selectedIncident =
    RECENT_SUMMARIZED_INCIDENTS.find((inc) => inc.id === selectedIncidentId) ||
    RECENT_SUMMARIZED_INCIDENTS[0];

  const handleCopySummary = () => {
    const textToCopy = `[${selectedIncident.id}] ${selectedIncident.title}\nSeverity: ${selectedIncident.severity}\nTime: ${selectedIncident.summaryTimestamp}\nAI Confidence: ${selectedIncident.confidenceScore}%\n\nSummary:\n${selectedIncident.summary}\n\nKey Takeaways:\n${selectedIncident.keyTakeaways.map((t) => "- " + t).join("\n")}\n\nRecommended Actions:\n${selectedIncident.recommendedActions.map((a) => "- " + a).join("\n")}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSeverityBadge = (severity: SummarizedIncidentItem["severity"]) => {
    switch (severity) {
      case "Critical":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/50";
      case "High":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-900/50";
      case "Medium":
        return "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400 dark:border-yellow-900/50";
      case "Low":
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/50";
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. KPI ROW (5 Cards in 1 Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-stretch">
        {INCIDENT_SUMMARIZATION_KPIS.map((metric) => (
          <AiKpiCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* 2. MAIN ROW: 3 Cards (Left: Recent Incidents, Center: AI Summary, Right: Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* LEFT: Recent Incidents Summarized (col-span-3 or 4) */}
        <div className="lg:col-span-3 flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Recent Incidents Summarized
              </h2>
              <p className="text-[11px] text-slate-400">
                Select an incident to view brief
              </p>
            </div>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              DEMO DATA
            </span>
          </div>

          <div className="my-2 flex flex-1 flex-col gap-2 overflow-y-auto pr-0.5">
            {RECENT_SUMMARIZED_INCIDENTS.map((item) => {
              const isSelected = item.id === selectedIncidentId;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedIncidentId(item.id)}
                  className={`flex flex-col text-left rounded-lg p-2.5 transition-all border ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/60 shadow-xs dark:border-blue-500/80 dark:bg-blue-950/40"
                      : "border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[10px] text-slate-400 font-semibold">
                      {item.id}
                    </span>
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold ${getSeverityBadge(
                        item.severity
                      )}`}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <h4 className="mt-1 line-clamp-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {item.title}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    {item.summary}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                    <span className="truncate max-w-[120px]">{item.source}</span>
                    <span>{item.time}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
              View all summarized incidents →
            </button>
          </div>
        </div>

        {/* CENTER: Incident Summary (AI Generated) (col-span-5 or 6) */}
        <div className="lg:col-span-6 flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {selectedIncident.id}
                </span>
                <span
                  className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${getSeverityBadge(
                    selectedIncident.severity
                  )}`}
                >
                  {selectedIncident.severity} Severity
                </span>
                <span className="text-[11px] text-slate-400">
                  {selectedIncident.summaryTimestamp}
                </span>
              </div>
              <h2 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                {selectedIncident.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                DEMO DATA
              </span>
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                title="Copy AI summary to clipboard"
              >
                <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{copied ? "Copied!" : "Copy Summary"}</span>
              </button>
            </div>
          </div>

          {/* AI Summary Content Body */}
          <div className="my-2 flex flex-1 flex-col gap-3.5 overflow-y-auto pr-1">
            {/* AI Summary Text */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span className="text-purple-500">✨</span>
                <span>AI Executive Brief</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {selectedIncident.summary}
              </p>
            </div>

            {/* Key Metrics Grid */}
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Key Metrics
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2 text-center dark:border-slate-800 dark:bg-slate-950/40">
                  <span className="text-[10px] text-slate-400">Failed Attempts</span>
                  <div className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-100">
                    {selectedIncident.keyMetrics.failedAttempts.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2 text-center dark:border-slate-800 dark:bg-slate-950/40">
                  <span className="text-[10px] text-slate-400">Attack Duration</span>
                  <div className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-100">
                    {selectedIncident.keyMetrics.attackDuration}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2 text-center dark:border-slate-800 dark:bg-slate-950/40">
                  <span className="text-[10px] text-slate-400">Source IP</span>
                  <div className="mt-0.5 truncate text-xs font-bold text-slate-800 dark:text-slate-100" title={selectedIncident.keyMetrics.sourceIP}>
                    {selectedIncident.keyMetrics.sourceIP}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2 text-center dark:border-slate-800 dark:bg-slate-950/40">
                  <span className="text-[10px] text-slate-400">Successful Login</span>
                  <div className={`mt-0.5 text-xs font-bold ${selectedIncident.keyMetrics.successfulLogin ? "text-red-500" : "text-emerald-500"}`}>
                    {selectedIncident.keyMetrics.successfulLogin ? "Yes (Breach)" : "None (Blocked)"}
                  </div>
                </div>
              </div>
            </div>

            {/* Key Takeaways */}
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Key Takeaways
              </div>
              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                {selectedIncident.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-blue-500 font-bold">•</span>
                    <span className="leading-relaxed">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Confidence Score & Recommended Actions */}
            <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3 dark:border-blue-900/30 dark:bg-blue-950/20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                  AI Recommended Actions
                </span>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  Confidence: {selectedIncident.confidenceScore}%
                </span>
              </div>
              <ul className="space-y-1 text-xs text-blue-900/90 dark:text-blue-300">
                {selectedIncident.recommendedActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="font-bold text-blue-500">→</span>
                    <span className="leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <span className="text-[10px] text-slate-400">
              Generated by Security Copilot • Verified against Wazuh and EDR alerts
            </span>
          </div>
        </div>

        {/* RIGHT: Incident Timeline (AI Extracted) (col-span-3) */}
        <div className="lg:col-span-3 flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Incident Timeline (AI Extracted)
              </h2>
              <p className="text-[11px] text-slate-400">
                Chronological attack progression
              </p>
            </div>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              DEMO DATA
            </span>
          </div>

          <div className="my-2 flex flex-1 flex-col overflow-y-auto pl-2 pr-1">
            <div className="relative border-l-2 border-blue-400/80 pl-4 space-y-4 py-2">
              {selectedIncident.timeline.map((event) => (
                <div key={event.id} className="relative group">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white ${
                      event.isStart
                        ? "bg-emerald-500"
                        : event.isEnd
                        ? "bg-red-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                      <span>{event.time}</span>
                      {event.isStart && (
                        <span className="rounded bg-emerald-50 px-1 text-[9px] font-bold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                          START
                        </span>
                      )}
                      {event.isEnd && (
                        <span className="rounded bg-red-50 px-1 text-[9px] font-bold text-red-600 dark:bg-red-950/60 dark:text-red-400">
                          CONTAINED
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                      {event.description}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      Source: {event.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <span className="text-[10px] text-slate-400">
              {selectedIncident.timeline.length} correlated events identified
            </span>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM ROW: 3 Equal-Height Cards (Incident Categories, Summarization Performance, Recent Analyst Reviews) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Card 1: Incident Categories (This Week) */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Incident Categories (This Week)
              </h2>
              <p className="text-[11px] text-slate-400">
                Classification distribution of summarized cases
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
                    data={INCIDENT_CATEGORIES_SUMMARY}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={65}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {INCIDENT_CATEGORIES_SUMMARY.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as typeof INCIDENT_CATEGORIES_SUMMARY[0];
                        return (
                          <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-md dark:border-slate-700 dark:bg-slate-800">
                            <div className="text-xs font-semibold" style={{ color: item.color }}>
                              {item.name}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-300">
                              {item.count} incidents ({item.percentage}%)
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
                <span className="text-xl font-bold leading-none text-slate-800 dark:text-white">
                  {TOTAL_INCIDENTS_THIS_WEEK}
                </span>
                <span className="mt-1 text-[9px] uppercase font-medium tracking-wide text-slate-400">
                  Total Cases
                </span>
              </div>
            </div>

            <div className="flex w-full flex-col justify-center gap-2 px-2 sm:w-auto sm:px-0">
              {INCIDENT_CATEGORIES_SUMMARY.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {item.count} <span className="text-[10px] font-normal text-slate-400">({item.percentage}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
              View category report →
            </button>
          </div>
        </div>

        {/* Card 2: Summarization Performance */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Summarization Performance
              </h2>
              <p className="text-[11px] text-slate-400">
                Model throughput, latency & quality benchmarks
              </p>
            </div>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              DEMO DATA
            </span>
          </div>

          <div className="my-auto flex flex-1 flex-col justify-center gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <span className="text-[11px] text-slate-400 font-medium">Inference Latency</span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-slate-900 dark:text-white">1.42s</span>
                  <span className="text-[10px] font-medium text-emerald-600">↓ 0.3s</span>
                </div>
                <div className="mt-1 text-[10px] text-slate-400">p95 response time</div>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <span className="text-[11px] text-slate-400 font-medium">Factuality Score</span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-slate-900 dark:text-white">99.1%</span>
                  <span className="text-[10px] font-medium text-emerald-600">↑ 0.4%</span>
                </div>
                <div className="mt-1 text-[10px] text-slate-400">Zero hallucination rate</div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-400">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                <span>Model Version: Security-LLM-v2.4</span>
                <span className="text-emerald-600 font-mono">STATUS: OPTIMAL</span>
              </div>
              <p className="mt-1 leading-relaxed text-[11px]">
                Summarization pipeline operates on structured Wazuh rule alerts and parsed syslog events with zero data retention on external endpoints.
              </p>
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
              View model telemetry →
            </button>
          </div>
        </div>

        {/* Card 3: Recent Analyst Reviews */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Recent Analyst Reviews
              </h2>
              <p className="text-[11px] text-slate-400">
                Human-in-the-loop verification log
              </p>
            </div>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              DEMO DATA
            </span>
          </div>

          <div className="my-auto flex flex-1 flex-col overflow-x-auto py-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400 dark:border-slate-800">
                  <th className="pb-2 font-medium">Incident</th>
                  <th className="pb-2 font-medium">Confidence</th>
                  <th className="pb-2 font-medium">Analyst</th>
                  <th className="pb-2 font-medium">Feedback</th>
                  <th className="pb-2 text-right font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                {RECENT_ANALYST_REVIEWS.map((rev) => (
                  <tr key={rev.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 font-mono text-[11px] font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {rev.incidentId}
                    </td>
                    <td className="py-2.5 whitespace-nowrap">
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                        {rev.confidence}%
                      </span>
                    </td>
                    <td className="py-2.5 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium">
                      {rev.analyst}
                    </td>
                    <td className="py-2.5 whitespace-nowrap">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                          rev.feedback === "Approved" || rev.feedback === "Accurate"
                            ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300"
                            : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300"
                        }`}
                      >
                        {rev.feedback}
                      </span>
                    </td>
                    <td className="py-2.5 text-right whitespace-nowrap text-[11px] text-slate-400">
                      {rev.reviewedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
              View all reviews ({RECENT_ANALYST_REVIEWS.length}) →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
