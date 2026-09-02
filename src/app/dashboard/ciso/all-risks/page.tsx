"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Tooltip,
} from "recharts";
import { Panel } from "@/components/ui/Panel";
import { CisoDetailHeader } from "@/components/ciso/CisoDetailHeader";
import {
  CISO_MOCK_RISK_DETAIL_KPIS,
  CISO_MOCK_RISK_DISTRIBUTION_DETAIL,
  CISO_MOCK_ALL_RISKS_TABLE,
  CISO_MOCK_ALL_RISKS_INSIGHTS,
  AllRiskItem,
} from "@/mock/ciso-dashboard.mock";

function getSeverityBadge(severity: AllRiskItem["severity"]) {
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

function getStatusBadge(status: AllRiskItem["status"]) {
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

function getImpactTextClass(impact: AllRiskItem["impact"]) {
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

const ITEMS_PER_PAGE = 10;

export default function AllRisksDetailPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedOwner, setSelectedOwner] = useState("All");
  const [sortByImpact, setSortByImpact] = useState("none"); // "none" | "desc" | "asc"
  const [currentPage, setCurrentPage] = useState(1);

  // Extract unique owners for filter dropdown
  const uniqueOwners = useMemo(() => {
    const owners = Array.from(new Set(CISO_MOCK_ALL_RISKS_TABLE.map((r) => r.owner)));
    return ["All", ...owners];
  }, []);

  // Filter and sort items client-side
  const filteredAndSortedRisks = useMemo(() => {
    let result = CISO_MOCK_ALL_RISKS_TABLE.filter((item) => {
      const matchesSearch =
        item.riskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.treatment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity =
        selectedSeverity === "All" || item.severity === selectedSeverity;
      const matchesStatus =
        selectedStatus === "All" || item.status === selectedStatus;
      const matchesOwner =
        selectedOwner === "All" || item.owner === selectedOwner;

      return matchesSearch && matchesSeverity && matchesStatus && matchesOwner;
    });

    if (sortByImpact === "desc") {
      result = [...result].sort((a, b) => b.impactScore - a.impactScore);
    } else if (sortByImpact === "asc") {
      result = [...result].sort((a, b) => a.impactScore - b.impactScore);
    }

    return result;
  }, [searchQuery, selectedSeverity, selectedStatus, selectedOwner, sortByImpact]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedRisks.length / ITEMS_PER_PAGE));
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedRisks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedRisks, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const totalRisksCount = CISO_MOCK_RISK_DISTRIBUTION_DETAIL.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <>
      <CisoDetailHeader
        title="All Risks"
        subtitle="Granular registry of enterprise cybersecurity risks, operational owners, and active treatment strategies"
        badge="Enterprise Risk Registry"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Active Scope:
            </span>
            <span className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              22 Critical Threats
            </span>
          </div>
        }
      />

      <main className="flex-1 space-y-5 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        {/* SECTION 1 – Summary KPI Cards (4 Cards with Sparklines) */}
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

        {/* SECTION 2 & SECTION 3: Search & Filters + All Risks Table with Client-Side Pagination */}
        <Panel
          title="All Managed Cybersecurity Risks"
          action={
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredAndSortedRisks.length} of {CISO_MOCK_ALL_RISKS_TABLE.length} loaded records
            </span>
          }
        >
          {/* Section 2: Search & Filter Controls */}
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
            {/* Search Input */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Search Risk / Category
              </label>
              <input
                type="text"
                placeholder="Search by risk name, category, treatment..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
            </div>

            {/* Filter Severity */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Severity
              </label>
              <select
                value={selectedSeverity}
                onChange={(e) => {
                  setSelectedSeverity(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-brand-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Filter Status */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-brand-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Mitigated">Mitigated</option>
                <option value="Accepted">Accepted</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Filter Owner & Sort Impact */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Owner / Impact Sort
              </label>
              <div className="flex gap-1.5">
                <select
                  value={selectedOwner}
                  onChange={(e) => {
                    setSelectedOwner(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-1/2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-brand-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 truncate"
                >
                  {uniqueOwners.map((owner) => (
                    <option key={owner} value={owner}>
                      {owner}
                    </option>
                  ))}
                </select>

                <select
                  value={sortByImpact}
                  onChange={(e) => {
                    setSortByImpact(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-1/2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-brand-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 truncate"
                >
                  <option value="none">Sort: Default</option>
                  <option value="desc">Impact: High→Low</option>
                  <option value="asc">Impact: Low→High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: All Risks Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Risk Name</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Impact</th>
                  <th className="py-2.5 px-3">Likelihood</th>
                  <th className="py-2.5 px-3">Owner</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Treatment Strategy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      No risks found matching the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3 px-3 max-w-[240px]">
                        <div className="font-mono text-[10px] text-slate-400">{item.id}</div>
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {item.riskName}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {item.category}
                        </div>
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
                      <td className={`py-3 px-3 ${getImpactTextClass(item.impact)}`}>
                        {item.impact}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        {item.likelihood}
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
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        <span className={item.isOverdue ? "font-bold text-rose-600 dark:text-rose-400" : ""}>
                          {item.dueDate}
                        </span>
                        {item.isOverdue && (
                          <span className="block text-[9px] font-bold text-rose-500">Overdue</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-[220px] truncate">
                        {item.treatment}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div>
              Showing page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of{" "}
              <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span> ({filteredAndSortedRisks.length} total filtered items)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                ← Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`h-7 w-7 rounded-lg text-xs font-bold transition ${
                      currentPage === page
                        ? "bg-brand-blue text-white shadow-xs"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Next →
              </button>
            </div>
          </div>
        </Panel>

        {/* SECTION 4 & SECTION 5: Risk Distribution Donut + Executive Insights */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Section 4: Risk Distribution Donut Chart */}
          <Panel
            title="Risk Distribution by Severity"
            action={
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Total: {totalRisksCount} Enterprise Risks
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

          {/* Section 5: Executive Insight Cards */}
          <Panel
            title="All Risks Executive Insights"
            action={
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Actionable CISO Briefing
              </span>
            }
            className="lg:col-span-7 flex flex-col justify-between"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CISO_MOCK_ALL_RISKS_INSIGHTS.map((insight) => (
                <div
                  key={insight.id}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          insight.tagColor === "rose"
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                            : insight.tagColor === "amber"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                            : insight.tagColor === "emerald"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                        }`}
                      >
                        {insight.tag}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{insight.id}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-700 dark:text-slate-300">
                      <span className="text-brand-blue font-bold">Action: </span>
                      {insight.recommendation}
                    </div>
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
