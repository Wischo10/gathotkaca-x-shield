"use client";

import { useState } from "react";
import { Panel, PanelError, PanelLoading } from "@/components/ui/Panel";
import { useApiResult } from "@/hooks/useApiResult";
import type { PdpEvidenceMatrixData, PdpEvidenceReadinessState } from "@/types/pdp";

const domains = ["Data Governance", "Security Controls", "Privacy Controls", "Personal Data Breach"];
const readinessStates: PdpEvidenceReadinessState[] = ["candidate_evidence_available", "verified_evidence_available", "awaiting_organizational_data", "incomplete_evidence", "insufficient_evidence", "evidence_registered", "evidence_pending_review", "unavailable"];
const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase());
const inputClass = "rounded border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900";

function Summary({name,value}:{name:string;value:string|number}) { return <div className="rounded border border-slate-200 p-2 dark:border-slate-800"><div className="text-[10px] text-slate-500">{name}</div><div className="text-lg font-bold">{value}</div></div>; }

export function PdpEvidenceReadinessMatrix({onSelect}:{onSelect:(id:string)=>void}) {
  const state = useApiResult<PdpEvidenceMatrixData>("/api/ciso/pdp/evidence-readiness");
  const [search,setSearch] = useState("");
  const [domain,setDomain] = useState("");
  const [readiness,setReadiness] = useState("");
  if (state.phase === "loading") return <Panel title="25-Control Evidence Readiness Matrix"><PanelLoading /></Panel>;
  if (state.phase !== "ready") return <Panel title="25-Control Evidence Readiness Matrix"><PanelError message="Evidence readiness sources are unavailable. No zero state is inferred." onRetry={state.reload} /></Panel>;

  const data = state.data;
  const needle = search.trim().toLowerCase();
  const rows = data.rows.filter(row => (!domain || row.domain === domain) && (!readiness || row.readiness === readiness) && (!needle || `${row.controlCode} ${row.controlName}`.toLowerCase().includes(needle)));
  const assessed = data.rows.filter(row => row.assessment !== "not_assessed").length;
  const action = (row: PdpEvidenceMatrixData["rows"][number]) => row.nextAction === "Add Processing Activity"
    ? <a href="#inventory-workspace" className="font-medium text-brand-blue hover:underline">{row.nextAction}</a>
    : <button type="button" onClick={() => onSelect(row.controlId)} className="font-medium text-brand-blue hover:underline">{row.nextAction}</button>;

  return <Panel title="25-Control Evidence Readiness Matrix" action={<span className="text-xs text-slate-400">Evidence readiness, not compliance</span>}>
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6"><Summary name="Total Controls" value={data.rows.length}/><Summary name="Assessed" value={assessed}/><Summary name="Assessment Coverage" value={`${data.rows.length ? Math.round(assessed/data.rows.length*100) : 0}%`}/><Summary name="Candidate Evidence" value={data.summary.candidate_evidence_available}/><Summary name="Awaiting Organizational Data" value={data.summary.awaiting_organizational_data}/><Summary name="Insufficient Evidence" value={data.summary.insufficient_evidence}/></div>
    <div className="mt-3 flex flex-wrap gap-2"><input aria-label="Search controls" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search control ID or name" className={`${inputClass} w-full sm:w-56`}/><select aria-label="Filter by domain" value={domain} onChange={event=>setDomain(event.target.value)} className={inputClass}><option value="">All domains</option>{domains.map(item=><option key={item}>{item}</option>)}</select><select aria-label="Filter by readiness" value={readiness} onChange={event=>setReadiness(event.target.value)} className={inputClass}><option value="">All readiness states</option>{readinessStates.map(item=><option key={item} value={item}>{label(item)}</option>)}</select><span className="self-center text-xs text-slate-400">Showing {rows.length} of {data.rows.length}</span></div>
    <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-xs"><thead className="border-b text-slate-500"><tr><th className="py-2 pr-3">Control</th><th className="pr-3">Regulatory Basis</th><th className="pr-3">Evidence Sources</th><th className="pr-3">Current Evidence / Missing</th><th className="pr-3">Evidence Readiness</th><th className="pr-3">Assessment</th><th>Next Action</th></tr></thead><tbody className="divide-y dark:divide-slate-800">{rows.map(row=><tr key={row.controlId} className="align-top"><td className="py-3 pr-3"><b>{row.controlCode}</b><div>{row.controlName}</div><div className="text-[10px] text-slate-400">{row.domain}</div></td><td className="max-w-48 pr-3"><div>{row.regulatoryBasis.join(", ")}</div><div className="mt-1 text-[10px] text-slate-400">{row.relationshipTypes.map(label).join(" / ")}</div></td><td className="max-w-44 pr-3"><div className="flex flex-wrap gap-1">{row.sourceTypes.map(source=><span key={source} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] dark:bg-slate-800">{source}</span>)}</div></td><td className="max-w-80 pr-3"><div>{row.currentEvidence}</div><details className="mt-1 text-slate-500"><summary className="cursor-pointer">Still required</summary><p className="mt-1">{row.missingEvidence}</p></details></td><td className="pr-3"><span className="rounded-full bg-blue-50 px-2 py-1 font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{label(row.readiness)}</span></td><td className="pr-3">{label(row.assessment)}</td><td>{action(row)}</td></tr>)}</tbody></table></div>
    <p className="mt-3 text-[11px] text-slate-400">Generated {new Date(data.generatedAt).toLocaleString()}. Readiness summarizes source-backed assessor evidence and never creates or selects an assessment.</p>
  </Panel>;
}
