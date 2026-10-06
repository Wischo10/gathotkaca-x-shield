"use client";

import { useState, type ReactNode } from "react";
import worldMap from "@svg-maps/world";
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Panel } from "@/components/ui/Panel";
import type { MsspAssetsDemoData, MsspDemoAsset } from "@/types/mssp";

const COLORS = ["#2563eb", "#8b5cf6", "#14b8a6", "#f97316", "#eab308", "#64748b"];
const RISK_COLORS: Record<string, string> = { High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e", Info: "#3b82f6" };
const PAGE_SIZE = 10;
const day = (value: string) => new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });
const dateTime = (value: string) => new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
const group = (assets: MsspDemoAsset[], key: keyof MsspDemoAsset, colors = COLORS) => [...new Set(assets.map((asset) => String(asset[key])))].map((name, index) => ({ name, value: assets.filter((asset) => String(asset[key]) === name).length, color: key === "riskLevel" ? RISK_COLORS[name] : colors[index % colors.length] }));

export function MsspAssets({ demo }: { demo: MsspAssetsDemoData }) {
  const [page, setPage] = useState(1), assets = demo.assets, total = assets.length;
  const managed = assets.filter((asset) => asset.managementStatus === "Managed").length, unmanaged = total - managed;
  const periodStart = Date.parse(demo.snapshotAt) - 6 * 86_400_000;
  const newAssets = assets.filter((asset) => Date.parse(asset.firstSeen) >= periodStart).length;
  const highRisk = assets.filter((asset) => asset.riskLevel === "High").length;
  const vulnerable = assets.filter((asset) => asset.vulnerabilityCount > 0).length;
  const kpis = [["Total Assets", total, [total - 5, total - 4, total - 3, total - 2, total]], ["Managed Assets", managed, [managed - 4, managed - 3, managed - 2, managed - 1, managed]], ["Unmanaged Assets", unmanaged, [unmanaged + 2, unmanaged + 2, unmanaged + 1, unmanaged + 1, unmanaged]], ["New Assets", newAssets, [1, 2, 1, 2, newAssets]], ["High Risk Assets", highRisk, [highRisk + 2, highRisk + 1, highRisk + 1, highRisk, highRisk]], ["Assets with Vulnerabilities", vulnerable, [vulnerable - 3, vulnerable - 2, vulnerable - 2, vulnerable - 1, vulnerable]]] as const;
  const timeline = Array.from({ length: 7 }, (_, index) => { const end = periodStart + index * 86_400_000; const visible = assets.filter((asset) => Date.parse(asset.firstSeen) <= end); const managedCount = visible.filter((asset) => asset.managementStatus === "Managed").length; return { date: day(new Date(end).toISOString()), total: visible.length, managed: managedCount, unmanaged: visible.length - managedCount }; });
  const ranked = [...assets].sort((a, b) => b.riskScore - a.riskScore), pages = Math.ceil(total / PAGE_SIZE), current = Math.min(page, pages), start = (current - 1) * PAGE_SIZE;
  return <div className="space-y-4">
    <header className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h1 className="text-xl font-semibold text-slate-800 dark:text-white">Assets</h1><DemoBadge /></div><p className="mt-1 text-sm text-slate-500">Demo asset inventory · Asset Management integration pending</p></div><p className="text-[10px] text-slate-400">Illustrative inventory only · No Wazuh or external asset source</p></header>
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">{kpis.map(([title, value, history]) => <Kpi key={title} title={title} value={value} history={[...history]} />)}</section>
    <section className="grid items-stretch gap-4 xl:grid-cols-12"><Box span="xl:col-span-3" title="Assets by Type"><Donut rows={group(assets, "assetType")} total={total} /></Box><Box span="xl:col-span-4" title="Assets Over Time"><Timeline rows={timeline} /></Box><Box span="xl:col-span-3" title="Assets by Operating System"><Donut rows={group(assets, "operatingSystem")} total={total} /></Box><Box span="xl:col-span-2" title="Assets by Risk Level"><Donut rows={group(assets, "riskLevel")} total={total} compact /></Box></section>
    <section className="grid items-stretch gap-4 xl:grid-cols-12"><Box span="xl:col-span-5" title="Top Assets by Risk Score"><RiskTable assets={ranked.slice(start, start + PAGE_SIZE)} demo={demo} start={start} total={total} page={current} pages={pages} onPage={setPage} /></Box><Box span="xl:col-span-3" title="Assets by Client"><Clients demo={demo} /></Box><Box span="xl:col-span-4" title="Assets by Location"><Locations assets={assets} /></Box></section>
    <section className="grid items-stretch gap-4 xl:grid-cols-12"><Box span="xl:col-span-3" title="Asset Inventory by Status"><Donut rows={group(assets, "lifecycleStatus")} total={total} /></Box><Box span="xl:col-span-6" title="Recent Asset Changes"><Changes demo={demo} /></Box><Box span="xl:col-span-3" title="Asset Discovery Sources"><Donut rows={group(assets, "discoverySource")} total={total} /></Box></section>
  </div>;
}

