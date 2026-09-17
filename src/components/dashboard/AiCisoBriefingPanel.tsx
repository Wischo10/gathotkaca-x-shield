"use client";
import { useCallback, useEffect, useState } from "react";
import { Panel, PanelLoading } from "@/components/ui/Panel";
import type { AiCisoBriefing } from "@/types/ai-briefing";

type State={phase:"loading"}|{phase:"error";reason:string}|{phase:"ready";data:AiCisoBriefing};
export function AiCisoBriefingPanel(){
  const [state,setState]=useState<State>({phase:"loading"});
  const load=useCallback(async()=>{setState({phase:"loading"});try{const response=await fetch("/api/ciso/ai-briefing",{cache:"no-store"});const body=await response.json().catch(()=>null);if(!response.ok){setState({phase:"error",reason:body?.error||"AI provider did not return a grounded briefing."});return;}setState({phase:"ready",data:body.data});}catch{setState({phase:"error",reason:"AI provider could not be reached."});}},[]);
  useEffect(()=>{void load()},[load]);
  const freshness=(value:string|null|undefined)=>value?new Date(value).toLocaleString():"Unavailable";
  return <Panel title="AI CISO Briefing" action={<button type="button" disabled={state.phase==="loading"} onClick={load} className="text-xs font-medium text-brand-blue hover:underline disabled:opacity-50">{state.phase==="loading"?"Generating…":"Refresh / Regenerate"}</button>} className="flex h-full min-h-[320px] flex-col overflow-hidden xl:h-[340px]">
    {state.phase==="loading"&&<PanelLoading/>}
    {state.phase==="error"&&<div className="flex flex-1 flex-col items-center justify-center px-4 text-center"><div className="font-semibold text-slate-700 dark:text-slate-200">AI Briefing Unavailable</div><div className="mt-1 text-xs text-slate-500">{state.reason}</div><div className="mt-2 text-[10px] text-slate-400">No deterministic text is presented as AI output.</div></div>}
    {state.phase==="ready"&&<div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 text-xs">
      <section><h3 className="font-semibold text-slate-700 dark:text-slate-200">Executive Summary</h3><p className="mt-1 text-slate-600 dark:text-slate-300">{state.data.executiveSummary}</p></section>
      <section><h3 className="font-semibold text-slate-700 dark:text-slate-200">Grounded Observations</h3><ul className="mt-1 list-disc space-y-1 pl-4 text-slate-600 dark:text-slate-300">{state.data.keyObservations.map(item=><li key={`${item.factIds.join("-")}-${item.text}`}>{item.text}</li>)}</ul></section>
      <section><h3 className="font-semibold text-slate-700 dark:text-slate-200">Recommended Actions</h3><ul className="mt-1 list-disc space-y-1 pl-4 text-slate-600 dark:text-slate-300">{state.data.priorityActions.map(item=><li key={`${item.factIds.join("-")}-${item.text}`}>{item.text}</li>)}</ul><div className="mt-1 text-[10px] text-slate-400">Recommendations are AI-selected actions, not observed conditions.</div></section>
      <footer className="border-t border-slate-100 pt-2 text-[10px] text-slate-400 dark:border-slate-800">Generated {new Date(state.data.generatedAt).toLocaleString()} · Provider: Ollama · Model: {state.data.model}<div>{state.data.normalizedFacts.length} validated source facts · Facts and AI interpretation are kept separate</div><div>Source freshness: CISO {freshness(state.data.sourceFreshness.cisoMetrics)} · Compliance {freshness(state.data.sourceFreshness.compliance)}</div></footer>
    </div>}
  </Panel>;
}
