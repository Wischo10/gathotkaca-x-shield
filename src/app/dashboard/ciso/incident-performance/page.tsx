"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Panel } from "@/components/ui/Panel";
import { CisoDetailHeader } from "@/components/ciso/CisoDetailHeader";
import {
  CISO_MOCK_INCIDENT_KPI,
  CISO_MOCK_INCIDENT_TREND_30D,
  CISO_MOCK_INCIDENT_SEVERITY_DIST,
  CISO_MOCK_INCIDENT_CATEGORIES,
  CISO_MOCK_RECENT_INCIDENTS,
  CISO_MOCK_INCIDENT_RECOMMENDATIONS,
  IncidentDetailItem,
} from "@/mock/ciso-dashboard.mock";

function getSeverityBadge(severity: IncidentDetailItem["severity"]) {
  switch (severity) {
    case "Critical":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800";
    case "High":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800";
    case "Medium":
      return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400 dark:border-yellow-800";
    case "Low":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700";
  }
}

function getStatusBadge(status: IncidentDetailItem["status"]) {
  switch (status) {
    case "Investigating":
      return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300";
    case "Contained":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300";
    case "Resolved":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300";
    case "Closed":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

export default function IncidentPerformanceDetailPage() {
  return (
    <>
      <CisoDetailHeader
        title="Incident Performance"
        subtitle="Security response lifecycle analytics, SOC resolution velocities, and containment metrics"
        badge="SOC Velocity"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Active Triage:
            </span>
            <span className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              24 Incidents
            </span>
          </div>
        }
      />

      <main className="flex-1 space-y-5 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        {/* ROW 1: 4 Main Incident KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CISO_MOCK_INCIDENT_KPI.map((kpi) => (
            <div
              key={kpi.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {kpi.label}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    kpi.isImprovement
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                      : "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                  }`}
                >
                  {kpi.changePct < 0 ? "↓" : "↑"} {Math.abs(kpi.changePct)}%
                </span>
              </div>
              <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                {kpi.value}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {kpi.fullName}
              </p>
            </div>
          ))}
        </div>

        {/* ROW 2: Incident Trend (30d) & Volume by Severity */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* 30-Day Incident Ingestion vs Resolution Trend */}
          <Panel
            title="Incident Trend & Resolution Velocity (Last 30 Days)"
            action={
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-slate-600 dark:text-slate-300">
                    New Incidents
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600 dark:text-slate-300">
                    Resolved
                  </span>
                </div>
              </div>
            }
            className="lg:col-span-7 flex flex-col justify-between"
          >
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CISO_MOCK_INCIDENT_TREND_30D}>
                  <defs>
                    <linearGradient id="incColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="resColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    stroke="#cbd5e1"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    stroke="#cbd5e1"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      color: "#f8fafc",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="incidents"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#incColor)"
                    name="New Incidents"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#resColor)"
                    name="Resolved"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {/* Incident Volume by Severity (Stacked Bar) */}
          <Panel
            title="Incident Volume by Severity (Weekly)"
            action={
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Monthly Breakdown
              </span>
            }
            className="lg:col-span-5 flex flex-col justify-between"
          >
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CISO_MOCK_INCIDENT_SEVERITY_DIST}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    stroke="#cbd5e1"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    stroke="#cbd5e1"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      color: "#f8fafc",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
                  <Bar dataKey="high" stackId="a" fill="#f97316" name="High" />
                  <Bar dataKey="medium" stackId="a" fill="#eab308" name="Medium" />
                  <Bar dataKey="low" stackId="a" fill="#22c55e" name="Low" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span> Critical
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500"></span> High
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500"></span> Medium
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span> Low
              </span>
            </div>
          </Panel>
        </div>

        {/* ROW 3: Top Incident Categories */}
        <Panel
          title="Top Incident Attack Vectors & Categories"
          action={
            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              Total 111 Categorized
            </span>
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 items-center">
            <div className="h-56 md:col-span-7">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={CISO_MOCK_INCIDENT_CATEGORIES}
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis
                    dataKey="category"
                    type="category"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    width={130}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      color: "#f8fafc",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Incidents" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="md:col-span-5 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
                <span>Vector</span>
                <span>Count / Proportion</span>
              </div>
              {CISO_MOCK_INCIDENT_CATEGORIES.map((cat) => (
                <div
                  key={cat.category}
                  className="flex items-center justify-between py-1 text-slate-700 dark:text-slate-300"
                >
                  <span className="font-medium">{cat.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {cat.count}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({Math.round((cat.count / 111) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* ROW 4: Recent Critical Incidents & Improvement Recommendations */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Recent Critical Incidents Table */}
          <Panel
            title="Recent Critical & High Priority Incidents"
            action={
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Latest 5 Activity Log
              </span>
            }
            className="lg:col-span-7 flex flex-col justify-between"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-400 dark:border-slate-800">
                    <th className="pb-2">Incident</th>
                    <th className="pb-2">Severity</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">MTTD / MTTR</th>
                    <th className="pb-2 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {CISO_MOCK_RECENT_INCIDENTS.map((inc) => (
                    <tr
                      key={inc.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                    >
                      <td className="py-2.5 pr-2">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {inc.title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {inc.id} • {inc.category} • {inc.owner}
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold ${getSeverityBadge(
                            inc.severity
                          )}`}
                        >
                          {inc.severity}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusBadge(
                            inc.status
                          )}`}
                        >
                          {inc.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                        {inc.mttd} / {inc.mttr}
                      </td>
                      <td className="py-2.5 text-right text-slate-500 whitespace-nowrap">
                        {inc.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Improvement Recommendations */}
          <Panel
            title="SOC Performance Optimization Actions"
            action={
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                Target: -35% MTTx
              </span>
            }
            className="lg:col-span-5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {CISO_MOCK_INCIDENT_RECOMMENDATIONS.map((rec, idx) => (
                <div
                  key={rec.id}
                  className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {idx + 1}
                      </span>
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                        {rec.title}
                      </h3>
                    </div>
                    <span className="whitespace-nowrap rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                      {rec.targetKpi}
                    </span>
                  </div>

                  <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {rec.description}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800/80">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {rec.impact}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        rec.status === "Completed"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : rec.status === "In Progress"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </main>
    </>
  );
}
