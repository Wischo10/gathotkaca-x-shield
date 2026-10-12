import type { DataProvenance, DataProvenanceMode } from "@/types/provenance";

const presentation: Record<DataProvenanceMode, { label: string; classes: string }> = {
  REAL: { label: "REAL", classes: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" },
  DEMO: { label: "Demo Data", classes: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300" },
  MIXED: { label: "Mixed: Live + Demo", classes: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300" },
  NOT_AVAILABLE: { label: "Source Unavailable", classes: "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400" },
};

export function DataProvenanceBadge({ provenance, className = "" }: { provenance: DataProvenance; className?: string }) {
  const value = presentation[provenance.mode];
  const sourceDetail = provenance.segments?.map(segment =>
    `${segment.name}: ${segment.mode} (${segment.source})${segment.explanation ? ` — ${segment.explanation}` : ""}`
  ).join("\n") || provenance.sources.join(", ");
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${value.classes} ${className}`}
      title={`${provenance.explanation}${sourceDetail ? `\n${sourceDetail}` : ""}`}
    >
      {value.label}
    </span>
  );
}
