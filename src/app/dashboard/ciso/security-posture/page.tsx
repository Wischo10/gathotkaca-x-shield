"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Panel } from "@/components/ui/Panel";
import { useSidebarToggle } from "@/context/sidebar-context";
import { NIST_FUNCTIONS, type NistPostureAssessment } from "@/types/ciso";

const endpoint = "/api/ciso/security-posture/assessments";

export default function SecurityPostureAssessmentPage() {
  const openSidebar = useSidebarToggle();
  const [assessment, setAssessment] = useState<NistPostureAssessment | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [unavailableStatus, setUnavailableStatus] = useState("");
  const [selectedFunction, setSelectedFunction] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function load() {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const result = await response.json();
      if (response.status === 503) {
        setAssessment(null); setMessage(""); setError(""); setUnavailableStatus("Assessment storage unavailable"); return;
      }
      if (!response.ok) throw new Error(result.error || "Unable to load assessments.");
      setUnavailableStatus(""); setAssessment(result.data);
    } catch {
      setAssessment(null); setError(""); setUnavailableStatus("Assessment storage unavailable");
    }
  }
  useEffect(() => { void load(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assessment || saving) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    setSaving(true); setError(""); setMessage("");
    try {
      const response = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ function: fields.get("function"), score: Number(fields.get("score")), notes: fields.get("notes") }),
      });
      const result = await response.json();
      if (response.status === 503) {
        setAssessment(null); setUnavailableStatus(result.error || "Assessment storage unavailable"); return;
      }
      if (!response.ok) throw new Error(result.error || "Unable to save assessment.");
      form.reset(); setSelectedFunction("");
      setMessage("Assessment recorded. The latest function data is now available to the CISO dashboard.");
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to save assessment."); }
    finally { setSaving(false); }
  }

  function openForm(name: typeof NIST_FUNCTIONS[number]) {
    setSelectedFunction(name);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => formRef.current?.querySelector<HTMLInputElement>('input[name="score"]')?.focus(), 300);
  }

  const inputClass = "mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900";
  return <>
    <Topbar title="Security Posture Assessment" subtitle="Record an evidence-based NIST CSF 2.0 function assessment" onMenuClick={openSidebar} />
    <main className="flex-1 space-y-4 bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
      <Link href="/dashboard/ciso" className="text-sm text-brand-blue hover:underline">Back to CISO dashboard</Link>
      <Panel title="NIST CSF 2.0 Functions" action={<span className="text-xs text-slate-400">Manual assessments only</span>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm" aria-label="NIST CSF function assessments">
            <thead className="text-xs text-slate-500"><tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-2 font-medium">Function</th><th className="py-2 text-center font-medium">Current Score</th>
              <th className="py-2 font-medium">Assessment Status</th><th className="py-2 font-medium">Last Assessed</th>
              <th className="py-2 font-medium">Trend</th><th className="py-2 font-medium">Latest Rationale / Notes</th>
              <th className="py-2 text-right font-medium">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {NIST_FUNCTIONS.map(name => {
                const domain = assessment?.domains.find(item => item.name === name);
                const assessed = domain?.score !== null && domain?.score !== undefined;
                const summary = [domain?.notes?.trim(), domain?.evidence?.trim()].filter((value): value is string => Boolean(value)).join(" • ") || "—";
                return <tr key={name}>
                  <td className="py-3 font-medium text-slate-700 dark:text-slate-200">{name}</td>
                  <td className="py-3 text-center font-semibold">{assessed ? `${domain.score}%` : "N/A"}</td>
                  <td className="py-3 text-slate-500">{assessed ? "Assessed" : "Not Assessed"}</td>
                  <td className="py-3 text-slate-500">{domain?.assessedAt ? new Date(domain.assessedAt).toLocaleString() : "—"}</td>
                  <td className="py-3 text-slate-500">{domain?.trend30d === null || domain?.trend30d === undefined ? "—" : `${domain.trend30d > 0 ? "+" : ""}${domain.trend30d} pp`}</td>
                  <td className="max-w-xs whitespace-normal py-3 pr-3 text-slate-500">{summary}</td>
                  <td className="py-3 text-right"><button type="button" onClick={() => openForm(name)} className="text-brand-blue hover:underline">{assessed ? "Update" : "Assess"}</button></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="max-w-xl">
        <Panel title="New Assessment" action={<span className="text-xs text-slate-400">Manual NIST CSF 2.0 Assessment</span>}>
          <p className="mb-4 text-xs text-slate-500">Each explicit submission records a manual assessment using your authenticated identity and the current server time. The score is never inferred from telemetry.</p>
          {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
          {message && <p role="status" className="mb-3 text-sm text-green-600">{message}</p>}
          {unavailableStatus && <p role="alert" className="mb-3 text-sm text-red-600">{unavailableStatus}</p>}
          {!assessment && !error && !unavailableStatus && <p className="text-sm text-slate-500">Checking assessment access...</p>}
          <form ref={formRef} onSubmit={submit}>
            <fieldset disabled={!assessment || saving} className="space-y-3 disabled:opacity-50">
              <label className="block text-xs">NIST function<select name="function" required value={selectedFunction} onChange={event => setSelectedFunction(event.target.value)} className={inputClass}><option value="" disabled>Select function</option>{NIST_FUNCTIONS.map(name => <option key={name}>{name}</option>)}</select></label>
              <label className="block text-xs">Score (0–100, whole number)<input name="score" type="number" required min="0" max="100" step="1" defaultValue="" inputMode="numeric" className={inputClass} /></label>
              <div className="rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300" aria-label="Score guidance">
                <p className="mb-1 font-medium">Score guidance only</p>
                <p>0–20 = Very weak / largely absent</p><p>21–40 = Weak / limited implementation</p><p>41–60 = Moderate / partially implemented</p><p>61–80 = Strong / mostly implemented</p><p>81–100 = Very strong / consistently implemented</p>
              </div>
              <label className="block text-xs">Rationale / Notes (required)<textarea name="notes" required maxLength={10000} rows={4} placeholder="Explain why the selected score is justified." className={inputClass} /></label>
              <button type="submit" disabled={!assessment || saving} className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-slate-400">{saving ? "Recording..." : "Submit assessment"}</button>
            </fieldset>
          </form>
        </Panel>
      </div>
    </main>
  </>;
}
