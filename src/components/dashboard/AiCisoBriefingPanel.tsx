"use client";

import { useCallback, useEffect, useState } from "react";
import { Panel, PanelLoading } from "@/components/ui/Panel";
import { CISO_DEMO_BRIEFING, type CisoDemoBriefing } from "@/services/ciso-demo-data-provider";
import type { AiCisoBriefing } from "@/types/ai-briefing";

type State =
  | { phase: "loading" }
  | { phase: "error"; reason: string }
  | { phase: "ready"; data: AiCisoBriefing }
  | { phase: "demo"; data: CisoDemoBriefing };

export function AiCisoBriefingPanel() {
  const [state, setState] = useState<State>({ phase: "loading" });
  const load = useCallback(async () => {
    setState({ phase: "loading" });
    try {
      const response = await fetch("/api/ciso/ai-briefing", { cache: "no-store" });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        if (body?.code === "ai_briefing_not_configured") {
          setState({ phase: "demo", data: CISO_DEMO_BRIEFING });
          return;
        }
        setState({ phase: "error", reason: body?.error || "AI provider did not return a grounded briefing." });
        return;
      }
      setState({ phase: "ready", data: body.data });
    } catch {
      setState({ phase: "error", reason: "AI provider could not be reached." });
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return <Panel
    title="AI CISO Briefing"
    action={<div className="flex items-center gap-2">
      {state.phase === "demo" && <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">DEMO DATA</span>}
      <button type="button" disabled={state.phase === "loading"} onClick={load} className="text-xs font-medium text-brand-blue hover:underline disabled:opacity-50">{state.phase === "loading" ? "Generating…" : "Refresh / Regenerate"}</button>
    </div>}
    className="flex h-full min-h-[320px] flex-col overflow-hidden xl:h-[340px]"
  >
    {state.phase === "loading" && <PanelLoading />}
    {state.phase === "error" && <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <div className="font-semibold text-slate-700 dark:text-slate-200">AI Briefing Unavailable</div>
      <div className="mt-1 text-xs text-slate-500">{state.reason}</div>
      <div className="mt-2 text-[10px] text-slate-400">No deterministic text is presented as AI output.</div>
    </div>}
    {state.phase === "ready" && <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 text-xs">
      <section><h3 className="font-semibold text-slate-700 dark:text-slate-200">Executive Summary</h3><p className="mt-1 text-slate-600 dark:text-slate-300">{state.data.executiveSummary}</p></section>
      <section><h3 className="font-semibold text-slate-700 dark:text-slate-200">Grounded Observations</h3><ul className="mt-1 list-disc space-y-1 pl-4 text-slate-600 dark:text-slate-300">{state.data.keyObservations.map(item => <li key={`${item.factIds.join("-")}-${item.text}`}>{item.text}</li>)}</ul></section>
      <section><h3 className="font-semibold text-slate-700 dark:text-slate-200">Recommended Actions</h3><ul className="mt-1 list-disc space-y-1 pl-4 text-slate-600 dark:text-slate-300">{state.data.priorityActions.map(item => <li key={`${item.factIds.join("-")}-${item.text}`}>{item.text}</li>)}</ul><div className="mt-1 text-[10px] text-slate-400">Recommendations are AI-selected actions, not observed conditions.</div></section>
      <footer className="border-t border-slate-100 pt-2 text-[10px] text-slate-400 dark:border-slate-800">Briefing generated {new Date(state.data.generatedAt).toLocaleString()} · Provider: Ollama · Model: {state.data.model}<div>{state.data.normalizedFacts.length} validated source facts · Facts and AI interpretation are kept separate</div></footer>
    </div>}
    {state.phase === "demo" && <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 text-xs">
      <p className="rounded-lg border border-amber-200 bg-amber-50/70 p-2 text-[10px] leading-4 text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-300">AI integration is not configured. This deterministic preview is synthetic and is not generated from live dashboard telemetry.</p>
      <section><h3 className="font-semibold text-slate-700 dark:text-slate-200">Executive Summary</h3><p className="mt-1 text-slate-600 dark:text-slate-300">{state.data.executiveSummary}</p></section>
      <section><h3 className="font-semibold text-slate-700 dark:text-slate-200">Example Observations</h3><ul className="mt-1 list-disc space-y-1 pl-4 text-slate-600 dark:text-slate-300">{state.data.observations.map(item => <li key={item}>{item}</li>)}</ul></section>
      <section><h3 className="font-semibold text-slate-700 dark:text-slate-200">Example Priority Actions</h3><ul className="mt-1 list-disc space-y-1 pl-4 text-slate-600 dark:text-slate-300">{state.data.priorityActions.map(item => <li key={item}>{item}</li>)}</ul></section>
      <footer className="border-t border-slate-100 pt-2 text-[10px] text-slate-400 dark:border-slate-800">{state.data.id} · deterministic session-independent preview · no AI provider response</footer>
    </div>}
  </Panel>;
}
