export interface AiCisoBriefingItem { text: string; factIds: string[]; }
export type AiCisoGenerationMode = "ollama_grounded";
export interface AiCisoNormalizedFact {
  id: string; key: string; value: number | string | null; unit: "count" | "percent" | "score" | "status"; source: string; text: string;
  provenance: import("@/types/provenance").DataProvenance;
}
export interface AiCisoBriefing {
  executiveSummary: string;
  keyObservations: AiCisoBriefingItem[];
  priorityActions: AiCisoBriefingItem[];
  generatedAt: string;
  model: string;
  generationMode: AiCisoGenerationMode;
  sourceAvailability: Record<string, boolean>;
  normalizedFacts: AiCisoNormalizedFact[];
  sourceFreshness: Record<string, string | null>;
}
