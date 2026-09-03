import "server-only";
import { env } from "@/lib/env";
import { fetchJson } from "@/lib/http";

export async function generateExecutiveSummary(stats: any): Promise<string[]> {
  const apiUrl = env.ollama.url();
  const model = env.ollama.model();

  if (!apiUrl) {
    console.warn("Ollama API URL not configured");
    return ["AI Summary is not available because Ollama is not configured."];
  }

  const prompt = `
You are a top-tier CISO AI assistant. Analyze these SOC metrics and provide a 4-bullet point executive summary.
Keep each bullet point under 20 words. Focus on the most critical insights.
Format output strictly as a JSON array of strings. Do not include markdown formatting or explanations.

Metrics:
- Total Alerts: ${stats.totalAlerts}
- Critical Alerts: ${stats.criticalAlerts}
- Top Victim Asset: ${stats.topVictim}
- Top Attack Method: ${stats.topAttackMethod}
- Critical Incidents: ${stats.criticalIncidents}
  `;

  try {
    const res = await fetchJson<any>(`${apiUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        format: "json"
      }),
      timeoutMs: 30000
    });

    const output = JSON.parse(res.response);
    if (Array.isArray(output)) return output;
    
    // Fallback if not an array
    if (output.summary && Array.isArray(output.summary)) return output.summary;
    return ["Failed to parse AI response."];
  } catch (error) {
    console.error("Ollama Service Error:", error);
    return [
      "AI Service is currently unreachable or timed out.",
      "Please verify the Ollama endpoint in the environment configuration."
    ];
  }
}

export async function generateCompletion(prompt: string): Promise<string> {
  const apiUrl = env.ollama.url();
  const model = env.ollama.model();

  if (!apiUrl) {
    throw new Error("Ollama API URL not configured");
  }

  const res = await fetchJson<any>(`${apiUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: model,
      prompt: prompt,
      stream: false,
    }),
    timeoutMs: 30000
  });

  return res.response;
}
