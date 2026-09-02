"use client";

import { useState, useMemo } from "react";
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
  CISO_MOCK_VENDOR_KPIS,
  CISO_MOCK_VENDOR_RISK_DISTRIBUTION,
  CISO_MOCK_VENDOR_ASSESSMENTS,
  CISO_MOCK_VENDOR_TABLE,
  CISO_MOCK_VENDOR_TREND,
  CISO_MOCK_VENDOR_FINDINGS,
  CISO_MOCK_VENDOR_INSIGHTS,
  CriticalVendorItem,
} from "@/mock/ciso-dashboard.mock";

function getRiskBadge(risk: CriticalVendorItem["riskLevel"]) {
  switch (risk) {
    case "High":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800";
    case "Medium":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800";
    case "Low":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700";
  }
}

function getStatusBadge(status: CriticalVendorItem["status"]) {
  switch (status) {
    case "Active":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300";
    case "Review":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300";
    case "Overdue":
      return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

function getCriticalAccessBadge(access: CriticalVendorItem["criticalAccess"]) {
  switch (access) {
    case "Yes":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800 font-bold";
    case "Limited":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800 font-medium";
    case "No":
      return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 font-normal";
    default:
      return "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  }
}

export default function ThirdPartyRiskDetailPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredVendors = useMemo(() => {
    return CISO_MOCK_VENDOR_TABLE.filter((vendor) => {
      const matchesSearch =
        vendor.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.owner.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === "All" || vendor.riskLevel === riskFilter;
      const matchesStatus = statusFilter === "All" || vendor.status === statusFilter;
      return matchesSearch && matchesRisk && matchesStatus;
    });
  }, [searchQuery, riskFilter, statusFilter]);

  const totalVendors = CISO_MOCK_VENDOR_RISK_DISTRIBUTION.reduce((acc, curr) => acc + curr.count, 0);

  // Group executive recommendations by Horizon
  const horizonGroups = ["Immediate (0–30 hari)", "Short Term (30–90 hari)", "Long Term (>90 hari)"] as const;

  return (
    <>
      <CisoDetailHeader
        title="Third-Party Risk Overview"
        subtitle="SaaS & supply chain security governance, vendor audit readiness, and third-party access lifecycle"
        badge="Medium Vendor Risk"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              High Risk Posture:
            </span>
            <span className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              18 Critical Vendors
            </span>
          </div>
        }
      />

      <main className="flex-1 space-y-5 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        {/* SECTION 1 – KPI Cards (4 Cards with Sparklines) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {CISO_MOCK_VENDOR_KPIS.map((kpi) => (
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

        {/* SECTION 2 & SECTION 3: Risk Distribution (Donut) & Assessment Status (Stacked Bar) */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Section 2: Vendor Risk Distribution Donut */}
          <Panel
            title="Vendor Risk Tier Distribution"
            action={
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Total: {totalVendors} Active Vendors
              </span>
            }
            className="lg:col-span-5 flex flex-col justify-between"
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4">
              <div className="h-56 sm:col-span-6 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={CISO_MOCK_VENDOR_RISK_DISTRIBUTION}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {CISO_MOCK_VENDOR_RISK_DISTRIBUTION.map((entry) => (
                        <Cell key={`cell-${entry.tier}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as (typeof CISO_MOCK_VENDOR_RISK_DISTRIBUTION)[0];
                          return (
                            <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800 text-xs">
                              <p className="font-semibold text-slate-900 dark:text-white">{data.name}</p>
                              <p className="text-slate-600 dark:text-slate-300">
                                {data.count} vendors ({data.percentage})
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
                {CISO_MOCK_VENDOR_RISK_DISTRIBUTION.map((item) => (
                  <div
                    key={item.tier}
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

          {/* Section 3: Vendor Assessment Status Bar Chart */}
          <Panel
            title="Vendor Security Assessment Status"
            action={
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Quarterly Assessment Lifecycle
              </span>
            }
            className="lg:col-span-7 flex flex-col justify-between"
          >
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={CISO_MOCK_VENDOR_ASSESSMENTS}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.3} vertical={false} />
                  <XAxis dataKey="status" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as (typeof CISO_MOCK_VENDOR_ASSESSMENTS)[0];
                        return (
                          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-700 dark:bg-slate-800 text-xs">
                            <p className="font-semibold text-slate-900 dark:text-white">{data.status}</p>
                            <p className="text-brand-blue font-bold">
                              {data.count} vendors ({data.percentage})
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {CISO_MOCK_VENDOR_ASSESSMENTS.map((entry) => (
                      <Cell key={`bar-${entry.status}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        {/* SECTION 4: Critical Vendors Table */}
        <Panel
          title="Critical & Key Third-Party Vendors"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search vendor, service, owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-brand-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="All">All Risk Levels</option>
                <option value="High">High Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="Low">Low Risk</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-brand-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Review">Review</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Vendor & Service Scope</th>
                  <th className="py-2.5 px-3">Risk Tier</th>
                  <th className="py-2.5 px-3">Critical Access</th>
                  <th className="py-2.5 px-3">Compliance Badges</th>
                  <th className="py-2.5 px-3">Owner</th>
                  <th className="py-2.5 px-3">Audit Lifecycle Progress</th>
                  <th className="py-2.5 px-3">Next Review</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      No third-party vendors match your search filters.
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3 px-3 max-w-[220px]">
                        <div className="font-mono text-[10px] text-slate-400">{item.id}</div>
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {item.vendor}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {item.service}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${getRiskBadge(
                            item.riskLevel
                          )}`}
                        >
                          {item.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] ${getCriticalAccessBadge(
                            item.criticalAccess
                          )}`}
                        >
                          {item.criticalAccess}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {item.compliance.map((c) => (
                            <span
                              key={c}
                              className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                        {item.owner}
                      </td>
                      <td className="py-3 px-3 min-w-[140px]">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                          <span>{item.assessmentProgress}% Complete</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={`h-1.5 rounded-full ${
                              item.assessmentProgress === 100
                                ? "bg-emerald-500"
                                : item.assessmentProgress > 50
                                ? "bg-brand-blue"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${item.assessmentProgress}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {item.nextReview}
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* SECTION 5 & SECTION 6: Vendor Trend (12 Months) + Third-Party Findings Gap */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Section 5: Vendor Risk Trend Line Chart */}
          <Panel
            title="12-Month Vendor Risk & Security Incident Trend"
            action={
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-rose-500">
                  <span className="h-2 w-2 rounded-full bg-rose-500" /> High Risk Vendors
                </span>
                <span className="flex items-center gap-1 text-amber-500">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Vendor Incidents
                </span>
              </div>
            }
            className="lg:col-span-6 flex flex-col justify-between"
          >
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CISO_MOCK_VENDOR_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.3} vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-700 dark:bg-slate-800 text-xs">
                            <p className="font-semibold text-slate-900 dark:text-white mb-1">{label}</p>
                            <p className="text-rose-500 font-medium">
                              High Risk Vendors: {payload[0]?.value}
                            </p>
                            <p className="text-amber-500 font-medium">
                              Vendor Incidents: {payload[1]?.value}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="highRiskVendors"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#ef4444" }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="vendorIncidents"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: "#f59e0b" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {/* Section 6: Third-Party Findings (Horizontal Bar Chart) */}
          <Panel
            title="Third-Party Findings & Control Deficiencies"
            action={
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Breakdown Across Vendor Audit Categories
              </span>
            }
            className="lg:col-span-6 flex flex-col justify-between"
          >
            <div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={CISO_MOCK_VENDOR_FINDINGS}
                    margin={{ top: 5, right: 30, left: 75, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.3} horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis
                      dataKey="category"
                      type="category"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as (typeof CISO_MOCK_VENDOR_FINDINGS)[0];
                          return (
                            <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-700 dark:bg-slate-800 text-xs">
                              <p className="font-semibold text-slate-900 dark:text-white">{data.category}</p>
                              <p className="text-rose-500 font-bold mt-1">
                                {data.findingsCount} Total Findings ({data.highSeverityCount} Critical/High)
                              </p>
                              <p className="text-slate-500 text-[10px]">Risk Score: {data.riskScore}/100</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="findingsCount" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Panel>
        </div>

        {/* SECTION 7: Executive Recommendations (Grouped by Time Horizon) */}
        <Panel
          title="Third-Party Risk Strategic Recommendations"
          action={
            <span className="text-xs text-slate-500 dark:text-slate-400">
              CISO Time-Horizon Action Plan
            </span>
          }
        >
          <div className="space-y-4">
            {horizonGroups.map((horizon) => {
              const items = CISO_MOCK_VENDOR_INSIGHTS.filter((i) => i.horizon === horizon);
              if (items.length === 0) return null;

              return (
                <div key={horizon} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-brand-blue/10 px-2 py-0.5 text-[11px] font-bold text-brand-blue dark:bg-blue-950 dark:text-blue-400">
                      {horizon}
                    </span>
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                item.priority === "Critical"
                                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                                  : item.priority === "High"
                                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                                  : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                              }`}
                            >
                              {item.priority} Priority
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {item.impactedVendors}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="text-[10px] text-slate-700 dark:text-slate-300">
                            <span className="text-brand-blue font-bold">Action Plan: </span>
                            {item.action}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </main>
    </>
  );
}
