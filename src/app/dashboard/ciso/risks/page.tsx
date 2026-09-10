"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Panel, PanelEmpty } from "@/components/ui/Panel";
import { useSidebarToggle } from "@/context/sidebar-context";
import type { RiskRecord } from "@/types/risk";
import type { RiskEvidenceResponse, RiskEvidenceSuggestion } from "@/types/risk-evidence";

const endpoint = "/api/ciso/risks";

const businessContextFields = [
  ["title", "Risk title"],
  ["scenarioDescription", "Scenario description"], ["businessService", "Business service"],
  ["businessUnit", "Business unit"],
] as const;

const evidenceFields = [
  ["threatNarrative", "Threat narrative"], ["vulnerabilityNarrative", "Vulnerability narrative"],
] as const;

const assessmentFields = [
  ["likelihood", "Likelihood (manual assessment)"],
  ["likelihoodRationale", "Likelihood rationale"], ["impact", "Impact (manual assessment)"],
  ["impactRationale", "Impact rationale"], ["inherentRisk", "Inherent risk (manual assessment)"],
  ["residualRisk", "Residual risk (manual assessment)"], ["severity", "Severity (manual assessment)"],
] as const;

const treatmentFields = [
  ["treatmentStrategy", "Treatment strategy"], ["treatmentStatus", "Treatment status"],
  ["treatmentOwner", "Treatment owner"], ["treatmentAction", "Treatment action"],
] as const;

const multiline = new Set([
  "scenarioDescription", "threatNarrative", "vulnerabilityNarrative",
  "likelihoodRationale", "impactRationale", "treatmentAction", "notes",
]);

