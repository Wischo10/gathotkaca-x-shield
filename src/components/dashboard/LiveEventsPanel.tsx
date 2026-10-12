import { Panel } from "@/components/ui/Panel";
import { SocCardLayout } from "@/components/dashboard/SocDrilldownLink";
import type { SocTelemetry } from "@/types/soc";

export function LiveEventsPanel({ telemetry, loading = false, unavailable = false }: { telemetry?: SocTelemetry; loading?: boolean; unavailable?: boolean }) {
  return <Panel title="Recent Alerts (Last 10)">
    <SocCardLayout view="alerts" label="View all alerts">
    <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead><tr className="border-b border-slate-200 text-[10px] uppercase tracking-wide text-slate-400 dark:border-slate-800"><th className="py-2 pr-3 font-semibold">Time</th><th className="py-2 pr-3 font-semibold">Event</th><th className="py-2 pr-3 font-semibold">Agent</th><th className="py-2 pr-3 font-semibold">Severity</th><th className="py-2 pr-3 font-semibold">Rule</th><th className="py-2 font-semibold">Asset / User</th></tr></thead><tbody>{telemetry?.liveEvents.map((event) => <tr key={event.id} className="border-b border-slate-100 dark:border-slate-800"><td className="py-2 pr-3 text-slate-500">{event.time ? new Date(event.time).toLocaleTimeString() : "-"}</td><td className="py-2 pr-3 text-slate-700 dark:text-slate-200">{event.event}</td><td className="py-2 pr-3 text-slate-500">{event.source}</td><td className="py-2 pr-3 capitalize">{event.severity}</td><td className="py-2 pr-3 text-slate-500">{event.rule}</td><td className="py-2 text-slate-500">{event.assetOrUser}</td></tr>)}</tbody></table>{loading && <State message="Loading recent alerts…" />}{unavailable && <State message="Recent Wazuh alerts unavailable" />}{!loading && !unavailable && telemetry && telemetry.liveEvents.length === 0 && <State message="No recent alerts" />}</div>
    </SocCardLayout>
  </Panel>;
}

function State({ message }: { message: string }) { return <div className="flex min-h-44 items-center justify-center text-center text-xs text-slate-400">{message}</div>; }
