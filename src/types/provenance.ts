export type DataProvenanceMode = "REAL" | "DEMO" | "MIXED" | "NOT_AVAILABLE";

export interface DataProvenanceSegment {
  name: string;
  mode: DataProvenanceMode;
  source: string;
  explanation?: string;
}

export interface DataProvenance {
  mode: DataProvenanceMode;
  sources: string[];
  segments?: DataProvenanceSegment[];
  explanation: string;
}

export function aggregateProvenance(
  inputs: readonly DataProvenance[],
  explanation?: string
): DataProvenance {
  const usable = inputs.filter(input => input.mode !== "NOT_AVAILABLE");
  const sources = [...new Set(inputs.flatMap(input => input.sources))];
  const segments = inputs.flatMap(input => input.segments ?? [{
    name: input.sources.join(", ") || "Source",
    mode: input.mode,
    source: input.sources.join(", ") || "Unavailable",
    explanation: input.explanation,
  }]);

  let mode: DataProvenanceMode;
  if (usable.length === 0) mode = "NOT_AVAILABLE";
  else if (usable.some(input => input.mode === "MIXED")) mode = "MIXED";
  else {
    const modes = new Set(usable.map(input => input.mode));
    mode = modes.size === 1 ? usable[0].mode : "MIXED";
  }

  return {
    mode,
    sources,
    segments,
    explanation: explanation ?? (mode === "REAL"
      ? "All usable inputs come from live or persisted operational sources."
      : mode === "DEMO"
        ? "All usable inputs are explicitly synthetic demonstration data."
        : mode === "MIXED"
          ? "This result combines live and synthetic demonstration inputs."
          : "No configured source supplied usable data."),
  };
}
