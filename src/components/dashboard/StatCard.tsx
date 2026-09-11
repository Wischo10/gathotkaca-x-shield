import type { ReactNode } from "react";

export function StatCard({ label, value, icon, helper = "Data unavailable" }: { label: string; value: string; icon: ReactNode; helper?: string }) {
  return (
    <article className="flex h-36 min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm shadow-slate-200/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:h-40">
      <div className="flex min-h-8 items-center gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-brand-blue dark:bg-blue-950/60">{icon}</span><p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p></div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-800 dark:text-white sm:text-3xl">{value}</p>
      <p className="mt-1 text-[11px] text-slate-400">{helper}</p>
      <div className="mt-auto h-4 border-b border-dashed border-slate-200 dark:border-slate-800" aria-hidden="true" />
    </article>
  );
}
