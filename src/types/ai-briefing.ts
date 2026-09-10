export interface AiCisoBriefingItem { text: string; factIds: string[]; }
export type AiCisoGenerationMode = "ollama_grounded" | "grounded_factual_summary";
export interface AiCisoNormalizedFact {
  id: string; key: string; value: number; unit: "count" | "percent"; source: string; text: string;
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
}
