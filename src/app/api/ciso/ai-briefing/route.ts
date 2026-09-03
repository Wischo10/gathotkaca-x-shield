import { NextResponse } from "next/server";
import { generateCompletion } from "@/services/ollama-service";
import { getAlertsBySeverity } from "@/services/wazuh-indexer";
import { getRecentIncidents } from "@/services/bitdefender-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const alerts = await getAlertsBySeverity();
    const incidents = await getRecentIncidents();

    const prompt = `You are a CISO advisor. Based on this real data:
Total Alerts: ${alerts.total}, Critical: ${alerts.critical}.
Active Incidents: ${incidents.length}.
Generate 4 short JSON insights.
Return ONLY valid JSON matching this schema exactly:
[
  { "id": "ai-1", "title": "Brief title", "description": "Short explanation", "tag": "Category", "tagColor": "blue|red|orange|emerald" }
]
`;

    const raw = await generateCompletion(prompt);
    
    // Attempt to parse the JSON
    let data = [];
    try {
      const match = raw.match(/\[.*\]/s);
      if (match) {
        data = JSON.parse(match[0]);
      } else {
        data = JSON.parse(raw);
      }
    } catch (e) {
      console.error("Failed to parse CISO AI JSON:", raw);
      // Fallback
      data = [
        {
          id: "ai-1",
          title: "AI Generation Failed",
          description: "Could not parse the AI response.",
          tag: "System",
          tagColor: "red"
        }
      ];
    }

    return NextResponse.json({ status: "ok", data });
  } catch (error: any) {
    console.error("CISO AI Briefing error:", error);
    return NextResponse.json({ error: "Failed to generate AI briefing" }, { status: 500 });
  }
}
