"use client";

import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { AiKpiCard } from "./AiKpiCard";
import {
  INVESTIGATION_ASSISTANT_KPIS,
  ACTIVE_INVESTIGATIONS_LIST,
  INVESTIGATION_STATUS_OVERVIEW,
  TOTAL_INVESTIGATIONS_COUNT,
  INVESTIGATION_TIMELINE_EVENTS,
  MITRE_ATTACK_TACTICS_ACTIVE,
  TOP_INVESTIGATION_TAGS,
  RECENTLY_RESOLVED_INVESTIGATIONS,
  type ActiveInvestigationItem,
} from "@/services/ai-copilot-demo-provider";
import { useApiResult } from "@/hooks/useApiResult";
import type { SocIncidentRecord } from "@/types/soc";

export function InvestigationAssistantWorkspace() {
  // Query real persisted incidents if available in the database
  const realIncidentsResult = useApiResult<SocIncidentRecord[]>(
    "/api/soc/incident-details?limit=10"
  );
  const hasRealIncidents =
    realIncidentsResult.phase === "ready" &&
    Array.isArray(realIncidentsResult.data) &&
    realIncidentsResult.data.length > 0;

  // Selected investigation state for the interactive Investigation Assistant card
  const [selectedInvestigationId, setSelectedInvestigationId] = useState<string>(
    ACTIVE_INVESTIGATIONS_LIST[0].id
  );
  const [copied, setCopied] = useState<boolean>(false);

  const selectedInvestigation =
    ACTIVE_INVESTIGATIONS_LIST.find((inv) => inv.id === selectedInvestigationId) ||
    ACTIVE_INVESTIGATIONS_LIST[0];

  const handleCopyInsights = () => {
    const textToCopy = `[${selectedInvestigation.id} / ${selectedInvestigation.incidentId}] ${selectedInvestigation.title}
Priority: ${selectedInvestigation.priority} | Status: ${selectedInvestigation.status}
Assigned: ${selectedInvestigation.assignedTo} | Age: ${selectedInvestigation.age}

SUMMARY:
${selectedInvestigation.summary}

KEY ENTITIES:
- Source IP: ${selectedInvestigation.keyEntities.sourceIp}
- Target Account: ${selectedInvestigation.keyEntities.targetAccount}
- Target System: ${selectedInvestigation.keyEntities.targetSystem}
- First Seen: ${selectedInvestigation.keyEntities.firstSeen}
- Last Seen: ${selectedInvestigation.keyEntities.lastSeen}

AI SUGGESTED NEXT STEPS (RECOMMENDATIONS ONLY):
${selectedInvestigation.suggestedNextSteps.map((step) => "- " + step).join("\n")}`;

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPriorityBadge = (priority: ActiveInvestigationItem["priority"] | string) => {
    switch (priority) {
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

  const getStatusBadge = (status: ActiveInvestigationItem["status"] | string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900/50";
      case "Escalated":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-900/50";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/50";
      case "Resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/50";
      case "Open":
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  const maxTacticCount = Math.max(
    ...MITRE_ATTACK_TACTICS_ACTIVE.map((t) => t.count),
    1
  );

  return (
    <div className="space-y-4">
      {/* =========================================================================
          SECTION 1: 5 EQUAL KPI CARDS
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-stretch">
        {INVESTIGATION_ASSISTANT_KPIS.map((metric) => (
          <AiKpiCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* =========================================================================
          SECTION 2: MAIN INVESTIGATION ROW (3 Equal-Height Cards)
          LEFT: Active Investigations (Compact table / list)
          CENTER: Investigation Progress Overview (Donut chart)
          RIGHT: Investigation Assistant (AI Generated Insights)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* 2A. LEFT: Active Investigations */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Active Investigations
              </h2>
              <p className="text-[11px] text-slate-400">
                Ongoing threat inquiries & correlated events
              </p>
            </div>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {hasRealIncidents ? "CORRELATED" : "DEMO DATA"}
            </span>
          </div>

          <div className="my-2 flex flex-1 flex-col overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400 dark:border-slate-800">
                  <th className="pb-2 font-medium">Incident ID</th>
                  <th className="pb-2 font-medium">Title</th>
                  <th className="pb-2 font-medium">Priority</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Assigned To</th>
                  <th className="pb-2 text-right font-medium">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                {ACTIVE_INVESTIGATIONS_LIST.map((inv) => {
                  const isSelected = inv.id === selectedInvestigationId;
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvestigationId(inv.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50/70 dark:bg-blue-950/40"
                          : "hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <td className="py-2.5 font-mono text-[11px] font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {inv.incidentId}
                      </td>
                      <td className="py-2.5 pr-2 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[140px] text-[11px]">
                        {inv.title}
                      </td>
                      <td className="py-2.5 whitespace-nowrap">
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold ${getPriorityBadge(
                            inv.priority
                          )}`}
                        >
                          {inv.priority}
                        </span>
                      </td>
                      <td className="py-2.5 whitespace-nowrap">
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold ${getStatusBadge(
                            inv.status
                          )}`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-500 whitespace-nowrap text-[11px] truncate max-w-[110px]">
                        {inv.assignedTo}
                      </td>
                      <td className="py-2.5 text-right font-mono text-[10px] text-slate-400 whitespace-nowrap">
                        {inv.age}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
              View all active investigations →
            </button>
          </div>
        </div>

        {/* 2B. CENTER: Investigation Progress Overview */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Investigation Progress Overview
              </h2>
              <p className="text-[11px] text-slate-400">
                Status breakdown across all lifecycle stages
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                DEMO DATA
              </span>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
                View All →
              </button>
            </div>
          </div>

          {/* Donut chart with centered total count */}
          <div className="my-auto flex flex-1 flex-col items-center justify-center py-2 sm:flex-row sm:justify-around sm:gap-4">
            <div className="relative h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={INVESTIGATION_STATUS_OVERVIEW}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {INVESTIGATION_STATUS_OVERVIEW.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                      color: "#f8fafc",
                    }}
                    formatter={(val: number, name: string) => [
                      `${val} (${Math.round((val / TOTAL_INVESTIGATIONS_COUNT) * 100)}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-medium text-slate-400">Total</span>
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {TOTAL_INVESTIGATIONS_COUNT}
                </span>
                <span className="text-[10px] text-slate-500">Investigations</span>
              </div>
            </div>

            {/* Legend breakdown list */}
            <div className="mt-3 flex w-full flex-col gap-1.5 sm:mt-0 sm:w-auto text-xs">
              {INVESTIGATION_STATUS_OVERVIEW.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100 text-[11px]">
                    <span>{item.count}</span>
                    <span className="font-normal text-slate-400">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-[11px] text-slate-400 dark:border-slate-800/80 flex items-center justify-between">
            <span>76% on-track or completed</span>
            <span className="font-medium text-slate-600 dark:text-slate-300">
              Avg pace: 38m/case
            </span>
          </div>
        </div>

        {/* 2C. RIGHT: Investigation Assistant (AI Generated Insights) */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-blue-200/80 bg-white p-4 shadow-sm dark:border-blue-900/50 dark:bg-slate-900">
          {/* Header */}
          <div className="flex items-start justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-blue-600 dark:text-blue-400 text-sm">✨</span>
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Investigation Assistant (AI Generated Insights)
                </h2>
              </div>
              <p className="text-[11px] text-slate-400">
                Automated triage hypotheses & suggested investigation pivots
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                {selectedInvestigation.incidentId}
              </span>
              <span className="rounded bg-amber-50 px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
                DEMO AI INSIGHTS
              </span>
            </div>
          </div>

          {/* Assistant Body */}
          <div className="my-2 flex flex-1 flex-col gap-3 overflow-y-auto pr-0.5">
            {/* SUMMARY Section */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Summary
                </span>
                <button
                  onClick={handleCopyInsights}
                  className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  {copied ? "Copied! ✓" : "Copy Insights"}
                </button>
              </div>
              <div className="mt-1 rounded-lg border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-950/50">
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {selectedInvestigation.summary}
                </p>
              </div>
            </div>

            {/* KEY ENTITIES Section */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Key Entities
              </span>
              <div className="mt-1 grid grid-cols-2 gap-1.5 rounded-lg border border-slate-100 bg-white p-2 text-[11px] dark:border-slate-800 dark:bg-slate-800/40">
                <div>
                  <span className="text-slate-400">Source IP:</span>{" "}
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {selectedInvestigation.keyEntities.sourceIp}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Target Account:</span>{" "}
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {selectedInvestigation.keyEntities.targetAccount}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Target System:</span>{" "}
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {selectedInvestigation.keyEntities.targetSystem}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Seen:</span>{" "}
                  <span className="text-slate-600 dark:text-slate-400">
                    {selectedInvestigation.keyEntities.lastSeen}
                  </span>
                </div>
              </div>
            </div>

            {/* AI SUGGESTED NEXT STEPS Section */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  AI Suggested Next Steps
                </span>
                <span className="text-[10px] text-slate-400 italic">
                  Recommendations only
                </span>
              </div>
              <ul className="mt-1.5 space-y-1.5 text-xs">
                {selectedInvestigation.suggestedNextSteps.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50/40 p-2 text-slate-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-slate-300"
                  >
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {idx + 1}
                    </span>
                    <span className="leading-tight text-[11px]">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer action */}
          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
              Open in Investigation Assistant →
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: SECOND ROW (3 Equal-Height Cards)
          LEFT: Investigation Timeline (All Active)
          CENTER: MITRE ATT&CK Tactics (Active Investigations)
          RIGHT: Top Investigation Tags
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* 3A. LEFT: Investigation Timeline (All Active) */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Investigation Timeline (All Active)
              </h2>
              <p className="text-[11px] text-slate-400">
                Chronological sequence of forensic milestones
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                DEMO DATA
              </span>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
                View All →
              </button>
            </div>
          </div>

          {/* Vertical timeline */}
          <div className="my-auto flex flex-1 flex-col justify-center py-2">
            <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {INVESTIGATION_TIMELINE_EVENTS.map((evt) => (
                <div key={evt.id} className="relative group">
                  {/* Timeline bullet */}
                  <span
                    className={`absolute -left-6 top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-slate-900 ${
                      evt.severity === "Critical"
                        ? "bg-red-500"
                        : evt.severity === "High"
                        ? "bg-orange-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono font-medium text-slate-500 dark:text-slate-400">
                      {evt.timestamp} • {evt.date}
                    </span>
                    <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {evt.incidentId}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-slate-800 dark:text-slate-200">
                    {evt.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <span className="text-[11px] text-slate-400">
              Synced with telemetry streaming pipeline
            </span>
          </div>
        </div>

        {/* 3B. CENTER: MITRE ATT&CK Tactics (Active Investigations) */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                MITRE ATT&CK Tactics (Active Investigations)
              </h2>
              <p className="text-[11px] text-slate-400">
                Observed adversary behavior across active cases
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                DEMO DATA
              </span>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
                View All →
              </button>
            </div>
          </div>

          {/* Horizontal bar chart visualization */}
          <div className="my-auto flex flex-1 flex-col justify-center space-y-2 py-2 overflow-y-auto">
            {MITRE_ATTACK_TACTICS_ACTIVE.map((item, idx) => {
              const widthPercent = Math.max((item.count / maxTacticCount) * 100, 8);
              const barBg =
                idx === 0
                  ? "bg-red-500 dark:bg-red-500"
                  : idx === 1
                  ? "bg-orange-500 dark:bg-orange-500"
                  : idx === 2
                  ? "bg-amber-500 dark:bg-amber-500"
                  : "bg-blue-500/80 dark:bg-blue-500/80";

              return (
                <div key={item.tactic} className="group flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate pr-2 font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                      {item.tactic}
                    </span>
                    <span className="shrink-0 font-semibold text-slate-900 dark:text-slate-100 text-[11px]">
                      {item.count}
                      <span className="ml-1 text-[10px] font-normal text-slate-400">
                        ({item.percentage}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barBg}`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <span className="text-[11px] text-slate-400">
              Mapped against MITRE ATT&CK v14.1 Enterprise Matrix
            </span>
          </div>
        </div>

        {/* 3C. RIGHT: Top Investigation Tags (Word-cloud / Tag visualization) */}
        <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Top Investigation Tags
              </h2>
              <p className="text-[11px] text-slate-400">
                Weighted frequency cloud across active dossiers
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                DEMO DATA
              </span>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
                View All →
              </button>
            </div>
          </div>

          {/* Word cloud / Weighted Tag Visualization */}
          <div className="my-auto flex flex-1 flex-wrap items-center justify-center content-center gap-2.5 p-3">
            {TOP_INVESTIGATION_TAGS.map((tag) => {
              const sizeClass =
                tag.weight === "xl"
                  ? "text-base px-3 py-1 bg-red-50/70 border-red-200 dark:bg-red-950/40 dark:border-red-900/40 shadow-xs"
                  : tag.weight === "lg"
                  ? "text-sm px-2.5 py-1 bg-blue-50/70 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900/40"
                  : tag.weight === "md"
                  ? "text-xs px-2 py-0.5 bg-slate-50 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700"
                  : "text-[11px] px-1.5 py-0.5 bg-slate-50/50 border-slate-100 dark:bg-slate-900 dark:border-slate-800";

              return (
                <span
                  key={tag.tag}
                  className={`inline-flex items-center gap-1.5 rounded-lg border transition-all hover:scale-105 cursor-pointer ${sizeClass} ${tag.colorClass}`}
                >
                  <span>{tag.tag}</span>
                  <span className="text-[10px] font-mono opacity-70">
                    ({tag.count})
                  </span>
                </span>
              );
            })}
          </div>

          <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
            <span className="text-[11px] text-slate-400">
              Aggregated across 42 active case hypotheses
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: BOTTOM ROW (Full-Width Card)
          Recently Resolved Investigations
          ========================================================================= */}
      <div className="flex min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Recently Resolved Investigations
            </h2>
            <p className="text-[11px] text-slate-400">
              Closed cases with root cause summaries and verified remediation times
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              DEMO DATA
            </span>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400">
              View All →
            </button>
          </div>
        </div>

        <div className="my-2 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400 dark:border-slate-800">
                <th className="pb-2 font-medium">Incident ID</th>
                <th className="pb-2 font-medium">Title</th>
                <th className="pb-2 font-medium">Priority</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Resolved By</th>
                <th className="pb-2 font-medium">Resolved At</th>
                <th className="pb-2 font-medium">Resolution Time</th>
                <th className="pb-2 font-medium">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
              {RECENTLY_RESOLVED_INVESTIGATIONS.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-2.5 font-mono text-[11px] font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    {row.incidentId}
                  </td>
                  <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap text-[11px]">
                    {row.title}
                  </td>
                  <td className="py-2.5 whitespace-nowrap">
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold ${getPriorityBadge(
                        row.priority
                      )}`}
                    >
                      {row.priority}
                    </span>
                  </td>
                  <td className="py-2.5 whitespace-nowrap">
                    <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-400">
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-500 whitespace-nowrap text-[11px]">
                    {row.resolvedBy}
                  </td>
                  <td className="py-2.5 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                    {row.resolvedAt}
                  </td>
                  <td className="py-2.5 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {row.resolutionTime}
                  </td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-400 text-[11px] truncate max-w-xs">
                    {row.summary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