export default function RiskRegisterPage() {
  const openSidebar = useSidebarToggle();
  const [risks, setRisks] = useState<RiskRecord[]>([]);
  const [storageAvailable, setStorageAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [evidence, setEvidence] = useState<RiskEvidenceResponse | null>(null);
  const [reviewingReference, setReviewingReference] = useState("");
  const [assessmentStatus, setAssessmentStatus] = useState<"needs_assessment" | "assessed">("needs_assessment");
  const [editingRiskId, setEditingRiskId] = useState<string | null>(null);

  async function load() {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const result = await response.json();
      if (response.status === 503) {
        setRisks([]); setStorageAvailable(false); setError("");
        return;
      }
      if (!response.ok) throw new Error(result.error || "Unable to load the risk register.");
      setRisks(result.data.items); setStorageAvailable(true); setError("");
    } catch {
      setRisks([]); setStorageAvailable(false); setError("");
    }
  }

  useEffect(() => { void load(); }, []);

  useEffect(() => {
    fetch(`${endpoint}/evidence-suggestions`, { cache: "no-store" })
      .then(async response => response.ok ? response.json() : Promise.reject())
      .then(result => setEvidence(result.data))
      .catch(() => setEvidence({ suggestions: [], sources: { wazuh: { available: false }, bitdefender: { available: false } } }));
  }, []);

  function reviewAsRisk(item: RiskEvidenceSuggestion) {
    const form = document.getElementById("new-risk-assessment") as HTMLFormElement | null;
    if (!form) return;
    const narrativeName = item.kind === "vulnerability" ? "vulnerabilityNarrative" : "threatNarrative";
    const narrative = form.elements.namedItem(narrativeName) as HTMLTextAreaElement | null;
    const threatNarrative = form.elements.namedItem("threatNarrative") as HTMLTextAreaElement | null;
    const vulnerabilityNarrative = form.elements.namedItem("vulnerabilityNarrative") as HTMLTextAreaElement | null;
    const notes = form.elements.namedItem("notes") as HTMLTextAreaElement | null;
    const facts = [
      item.affectedAssetCount !== null ? `${item.affectedAssetCount} affected asset(s)` : null,
      item.affectedAsset ? `affected endpoint ${item.affectedAsset}` : null,
      item.observedAt ? `oldest detection ${item.observedAt}` : null,
      item.slaState ? `SLA state ${item.slaState}` : null,
      item.status ? `source status ${item.status}` : null,
    ].filter((fact): fact is string => fact !== null);
    if (threatNarrative) threatNarrative.value = "";
    if (vulnerabilityNarrative) vulnerabilityNarrative.value = "";
    if (narrative) narrative.value = `${item.sourceReference}: ${item.summary}${facts.length ? ` ${facts.join("; ")}.` : ""}`;
    if (notes) notes.value = `Technical evidence source: ${item.source}; reference: ${item.sourceReference}; collected: ${item.collectedAt}${facts.length ? `; ${facts.join("; ")}` : ""}.`;
    setReviewingReference(item.sourceReference);
    setEditingRiskId(null);
    setAssessmentStatus("needs_assessment");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function completeAssessment(risk: RiskRecord) {
    const form = document.getElementById("new-risk-assessment") as HTMLFormElement | null;
    if (!form) return;
    for (const [name, value] of Object.entries(risk)) {
      const field = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
      if (field && typeof value === "string") field.value = value;
    }
    setEditingRiskId(risk.id);
    setReviewingReference(risk.riskCode);
    setAssessmentStatus("assessed");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!storageAvailable || saving) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const body = Object.fromEntries([...fields.entries()].map(([key, value]) => [key, value === "" ? null : value]));
    body.assessmentStatus = assessmentStatus;
    if (editingRiskId) {
      body.id = editingRiskId;
      const existingRiskCode = risks.find(risk => risk.id === editingRiskId)?.riskCode;
      if (existingRiskCode) body.riskCode = existingRiskCode;
    }
    setSaving(true); setError(""); setMessage("");
    try {
      const response = await fetch(endpoint, {
        method: editingRiskId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const result = await response.json();
      if (response.status === 503) {
        setStorageAvailable(false); setError("");
        return;
      }
      if (!response.ok) throw new Error(result.error || "Unable to save the risk assessment.");
      form.reset();
      setReviewingReference("");
      setEditingRiskId(null);
      setAssessmentStatus("needs_assessment");
      setMessage("Risk assessment recorded in the authoritative risk register.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save the risk assessment.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900";
  const coreInputFields = new Set(["title", "scenarioDescription", "threatNarrative", "vulnerabilityNarrative"]);
  const renderField = ([name, label]: readonly [string, string]) => (
    <label key={name} className={multiline.has(name) ? "block sm:col-span-2" : "block"}>
      <span className="text-xs text-slate-600 dark:text-slate-300">{label}</span>
      {multiline.has(name)
        ? <textarea name={name} required={coreInputFields.has(name) || assessmentStatus === "assessed"} maxLength={10000} rows={3} className={inputClass} />
        : <input name={name} required={coreInputFields.has(name) || assessmentStatus === "assessed"} maxLength={10000} className={inputClass} />}
    </label>
  );

  return <>
    <Topbar title="Risk Register" subtitle="Human-governed business risk assessments" onMenuClick={openSidebar} />
    <main className="flex-1 space-y-4 bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
      <Link href="/dashboard/ciso" className="text-sm text-brand-blue hover:underline">Back to CISO dashboard</Link>

      <Panel title="Risk Register" action={<span className="text-xs text-slate-400">{storageAvailable === true ? `${risks.length} Total Risks · ${risks.filter(risk => risk.assessmentStatus === "needs_assessment").length} Needs Assessment · ${risks.filter(risk => risk.assessmentStatus === "assessed").length} Assessed` : "Manual risk assessments only"}</span>}>
        {storageAvailable === null && <p className="py-8 text-center text-sm text-slate-400">Checking risk storage...</p>}
        {storageAvailable === false && <PanelEmpty message="Risk storage unavailable" />}
        {storageAvailable === true && risks.length === 0 && <PanelEmpty message="0 Total Risks — no risk assessments recorded." />}
        {storageAvailable === true && risks.length > 0 && <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-xs">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
              <tr><th className="py-2">Risk</th><th>Status</th><th>Service / Unit</th><th>Manual Assessment</th><th>Owner</th><th>Treatment</th><th>Due / Review</th><th>Source</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {risks.map(risk => <tr key={risk.id}>
                <td className="py-3 pr-4"><div className="font-semibold">{risk.riskCode}: {risk.title}</div><div className="mt-1 max-w-xs text-slate-500">{risk.scenarioDescription}</div></td>
                <td className="pr-4"><span className={risk.assessmentStatus === "assessed" ? "rounded bg-green-100 px-2 py-1 text-green-700" : "rounded bg-amber-100 px-2 py-1 text-amber-700"}>{risk.assessmentStatus === "assessed" ? "Assessed" : "Needs Assessment"}</span>{risk.assessmentStatus === "needs_assessment" && <button type="button" onClick={() => completeAssessment(risk)} className="mt-2 block text-brand-blue hover:underline">Complete Assessment</button>}</td>
                <td className="pr-4"><div>{risk.businessService ?? "N/A"}</div><div className="text-slate-500">{risk.businessUnit ?? "N/A"}</div></td>
                <td className="pr-4"><div>Likelihood: {risk.likelihood ?? "Not Assessed"}</div><div>Impact: {risk.impact ?? "Not Assessed"}</div><div>Inherent: {risk.inherentRisk ?? "Not Assessed"}</div><div>Residual: {risk.residualRisk ?? "Not Assessed"}</div><div>Severity: {risk.severity ?? "Not Assessed"}</div></td>
                <td className="pr-4">{risk.riskOwner ?? "N/A"}</td>
                <td className="max-w-xs pr-4"><div>{risk.treatmentStrategy ?? "Not Assessed"} · {risk.treatmentStatus ?? "Not Assessed"}</div><div className="text-slate-500">{risk.treatmentOwner ?? "N/A"}: {risk.treatmentAction ?? "N/A"}</div></td>
                <td className="pr-4"><div>Due: {risk.dueDate ?? "N/A"}</div><div>Review: {risk.reviewDate ?? "N/A"}</div></td>
                <td>{risk.assessmentSource === "manual_risk_assessment" ? "Manual risk assessment" : risk.assessmentSource}</td>
              </tr>)}
            </tbody>
          </table>
        </div>}
      </Panel>

      <Panel title="Risk Evidence Suggestions" action={<span className="text-xs text-slate-400">Read-only telemetry</span>}>
        <p className="mb-4 text-sm text-slate-500">Security telemetry that may support a risk assessment. Review and business context are required before creating a risk.</p>
        {!evidence && <p className="py-6 text-center text-sm text-slate-400">Loading real telemetry...</p>}
        {evidence && <>
          <div className="mb-3 flex gap-3 text-xs text-slate-500">
            {!evidence.sources.wazuh.available && <span>Wazuh vulnerability evidence unavailable</span>}
            {!evidence.sources.bitdefender.available && <span>Bitdefender incident evidence unavailable</span>}
          </div>
          {evidence.suggestions.length === 0 ? <PanelEmpty message="No telemetry evidence suggestions available." /> :
            <div className="grid gap-3 lg:grid-cols-2">{evidence.suggestions.map(item =>
              <article key={item.id} className="rounded border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex items-start justify-between gap-2"><span className="rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">{item.source}</span><button type="button" onClick={() => reviewAsRisk(item)} className="text-sm text-brand-blue hover:underline">Review as Risk</button></div>
                <p className="mt-2 text-sm font-medium">{item.summary}</p>
                <div className="mt-2 text-xs text-slate-500">Reference: {item.sourceReference}</div>
                {item.technicalSeverity && <div className="text-xs text-slate-500">Technical severity: {item.technicalSeverity}</div>}
                {item.affectedAssetCount !== null && <div className="text-xs text-slate-500">Affected assets: {item.affectedAssetCount}</div>}
                {item.affectedAsset && <div className="text-xs text-slate-500">Affected endpoint: {item.affectedAsset}</div>}
                {item.observedAt && <div className="text-xs text-slate-500">Oldest observed/detection: {new Date(item.observedAt).toLocaleString()}</div>}
                {item.slaState && <div className="text-xs text-slate-500">SLA: {item.slaState}</div>}
                {item.status && <div className="text-xs text-slate-500">Status: {item.status}</div>}
                {item.alertCount !== null && <div className="text-xs text-slate-500">Alerts: {item.alertCount}</div>}
                {item.attackTypes.length > 0 && <div className="text-xs text-slate-500">Attack types: {item.attackTypes.join(", ")}</div>}
                <div className="text-xs text-slate-500">Collected: {new Date(item.collectedAt).toLocaleString()}</div>
              </article>)}</div>}
        </>}
      </Panel>

      <form id="new-risk-assessment" onSubmit={submit}>
        <fieldset disabled={!storageAvailable || saving} className="space-y-4 disabled:opacity-50">
          <Panel title="New Risk Assessment" action={<span className="text-xs text-slate-400">Manual risk assessment</span>}>
            {storageAvailable === false && <p role="status" className="mb-3 text-sm text-slate-500">Risk storage unavailable</p>}
            {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
            {message && <p role="status" className="mb-3 text-sm text-green-600">{message}</p>}
            {reviewingReference && <p role="status" className="mb-3 text-sm text-brand-blue">Reviewing {reviewingReference}. Only factual technical narrative and source notes were prefilled.</p>}
            <div className="mb-4 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <p className="font-medium">Technical severity is not business risk.</p>
              <p className="mt-1 text-xs">Assess likelihood as the probability or frequency of the risk scenario, and impact as the potential business impact. Consider the technical evidence together with business context. No value is calculated automatically.</p>
            </div>
            <label className="mb-4 block text-xs">Assessment status<select value={assessmentStatus} onChange={event => setAssessmentStatus(event.target.value as "needs_assessment" | "assessed")} className={inputClass}><option value="needs_assessment">Needs Assessment</option><option value="assessed">Assessed</option></select></label>
            <h3 className="mb-2 text-sm font-semibold">Business Context</h3>
            {!editingRiskId && <p className="mb-3 text-xs text-slate-500">Risk code is generated by the server when this record is saved.</p>}
            <div className="grid gap-3 sm:grid-cols-2">{businessContextFields.map(renderField)}</div>
            <h3 className="mb-2 mt-5 text-sm font-semibold">Technical Evidence and Narrative</h3>
            <div className="grid gap-3 sm:grid-cols-2">{evidenceFields.map(renderField)}</div>
            <h3 className="mb-2 mt-5 text-sm font-semibold">Assessment</h3>
            <p className="mb-3 text-xs text-slate-500">Enter all ratings manually. Technical severity and CVSS are not converted into business risk ratings.</p>
            <div className="grid gap-3 sm:grid-cols-2">{assessmentFields.map(renderField)}</div>
            <h3 className="mb-2 mt-5 text-sm font-semibold">Ownership</h3>
            <div className="grid gap-3 sm:grid-cols-2">{renderField(["riskOwner", "Risk owner"])}</div>
          </Panel>

          <Panel title="Risk Treatment">
            <div className="grid gap-3 sm:grid-cols-2">
              {treatmentFields.map(renderField)}
              <label className="block"><span className="text-xs">Due date</span><input name="dueDate" type="date" required={assessmentStatus === "assessed"} className={inputClass} /></label>
              <label className="block"><span className="text-xs">Review date</span><input name="reviewDate" type="date" required={assessmentStatus === "assessed"} className={inputClass} /></label>
              <label className="block sm:col-span-2"><span className="text-xs">Notes</span><textarea name="notes" maxLength={10000} rows={3} className={inputClass} /></label>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">Assessment source: Manual risk assessment</span>
              <button type="submit" disabled={!storageAvailable || saving} className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-slate-400">{saving ? "Recording..." : editingRiskId ? "Complete assessment" : assessmentStatus === "assessed" ? "Submit assessed risk" : "Save for assessment"}</button>
            </div>
          </Panel>
        </fieldset>
      </form>
    </main>
  </>;
}
