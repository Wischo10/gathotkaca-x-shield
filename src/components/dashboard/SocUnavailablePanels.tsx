import { Panel } from "@/components/ui/Panel";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import worldMap from "@svg-maps/world";
import type { AttackCountryDetection, IncidentsBySeverity, SocTelemetry, TopIocDetection } from "@/types/soc";

type WorldMapGeometry = {
  viewBox: string;
  locations: Array<{ id: string; name: string; path: string }>;
};

const worldGeometry = worldMap as WorldMapGeometry;

function Unavailable({ message }: { message: string }) {
  return <div className="flex h-full min-h-40 flex-col items-center justify-center px-3 text-center"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:bg-slate-800">N/A</span><p className="mt-2 text-xs text-slate-400">{message}</p></div>;
}

function EmptyResult({ message }: { message: string }) {
  return <div className="flex h-full min-h-40 items-center justify-center px-3 text-center text-xs text-slate-400">{message}</div>;
}

export function AlertsByStatusPanel() { return <Panel title="Alerts by Status"><Unavailable message="Alert status data unavailable" /></Panel>; }

export function AlertAgingPanel({ telemetry }: { telemetry?: SocTelemetry }) {
  const labels: Record<string, string> = { "0-15m": "0-15 minutes", "15-60m": "15-60 minutes", "1-4h": "1-4 hours", "4-24h": "4-24 hours", ">24h": ">24 hours" };
  const max = Math.max(...(telemetry?.aging ?? []).map((bucket) => bucket.count), 1);
  return <Panel title="Alert Aging" action={<span title="Age since alert timestamp" className="text-[10px] font-medium text-slate-400">Age since alert timestamp</span>}><div className="flex h-full min-h-48 flex-col justify-center space-y-3">{telemetry ? telemetry.aging.map((bucket) => <div key={bucket.bucket} className="grid grid-cols-[6rem_1fr_auto] items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400"><span>{labels[bucket.bucket]}</span><span className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"><span className="block h-2 rounded-full bg-brand-blue" style={{ width: `${bucket.count / max * 100}%` }} /></span><span className="text-slate-500">{bucket.count.toLocaleString()} <span className="text-slate-400">({bucket.percentage}%)</span></span></div>) : <Unavailable message="Alert timestamp data unavailable" />}{telemetry && telemetry.aging.length === 0 && <p className="text-center text-[11px] text-slate-400">No alerts in this period</p>}</div></Panel>;
}

export function IncidentsBySeverityPanel({ data, unavailable = false }: { data?: IncidentsBySeverity; unavailable?: boolean }) {
  const resolved = unavailable ? undefined : data;
  const series = [{ label: "Critical", key: "critical" as const, color: "#E53935" }, { label: "High", key: "high" as const, color: "#F59E0B" }, { label: "Medium", key: "medium" as const, color: "#EAB308" }, { label: "Low", key: "low" as const, color: "#22C55E" }];
  const chart = resolved && resolved.classifiedIncidents > 0 ? series.map((item) => ({ name: item.label, value: resolved[item.key], color: item.color })) : [{ name: "No classified incidents", value: 1, color: "#e2e8f0" }];
  return <Panel title="Incidents by Severity" action={<span className="text-[10px] font-medium text-slate-400">Last 7 Days</span>}><div className="flex h-full min-h-48 items-center justify-center gap-5"><div className="relative h-28 w-28 shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chart} dataKey="value" innerRadius={42} outerRadius={55} stroke="none">{chart.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="text-center"><div className="text-xl font-semibold text-slate-700 dark:text-slate-200">{resolved ? resolved.totalIncidents.toLocaleString() : "N/A"}</div><div className="text-[10px] text-slate-400">Total incidents</div></div></div></div><ul className="min-w-0 space-y-2 text-xs">{series.map((item) => <li key={item.key} className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} /><span>{item.label}</span><span className="ml-auto pl-2 text-slate-400">{resolved ? `${resolved[item.key].toLocaleString()} / ${percentage(resolved[item.key], resolved.classifiedIncidents)}` : "N/A"}</span></li>)}{resolved && resolved.unclassifiedIncidents > 0 && <li className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><span className="h-2 w-2 rounded-full bg-slate-300" /><span>Unclassified</span><span className="ml-auto pl-2 text-slate-400">{resolved.unclassifiedIncidents.toLocaleString()}</span></li>}</ul></div></Panel>;
}

function percentage(value: number, denominator: number): string { return `${(denominator ? value / denominator * 100 : 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`; }

type DetectionSourceSlice = { source: string; count: number; percentage: number; color: string };

function DetectionSourceTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: DetectionSourceSlice }> }) {
  const slice = payload?.[0]?.payload;
  if (!active || !slice) return null;
  return <div className="rounded-md border border-slate-200 bg-white px-2.5 py-2 text-[10px] shadow-lg dark:border-slate-700 dark:bg-slate-900">
    <p className="font-semibold text-slate-700 dark:text-slate-200">{slice.source}</p>
    <p className="mt-0.5 text-slate-500 dark:text-slate-400">{slice.count.toLocaleString()} alerts</p>
    <p className="text-slate-500 dark:text-slate-400">{slice.percentage.toLocaleString(undefined, { maximumFractionDigits: 1 })}%</p>
  </div>;
}

