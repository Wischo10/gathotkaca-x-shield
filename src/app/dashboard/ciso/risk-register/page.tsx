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
  CISO_MOCK_RISK_DETAIL_KPIS,
  CISO_MOCK_RISK_DISTRIBUTION_DETAIL,
  CISO_MOCK_RISK_TREATMENT_STATUS,
  CISO_MOCK_RISK_MATRIX_ITEMS,
  CISO_MOCK_PRIORITY_RISKS_TABLE,
  CISO_MOCK_RISK_TREND_30D,
  CISO_MOCK_RISK_EXECUTIVE_RECOMMENDATIONS,
  PriorityRiskTableItem,
  RiskMatrixItem,
} from "@/mock/ciso-dashboard.mock";

function getSeverityBadge(severity: PriorityRiskTableItem["severity"]) {
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

function getStatusBadge(status: PriorityRiskTableItem["status"]) {
  switch (status) {
    case "Open":
      return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300";
    case "In Progress":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300";
    case "Mitigated":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300";
    case "Accepted":
      return "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300";
    case "Closed":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

function getImpactBadge(impact: PriorityRiskTableItem["impact"]) {
  switch (impact) {
    case "Very High":
      return "text-rose-600 dark:text-rose-400 font-bold";
    case "High":
      return "text-amber-600 dark:text-amber-400 font-bold";
    case "Medium":
      return "text-yellow-600 dark:text-yellow-400 font-medium";
    case "Low":
    case "Very Low":
      return "text-emerald-600 dark:text-emerald-400 font-medium";
    default:
      return "text-slate-600 dark:text-slate-400";
  }
}

const MATRIX_IMPACT_LABELS = ["Very High", "High", "Medium", "Low", "Very Low"];
const MATRIX_LIKELIHOOD_LABELS = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"];

function getMatrixCellBg(impactScore: number, likelihoodScore: number) {
  const riskValue = impactScore * likelihoodScore;
  if (riskValue >= 15) return "bg-rose-500/20 border-rose-500/30 text-rose-700 dark:text-rose-300";
  if (riskValue >= 9) return "bg-amber-500/20 border-amber-500/30 text-amber-700 dark:text-amber-300";
  if (riskValue >= 4) return "bg-yellow-500/15 border-yellow-500/30 text-yellow-700 dark:text-yellow-300";
  return "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300";
}

export default function RiskRegisterDetailPage() {
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMatrixItem, setSelectedMatrixItem] = useState<RiskMatrixItem | null>(null);

  const filteredRisks = CISO_MOCK_PRIORITY_RISKS_TABLE.filter((item) => {
    const matchesSeverity = selectedSeverity === "All" || item.severity === selectedSeverity;
    const matchesStatus = selectedStatus === "All" || item.status === selectedStatus;
    const matchesSearch =
      item.risk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const totalRisks = CISO_MOCK_RISK_DISTRIBUTION_DETAIL.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <>
      <CisoDetailHeader
        title="Risk Register"
        subtitle="Enterprise cybersecurity risk quantification, matrix prioritization, and treatment lifecycle tracking"
        badge="Enterprise Risk"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Treatment Progress:
            </span>
            <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              64% Mitigated
            </span>
          </div>
        }
      />

      <main className="flex-1 space-y-5 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        {/* SECTION 1 – KPI Cards (4 Cards with Mini Sparklines) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {CISO_MOCK_RISK_DETAIL_KPIS.map((kpi) => (
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

        {/* SECTION 2 & SECTION 3: Risk Distribution (Donut) & Risk Treatment Status (Stacked Bar) */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Section 2: Risk Distribution Donut Chart */}
          <Panel
            title="Risk Severity Distribution"
            action={
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Total: {totalRisks} Risks
              </span>
            }
            className="lg:col-span-5 flex flex-col justify-between"
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4">
              <div className="h-56 sm:col-span-6 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={CISO_MOCK_RISK_DISTRIBUTION_DETAIL}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {CISO_MOCK_RISK_DISTRIBUTION_DETAIL.map((entry) => (
                        <Cell key={`cell-${entry.severity}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as (typeof CISO_MOCK_RISK_DISTRIBUTION_DETAIL)[0];
                          return (
                            <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800 text-xs">
                              <p className="font-semibold text-slate-900 dark:text-white">{data.name} Severity</p>
                              <p className="text-slate-600 dark:text-slate-300">
                                {data.count} risks ({data.percentage})
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
                {CISO_MOCK_RISK_DISTRIBUTION_DETAIL.map((item) => (
                  <div
                    key={item.severity}
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

          {/* Section 3: Risk Treatment Status Bar Chart */}
          <Panel
            title="Risk Treatment & Lifecycle Status"
            action={
              <span className="text-xs text-slate-500 dark:text-slate-400">
                126 Managed Risks
              </span>
            }
            className="lg:col-span-7 flex flex-col justify-between"
          >
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={CISO_MOCK_RISK_TREATMENT_STATUS}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.3} vertical={false} />
                  <XAxis dataKey="status" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as (typeof CISO_MOCK_RISK_TREATMENT_STATUS)[0];
                        return (
                          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-700 dark:bg-slate-800 text-xs">
                            <p className="font-semibold text-slate-900 dark:text-white">{data.status}</p>
                            <p className="text-brand-blue font-bold">
                              {data.count} risks ({data.percentage})
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {CISO_MOCK_RISK_TREATMENT_STATUS.map((entry) => (
                      <Cell key={`bar-${entry.status}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        {/* SECTION 4: 5x5 Risk Matrix */}
        <Panel
          title="5x5 Risk Matrix Heatmap"
          action={
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <span className="h-2.5 w-2.5 rounded bg-rose-500" /> Critical (15-25)
              </span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <span className="h-2.5 w-2.5 rounded bg-amber-500" /> High (9-14)
              </span>
              <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <span className="h-2.5 w-2.5 rounded bg-yellow-500" /> Medium (4-8)
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="h-2.5 w-2.5 rounded bg-emerald-500" /> Low (1-3)
              </span>
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 5x5 Grid Table */}
            <div className="lg:col-span-8 overflow-x-auto">
              <div className="min-w-[500px]">
                <div className="flex items-center mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-24">
                    Impact ↓
                  </span>
                  <div className="grid grid-cols-5 flex-1 text-center text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {MATRIX_LIKELIHOOD_LABELS.map((lbl) => (
                      <span key={lbl}>{lbl}</span>
                    ))}
                  </div>
                </div>

                {/* Rows for Impact: 5 (Very High) down to 1 (Very Low) */}
                {[5, 4, 3, 2, 1].map((impactScore, rIdx) => {
                  const impactLabel = MATRIX_IMPACT_LABELS[rIdx];
                  return (
                    <div key={`row-${impactScore}`} className="flex items-stretch mb-1.5">
                      <div className="w-24 flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 pr-2">
                        {impactLabel} ({impactScore})
                      </div>
                      <div className="grid grid-cols-5 gap-1.5 flex-1">
                        {[1, 2, 3, 4, 5].map((likelihoodScore) => {
                          const cellBg = getMatrixCellBg(impactScore, likelihoodScore);
                          const matchingRisks = CISO_MOCK_RISK_MATRIX_ITEMS.filter(
                            (r) => r.impactScore === impactScore && r.likelihoodScore === likelihoodScore
                          );

                          return (
                            <div
                              key={`cell-${impactScore}-${likelihoodScore}`}
                              className={`h-16 rounded-lg border p-1.5 transition flex flex-col justify-between ${cellBg}`}
                            >
                              <div className="text-[10px] font-mono font-bold opacity-60 text-right">
                                {impactScore * likelihoodScore}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {matchingRisks.map((item) => (
                                  <button
                                    key={item.id}
                                    onClick={() => setSelectedMatrixItem(item)}
                                    title={`${item.name} (${item.category})`}
                                    className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold shadow-xs transition hover:scale-105 cursor-pointer truncate max-w-full ${
                                      item.severity === "Critical"
                                        ? "bg-rose-600 text-white"
                                        : item.severity === "High"
                                        ? "bg-amber-600 text-white"
                                        : item.severity === "Medium"
                                        ? "bg-yellow-600 text-white"
                                        : "bg-emerald-600 text-white"
                                    }`}
                                  >
                                    {item.name.split(" ")[0]}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-2 ml-24">
                  Likelihood →
                </div>
              </div>
            </div>

            {/* Selected Matrix Item Detail Card */}
            <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Risk Point Inspector
              </h4>
              {selectedMatrixItem ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-400">{selectedMatrixItem.id}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        selectedMatrixItem.severity === "Critical"
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                          : selectedMatrixItem.severity === "High"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          : selectedMatrixItem.severity === "Medium"
                          ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300"
                          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      }`}
                    >
                      {selectedMatrixItem.severity} Risk
                    </span>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">Threat Description:</div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                      {selectedMatrixItem.name}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[10px]">Impact Score:</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedMatrixItem.impactScore} / 5
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Likelihood Score:</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedMatrixItem.likelihoodScore} / 5
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Category:</span>
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        {selectedMatrixItem.category}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Owner:</span>
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        {selectedMatrixItem.owner}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Click any risk point tag in the 5x5 heatmap to inspect details.
                </div>
              )}
            </div>
          </div>
        </Panel>

        {/* SECTION 5: Top Priority Risks Table */}
        <Panel
          title="Top Priority Cyber Risks Register"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search risk, category, owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-brand-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-brand-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Mitigated">Mitigated</option>
                <option value="Accepted">Accepted</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Risk ID & Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Impact</th>
                  <th className="py-2.5 px-3">Likelihood</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Owner</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRisks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-500 dark:text-slate-400">
                      No risks matched your search filters.
                    </td>
                  </tr>
                ) : (
                  filteredRisks.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3 px-3 max-w-[280px]">
                        <div className="font-mono text-[10px] text-slate-400">{item.id}</div>
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {item.risk}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                        {item.category}
                      </td>
                      <td className={`py-3 px-3 ${getImpactBadge(item.impact)}`}>
                        {item.impact}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        {item.likelihood}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${getSeverityBadge(
                            item.severity
                          )}`}
                        >
                          {item.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-medium">
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
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                        {item.dueDate}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* SECTION 6: Risk Trend (30 Days) Line Chart */}
        <Panel
          title="30-Day Risk Exposure & Containment Trend"
          action={
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-rose-500">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Open Risks
              </span>
              <span className="flex items-center gap-1 text-emerald-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Closed / Mitigated Risks
              </span>
            </div>
          }
        >
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CISO_MOCK_RISK_TREND_30D} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.3} vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-700 dark:bg-slate-800 text-xs">
                          <p className="font-semibold text-slate-900 dark:text-white mb-1">{label}</p>
                          <p className="text-rose-500 font-medium">
                            Open Risks: {payload[0]?.value}
                          </p>
                          <p className="text-emerald-500 font-medium">
                            Closed Risks: {payload[1]?.value}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="openRisks"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#f43f5e" }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="closedRisks"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#10b981" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* SECTION 7: Executive Recommendations */}
        <Panel
          title="Risk Register Executive Recommendations"
          action={
            <span className="text-xs text-slate-500 dark:text-slate-400">
              CISO Strategic Action Roadmap
            </span>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CISO_MOCK_RISK_EXECUTIVE_RECOMMENDATIONS.map((rec) => (
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
                    <span className="text-[11px] font-mono text-slate-400">{rec.id}</span>
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
                    <span className="text-brand-blue font-bold">Action ({rec.owner}): </span>
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