function DemoBadge() { return <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">Demo Data</span>; }
function Box({ span, title, children }: { span: string; title: string; children: ReactNode }) { return <div className={`min-w-0 ${span}`}><Panel title={title} action={<DemoBadge />}>{children}</Panel></div>; }
function Kpi({ title, value, history }: { title: string; value: number; history: number[] }) { const delta = history.at(-1)! - history[0]; return <article className="min-h-28 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex justify-between gap-2"><p className="truncate text-[11px] font-semibold text-slate-500">{title}</p><DemoBadge /></div><div className="mt-2 grid grid-cols-[1fr_4.5rem] items-end"><div><p className="text-xl font-bold text-slate-800 dark:text-white">{value}</p><p className={`text-[9px] ${delta >= 0 ? "text-emerald-600" : "text-rose-500"}`}>{delta >= 0 ? "↑" : "↓"} {Math.abs(delta)} <span className="text-slate-400">demo trend</span></p></div><div className="h-10"><ResponsiveContainer><LineChart data={history.map((point, index) => ({ index, point }))}><Line dataKey="point" stroke="#f59e0b" dot={false} strokeWidth={1.8} /></LineChart></ResponsiveContainer></div></div></article>; }
function Donut({ rows, total, compact = false }: { rows: Array<{ name: string; value: number; color: string }>; total: number; compact?: boolean }) { return <div className={`${compact ? "block" : "grid grid-cols-[8rem_1fr]"} min-h-52 items-center gap-2`}><div className="relative h-32"><ResponsiveContainer><PieChart><Pie data={rows} dataKey="value" innerRadius={40} outerRadius={58} strokeWidth={0}>{rows.map((row) => <Cell key={row.name} fill={row.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><strong className="text-xl">{total}</strong><span className="text-[8px] text-slate-400">Total Assets</span></div></div><div className="space-y-1.5">{rows.map((row) => <div key={row.name} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-1 text-[9px]"><i className="h-1.5 w-1.5 rounded-full" style={{ background: row.color }} /><span className="truncate text-slate-500">{row.name}</span><strong>{row.value}</strong><span className="w-8 text-right text-slate-400">{(row.value / total * 100).toFixed(0)}%</span></div>)}</div></div>; }
function Timeline({ rows }: { rows: Array<{ date: string; total: number; managed: number; unmanaged: number }> }) { return <div className="h-52"><ResponsiveContainer><LineChart data={rows} margin={{ top: 8, right: 8, left: -28 }}><XAxis dataKey="date" tick={{ fontSize: 8 }} /><YAxis tick={{ fontSize: 8 }} allowDecimals={false} /><Tooltip /><Line dataKey="total" name="Total Assets" stroke="#2563eb" strokeWidth={2} dot={false} /><Line dataKey="managed" name="Managed Assets" stroke="#22c55e" strokeWidth={1.8} dot={false} /><Line dataKey="unmanaged" name="Unmanaged Assets" stroke="#f97316" strokeWidth={1.8} dot={false} /></LineChart></ResponsiveContainer></div>; }
function RiskTable({ assets, demo, start, total, page, pages, onPage }: { assets: MsspDemoAsset[]; demo: MsspAssetsDemoData; start: number; total: number; page: number; pages: number; onPage: (page: number) => void }) { return <><Table width="650px" heads={["Asset Name", "Client", "Asset Type", "Risk Score", "Risk Level", "Last Seen"]}>{assets.map((asset) => <tr key={asset.id}><Td>{asset.assetName}</Td><Td>{demo.clients.find((client) => client.id === asset.clientId)?.name}</Td><Td>{asset.assetType}</Td><Td><strong>{asset.riskScore}</strong></Td><Td><Risk level={asset.riskLevel} /></Td><Td>{dateTime(asset.lastSeen)}</Td></tr>)}</Table><div className="flex items-center justify-between px-2 py-2 text-[9px] text-slate-400"><span>Showing {start + 1}-{Math.min(start + PAGE_SIZE, total)} of {total} assets</span><div className="flex gap-1"><button disabled={page === 1} onClick={() => onPage(page - 1)} className="rounded border px-2 py-1 disabled:opacity-40">Previous</button><button disabled={page === pages} onClick={() => onPage(page + 1)} className="rounded border px-2 py-1 disabled:opacity-40">Next</button></div></div></>; }
function Clients({ demo }: { demo: MsspAssetsDemoData }) { const rows = demo.clients.map((client) => { const assets = demo.assets.filter((asset) => asset.clientId === client.id), managed = assets.filter((asset) => asset.managementStatus === "Managed").length; return { name: client.name, total: assets.length, managed, unmanaged: assets.length - managed }; }).sort((a, b) => b.total - a.total).slice(0, 10); return <Table heads={["Client", "Total Assets", "Managed", "Unmanaged"]}>{rows.map((row) => <tr key={row.name}><Td title={row.name}>{row.name}</Td><Td><strong>{row.total}</strong></Td><Td>{row.managed}</Td><Td>{row.unmanaged}</Td></tr>)}</Table>; }
function Locations({ assets }: { assets: MsspDemoAsset[] }) {
  const rows = group(assets, "location");
  const positions: Record<string, { x: number; y: number; labelX: number; labelY: number }> = {
    Singapore: { x: 787, y: 420, labelX: 748, labelY: 401 },
    Jakarta: { x: 806, y: 454, labelX: 776, labelY: 485 },
    Surabaya: { x: 836, y: 462, labelX: 850, labelY: 488 },
    Tokyo: { x: 902, y: 294, labelX: 902, labelY: 266 },
    Sydney: { x: 904, y: 548, labelX: 904, labelY: 582 },
  };
  return <div className="flex min-h-60 items-center justify-center overflow-hidden px-1 py-2">
    <svg viewBox={worldMap.viewBox} role="img" aria-label="Demo asset distribution across world locations" className="block h-auto max-h-[21rem] w-full">
      <rect width="1010" height="666" rx="22" className="fill-slate-50 dark:fill-slate-950/30" />
      <g className="fill-slate-200 stroke-white stroke-[0.65] dark:fill-slate-700 dark:stroke-slate-800">{worldMap.locations.map((location: { id: string; path: string }) => <path key={location.id} d={location.path} />)}</g>
      {rows.map((row) => { const position = positions[row.name]; if (!position) return null; const radius = Math.max(18, Math.min(24, 15 + row.value * .45)); return <g key={row.name} className="cursor-default">
        <title>{row.name}{`\n`}{row.value} assets</title>
        <line x1={position.x} y1={position.y} x2={position.labelX} y2={position.labelY} className="stroke-blue-400/70" strokeWidth="2" />
        <circle cx={position.x} cy={position.y} r={radius + 3} className="fill-white/90 stroke-blue-200 dark:fill-slate-900/90 dark:stroke-blue-800" strokeWidth="2" />
        <circle cx={position.x} cy={position.y} r={radius} className="fill-blue-600/90" />
        <text x={position.x} y={position.y + 5} textAnchor="middle" className="fill-white text-[14px] font-bold">{row.value}</text>
        <rect x={position.labelX - 35} y={position.labelY - 13} width="70" height="23" rx="11" className="fill-white/95 stroke-slate-200 dark:fill-slate-900/95 dark:stroke-slate-700" />
        <text x={position.labelX} y={position.labelY + 3} textAnchor="middle" className="fill-slate-600 text-[11px] font-semibold dark:fill-slate-200">{row.name}</text>
      </g>; })}
    </svg>
  </div>;
}
function Changes({ demo }: { demo: MsspAssetsDemoData }) { return <Table width="600px" heads={["Time", "Asset Name", "Client", "Change", "Changed By"]}>{demo.changes.map((change) => { const asset = demo.assets.find((item) => item.id === change.assetId)!; return <tr key={change.id}><Td>{dateTime(change.changedAt)}</Td><Td>{asset.assetName}</Td><Td>{demo.clients.find((client) => client.id === asset.clientId)?.name}</Td><Td>{change.changeType}</Td><Td>{change.changedBy}</Td></tr>; })}</Table>; }
function Table({ heads, children, width = "100%" }: { heads: string[]; children: ReactNode; width?: string }) { return <div className="overflow-x-auto"><table className="w-full table-fixed text-left text-[9px]" style={{ minWidth: width }}><thead className="border-b bg-slate-50/80 text-slate-400 dark:bg-slate-950/40"><tr>{heads.map((head) => <th key={head} className="px-2 py-2 font-semibold">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{children}</tbody></table></div>; }
function Td({ children, title }: { children: ReactNode; title?: string }) { return <td title={title} className="truncate px-2 py-2 text-slate-600 dark:text-slate-300">{children}</td>; }
function Risk({ level }: { level: string }) { const classes = level === "High" ? "bg-red-100 text-red-700" : level === "Medium" ? "bg-amber-100 text-amber-700" : level === "Low" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"; return <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${classes}`}>{level}</span>; }