export function MitreTacticsPanel({ telemetry }: { telemetry?: SocTelemetry }) {
  const max = Math.max(...(telemetry?.mitre ?? []).map((tactic) => tactic.count), 1);
  return <Panel title="MITRE ATT&CK Tactic Distribution"><div className="flex h-full min-h-48 items-end justify-between gap-1 border-b border-slate-200 px-1 pb-1 dark:border-slate-700">{telemetry?.mitre.map((tactic) => <div key={tactic.tactic} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"><span className="mb-1 text-[10px] text-slate-400">{tactic.count.toLocaleString()}</span><span className="w-3/5 rounded-t bg-brand-blue" style={{ height: `${Math.max(4, tactic.count / max * 72)}%` }} /><span className="mt-2 w-full truncate text-center text-[9px] text-slate-400" title={tactic.tactic}>{tactic.tactic}</span></div>)}{!telemetry && <Unavailable message="MITRE tactic data unavailable" />}{telemetry && telemetry.mitre.length === 0 && <EmptyResult message="No MITRE tactics in this period" />}</div></Panel>;
}

export function TopIocDetectionsPanel({ data, loading, unavailable }: { data: TopIocDetection[]; loading: boolean; unavailable: boolean }) {
  return <Panel title="Top IOC Detections"><div className="h-full min-h-48"><div className="grid grid-cols-[1fr_4rem_4rem] border-b border-slate-200 pb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-800"><span>IOC Value</span><span>Type</span><span className="text-right">Detections</span></div>
    {unavailable ? <Unavailable message="IOC correlation unavailable" /> : loading ? <EmptyResult message="Loading IOC detections…" /> : data.length === 0 ? <EmptyResult message="No confirmed IOC detections" /> :
      <div>{data.map((item) => <div key={item.iocValue} className="grid grid-cols-[1fr_4rem_4rem] border-b border-slate-100 py-2 text-xs dark:border-slate-800"><span className="truncate pr-2 text-slate-700 dark:text-slate-200" title={item.iocValue}>{item.iocValue}</span><span className="text-slate-500">{item.type}</span><span className="text-right font-medium text-slate-600 dark:text-slate-300">{item.detectionCount.toLocaleString()}</span></div>)}</div>}
  </div></Panel>;
}
export function AttackCountryPanel({ data, loading, unavailable }: { data: AttackCountryDetection[]; loading: boolean; unavailable: boolean }) {
  const max = Math.max(...data.map((country) => country.detectionCount), 1);
  const detectionsByCountry = new Map(data.map((country) => [country.countryCode.toLowerCase(), country.detectionCount]));
  const geometryCountryCodes = new Set(worldGeometry.locations.map((location) => location.id));
  const unmatchedCountryCodes = data
    .map((country) => country.countryCode)
    .filter((countryCode) => !geometryCountryCodes.has(countryCode.toLowerCase()));

  return <Panel title="Attack Country Heatmap">
    {unavailable ? <Unavailable message="Source geolocation unavailable" /> : loading ? <EmptyResult message="Loading attack countries…" /> : data.length === 0 ? <EmptyResult message="No confirmed attack-country data" /> :
      <div className="relative h-full min-h-48 w-full overflow-hidden">
        <svg aria-label="World map showing attack detections by country" className="block h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" viewBox={worldGeometry.viewBox}>
          {worldGeometry.locations.map((location) => {
            const detectionCount = detectionsByCountry.get(location.id);
            const intensity = detectionCount === undefined ? 0 : 0.25 + 0.75 * Math.sqrt(detectionCount / max);
            const fill = detectionCount === undefined
              ? "#E5E7EB"
              : intensity >= 0.9
                ? "#B91C1C"
                : intensity >= 0.7
                  ? "#EF4444"
                  : intensity >= 0.45
                    ? "#FCA5A5"
                    : "#FEE2E2";
            return <path key={location.id} className="transition-[filter] duration-150 hover:brightness-110" d={location.path} fill={fill} stroke="#ffffff" strokeWidth="0.7">
              <title>{detectionCount === undefined ? `${location.name}: no detections` : `${location.name}: ${detectionCount.toLocaleString()} detections`}</title>
            </path>;
          })}
        </svg>
        <span className="pointer-events-none absolute right-0 top-0 flex items-center gap-1 rounded bg-white/85 px-1.5 py-0.5 text-[9px] text-slate-500 backdrop-blur-sm dark:bg-slate-900/85 dark:text-slate-400" aria-label="Detection intensity legend">
          <span>Low</span>
          <span className="h-2 w-14 rounded-sm" style={{ backgroundImage: "linear-gradient(to right, #FEE2E2, #FCA5A5, #EF4444, #B91C1C)" }} />
          <span>High</span>
        </span>
        <span className="pointer-events-none absolute bottom-0 left-0 rounded bg-white/75 px-1 py-0.5 text-[8px] text-slate-400 dark:bg-slate-900/75" title="World geometry from MapSVG via SVG Maps (CC BY 4.0)">Map geometry CC BY 4.0</span>
        {unmatchedCountryCodes.length > 0 && <p className="absolute bottom-0 right-0 max-w-[55%] truncate rounded bg-white/85 px-1 py-0.5 text-[9px] text-slate-500 dark:bg-slate-900/85 dark:text-slate-400" title={unmatchedCountryCodes.join(", ")}>Unmatched: {unmatchedCountryCodes.join(", ")}</p>}
      </div>}
  </Panel>;
}
export function DetectionSourcesPanel({ telemetry, loading = false, unavailable = false }: { telemetry?: SocTelemetry; loading?: boolean; unavailable?: boolean }) {
  const data = unavailable ? undefined : telemetry?.detectionSources;
  const palette = ["#2563EB", "#0F766E", "#7C3AED", "#0369A1", "#4F46E5"];
  const sortedSources = [...(data?.sources ?? [])].sort((a, b) => b.count - a.count);
  const topSources = sortedSources.slice(0, 5);
  const othersCount = sortedSources.slice(5).reduce((sum, item) => sum + item.count, 0);
  const donutData: DetectionSourceSlice[] = [
    ...topSources.map((item, index) => ({ ...item, percentage: data?.classified ? item.count / data.classified * 100 : 0, color: palette[index] })),
    ...(othersCount > 0 ? [{ source: "Others", count: othersCount, percentage: data?.classified ? othersCount / data.classified * 100 : 0, color: "#94A3B8" }] : []),
  ];

  return <Panel title="Detection Sources" action={data ? <span className="text-[10px] font-medium text-slate-400">{data.coveragePercent.toLocaleString(undefined, { maximumFractionDigits: 1 })}% classified</span> : undefined}>
    {unavailable ? <Unavailable message="Detection source metadata unavailable" /> : loading ? <EmptyResult message="Loading detection sources…" /> : !data || data.sources.length === 0 ? <EmptyResult message="No detection source data" /> :
      <div className="flex h-full min-h-48 flex-col">
        <div className="grid min-h-0 flex-1 grid-cols-1 items-center gap-2 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
          <div className="relative mx-auto h-32 w-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="count" nameKey="source" innerRadius={43} outerRadius={60} paddingAngle={1} stroke="#ffffff" strokeWidth={1}>
                  {donutData.map((item) => <Cell key={item.source} fill={item.color} />)}
                </Pie>
                <Tooltip content={<DetectionSourceTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold leading-none text-slate-700 dark:text-slate-200">{data.classified.toLocaleString()}</span>
              <span className="mt-1 text-[9px] text-slate-400">Total Alerts</span>
            </div>
          </div>
          <ul className="min-w-0 space-y-1.5">
            {donutData.map((item) => <li key={item.source} className="flex min-w-0 items-center gap-1.5 text-[9px] text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="min-w-0 flex-1 truncate" title={item.source}>{item.source}</span>
              <span className="shrink-0 tabular-nums">{item.count.toLocaleString()} ({item.percentage.toLocaleString(undefined, { maximumFractionDigits: 1 })}%)</span>
            </li>)}
          </ul>
        </div>
        <div className="pt-1 text-right text-[10px] text-slate-400">Unclassified: {data.unclassified.toLocaleString()}</div>
      </div>}
  </Panel>;
}
