"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Panel } from "@/components/ui/Panel";
import { CisoDetailHeader } from "@/components/ciso/CisoDetailHeader";
import {
  CISO_MOCK_COMPLIANCE_DETAIL_KPIS,
  CISO_MOCK_FRAMEWORK_SCORES,
  CISO_MOCK_COMPLIANCE_FINDINGS_STATUS,
  CISO_MOCK_REGULATORY_TRACKING_TABLE,
  CISO_MOCK_AUDIT_TIMELINE,
  CISO_MOCK_COMPLIANCE_GAP_ANALYSIS,
  CISO_MOCK_COMPLIANCE_TREND_12M,
  CISO_MOCK_COMPLIANCE_EXECUTIVE_RECOMMENDATIONS,
  RegulatoryTrackingItem,
  AuditTimelineItem,
} from "@/mock/ciso-dashboard.mock";

function getStatusBadge(status: RegulatoryTrackingItem["status"]) {
  switch (status) {
    case "Compliant":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300";
    case "Partial":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300";
    case "Pending":
      return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

function getEvidenceBadge(status: RegulatoryTrackingItem["evidenceStatus"]) {
  switch (status) {
    case "Verified":
      return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800";
    case "Under Review":
      return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800";
    case "Missing Evidence":
      return "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800";
    default:
      return "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800";
  }
}

function getTimelineStatusIcon(status: AuditTimelineItem["status"]) {
  switch (status) {
    case "Completed":
      return {
        bg: "bg-emerald-500",
        border: "border-emerald-200 dark:border-emerald-800",
        text: "text-emerald-600 dark:text-emerald-400",
        badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
      };
    case "In Progress":
      return {
        bg: "bg-blue-500",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-600 dark:text-blue-400",
        badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
      };
    case "Scheduled":
    case "Upcoming":
      return {
        bg: "bg-slate-400 dark:bg-slate-600",
        border: "border-slate-200 dark:border-slate-700",
        text: "text-slate-600 dark:text-slate-400",
        badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      };
  }
}

export default function ComplianceDetailPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredRegulations = CISO_MOCK_REGULATORY_TRACKING_TABLE.filter((item) => {
    const matchesSearch =
      item.framework.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.standardScope.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalFindings = CISO_MOCK_COMPLIANCE_FINDINGS_STATUS.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <>
      <CisoDetailHeader
        title="Compliance Dashboard"
        subtitle="Multi-standard regulatory tracking, evidence repository management, and continuous audit lifecycle"
        badge="Regulatory Compliance"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Audit Readiness:
            </span>
            <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              82% Compliant
            </span>
          </div>
        }
      />

      <main className="flex-1 space-y-5 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        {/* SECTION 1 – KPI Cards (4 Cards with Sparklines) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {CISO_MOCK_COMPLIANCE_DETAIL_KPIS.map((kpi) => (
            <div
              key={kpi.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-lg">{kpi.icon}</span>
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      kpi.isPositiveGood
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                    }`}
                  >
                    {kpi.changePct > 0 ? `+${kpi.changePct}%` : `${kpi.changePct}%`}
                  </span>
                </div>
                <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                  {kpi.value}
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {kpi.title}
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  {kpi.trendText}
                </p>
              </div>

              {/* Sparkline */}
              <div className="mt-3 h-8 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={kpi.sparklineData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={kpi.sparklineColor}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>

        {/* SECTION 2 & SECTION 3: Framework Overview (Bar/Progress) + Findings Status (Donut) */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Section 2: Framework Compliance Overview */}
          <Panel
            title="Framework Compliance Posture"
            action={
              <span className="text-xs text-slate-500 dark:text-slate-400">
                5 Assessed Frameworks
              </span>
            }
            className="lg:col-span-7 flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              {CISO_MOCK_FRAMEWORK_SCORES.map((fw) => (
                <div
                  key={fw.id}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1.5">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{fw.framework}</span>
                        <span className="font-normal text-[11px] text-slate-400">({fw.standard})</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {fw.compliantControls}/{fw.totalControls} Controls Compliant ({fw.partialControls} Partial, {fw.nonCompliantControls} Non-Compliant)
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {fw.score}%
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Target: {fw.targetScore}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${fw.score}%`,
                        backgroundColor: fw.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Section 3: Findings Status Donut Chart */}
          <Panel
            title="Control Findings Status Breakdown"
            action={
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Total: {totalFindings} Evaluated Controls
              </span>
            }
            className="lg:col-span-5 flex flex-col justify-between"
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4">
              <div className="h-56 sm:col-span-6 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={CISO_MOCK_COMPLIANCE_FINDINGS_STATUS}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {CISO_MOCK_COMPLIANCE_FINDINGS_STATUS.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as (typeof CISO_MOCK_COMPLIANCE_FINDINGS_STATUS)[0];
                          return (
                            <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800 text-xs">
                              <p className="font-semibold text-slate-900 dark:text-white">{data.name}</p>
                              <p className="text-slate-600 dark:text-slate-300">
                                {data.count} controls ({data.percentage})
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend & Breakdown */}
              <div className="sm:col-span-6 space-y-2">
                {CISO_MOCK_COMPLIANCE_FINDINGS_STATUS.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-xs rounded-lg p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{item.count}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        ({item.percentage})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>

        {/* SECTION 4: Regulatory Tracking Table (with Evidence Management) */}
        <Panel
          title="Regulatory Tracking & Evidence Repository"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search framework, owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-brand-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="All">All Statuses</option>
                <option value="Compliant">Compliant</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Framework & Standard Scope</th>
                  <th className="py-2.5 px-3">Owner / Custodian</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Evidence Artifacts</th>
                  <th className="py-2.5 px-3">Audit Frequency</th>
                  <th className="py-2.5 px-3">Last Review</th>
                  <th className="py-2.5 px-3">Next Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRegulations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      No regulatory records match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRegulations.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3 px-3 max-w-[260px]">
                        <div className="font-mono text-[10px] text-slate-400">{item.id}</div>
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {item.framework}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {item.standardScope}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                        {item.owner}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${getEvidenceBadge(
                            item.evidenceStatus
                          )}`}
                        >
                          <span>📁 {item.evidenceCount} docs</span>
                          <span>•</span>
                          <span>{item.evidenceStatus}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        {item.auditFrequency}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {item.lastReview}
                      </td>
                      <td className="py-3 px-3 font-semibold text-brand-blue whitespace-nowrap">
                        {item.nextReview}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* SECTION 5 & SECTION 6: Audit & Assessment (Vertical Timeline) + Risk & Gap Analysis (Horizontal Bar) */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Section 5: Audit & Assessment Vertical Timeline */}
          <Panel
            title="Audit & Assessment Lifecycle Timeline"
            action={
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Continuous Governance Roadmap
              </span>
            }
            className="lg:col-span-6 flex flex-col justify-between"
          >
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {CISO_MOCK_AUDIT_TIMELINE.map((item) => {
                const style = getTimelineStatusIcon(item.status);
                return (
                  <div key={item.id} className="relative group">
                    {/* Timeline Node */}
                    <div
                      className={`absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 ${style.bg}`}
                    />

                    <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-mono font-bold text-slate-400">
                          {item.date} • {item.id}
                        </span>
                        <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${style.badge}`}>
                          {item.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Scope: {item.scope}
                      </p>

                      <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                          Auditor: {item.leadAuditor}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {item.resultSummary}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Section 6: Risk & Gap Analysis (Horizontal Bar Chart) */}
          <Panel
            title="Compliance Gap Analysis by Control Domain"
            action={
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Gaps Needing Technical Closure
              </span>
            }
            className="lg:col-span-6 flex flex-col justify-between"
          >
            <div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={CISO_MOCK_COMPLIANCE_GAP_ANALYSIS}
                    margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.3} horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis
                      dataKey="domain"
                      type="category"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as (typeof CISO_MOCK_COMPLIANCE_GAP_ANALYSIS)[0];
                          return (
                            <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-700 dark:bg-slate-800 text-xs">
                              <p className="font-semibold text-slate-900 dark:text-white">{data.domain}</p>
                              <p className="text-rose-500 font-bold mt-1">{data.gapScore}% Gap Identified</p>
                              <p className="text-slate-500 text-[10px] mt-0.5">Status: {data.mitigationStatus}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="gapScore" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gap Domain Breakdown Cards */}
              <div className="mt-3 grid grid-cols-1 gap-2">
                {CISO_MOCK_COMPLIANCE_GAP_ANALYSIS.slice(0, 3).map((gap) => (
                  <div
                    key={gap.domain}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{gap.domain}</span>
                      <span className="block text-[10px] text-slate-400">{gap.mitigationStatus}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-rose-500">{gap.identifiedGaps} Gaps</span>
                      <span className="block text-[10px] font-semibold text-slate-400">Priority: {gap.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>

        {/* 12-Month Compliance Trend Line Chart */}
        <Panel
          title="12-Month Regulatory Compliance & Finding Closure Trend"
          action={
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Compliance Score (%)
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-slate-400" /> Target Baseline (85%)
              </span>
              <span className="flex items-center gap-1 text-brand-blue">
                <span className="h-2 w-2 rounded-full bg-brand-blue" /> Closed Findings
              </span>
            </div>
          }
        >
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CISO_MOCK_COMPLIANCE_TREND_12M} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.3} vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-700 dark:bg-slate-800 text-xs">
                          <p className="font-semibold text-slate-900 dark:text-white mb-1">{label}</p>
                          <p className="text-emerald-500 font-medium">
                            Compliance Score: {payload[0]?.value}%
                          </p>
                          <p className="text-slate-400 font-medium">
                            Target: {payload[1]?.value}%
                          </p>
                          <p className="text-brand-blue font-medium">
                            Closed Findings: {payload[2]?.value} items
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="complianceScore"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#10b981" }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="targetScore"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="closedFindings"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* SECTION 7: Executive Recommendations */}
        <Panel
          title="Compliance Executive Recommendations"
          action={
            <span className="text-xs text-slate-500 dark:text-slate-400">
              CISO Strategic Governance Plan
            </span>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CISO_MOCK_COMPLIANCE_EXECUTIVE_RECOMMENDATIONS.map((rec) => (
              <div
                key={rec.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        rec.priority === "Critical"
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                          : rec.priority === "High"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {rec.targetFramework}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    <span className="text-brand-blue font-bold">Action Plan: </span>
                    {rec.action}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </main>
    </>
  );
}
