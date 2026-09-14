import { Panel } from "@/components/ui/Panel";
import type { SocTelemetry } from "@/types/soc";

export function TopRulesPanel({ telemetry }: { telemetry?: SocTelemetry }) {
  return <Panel title="Top 10 Alerting Rules" action={<span className="text-[10px] font-medium text-slate-400">Last 7 Days</span>}>
    <div className="h-full min-h-48">{telemetry ? telemetry.topRules.length > 0 ? <ul className="space-y-2.5">{telemetry.topRules.map((rule) => { const max = Math.max(...telemetry.topRules.map((item) => item.count), 1); return <li key={rule.id} className="text-sm"><div className="mb-1 flex items-center justify-between text-slate-600 dark:text-slate-300"><span className="truncate pr-2" title={rule.description}>{rule.id} — {rule.description}</span><span className="shrink-0 font-medium text-slate-800 dark:text-white">{rule.count.toLocaleString()}</span></div><div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-1.5 rounded-full bg-brand-blue" style={{ width: `${rule.count / max * 100}%` }} /></div></li>; })}</ul> : <div className="flex min-h-40 items-center justify-center text-xs text-slate-400">No alerting rules in this period</div> : <Unavailable />}</div>
  </Panel>;
}

function Unavailable() { return <div className="flex min-h-40 items-center justify-center text-center"><div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:bg-slate-800">N/A</span><p className="mt-2 text-xs text-slate-400">Alerting rule data unavailable</p></div></div>; }
