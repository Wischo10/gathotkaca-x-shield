"use client";
import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Panel } from "@/components/ui/Panel";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/app/dashboard/SidebarContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Modal } from "@/components/ui/Modal";

// Dynamic import — react-simple-maps uses SVG/browser APIs, must be client-only
const WorldHeatmap = dynamic(() => import("@/components/maps/WorldHeatmap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-slate-400">
      Loading map...
    </div>
  ),
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface MetricCardProps {
  title: string;
  value: string | number;
  trendText: string;
  trendColor: "blue" | "red" | "orange" | "purple" | "yellow" | "green";
  sparklineColor?: string;
  isTrendUp?: boolean;
}

// ─── Range options ─────────────────────────────────────────────────────────────
const RANGE_OPTIONS = [
  { label: "Today",       value: "24h" },
  { label: "Last 7 Days", value: "7d"  },
  { label: "Last 30 Days",value: "30d" },
] as const;
type RangeValue = "24h" | "7d" | "30d";

// ─── RangeSelect component ─────────────────────────────────────────────────────
function RangeSelect({
  value,
  onChange,
}: {
  value: RangeValue;
  onChange: (v: RangeValue) => void;
}) {
  return (
    <select
      className="text-xs bg-transparent border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-600 dark:text-slate-400 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400"
      value={value}
      onChange={(e) => onChange(e.target.value as RangeValue)}
    >
      {RANGE_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ─── MetricCard ────────────────────────────────────────────────────────────────
function MetricCard({
  title,
  value,
  trendText,
  trendColor,
  sparklineColor,
}: MetricCardProps) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-100",
    red: "text-red-600 bg-red-100",
    orange: "text-orange-600 bg-orange-100",
    purple: "text-purple-600 bg-purple-100",
    yellow: "text-yellow-600 bg-yellow-100",
    green: "text-green-600 bg-green-100",
  };

  const bgMap = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500",
    orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-500",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-500",
    yellow: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500",
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <div className={`flex h-6 w-6 items-center justify-center rounded-full ${bgMap[trendColor]}`}>
          {title.charAt(0)}
        </div>
        <span className="truncate">{title}</span>
        <span className="ml-auto text-[10px] opacity-50">ⓘ</span>
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">
        {value}
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div className="text-[10px] text-slate-500">
          <span className={`${colorMap[trendColor]} px-1 py-0.5 rounded font-medium mr-1`}>{trendText}</span>
        </div>
        {sparklineColor && (
          <div className="h-4 w-12 opacity-80">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={[10, 15, 8, 20, 15, 30].map((v, i) => ({v, i}))}>
                 <Line type="monotone" dataKey="v" stroke={sparklineColor} strokeWidth={1.5} dot={false} isAnimationActive={false} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ExecutiveDashboardPage() {
  const openSidebar = useSidebarToggle();

  // ── Per-panel range filters ──────────────────────────────────────────────────
  const [rangeAlerts,       setRangeAlerts]       = useState<RangeValue>("7d");
  const [rangeTrend,        setRangeTrend]         = useState<RangeValue>("7d");
  const [rangeStatusTrend,  setRangeStatusTrend]   = useState<RangeValue>("7d");
  const [rangeRisks,        setRangeRisks]         = useState<RangeValue>("30d");
  const [rangeAttackMethods,setRangeAttackMethods] = useState<RangeValue>("30d");
  const [rangeVictims,      setRangeVictims]       = useState<RangeValue>("30d");
  const [rangeHeatmap,      setRangeHeatmap]       = useState<RangeValue>("30d");

  // ── Data state ───────────────────────────────────────────────────────────────
  const [alerts,        setAlerts]        = useState<any>(null);
  const [trend,         setTrend]         = useState<any[]>([]);
  const [incidents,     setIncidents]     = useState<any[] | null>(null);
  const [attackMethods, setAttackMethods] = useState<any[] | null>(null);
  const [topVictims,    setTopVictims]    = useState<any[] | null>(null);
  const [aiSummary,     setAiSummary]     = useState<string[] | null>(null);
  const [topRisks,      setTopRisks]      = useState<any[] | null>(null);
  const [boardReport,   setBoardReport]   = useState<any | null>(null);
  const [heatmapData,   setHeatmapData]   = useState<any[] | null>(null);

  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  // ── Fetchers ─────────────────────────────────────────────────────────────────
  const fetchAlerts = useCallback((range: RangeValue) => {
    setAlerts(null);
    fetch(`/api/soc/alerts-by-severity?range=${range}`)
      .then(r => r.json())
      .then(r => setAlerts(r.status === "ok" ? r.data : []))
      .catch(() => setAlerts([]));
  }, []);

  const fetchTrend = useCallback((range: RangeValue) => {
    setTrend([]);
    fetch(`/api/soc/alerts-trend?range=${range}`)
      .then(r => r.json())
      .then(r => setTrend(r.status === "ok" ? r.data : []))
      .catch(() => setTrend([]));
  }, []);

  // Status trend shares the same endpoint as Trend but with its own range state
  const fetchStatusTrend = useCallback((range: RangeValue) => {
    setTrend([]);
    fetch(`/api/soc/alerts-trend?range=${range}`)
      .then(r => r.json())
      .then(r => setTrend(r.status === "ok" ? r.data : []))
      .catch(() => setTrend([]));
  }, []);

  const fetchAttackMethods = useCallback((range: RangeValue) => {
    setAttackMethods(null);
    fetch(`/api/soc/attack-methods?range=${range}`)
      .then(r => r.json())
      .then(r => setAttackMethods(r.status === "ok" ? r.data : []))
      .catch(() => setAttackMethods([]));
  }, []);

  const fetchTopVictims = useCallback((range: RangeValue) => {
    setTopVictims(null);
    fetch(`/api/soc/top-victims?range=${range}`)
      .then(r => r.json())
      .then(r => setTopVictims(r.status === "ok" ? r.data : []))
      .catch(() => setTopVictims([]));
  }, []);

  const fetchTopRisks = useCallback((range: RangeValue) => {
    setTopRisks(null);
    fetch(`/api/executive/top-risks?range=${range}`)
      .then(r => r.json())
      .then(r => setTopRisks(r.status === "ok" ? r.data : []))
      .catch(() => setTopRisks([]));
  }, []);

  const fetchHeatmap = useCallback((range: RangeValue) => {
    setHeatmapData(null);
    fetch(`/api/executive/attack-heatmap?range=${range}`)
      .then(r => r.json())
      .then(r => setHeatmapData(r.status === "ok" ? r.data : []))
      .catch(() => setHeatmapData([]));
  }, []);

  // ── Initial load (static / non-filtered data) ────────────────────────────────
  useEffect(() => {
    fetchAlerts(rangeAlerts);
    fetchTrend(rangeTrend);
    fetchAttackMethods(rangeAttackMethods);
    fetchTopVictims(rangeVictims);
    fetchTopRisks(rangeRisks);
    fetchHeatmap(rangeHeatmap);

    // These don't have a per-panel time range filter
    fetch("/api/soc/recent-incidents")
      .then(r => r.json()).then(r => setIncidents(r.status === "ok" ? r.data : []))
      .catch(() => setIncidents([]));
    fetch("/api/ai/executive-summary")
      .then(r => r.json()).then(r => setAiSummary(r.status === "ok" ? r.data : ["Failed to load AI Summary."]))
      .catch(() => setAiSummary(["Failed to load AI Summary."]));
    fetch("/api/executive/board-report")
      .then(r => r.json()).then(r => setBoardReport(r.status === "ok" ? r.data : null))
      .catch(() => setBoardReport(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-fetch when individual range filters change ────────────────────────────
  useEffect(() => { fetchAlerts(rangeAlerts); },             [rangeAlerts,        fetchAlerts]);
  useEffect(() => { fetchTrend(rangeTrend); },               [rangeTrend,         fetchTrend]);
  useEffect(() => { fetchStatusTrend(rangeStatusTrend); },   [rangeStatusTrend,   fetchStatusTrend]);
  useEffect(() => { fetchAttackMethods(rangeAttackMethods); },[rangeAttackMethods, fetchAttackMethods]);
  useEffect(() => { fetchTopVictims(rangeVictims); },        [rangeVictims,       fetchTopVictims]);
  useEffect(() => { fetchTopRisks(rangeRisks); },            [rangeRisks,         fetchTopRisks]);
  useEffect(() => { fetchHeatmap(rangeHeatmap); },           [rangeHeatmap,       fetchHeatmap]);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const totalAlerts = alerts ? alerts.total : 0;

  const alertStatusData = alerts ? [
    { name: "Critical", value: alerts.critical, color: "#ef4444" },
    { name: "High",     value: alerts.high,     color: "#f97316" },
    { name: "Medium",   value: alerts.medium,   color: "#eab308" },
    { name: "Low",      value: alerts.low,      color: "#22c55e" },
  ].filter(d => d.value > 0) : [];

  const statusTrendData = trend.map(t => ({
    day: new Date(t.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
    Critical: t.critical,
    High:     t.high,
    Medium:   t.medium,
    Low:      t.low,
    alerts:   t.critical + t.high + t.medium + t.low,
  }));

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <Topbar
        title="Executive Dashboard"
        subtitle="Strategic overview of cybersecurity posture, threats, and performance"
        onMenuClick={openSidebar}
      />
      <main className="flex-1 space-y-4 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">

        {/* ROW 1: 7 Top Metric Cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">

          {/* 1. Overall Security Score — derived from Wazuh alert ratios + agent health */}
          <MetricCard
            title="Overall Security Score"
            value={boardReport ? `${boardReport.securityScore}` : "…"}
            trendText={boardReport
              ? (boardReport.securityScore >= 75 ? "Good" : boardReport.securityScore >= 50 ? "Attention" : "At Risk")
              : "Loading"}
            trendColor={boardReport
              ? (boardReport.securityScore >= 75 ? "green" : boardReport.securityScore >= 50 ? "yellow" : "red")
              : "blue"}
            sparklineColor="#3b82f6"
            isTrendUp={true}
          />

          {/* 2. Critical Incidents — from Bitdefender (graceful fallback) */}
          <MetricCard
            title="Critical Incidents"
            value={incidents ? incidents.length.toString() : "…"}
            trendText={incidents ? "Live Data" : "Loading"}
            trendColor="red"
            sparklineColor={incidents && incidents.length > 0 ? "#ef4444" : undefined}
            isTrendUp={true}
          />

          {/* 3. Total Alerts — from Wazuh Indexer */}
          <MetricCard
            title="Total Alerts"
            value={totalAlerts.toLocaleString()}
            trendText="Live Data"
            trendColor="orange"
            sparklineColor="#f97316"
            isTrendUp={true}
          />

          {/* 4. Processed Alerts — needs soc_cases DB (not yet available) */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-500">P</div>
              Processed Alerts <span className="ml-auto text-[10px] opacity-50">ⓘ</span>
            </div>
            <div className="mt-2 flex justify-between">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-500">-</div>
                <div className="text-[10px] text-slate-500">Otomatis</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-teal-500 dark:text-teal-400">-</div>
                <div className="text-[10px] text-slate-500">Manual</div>
              </div>
            </div>
          </div>

          {/* 5. Closed Alerts — needs soc_cases DB (not yet available) */}
          <MetricCard
            title="Closed Alerts"
            value="-"
            trendText="Needs DB"
            trendColor="purple"
            sparklineColor="#a855f7"
            isTrendUp={true}
          />

          {/* 6. Critical Vulnerabilities — from Wazuh vulnerability index */}
          <MetricCard
            title="Critical Vulnerabilities"
            value={boardReport ? boardReport.criticalVulnerabilities.toLocaleString() : "…"}
            trendText={boardReport
              ? `${boardReport.highVulnerabilities.toLocaleString()} High`
              : "Loading"}
            trendColor={boardReport && boardReport.criticalVulnerabilities > 0 ? "yellow" : "green"}
            sparklineColor="#eab308"
            isTrendUp={true}
          />

          {/* 7. Compliance Score — from Wazuh rule.pci_dss/gdpr/hipaa/nist coverage */}
          <MetricCard
            title="Compliance Score"
            value={boardReport ? `${boardReport.compliancePct}%` : "…"}
            trendText={boardReport
              ? `${boardReport.totalComplianceEvents.toLocaleString()} events`
              : "Loading"}
            trendColor={boardReport
              ? (boardReport.compliancePct >= 75 ? "green" : boardReport.compliancePct >= 50 ? "yellow" : "red")
              : "green"}
            sparklineColor="#22c55e"
            isTrendUp={true}
          />
        </div>


        {/* ROW 2 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {/* Alerts by Status */}
          <Panel
            title="Alerts by Status"
            action={<RangeSelect value={rangeAlerts} onChange={setRangeAlerts} />}
          >
            <div className="flex h-56 items-center">
              <div className="h-full w-1/2">
                {!alerts ? <div className="flex h-full items-center justify-center text-xs text-slate-400">Loading...</div> :
                 alertStatusData.length === 0 ? <div className="flex h-full items-center justify-center text-xs text-slate-400">No Data</div> :
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={alertStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" stroke="none">
                      {alertStatusData.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold fill-slate-800 dark:fill-white">{totalAlerts > 1000000 ? "1M+" : totalAlerts.toLocaleString()}</text>
                    <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-[10px] fill-slate-500">Total Alerts</text>
                  </PieChart>
                </ResponsiveContainer>}
              </div>
              <div className="w-1/2 text-xs flex flex-col gap-2">
                {alertStatusData.map((s: any) => (
                  <div key={s.name} className="flex justify-between items-center pr-2">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}}></span> {s.name}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{s.value.toLocaleString()} <span className="font-normal text-slate-400">({totalAlerts > 0 ? Math.round(s.value/totalAlerts*100) : 0}%)</span></span>
                  </div>
                ))}
              </div>
            </div>
            <div onClick={() => setSelectedFeature("Alerts by Status")} className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View alert analytics →</div>
          </Panel>

          {/* Alerts Trend */}
          <Panel
            title="Alerts Trend"
            action={<RangeSelect value={rangeTrend} onChange={setRangeTrend} />}
          >
            <div className="h-56 w-full">
              {trend.length === 0 ? <div className="flex h-full items-center justify-center text-xs text-slate-400">Loading...</div> :
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statusTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ stroke: "#e2e8f0", strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="alerts" stroke="#2563EB" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>}
            </div>
            <div onClick={() => setSelectedFeature("Alerts Trend")} className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View full analytics →</div>
          </Panel>

          {/* Alerts by Status Trend */}
          <Panel
            title="Alerts by Status Trend"
            action={<RangeSelect value={rangeStatusTrend} onChange={setRangeStatusTrend} />}
          >
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 mb-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span> Critical</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f97316]"></span> High</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#eab308]"></span> Medium</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#22c55e]"></span> Low</span>
            </div>
            <div className="h-44 w-full">
              {trend.length === 0 ? <div className="flex h-full items-center justify-center text-xs text-slate-400">Loading...</div> :
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusTrendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="Critical" stackId="a" fill="#ef4444" barSize={20} />
                  <Bar dataKey="High" stackId="a" fill="#f97316" />
                  <Bar dataKey="Medium" stackId="a" fill="#eab308" />
                  <Bar dataKey="Low" stackId="a" fill="#22c55e" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>}
            </div>
            <div onClick={() => setSelectedFeature("Alerts by Status Trend")} className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View trend details →</div>
          </Panel>

          {/* Top Risks by Domain */}
          <Panel
            title="Top Risks by Domain"
            action={<RangeSelect value={rangeRisks} onChange={setRangeRisks} />}
          >
            <div className="flex h-56 flex-col gap-2.5 overflow-y-auto pt-1 pr-1">
              {!topRisks ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">Loading...</div>
              ) : topRisks.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">No Data — Wazuh not configured</div>
              ) : (
                topRisks.map((risk: any) => {
                  const levelColors: Record<string, { bar: string; badge: string; text: string }> = {
                    critical: { bar: "bg-red-500",    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",    text: "Critical" },
                    high:     { bar: "bg-orange-500", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400", text: "High" },
                    medium:   { bar: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400", text: "Medium" },
                    low:      { bar: "bg-green-500",  badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",  text: "Low" },
                  };
                  const colors = levelColors[risk.level] ?? levelColors.low;
                  const domainIcons: Record<string, string> = {
                    Network: "🌐", Endpoint: "💻", Identity: "🔑", Application: "⚙️", Compliance: "📋"
                  };
                  return (
                    <div key={risk.domain} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <span>{domainIcons[risk.domain] ?? "🔒"}</span>
                          {risk.domain}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 dark:text-slate-500">{risk.alertCount.toLocaleString()} alerts</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${colors.badge}`}>{colors.text}</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300 w-7 text-right">{risk.score}</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                          style={{ width: `${risk.score}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div onClick={() => setSelectedFeature("Top Risks by Domain")} className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View risk register →</div>
          </Panel>
        </div>

        {/* ROW 3 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {/* Attack Country Heatmap */}
          <Panel
            title="Attack Country Heatmap"
            action={<RangeSelect value={rangeHeatmap} onChange={setRangeHeatmap} />}
          >
            <div className="h-56 relative">
              {heatmapData === null ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">Loading map...</div>
              ) : (
                <WorldHeatmap data={heatmapData} />
              )}
            </div>
            <div onClick={() => setSelectedFeature("Attack Country Heatmap")} className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View full map →</div>
          </Panel>

          {/* Attack Method Distribution */}
          <Panel
            title="Attack Method Distribution"
            action={<RangeSelect value={rangeAttackMethods} onChange={setRangeAttackMethods} />}
          >
            <div className="flex h-56 items-center">
              <div className="h-full w-1/2">
                {!attackMethods ? <div className="flex h-full items-center justify-center text-xs text-slate-400">Loading...</div> :
                 attackMethods.length === 0 ? <div className="flex h-full items-center justify-center text-xs text-slate-400">No Data</div> :
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={attackMethods} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" stroke="none">
                      {attackMethods.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold fill-slate-800 dark:fill-white">{attackMethods.reduce((a, b) => a + b.value, 0).toLocaleString()}</text>
                    <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-[10px] fill-slate-500">Total</text>
                  </PieChart>
                </ResponsiveContainer>}
              </div>
              <div className="w-1/2 text-xs flex flex-col gap-2">
                {attackMethods && attackMethods.map(s => (
                  <div key={s.name} className="flex justify-between items-center pr-2">
                    <span className="flex items-center gap-1 w-24 truncate" title={s.name}><span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor: s.color}}></span> {s.name}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{s.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div onClick={() => setSelectedFeature("Attack Method Distribution")} className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View attack analytics →</div>
          </Panel>

          {/* Top 10 Victim */}
          <Panel
            title="Top 10 Victim (By Alerts)"
            action={<RangeSelect value={rangeVictims} onChange={setRangeVictims} />}
          >
            <div className="h-56 w-full text-[10px]">
              {!topVictims ? <div className="flex h-full items-center justify-center text-xs text-slate-400">Loading...</div> :
               topVictims.length === 0 ? <div className="flex h-full items-center justify-center text-xs text-slate-400">No Data</div> :
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topVictims} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                  <XAxis type="number" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: "#f1f5f9"}} contentStyle={{fontSize: "10px"}}/>
                  <Bar dataKey="count" fill="#2563EB" barSize={10} radius={[0, 4, 4, 0]} label={{ position: "right", fill: "#64748b", fontSize: 9 }} />
                </BarChart>
              </ResponsiveContainer>}
            </div>
            <div onClick={() => setSelectedFeature("Top 10 Victim")} className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View all victims →</div>
          </Panel>

          {/* AI Executive Summary */}
          <Panel title="AI Executive Summary" action={<span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">✨ Powered by Ollama</span>}>
             <div className="flex h-56 flex-col gap-3 overflow-y-auto pt-2 text-[11px] text-slate-600 dark:text-slate-400">
                {!aiSummary ? (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">Generating AI Summary...</div>
                ) : (
                  aiSummary.map((line, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-purple-600">☑</span>
                      <p>{line}</p>
                    </div>
                  ))
                )}
             </div>
            <div onClick={() => setSelectedFeature("AI Executive Summary")} className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View full AI report →</div>
          </Panel>
        </div>

        {/* ROW 4: Board Report + Recent Incidents */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel
            title="Board Report"
            action={
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
                {boardReport ? boardReport.quarter : "Loading..."}
              </span>
            }
          >
            {!boardReport ? (
              <div className="flex h-56 items-center justify-center text-xs text-slate-400">Generating report...</div>
            ) : (
              <div className="flex h-56 flex-col gap-0 overflow-y-auto text-[11px]">
                {/* Security Score Hero */}
                <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 p-3 mb-2">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-xl font-black text-white">
                    {boardReport.securityScore}
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-blue-200">Security Score</div>
                    <div className="text-xs font-bold text-white">
                      {boardReport.securityScore >= 75 ? "Good Posture" :
                       boardReport.securityScore >= 50 ? "Needs Attention" : "At Risk"}
                    </div>
                    <div className="text-[10px] text-blue-200">
                      {boardReport.activeAgents}/{boardReport.totalAgents} agents active
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-[10px] text-blue-200">Generated</div>
                    <div className="text-[10px] font-medium text-white">
                      {new Date(boardReport.generatedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>

                {/* Alert Summary Row */}
                <div className="grid grid-cols-4 gap-1 mb-2">
                  {([
                    { label: "Critical", val: boardReport.criticalAlerts,  color: "text-red-600 dark:text-red-400",    bg: "bg-red-50 dark:bg-red-900/20" },
                    { label: "High",     val: boardReport.highAlerts,      color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20" },
                    { label: "Medium",   val: boardReport.mediumAlerts,    color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
                    { label: "Low",      val: boardReport.lowAlerts,       color: "text-green-600 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-900/20" },
                  ] as const).map(item => (
                    <div key={item.label} className={`rounded-md ${item.bg} p-1.5 text-center`}>
                      <div className={`font-bold text-sm ${item.color}`}>{item.val.toLocaleString()}</div>
                      <div className="text-[9px] text-slate-500">{item.label}</div>
                    </div>
                  ))}
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-start gap-1.5 rounded-md bg-slate-50 dark:bg-slate-800/50 p-2">
                    <span className="text-base">🛡️</span>
                    <div>
                      <div className="font-semibold text-slate-700 dark:text-slate-300">Vulnerabilities</div>
                      <div className="text-slate-500">
                        <span className="text-red-600 font-bold">{boardReport.criticalVulnerabilities}</span> Critical,{" "}
                        <span className="text-orange-500 font-bold">{boardReport.highVulnerabilities}</span> High
                      </div>
                      <div className="text-slate-400">Total: {boardReport.totalVulnerabilities.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 rounded-md bg-slate-50 dark:bg-slate-800/50 p-2">
                    <span className="text-base">⚠️</span>
                    <div>
                      <div className="font-semibold text-slate-700 dark:text-slate-300">Top Risk Domain</div>
                      <div className="font-bold text-red-600 dark:text-red-400">
                        {boardReport.topRisks?.[0]?.domain ?? "N/A"}
                      </div>
                      <div className="text-slate-400">{boardReport.highRiskDomains} domain(s) high/critical</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 rounded-md bg-slate-50 dark:bg-slate-800/50 p-2">
                    <span className="text-base">📋</span>
                    <div>
                      <div className="font-semibold text-slate-700 dark:text-slate-300">Compliance</div>
                      <div className="font-bold text-blue-600 dark:text-blue-400">{boardReport.compliancePct}% Coverage</div>
                      <div className="text-slate-400">{boardReport.totalComplianceEvents.toLocaleString()} events flagged</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 rounded-md bg-slate-50 dark:bg-slate-800/50 p-2">
                    <span className="text-base">🎯</span>
                    <div>
                      <div className="font-semibold text-slate-700 dark:text-slate-300">Top Attack</div>
                      <div className="font-bold text-purple-600 dark:text-purple-400 truncate max-w-[90px]" title={boardReport.topAttackMethod}>
                        {boardReport.topAttackMethod}
                      </div>
                      <div className="text-slate-400">{boardReport.attackMethods?.[0]?.count?.toLocaleString() ?? 0} events</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div onClick={() => setSelectedFeature("Board Report")} className="mt-2 text-center text-xs text-brand-blue hover:underline cursor-pointer">View full board report →</div>
          </Panel>

          <Panel title="Recent Critical Incidents" className="lg:col-span-2">
            {!incidents ? (
               <div className="flex h-56 items-center justify-center text-xs text-slate-400">Loading incidents...</div>
            ) : incidents.length === 0 ? (
               <div className="flex h-56 items-center justify-center text-xs text-slate-400">No Critical Incidents</div>
            ) : (
              <div className="overflow-x-auto h-56">
                <table className="w-full text-left text-[11px] text-slate-600 dark:text-slate-400">
                  <thead className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 uppercase dark:border-slate-700 text-slate-500">
                    <tr>
                      <th className="py-2">Time</th>
                      <th className="py-2">Incident Name</th>
                      <th className="py-2">Affected Assets</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((inc: any, i: number) => (
                      <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50">
                        <td className="py-2 whitespace-nowrap">{new Date(inc.creationTime).toLocaleString()}</td>
                        <td className="py-2 font-medium text-slate-800 dark:text-slate-200">{inc.name}</td>
                        <td className="py-2">{inc.endpoint}</td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            inc.status === "Investigating" ? "bg-blue-100 text-blue-700" :
                            inc.status === "In Progress"   ? "bg-yellow-100 text-yellow-700" :
                            inc.status === "Resolved"      ? "bg-green-100 text-green-700" :
                            "bg-slate-100 text-slate-700"
                          }`}>
                            {inc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div onClick={() => setSelectedFeature("Recent Critical Incidents")} className="mt-3 text-right text-xs text-brand-blue hover:underline cursor-pointer">View all incidents →</div>
          </Panel>
        </div>

      </main>

      {/* DETAILED VIEW MODAL — live data per feature */}
      <Modal
        isOpen={selectedFeature !== null}
        onClose={() => setSelectedFeature(null)}
        title={selectedFeature || "Detailed View"}
      >
        {/* ── Alerts by Status ─────────────────────────────────────── */}
        {selectedFeature === "Alerts by Status" && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {alertStatusData.map((s: any) => (
                <div key={s.name} className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 text-center">
                  <div className="mb-1 h-3 w-3 rounded-full mx-auto" style={{ backgroundColor: s.color }} />
                  <div className="text-2xl font-black text-slate-800 dark:text-white">{s.value.toLocaleString()}</div>
                  <div className="text-xs text-slate-500">{s.name}</div>
                  <div className="text-xs font-semibold mt-1" style={{ color: s.color }}>
                    {totalAlerts > 0 ? Math.round(s.value / totalAlerts * 100) : 0}%
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Severity</th>
                    <th className="px-4 py-3 text-right">Count</th>
                    <th className="px-4 py-3 text-right">Percentage</th>
                    <th className="px-4 py-3 text-right">Share (visual)</th>
                  </tr>
                </thead>
                <tbody>
                  {alertStatusData.map((s: any) => (
                    <tr key={s.name} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-4 py-3 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="font-medium text-slate-700 dark:text-slate-300">{s.name}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-800 dark:text-white">{s.value.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-500">{totalAlerts > 0 ? Math.round(s.value / totalAlerts * 100) : 0}%</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <div className="h-2 w-32 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${totalAlerts > 0 ? Math.round(s.value / totalAlerts * 100) : 0}%`, backgroundColor: s.color }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Total</td>
                    <td className="px-4 py-3 text-right font-mono font-black text-slate-800 dark:text-white">{totalAlerts.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-slate-500">100%</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Alerts Trend / Alerts by Status Trend ────────────────── */}
        {(selectedFeature === "Alerts Trend" || selectedFeature === "Alerts by Status Trend") && (
          <div className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statusTrendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="Critical" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="High"     stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Medium"   stroke="#eab308" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Low"      stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-right text-red-500">Critical</th>
                    <th className="px-4 py-2 text-right text-orange-500">High</th>
                    <th className="px-4 py-2 text-right text-yellow-500">Medium</th>
                    <th className="px-4 py-2 text-right text-green-500">Low</th>
                    <th className="px-4 py-2 text-right text-slate-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {statusTrendData.map((row: any, i: number) => (
                    <tr key={i} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300">{row.day}</td>
                      <td className="px-4 py-2 text-right font-mono text-red-600">{row.Critical.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right font-mono text-orange-500">{row.High.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right font-mono text-yellow-500">{row.Medium.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right font-mono text-green-500">{row.Low.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right font-mono font-bold text-slate-700 dark:text-slate-300">{row.alerts.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Top Risks by Domain ───────────────────────────────────── */}
        {selectedFeature === "Top Risks by Domain" && (
          <div className="space-y-3">
            {(!topRisks || topRisks.length === 0) ? (
              <div className="flex h-40 items-center justify-center text-sm text-slate-400">No risk data available</div>
            ) : topRisks.map((risk: any) => {
              const levelColors: Record<string, { bar: string; badge: string; text: string }> = {
                critical: { bar: "bg-red-500",    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",    text: "Critical" },
                high:     { bar: "bg-orange-500", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400", text: "High" },
                medium:   { bar: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400", text: "Medium" },
                low:      { bar: "bg-green-500",  badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",  text: "Low" },
              };
              const c = levelColors[risk.level] ?? levelColors.low;
              const domainIcons: Record<string, string> = { Network: "🌐", Endpoint: "💻", Identity: "🔑", Application: "⚙️", Compliance: "📋" };
              return (
                <div key={risk.domain} className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{domainIcons[risk.domain] ?? "🔒"}</span>
                      <span className="font-semibold text-slate-800 dark:text-white">{risk.domain}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-400">{risk.alertCount.toLocaleString()} alerts</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.badge}`}>{c.text}</span>
                      <span className="text-xl font-black text-slate-800 dark:text-white">{risk.score}<span className="text-sm font-normal text-slate-400">/100</span></span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${risk.score}%` }} />
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-slate-500">
                    <span>🔴 Critical: <strong className="text-red-600">{risk.criticalCount.toLocaleString()}</strong></span>
                    <span>🟠 High: <strong className="text-orange-500">{risk.highCount.toLocaleString()}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Attack Country Heatmap ────────────────────────────────── */}
        {selectedFeature === "Attack Country Heatmap" && (
          <div className="space-y-4">
            <div className="h-72 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
              {heatmapData === null ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">Loading map...</div>
              ) : (
                <WorldHeatmap data={heatmapData ?? []} />
              )}
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Rank</th>
                    <th className="px-4 py-3 text-left">Country</th>
                    <th className="px-4 py-3 text-left">Code</th>
                    <th className="px-4 py-3 text-right">Alert Count</th>
                    <th className="px-4 py-3 text-left">Sample IPs</th>
                  </tr>
                </thead>
                <tbody>
                  {(heatmapData ?? []).map((c: any, i: number) => (
                    <tr key={c.countryCode} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-bold text-slate-400">#{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{c.country}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono">{c.countryCode}</span></td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-800 dark:text-white">{c.count.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 font-mono">{(c.topIPs ?? []).join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Attack Method Distribution ────────────────────────────── */}
        {selectedFeature === "Attack Method Distribution" && (
          <div className="space-y-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attackMethods ?? []} layout="vertical" margin={{ top: 0, right: 30, left: 80, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.15} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={75} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" barSize={14} radius={[0, 4, 4, 0]}>
                    {(attackMethods ?? []).map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Rank</th>
                    <th className="px-4 py-3 text-left">Attack Method (rule.groups)</th>
                    <th className="px-4 py-3 text-right">Events</th>
                    <th className="px-4 py-3 text-right">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {(attackMethods ?? []).map((m: any, i: number) => {
                    const total = (attackMethods ?? []).reduce((a: number, b: any) => a + b.value, 0);
                    return (
                      <tr key={m.name} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3 font-bold text-slate-400">#{i + 1}</td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                          <span className="font-medium text-slate-700 dark:text-slate-300">{m.name}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-800 dark:text-white">{m.value.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{total > 0 ? Math.round(m.value / total * 100) : 0}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Top 10 Victim ─────────────────────────────────────────── */}
        {selectedFeature === "Top 10 Victim" && (
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Rank</th>
                  <th className="px-4 py-3 text-left">Agent / Host</th>
                  <th className="px-4 py-3 text-right">Alert Count</th>
                  <th className="px-4 py-3 text-right">Share (of top 10)</th>
                </tr>
              </thead>
              <tbody>
                {(topVictims ?? []).map((v: any, i: number) => {
                  const totalV = (topVictims ?? []).reduce((a: number, b: any) => a + b.count, 0);
                  return (
                    <tr key={v.name} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? "bg-red-100 text-red-600" : i === 1 ? "bg-orange-100 text-orange-600" : i === 2 ? "bg-yellow-100 text-yellow-600" : "bg-slate-100 text-slate-500"}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{v.name}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-800 dark:text-white">{v.count.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-2 w-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div className="h-full rounded-full bg-blue-500" style={{ width: `${totalV > 0 ? Math.round(v.count / totalV * 100) : 0}%` }} />
                          </div>
                          <span className="text-xs text-slate-400 w-8 text-right">{totalV > 0 ? Math.round(v.count / totalV * 100) : 0}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── AI Executive Summary ──────────────────────────────────── */}
        {selectedFeature === "AI Executive Summary" && (
          <div className="space-y-3">
            {(!aiSummary || aiSummary.length === 0) ? (
              <div className="flex h-40 items-center justify-center text-sm text-slate-400">No AI summary available</div>
            ) : aiSummary.map((line, idx) => (
              <div key={idx} className="flex gap-3 rounded-xl border border-purple-100 dark:border-purple-900/30 bg-purple-50 dark:bg-purple-900/10 p-4">
                <span className="text-purple-600 text-lg flex-shrink-0">☑</span>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{line}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Board Report ──────────────────────────────────────────── */}
        {selectedFeature === "Board Report" && boardReport && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-3xl font-black">
                {boardReport.securityScore}
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-blue-200">Overall Security Score</div>
                <div className="text-xl font-bold">{boardReport.securityScore >= 75 ? "Good Posture" : boardReport.securityScore >= 50 ? "Needs Attention" : "At Risk"}</div>
                <div className="text-sm text-blue-200">{boardReport.activeAgents}/{boardReport.totalAgents} agents active · Generated {new Date(boardReport.generatedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs text-blue-200">Period</div>
                <div className="text-lg font-bold">{boardReport.quarter}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Alerts",            val: boardReport.totalAlerts.toLocaleString(),               icon: "🔔", color: "text-orange-600" },
                { label: "Critical Alerts",         val: boardReport.criticalAlerts.toLocaleString(),            icon: "🔴", color: "text-red-600" },
                { label: "High Alerts",             val: boardReport.highAlerts.toLocaleString(),                icon: "🟠", color: "text-orange-500" },
                { label: "Total Vulnerabilities",   val: boardReport.totalVulnerabilities.toLocaleString(),      icon: "🛡️", color: "text-yellow-600" },
                { label: "Critical Vulns",          val: boardReport.criticalVulnerabilities.toLocaleString(),   icon: "⚠️", color: "text-red-600" },
                { label: "Compliance Coverage",     val: `${boardReport.compliancePct}%`,                        icon: "📋", color: "text-blue-600" },
                { label: "Top Risk Domain",         val: boardReport.topRisks?.[0]?.domain ?? "N/A",            icon: "🌐", color: "text-purple-600" },
                { label: "Top Attack Method",       val: boardReport.topAttackMethod,                           icon: "🎯", color: "text-indigo-600" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <div className="text-xs text-slate-400">{item.label}</div>
                    <div className={`font-bold ${item.color}`}>{item.val}</div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Compliance Framework Events</div>
              <div className="space-y-1.5">
                {(boardReport.complianceFrameworks ?? []).map((f: any) => (
                  <div key={f.name} className="flex items-center gap-3">
                    <span className="w-24 text-xs text-slate-600 dark:text-slate-400">{f.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(100, (f.value / Math.max(...(boardReport.complianceFrameworks ?? []).map((x: any) => x.value), 1)) * 100)}%` }} />
                    </div>
                    <span className="text-xs font-mono text-slate-500 w-16 text-right">{f.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Recent Critical Incidents ─────────────────────────────── */}
        {selectedFeature === "Recent Critical Incidents" && (
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            {(!incidents || incidents.length === 0) ? (
              <div className="flex h-40 items-center justify-center text-sm text-slate-400">No critical incidents</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-left">Incident</th>
                    <th className="px-4 py-3 text-left">Affected Asset</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((inc: any, i: number) => (
                    <tr key={i} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-xs">{new Date(inc.creationTime).toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{inc.name}</td>
                      <td className="px-4 py-3 text-slate-500">{inc.endpoint}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          inc.status === "Investigating" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" :
                          inc.status === "In Progress"   ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" :
                          inc.status === "Resolved"      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" :
                          "bg-slate-100 text-slate-700"
                        }`}>{inc.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
