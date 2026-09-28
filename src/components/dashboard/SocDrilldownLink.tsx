import Link from "next/link";
import type { ReactNode } from "react";

export type SocAnalyticsView = "severity" | "trend" | "status" | "aging" | "incidents" | "mitre" | "rules" | "iocs" | "alerts" | "countries" | "sources";

export function SocDrilldownLink({ view, label }: { view: SocAnalyticsView; label: string }) {
  return <div className="mt-3 flex min-h-8 shrink-0 items-end justify-end border-t border-slate-100 pt-2 dark:border-slate-800">
    <Link className="text-[11px] font-medium text-brand-blue hover:underline" href={`/dashboard/soc/analytics?view=${view}`}>{label} →</Link>
  </div>;
}

export function SocCardLayout({ children, view, label }: { children: ReactNode; view: SocAnalyticsView; label: string }) {
  return <div className="flex h-full min-h-0 flex-col">
    <div className="flex min-h-0 flex-1 flex-col justify-center">{children}</div>
    <SocDrilldownLink view={view} label={label} />
  </div>;
}
