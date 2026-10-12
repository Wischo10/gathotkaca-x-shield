import type { ReactNode } from "react";

export function StatCard({ label, value, icon, helper = "Data unavailable", badge }: { label: string; value: string; icon: ReactNode; helper?: string; badge?: string }) {
  return (
    <article className="flex min-h-36 min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm shadow-slate-200/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:min-h-40">
      <div className="flex min-h-8 items-center gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-brand-blue dark:bg-blue-950/60">{icon}</span><p className="min-w-0 flex-1 truncate text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>{badge && <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">{badge}</span>}</div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-800 dark:text-white sm:text-3xl">{value}</p>
      <p className="mt-1 break-words text-[11px] leading-tight text-slate-400">{helper}</p>
      <div className="mt-auto h-4 border-b border-dashed border-slate-200 dark:border-slate-800" aria-hidden="true" />
    </article>
  );
}
