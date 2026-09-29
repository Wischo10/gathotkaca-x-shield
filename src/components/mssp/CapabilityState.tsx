import { Panel } from "@/components/ui/Panel";

export function CapabilityState({ title, purpose, message, detail }: { title: string; purpose: string; message: string; detail: string }) {
  return <div className="mx-auto max-w-5xl space-y-4"><header><h1 className="text-xl font-semibold text-slate-800 dark:text-white">{title}</h1><p className="mt-1 text-sm text-slate-500">{purpose}</p></header><Panel title="Capability status" action={<span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800">Not Available</span>}><div className="flex min-h-48 items-center justify-center"><div className="max-w-2xl text-center"><p className="font-medium text-slate-700 dark:text-slate-200">{message}</p><p className="mt-2 text-sm text-slate-500">{detail}</p></div></div></Panel></div>;
}
