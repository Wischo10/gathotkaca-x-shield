"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Panel, PanelEmpty } from "@/components/ui/Panel";
import { useSidebarToggle } from "@/context/sidebar-context";
import {
  THIRD_PARTY_LIFECYCLE_STATUSES, THIRD_PARTY_RISK_LEVELS, THIRD_PARTY_TREATMENT_STATUSES,
  type ThirdPartyRecord, type ThirdPartySummary,
} from "@/types/third-party";

const endpoint = "/api/ciso/third-parties";
const emptySummary: ThirdPartySummary = {
  totalVendors: 0, needsAssessment: 0, assessed: 0, activeVendors: 0,
  eligibleAssessedVendors: 0, assessmentCoveragePct: 0,
  highestAssessedRisk: null, method: "Highest Assessed Risk",
};
const inputClass = "mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900";

export default function ThirdPartyRegisterPage() {
  const openSidebar = useSidebarToggle();
  const [items, setItems] = useState<ThirdPartyRecord[]>([]);
  const [summary, setSummary] = useState<ThirdPartySummary>(emptySummary);
  const [storageAvailable, setStorageAvailable] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<ThirdPartyRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Third-party register unavailable.");
      setItems(result.data.items); setSummary(result.data.summary); setStorageAvailable(true); setError("");
    } catch {
      setItems([]); setSummary(emptySummary); setStorageAvailable(false); setError("");
    }
  }
  useEffect(() => { void load(); }, []);

  async function addThirdParty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!storageAvailable || saving) return;
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    setSaving(true); setError(""); setMessage("");
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to register the third party.");
      form.reset(); setMessage(`${result.data.vendorCode} registered and marked Needs Assessment.`); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to register the third party."); }
    finally { setSaving(false); }
  }

  async function completeAssessment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !storageAvailable || saving) return;
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    setSaving(true); setError(""); setMessage("");
    try {
      const response = await fetch(`${endpoint}/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to complete the assessment.");
      form.reset(); setSelected(null); setMessage(`${result.data.vendorCode} assessment completed.`); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to complete the assessment."); }
    finally { setSaving(false); }
  }

  return <>
    <Topbar title="Third-Party Register" subtitle="Human-governed third-party registration and assessment" onMenuClick={openSidebar} />
    <main className="flex-1 space-y-4 bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
      <Link href="/dashboard/ciso" className="text-sm text-brand-blue hover:underline">Back to CISO dashboard</Link>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[["Total Vendors", summary.totalVendors], ["Needs Assessment", summary.needsAssessment], ["Assessed", summary.assessed], ["Active Vendors", summary.activeVendors]].map(([label, value]) =>
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-2xl font-bold">{storageAvailable === true ? value : "N/A"}</div></div>)}
      </div>

      <Panel title="Third-Party Register" action={<span className="text-xs text-slate-400">Manual records only</span>}>
        {storageAvailable === null && <PanelEmpty message="Checking third-party register..." />}
        {storageAvailable === false && <PanelEmpty message="Third-party register unavailable" />}
        {storageAvailable === true && items.length === 0 && <PanelEmpty message="No third parties have been registered." />}
        {storageAvailable === true && items.length > 0 && <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b text-xs text-slate-500"><tr><th className="py-2">Vendor Code</th><th>Vendor</th><th>Provided Service</th><th>Criticality</th><th>Lifecycle</th><th>Assessment Status</th><th>Action</th></tr></thead><tbody className="divide-y dark:divide-slate-800">{items.map(item => <tr key={item.id}><td className="py-3 font-medium">{item.vendorCode}</td><td>{item.vendorName}</td><td>{item.providedService}</td><td>{item.criticality}</td><td>{item.lifecycleStatus === "active" ? "Active" : "Inactive"}</td><td>{item.assessmentStatus === "assessed" ? "Assessed" : "Needs Assessment"}</td><td>{item.assessmentStatus === "needs_assessment" ? <button type="button" onClick={() => { setSelected(item); setMessage(""); setError(""); }} className="text-brand-blue hover:underline">Complete Assessment</button> : <span className="text-slate-400">Completed</span>}</td></tr>)}</tbody></table></div>}
      </Panel>

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p className="rounded bg-green-50 p-3 text-sm text-green-700">{message}</p>}

      <Panel title="Add Third Party" action={<span className="text-xs text-slate-400">Creates a Needs Assessment record</span>}>
        <form onSubmit={addThirdParty} className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs">Vendor Name<input name="vendorName" required maxLength={10000} className={inputClass} /></label>
          <label className="block text-xs">Provided Service<input name="providedService" required maxLength={10000} className={inputClass} /></label>
          <label className="block text-xs">Internal Owner<input name="internalOwner" required maxLength={10000} className={inputClass} /></label>
          <label className="block text-xs">Criticality<select name="criticality" required defaultValue="" className={inputClass}><option value="" disabled>Select criticality</option>{THIRD_PARTY_RISK_LEVELS.map(value => <option key={value}>{value}</option>)}</select></label>
          <label className="block text-xs">Lifecycle Status<select name="lifecycleStatus" required defaultValue="active" className={inputClass}>{THIRD_PARTY_LIFECYCLE_STATUSES.map(value => <option key={value} value={value}>{value === "active" ? "Active" : "Inactive"}</option>)}</select></label>
          <div className="flex items-end"><button type="submit" disabled={!storageAvailable || saving} className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:bg-slate-400">{saving ? "Saving..." : "Add Third Party"}</button></div>
        </form>
      </Panel>

      {selected && <Panel title={`Complete Assessment — ${selected.vendorCode}`} action={<button type="button" onClick={() => setSelected(null)} className="text-xs text-slate-500 hover:underline">Cancel</button>}>
        <p className="mb-4 text-xs text-slate-500">Risk categories are explicit human judgements. They are not calculated from criticality or security telemetry.</p>
        <form onSubmit={completeAssessment} className="grid gap-3 sm:grid-cols-2">
          {(["likelihood", "impact", "riskRating"] as const).map(name => <label key={name} className="block text-xs">{{ likelihood: "Likelihood", impact: "Impact", riskRating: "Risk Rating" }[name]}<select name={name} required defaultValue="" className={inputClass}><option value="" disabled>Select category</option>{THIRD_PARTY_RISK_LEVELS.map(value => <option key={value}>{value}</option>)}</select></label>)}
          <label className="block text-xs sm:col-span-2">Assessment Rationale<textarea name="assessmentRationale" required maxLength={10000} rows={4} className={inputClass} /></label>
          <label className="block text-xs">Treatment Strategy<input name="treatmentStrategy" required maxLength={10000} className={inputClass} /></label>
          <label className="block text-xs">Treatment Status<select name="treatmentStatus" required defaultValue="" className={inputClass}><option value="" disabled>Select status</option>{THIRD_PARTY_TREATMENT_STATUSES.map(value => <option key={value}>{value}</option>)}</select></label>
          <label className="block text-xs">Treatment Owner<input name="treatmentOwner" required maxLength={10000} className={inputClass} /></label>
          <label className="block text-xs sm:col-span-2">Treatment Action<textarea name="treatmentAction" required maxLength={10000} rows={3} className={inputClass} /></label>
          <label className="block text-xs">Due Date<input name="dueDate" type="date" required className={inputClass} /></label>
          <label className="block text-xs">Next Review Date<input name="nextReviewDate" type="date" required className={inputClass} /></label>
          <div className="sm:col-span-2"><button type="submit" disabled={saving} className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:bg-slate-400">{saving ? "Saving..." : "Complete Assessment"}</button></div>
        </form>
      </Panel>}
    </main>
  </>;
}
