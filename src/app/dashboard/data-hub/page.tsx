"use client";

import { useCallback, useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { DataProvenanceBadge } from "@/components/ui/DataProvenanceBadge";
import { SourceFreshness } from "@/components/ui/SourceFreshness";
import { useSidebarToggle } from "@/context/sidebar-context";
import type { DataHubRecord, DataHubRecordPreview, DataHubRecordType, DataHubSource, DataHubSourceRegistry, DataHubSourceStatus } from "@/types/data-hub";
import type { ApiResult } from "@/types/soc";

const capabilities = [
  { name: "Source Catalog", status: "Available", available: true },
  { name: "Unified Source Health", status: "Available", available: true },
  { name: "Read-Only Record Preview", status: "Available", available: true },
  { name: "Centralized Ingestion", status: "Not implemented", available: false },
  { name: "Cross-Source Normalization", status: "Not implemented", available: false },
  { name: "Shared Event Store", status: "Not implemented", available: false },
  { name: "Central Query / Search", status: "Not implemented", available: false },
  { name: "Retention Management", status: "Not implemented", available: false },
] as const;

const previewSources = [
  { id: "wazuh", name: "Wazuh / OpenSearch", types: ["SECURITY_ALERT", "VULNERABILITY_FINDING"] },
  { id: "bitdefender", name: "Bitdefender GravityZone", types: ["ENDPOINT_INCIDENT"] },
  { id: "threatfox", name: "ThreatFox", types: ["THREAT_INTEL_IOC"] },
  { id: "postgresql", name: "PostgreSQL", types: ["RISK_RECORD", "INCIDENT_LIFECYCLE", "VULNERABILITY_REMEDIATION", "THIRD_PARTY_ASSESSMENT", "COMPLIANCE_ASSESSMENT"] },
] as const satisfies ReadonlyArray<{ id: string; name: string; types: readonly DataHubRecordType[] }>;

const recordTypeLabels: Record<DataHubRecordType, string> = {
  SECURITY_ALERT: "Security Alerts",
  VULNERABILITY_FINDING: "Vulnerability Findings",
  ENDPOINT_INCIDENT: "Endpoint Incidents",
  THREAT_INTEL_IOC: "Threat Intelligence IOCs",
  INCIDENT_LIFECYCLE: "Incident Lifecycle",
  RISK_RECORD: "Risk Register",
  COMPLIANCE_ASSESSMENT: "Formal Compliance Assessments",
  THIRD_PARTY_ASSESSMENT: "Third-Party Assessments",
  VULNERABILITY_REMEDIATION: "Vulnerability Remediation",
  PDP_OPERATIONAL_RECORD: "PDP Operational Records",
};

const timestampLabels = {
  OBSERVED_AT: "Observed At", DETECTED_AT: "Detected At", FIRST_SEEN: "First Seen",
  PERSISTED_AT: "Persisted At", UPDATED_AT: "Updated At", ASSESSED_AT: "Assessed At",
} as const;

function displayTimestamp(record: DataHubRecord) {
  if (!record.timestamp.value || !record.timestamp.meaning) return { value: "Not Available", meaning: "Not Available" };
  const date = new Date(record.timestamp.value);
  return {
    value: Number.isFinite(date.getTime()) ? date.toLocaleString("en-GB", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" }) : "Not Available",
    meaning: timestampLabels[record.timestamp.meaning],
  };
}

const statusClasses: Record<DataHubSourceStatus, string> = {
  AVAILABLE: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  DEGRADED: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  NOT_AVAILABLE: "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
  HOLD: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300",
};

function freshnessLabel(source: DataHubSource) {
  switch (source.freshness.meaning) {
    case "OBSERVED_AT": return source.id === "wazuh" ? "Latest alert observation" : "Latest source observation";
    case "RETRIEVED_AT": return "Retrieved";
    case "PERSISTED_AT": return "Latest persisted update";
    case "CHECKED_AT": return "Health checked";
    default: return undefined;
  }
}

function SourceCard({ source }: { source: DataHubSource }) {
  return <article className="flex min-h-64 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div><h3 className="text-sm font-bold text-slate-900 dark:text-white">{source.name}</h3><p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{source.sourceType.replaceAll("_", " ")}</p></div>
      <div className="flex items-center gap-2"><span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClasses[source.status]}`}>{source.status.replaceAll("_", " ")}</span><DataProvenanceBadge provenance={source.provenance}/></div>
    </div>
    <div className="mt-3 text-xs text-slate-500">{source.category}</div>
    <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{source.description}</p>
    {source.capabilities.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{source.capabilities.map(capability => <span key={capability} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{capability}</span>)}</div>}
    {source.futureTarget && <p className="mt-3 text-xs text-slate-500"><span className="font-semibold">Future target:</span> {source.futureTarget}</p>}
    <div className="mt-auto border-t border-slate-100 pt-3 dark:border-slate-800">
      <p className="text-xs leading-5 text-slate-500">{source.healthDetail}</p>
      <SourceFreshness source={source.name} timestamp={source.freshness.timestamp} timestampLabel={freshnessLabel(source)} className="mt-1"/>
      {source.freshness.meaning === "CHECKED_AT" && <p className="text-[10px] text-slate-400">Health-check time only; not source data freshness.</p>}
    </div>
  </article>;
}

export default function DataHubDashboardPage() {
  const openSidebar = useSidebarToggle();
  const [registry, setRegistry] = useState<DataHubSourceRegistry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewSource, setPreviewSource] = useState("wazuh");
  const [previewType, setPreviewType] = useState<DataHubRecordType>("SECURITY_ALERT");
  const [preview, setPreview] = useState<DataHubRecordPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (loading && registry) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/data-hub/sources", { cache: "no-store" });
      const body = await response.json().catch(() => null) as ApiResult<DataHubSourceRegistry> | null;
      if (!response.ok || !body || body.status !== "ok") throw new Error("registry_unavailable");
      setRegistry(body.data);
    } catch {
      setError("Source registry could not be refreshed. Previously loaded status remains visible where available.");
    } finally {
      setLoading(false);
    }
  }, [loading, registry]);

  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedPreviewSource = previewSources.find(source => source.id === previewSource) ?? previewSources[0];
  const loadPreview = useCallback(async () => {
    if (previewLoading) return;
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const parameters = new URLSearchParams({ source: previewSource, recordType: previewType, limit: "20" });
      const response = await fetch(`/api/data-hub/records?${parameters}`, { cache: "no-store" });
      const body = await response.json().catch(() => null) as ApiResult<DataHubRecordPreview> | null;
      if (!response.ok || !body || body.status !== "ok") throw new Error("preview_unavailable");
      setPreview(body.data);
    } catch {
      setPreviewError("The selected source preview is currently unavailable. Previously loaded records remain visible where available.");
    } finally {
      setPreviewLoading(false);
    }
  }, [previewLoading, previewSource, previewType]);

  const currentSources = registry?.sources.filter(source => source.status !== "HOLD") ?? [];
  const holdSources = registry?.sources.filter(source => source.status === "HOLD") ?? [];
  const summary = registry?.summary;
  const summaryItems = [
    ["Registered Sources", summary?.registered], ["Available", summary?.available], ["Degraded", summary?.degraded],
    ["Unavailable", summary?.unavailable], ["Hold", summary?.hold],
  ] as const;

  return <>
    <Topbar title="Data Hub" subtitle="Security Data Source Registry" onMenuClick={openSidebar}/>
    <main className="flex-1 space-y-6 bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">Phase 3 · Read-only source registry and record preview</p><h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Security Data Source Registry</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Authenticated source availability, provenance, capabilities, and defensible source-level timestamps for data used across Gathotkaca X-Shield.</p></div>
          <button type="button" disabled={loading} onClick={() => void load()} className="inline-flex w-fit rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-brand-blue hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800">{loading ? "Refreshing…" : "Refresh Source Status"}</button>
        </div>
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">This registry performs bounded read-only health checks. Centralized ingestion, normalization, shared storage, correlation, and retention management remain unimplemented.</div>
        {error && <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">{error}</div>}
      </section>

      <section aria-labelledby="summary-heading">
        <div className="mb-3"><h2 id="summary-heading" className="text-base font-semibold text-slate-800 dark:text-slate-100">Registry Summary</h2><p className="mt-1 text-xs text-slate-500">Counts describe registry entries, not events or active integrations.</p></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{summaryItems.map(([label, value]) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="text-xs font-semibold text-slate-500">{label}</div><div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value ?? (loading ? "…" : "N/A")}</div></article>)}</div>
      </section>

      <section aria-labelledby="capabilities-heading">
        <div className="mb-3"><h2 id="capabilities-heading" className="text-base font-semibold text-slate-800 dark:text-slate-100">Data Hub Capability Status</h2><p className="mt-1 text-xs text-slate-500">Architecture capability status; no ingestion or event-processing capability is implied.</p></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{capabilities.map(capability => <article key={capability.name} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{capability.name}</h3><span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${capability.available ? statusClasses.AVAILABLE : statusClasses.NOT_AVAILABLE}`}>{capability.status}</span></article>)}</div>
      </section>

      <section aria-labelledby="current-sources-heading">
        <div className="mb-3"><h2 id="current-sources-heading" className="text-base font-semibold text-slate-800 dark:text-slate-100">Current Security / Data Sources</h2><p className="mt-1 text-xs text-slate-500">Used directly by platform features; not ingested through Data Hub.</p></div>
        {!registry && loading ? <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">Running bounded source checks…</div> : currentSources.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{currentSources.map(source => <SourceCard key={source.id} source={source}/>)}</div> : <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">Source registry unavailable.</div>}
      </section>

      <section aria-labelledby="record-preview-heading" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="record-preview-heading" className="text-base font-semibold text-slate-800 dark:text-slate-100">Source Record Preview</h2>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">Records are read directly from their authoritative source for a bounded preview. Data Hub does not persist or centrally ingest these records. Record types retain source-specific semantics and are not combined into a single event population.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Source
              <select value={previewSource} onChange={event => {
                const source = previewSources.find(item => item.id === event.target.value) ?? previewSources[0];
                setPreviewSource(source.id); setPreviewType(source.types[0]); setPreview(null); setPreviewError(null);
              }} className="mt-1 block min-w-48 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-normal text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                {previewSources.map(source => <option key={source.id} value={source.id}>{source.name}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Record Type
              <select value={previewType} onChange={event => { setPreviewType(event.target.value as DataHubRecordType); setPreview(null); setPreviewError(null); }} className="mt-1 block min-w-56 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-normal text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                {selectedPreviewSource.types.map(type => <option key={type} value={type}>{recordTypeLabels[type]}</option>)}
              </select>
            </label>
            <button type="button" disabled={previewLoading} onClick={() => void loadPreview()} className="inline-flex h-9 w-fit items-center rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-brand-blue hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800">{previewLoading ? "Loading..." : "Refresh Preview"}</button>
          </div>
        </div>
        {previewError && <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">{previewError}</div>}
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs dark:divide-slate-700">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 dark:bg-slate-800/70"><tr>
              {['Record Type', 'Source', 'Title', 'Severity', 'Entity', 'Timestamp', 'Timestamp Meaning', 'Provenance', 'Metadata'].map(label => <th key={label} className="whitespace-nowrap px-3 py-2 font-semibold">{label}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {preview?.records.map(record => {
                const timestamp = displayTimestamp(record);
                const metadata = Object.entries(record.metadata).filter(([, value]) => value !== null && value !== "" && (!Array.isArray(value) || value.length));
                return <tr key={record.id} className="align-top text-slate-600 dark:text-slate-300">
                  <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-800 dark:text-slate-100">{recordTypeLabels[record.recordType]}</td>
                  <td className="whitespace-nowrap px-3 py-3">{record.sourceName}</td>
                  <td className="min-w-52 max-w-sm px-3 py-3">{record.title ?? "Not Available"}</td>
                  <td className="whitespace-nowrap px-3 py-3">{record.severity ?? "Not Available"}</td>
                  <td className="min-w-36 px-3 py-3">{record.entity ? <><span className="block text-[10px] uppercase text-slate-400">{record.entity.type}</span>{record.entity.value}</> : "Not Available"}</td>
                  <td className="whitespace-nowrap px-3 py-3">{timestamp.value}</td>
                  <td className="whitespace-nowrap px-3 py-3">{timestamp.meaning}</td>
                  <td className="px-3 py-3"><DataProvenanceBadge provenance={record.provenance}/></td>
                  <td className="min-w-44 px-3 py-3">{metadata.length ? <details><summary className="cursor-pointer font-semibold text-brand-blue">View metadata</summary><dl className="mt-2 space-y-1">{metadata.map(([key, value]) => <div key={key}><dt className="inline font-semibold">{key}: </dt><dd className="inline break-all">{Array.isArray(value) ? value.join(", ") : String(value)}</dd></div>)}</dl></details> : "None"}</td>
                </tr>;
              })}
              {!previewLoading && (!preview || preview.records.length === 0) && <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-500">{preview ? "No records were returned by the selected authoritative source." : "Choose a source and record type, then refresh the bounded preview."}</td></tr>}
              {previewLoading && <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-500">Loading up to 20 source-owned records...</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="hold-sources-heading">
        <div className="mb-3"><h2 id="hold-sources-heading" className="text-base font-semibold text-slate-800 dark:text-slate-100">Planned / Hold Integrations</h2><p className="mt-1 text-xs text-slate-500">Not probed and never counted as available. Explicit dummy configuration remains Demo Data.</p></div>
        {holdSources.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{holdSources.map(source => <SourceCard key={source.id} source={source}/>)}</div> : <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">{loading ? "Loading hold registry entries…" : "Hold registry entries unavailable."}</div>}
      </section>
    </main>
  </>;
}
