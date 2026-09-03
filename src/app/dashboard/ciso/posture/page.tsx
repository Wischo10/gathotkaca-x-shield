"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
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
  CISO_MOCK_POSTURE_DOMAINS,
  CISO_MOCK_POSTURE_TREND_30D,
  CISO_MOCK_POSTURE_FINDINGS,
  CISO_MOCK_POSTURE_ACTIONS,
  SecurityPostureFinding,
} from "@/mock/ciso-dashboard.mock";

function getSeverityBadge(severity: SecurityPostureFinding["severity"]) {
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

function getStatusBadge(status: SecurityPostureFinding["status"]) {
  switch (status) {
    case "Open":
      return "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300";
    case "In Review":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300";
    case "Remediated":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

export default function SecurityPostureDetailPage() {
  const overallScore = Math.round(
    CISO_MOCK_POSTURE_DOMAINS.reduce((acc, curr) => acc + curr.score, 0) /
      CISO_MOCK_POSTURE_DOMAINS.length
  );

  return (
    <>
      <CisoDetailHeader
        title="Security Posture"
        subtitle="Comprehensive NIST CSF 2.0 evaluation, domain scoring breakdown, and remediation roadmap"
        badge="NIST CSF 2.0"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Overall Score:
            </span>
            <span className="rounded-md bg-brand-blue/10 px-2.5 py-1 text-sm font-bold text-brand-blue dark:bg-blue-950 dark:text-blue-400">
              {overallScore}/100
            </span>
          </div>
        }
      />

      <main className="flex-1 space-y-5 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        {/* ROW 1: Large Radar Chart & Domain Breakdown */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Radar Chart (Large) */}
          <Panel
            title="NIST CSF 2.0 Maturity Radar"
            action={
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Target: 85+ Across All Domains
              </span>
            }
            className="lg:col-span-6 flex flex-col justify-between"
          >
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={CISO_MOCK_POSTURE_DOMAINS}
                >
                  <PolarGrid stroke="#cbd5e1" strokeOpacity={0.5} />
                  <PolarAngleAxis
                    dataKey="domain"
                    tick={{ fill: "#64748b", fontSize: 13, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    stroke="#94a3b8"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                  />
                  <Radar
                    name="Current Posture"
                    dataKey="score"
                    stroke="#2563EB"
                    fill="#3B82F6"
                    fillOpacity={0.45}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} / 100`, "Score"]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      color: "#f8fafc",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-brand-blue opacity-80"></span>
                <span>Current Score</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border border-dashed border-slate-400"></span>
                <span>Scale (0 - 100)</span>
              </div>
            </div>
          </Panel>

          {/* Domain Breakdown Table */}
          <Panel
            title="Domain Performance Breakdown"
            action={
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                Overall: +6% vs last month
              </span>
            }
            className="lg:col-span-6 flex flex-col justify-between"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-400 dark:border-slate-800">
                    <th className="pb-2.5">Domain</th>
                    <th className="pb-2.5">Maturity</th>
                    <th className="pb-2.5">Score</th>
                    <th className="pb-2.5">Trend (30d)</th>
                    <th className="pb-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {CISO_MOCK_POSTURE_DOMAINS.map((item) => (
                    <tr
                      key={item.domain}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                    >
                      <td className="py-3 font-semibold text-slate-900 dark:text-white">
                        {item.domain}
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">
                        {item.score >= 80
                          ? "Optimized"
                          : item.score >= 75
                          ? "Established"
                          : "Defined"}
                      </td>
                      <td className="py-3 font-bold text-slate-800 dark:text-slate-100">
                        {item.score} / {item.fullMark}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-0.5 font-semibold ${
                            item.isUp ? "text-emerald-500" : "text-rose-500"
                          }`}
                        >
                          {item.isUp ? "↑" : "↓"} {item.trend}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            item.score >= 75
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                              : "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                          }`}
                        >
                          {item.score >= 75 ? "Target Met" : "Needs Focus"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-lg bg-blue-50/60 p-3 text-xs text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
              💡 <strong>Insight:</strong> The <em>Protect</em> domain shows slight
              regression (-1%) due to newly onboarded legacy cloud services. Priority
              should be assigned to IAM controls.
            </div>
          </Panel>
        </div>

        {/* ROW 2: Security Trend (30 Hari) */}
        <Panel
          title="Security Posture Historical Trend (Last 30 Days)"
          action={
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                <span className="text-slate-600 dark:text-slate-300">
                  Posture Score
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span>
                <span className="text-slate-600 dark:text-slate-300">
                  Industry Benchmark
                </span>
              </div>
            </div>
          }
        >
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CISO_MOCK_POSTURE_TREND_30D}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  stroke="#cbd5e1"
                />
                <YAxis
                  domain={[60, 90]}
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
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#2563EB" }}
                  activeDot={{ r: 6 }}
                  name="Posture Score"
                />
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  stroke="#94A3B8"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={false}
                  name="Industry Benchmark"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* ROW 3: Key Findings & Recommended Actions */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Key Findings (5 Findings with Severity Badges) */}
          <Panel
            title="Key Posture Findings & Deficiencies"
            action={
              <span className="text-xs text-slate-500 dark:text-slate-400">
                5 Total Active Findings
              </span>
            }
            className="lg:col-span-7 flex flex-col justify-between"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-400 dark:border-slate-800">
                    <th className="pb-2">Finding</th>
                    <th className="pb-2">Domain</th>
                    <th className="pb-2">Severity</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Detected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {CISO_MOCK_POSTURE_FINDINGS.map((finding) => (
                    <tr
                      key={finding.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                    >
                      <td className="py-2.5 pr-2">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {finding.title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          ID: {finding.id} • Impact Score: {finding.impactScore}
                        </div>
                      </td>
                      <td className="py-2.5 font-medium text-slate-600 dark:text-slate-300">
                        {finding.domain}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold ${getSeverityBadge(
                            finding.severity
                          )}`}
                        >
                          {finding.severity}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusBadge(
                            finding.status
                          )}`}
                        >
                          {finding.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-slate-500 whitespace-nowrap">
                        {finding.detectedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Recommended Actions */}
          <Panel
            title="Recommended Remediation Actions"
            action={
              <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                Est. Impact: +8.5 Pts
              </span>
            }
            className="lg:col-span-5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {CISO_MOCK_POSTURE_ACTIONS.map((action, idx) => (
                <div
                  key={action.id}
                  className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {idx + 1}
                      </span>
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                        {action.title}
                      </h3>
                    </div>
                    <span className="whitespace-nowrap rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                      {action.estScoreImpact}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <span>
                        Domain: <strong>{action.domain}</strong>
                      </span>
                      <span>
                        Effort: <strong>{action.effort}</strong>
                      </span>
                    </div>
                    <span>
                      Owner: <strong>{action.owner}</strong>
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
