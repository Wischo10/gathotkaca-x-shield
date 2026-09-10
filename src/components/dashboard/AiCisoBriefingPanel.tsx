"use client";

import { useApiResult } from "@/hooks/useApiResult";
import { Panel, PanelEmpty, PanelLoading } from "@/components/ui/Panel";
import type { AiCisoBriefing } from "@/types/ai-briefing";

export function AiCisoBriefingPanel() {
  const state = useApiResult<AiCisoBriefing>("/api/ciso/ai-briefing");
  return <Panel title="AI CISO Briefing" className="flex h-full min-h-[320px] flex-col overflow-hidden xl:h-[340px]">
    {state.phase === "loading" && <PanelLoading />}
    {(state.phase === "error" || state.phase === "empty") && <PanelEmpty message="AI briefing temporarily unavailable" />}
    {state.phase === "ready" && <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 text-xs">
      <section><h3 className="font-semibold text-slate-700 dark:text-slate-200">Executive Summary</h3><p className="mt-1 text-slate-600 dark:text-slate-300">{state.data.executiveSummary}</p></section>
      <section><h3 className="font-semibold text-slate-700 dark:text-slate-200">Key Observations</h3><ul className="mt-1 list-disc space-y-1 pl-4 text-slate-600 dark:text-slate-300">{state.data.keyObservations.map(item => <li key={`${item.factIds.join("-")}-${item.text}`}>{item.text}</li>)}</ul></section>
      <section><h3 className="font-semibold text-slate-700 dark:text-slate-200">Priority Actions</h3><ul className="mt-1 list-disc space-y-1 pl-4 text-slate-600 dark:text-slate-300">{state.data.priorityActions.map(item => <li key={`${item.factIds.join("-")}-${item.text}`}>{item.text}</li>)}</ul></section>
      <footer className="border-t border-slate-100 pt-2 text-[10px] text-slate-400 dark:border-slate-800">
        Generated {new Date(state.data.generatedAt).toLocaleString()} · Model: {state.data.model}
        {state.data.generationMode === "grounded_factual_summary" && " · Mode: Grounded factual summary"}
      </footer>
    </div>}
  </Panel>;
}
