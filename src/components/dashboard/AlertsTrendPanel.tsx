import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Panel } from "@/components/ui/Panel";
import { SocCardLayout } from "@/components/dashboard/SocDrilldownLink";
import type { SocTelemetry } from "@/types/soc";

export function AlertsTrendPanel({ telemetry, loading = false, unavailable = false }: { telemetry?: SocTelemetry; loading?: boolean; unavailable?: boolean }) {
  const data = telemetry?.trend.map((point) => ({ ...point, label: new Date(point.timestamp).toLocaleDateString([], { month: "short", day: "numeric", timeZone: "UTC" }) }));
  return <Panel title="Daily Wazuh Alerts (UTC)" action={<span className="text-[10px] font-medium text-slate-400">Last 7 Days</span>}>
    <SocCardLayout view="trend" label="View full analytics">
    <div className="flex h-48 flex-col">
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400">{[["Critical", "#ef4444"], ["High", "#f59e0b"], ["Medium", "#eab308"], ["Low", "#10b981"]].map(([label, color]) => <span key={label} className="flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />{label}</span>)}</div>
      <div className="mt-2 min-h-40 flex-1">{loading ? <State message="Loading alert history…" /> : unavailable ? <State message="Alert history unavailable" /> : telemetry && telemetry.totalAlerts === 0 ? <State message="No alerts in this period" /> : data ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.45} /><XAxis dataKey="label" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 9 }} tickLine={false} axisLine={false} /><Tooltip /><Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.65} name="Critical" /><Area type="monotone" dataKey="high" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.65} name="High" /><Area type="monotone" dataKey="medium" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.65} name="Medium" /><Area type="monotone" dataKey="low" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.65} name="Low" /></AreaChart></ResponsiveContainer> : <State message="Alert history unavailable" />}</div>
    </div>
    </SocCardLayout>
  </Panel>;
}

function State({ message }: { message: string }) { return <div className="flex h-full min-h-40 items-center justify-center text-center text-xs text-slate-400">{message}</div>; }
