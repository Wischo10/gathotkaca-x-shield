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
  CISO_MOCK_THREAT_INTEL_KPIS,
  CISO_MOCK_IOC_DISTRIBUTION,
  CISO_MOCK_THREAT_TREND_30D,
  CISO_MOCK_TOP_THREAT_SOURCES,
  CISO_MOCK_RECENT_IOCS,
  CISO_MOCK_MITRE_COVERAGE,
  CISO_MOCK_THREAT_EXECUTIVE_INSIGHTS,
  RecentIocFeedItem,
} from "@/mock/ciso-dashboard.mock";

function getConfidenceBadge(confidence: RecentIocFeedItem["confidence"]) {
  switch (confidence) {
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

function getStatusBadge(status: RecentIocFeedItem["status"]) {
  switch (status) {
    case "Blocked":
      return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300";
    case "Active":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300";
    case "Investigating":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300";
    case "Whitelisted":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

function getTypeBadge(type: RecentIocFeedItem["type"]) {
  switch (type) {
    case "IP Address":
      return "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300";
    case "Domain":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";
    case "URL":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";
    case "File Hash":
      return "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300";
    case "Email":
      return "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300";
    default:
      return "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

export default function ThreatIntelligenceDetailPage() {
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedConfidence, setSelectedConfidence] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredIocs = CISO_MOCK_RECENT_IOCS.filter((item) => {
    const matchesType = selectedType === "All" || item.type === selectedType;
    const matchesConfidence = selectedConfidence === "All" || item.confidence === selectedConfidence;
    const matchesSearch =
      item.ioc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.targetThreat && item.targetThreat.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesConfidence && matchesSearch;
  });

  const totalIocs = CISO_MOCK_IOC_DISTRIBUTION.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <>
      <CisoDetailHeader
        title="Threat Intelligence"
        subtitle="Global threat telemetry, indicator of compromise (IOC) correlation, and MITRE ATT&CK adversary mapping"
        badge="Active Telemetry"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              High Confidence:
            </span>
            <span className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              31 Threats Flagged
            </span>
          </div>
        }
      />

      <main className="flex-1 space-y-5 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        {/* SECTION 1 – KPI Cards (5 Cards with Mini Sparklines) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {CISO_MOCK_THREAT_INTEL_KPIS.map((kpi) => (
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

        {/* SECTION 2 & SECTION 3: IOC Distribution + Threat Trend (30 Days) */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Section 2: IOC Distribution Donut Chart */}
          <Panel
            title="IOC Distribution by Type"
            action={
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Total: {totalIocs} IOCs
              </span>
            }
            className="lg:col-span-5 flex flex-col justify-between"
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4">
              <div className="h-56 sm:col-span-6 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={CISO_MOCK_IOC_DISTRIBUTION}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {CISO_MOCK_IOC_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as (typeof CISO_MOCK_IOC_DISTRIBUTION)[0];
                          return (
                            <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800 text-xs">
                              <p className="font-semibold text-slate-900 dark:text-white">{data.name}</p>
                              <p className="text-slate-600 dark:text-slate-300">
                                {data.value} indicators ({data.percentage})
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
                {CISO_MOCK_IOC_DISTRIBUTION.map((item) => (
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
                      <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        ({item.percentage})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* Section 3: Threat Trend (30 Days) Line Chart */}
          <Panel
            title="30-Day Threat Discovery & Containment Trend"
            action={
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-rose-500">
                  <span className="h-2 w-2 rounded-full bg-rose-500" /> New IOCs
                </span>
                <span className="flex items-center gap-1 text-emerald-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Blocked Threats
                </span>
              </div>
            }
            className="lg:col-span-7 flex flex-col justify-between"
          >
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CISO_MOCK_THREAT_TREND_30D} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                              New IOCs: {payload[0]?.value}
                            </p>
                            <p className="text-emerald-500 font-medium">
                              Blocked Threats: {payload[1]?.value}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="newIocs"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#f43f5e" }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="blockedThreats"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: "#10b981" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        {/* SECTION 4: Top Threat Sources (Horizontal Bar Chart) */}
        <Panel
          title="Top Threat Sources & Feed Reliability"
          action={
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated from 5 external & internal feeds
            </span>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Horizontal Bar Chart */}
            <div className="lg:col-span-7 h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={CISO_MOCK_TOP_THREAT_SOURCES}
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.3} horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    dataKey="source"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as (typeof CISO_MOCK_TOP_THREAT_SOURCES)[0];
                        return (
                          <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-lg dark:border-slate-700 dark:bg-slate-800 text-xs">
                            <p className="font-semibold text-slate-900 dark:text-white">{data.source}</p>
                            <p className="text-slate-600 dark:text-slate-300">Category: {data.category}</p>
                            <p className="text-brand-blue font-bold mt-1">{data.count} Indicators</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown Cards */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {CISO_MOCK_TOP_THREAT_SOURCES.map((src) => (
                <div
                  key={src.source}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{src.source}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{src.category}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">{src.count}</span>
                    <span className="block text-[10px] font-semibold text-rose-500">{src.confidence} Confidence</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* SECTION 5: Recent IOC Feed Table */}
        <Panel
          title="Recent Indicator of Compromise (IOC) Feed"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search IOC, source, threat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-brand-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="All">All Types</option>
                <option value="IP Address">IP Address</option>
                <option value="Domain">Domain</option>
                <option value="URL">URL</option>
                <option value="File Hash">File Hash</option>
                <option value="Email">Email</option>
              </select>
              <select
                value={selectedConfidence}
                onChange={(e) => setSelectedConfidence(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-brand-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="All">All Confidence</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">IOC Value</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Associated Threat</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">First Seen</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredIocs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500 dark:text-slate-400">
                      No indicators matched your search filters.
                    </td>
                  </tr>
                ) : (
                  filteredIocs.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3 px-3 font-mono font-medium text-slate-900 dark:text-white max-w-[220px] truncate">
                        {item.ioc}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${getTypeBadge(
                            item.type
                          )}`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${getConfidenceBadge(
                            item.confidence
                          )}`}
                        >
                          {item.confidence}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                        {item.targetThreat || "-"}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-medium">
                        {item.source}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                        {item.firstSeen}
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

        {/* SECTION 6: MITRE ATT&CK Coverage */}
        <Panel
          title="MITRE ATT&CK Tactic Coverage"
          action={
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Correlated IOCs across Enterprise Matrix Tactics
            </span>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CISO_MOCK_MITRE_COVERAGE.map((mitre) => (
              <div
                key={mitre.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500">
                    {mitre.id}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      mitre.riskLevel === "Critical"
                        ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                        : mitre.riskLevel === "High"
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                        : "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                    }`}
                  >
                    {mitre.riskLevel} Risk
                  </span>
                </div>

                <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                  {mitre.tactic}
                </div>

                <div className="mt-3 flex items-baseline justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Associated IOCs:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{mitre.iocCount}</span>
                </div>

                <div className="mt-1 flex items-baseline justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Active Campaigns:</span>
                  <span className="font-bold text-rose-500">{mitre.campaignsCount} campaigns</span>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Detection Coverage</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {mitre.coveragePct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-1.5 rounded-full bg-brand-blue"
                      style={{ width: `${mitre.coveragePct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* SECTION 7: Executive Insights */}
        <Panel
          title="Threat Intelligence Executive Insights"
          action={
            <span className="text-xs text-slate-500 dark:text-slate-400">
              AI-Synthesized Security Advisory
            </span>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CISO_MOCK_THREAT_EXECUTIVE_INSIGHTS.map((insight) => (
              <div
                key={insight.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        insight.tagColor === "rose"
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                          : insight.tagColor === "amber"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          : insight.tagColor === "purple"
                          ? "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                          : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                      }`}
                    >
                      {insight.tag}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{insight.id}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {insight.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    <span className="text-brand-blue font-bold">Action: </span>
                    {insight.recommendation}
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
