"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Panel } from "@/components/ui/Panel";
import type { AlertsBySeverity, Severity } from "@/types/soc";

const SERIES: Array<{ key: Severity; label: string; color: string }> = [
  { key: "critical", label: "Critical", color: "#E53935" },
  { key: "high", label: "High", color: "#F59E0B" },
  { key: "medium", label: "Medium", color: "#EAB308" },
  { key: "low", label: "Low", color: "#22C55E" },
];

export function AlertsBySeverityPanel({ data, unavailable = false }: { data?: AlertsBySeverity; unavailable?: boolean }) {
  const resolved = unavailable ? null : data ?? null;
  const chartData = resolved && resolved.total > 0
    ? SERIES.map((series) => ({ name: series.label, value: resolved[series.key], color: series.color }))
    : [{ name: "No alerts", value: 1, color: "#e2e8f0" }];

  return <Panel title="Alerts by Severity" action={<span className="text-[10px] font-medium text-slate-400">Last 7 Days</span>}>
    <div className="flex h-full min-h-48 items-center justify-center gap-5">
      <div className="relative h-28 w-28 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart><Pie data={chartData} dataKey="value" innerRadius={42} outerRadius={55} stroke="none">{chartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie></PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="text-center"><div className="text-xl font-semibold text-slate-700 dark:text-slate-200">{resolved ? resolved.totalAlerts.toLocaleString() : "N/A"}</div><div className="text-[10px] text-slate-400">Total alerts</div></div></div>
      </div>
      <ul className="min-w-0 space-y-2 text-xs">{SERIES.map(({ key, label, color }) => <li key={key} className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} /><span>{label}</span><span className="ml-auto pl-2 text-right text-slate-400">{resolved ? `${resolved[key].toLocaleString()} / ${formatPercentage(resolved.percentages[key])}` : "N/A"}</span></li>)}</ul>
    </div>
  </Panel>;
}

function formatPercentage(value: number): string {
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
}
