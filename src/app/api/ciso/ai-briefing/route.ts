import { NextResponse } from "next/server";
import { AiBriefingError, generateAiCisoBriefing } from "@/services/ai-ciso-briefing-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await generateAiCisoBriefing();
    return NextResponse.json({ status: "ok", data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof AiBriefingError ? error.code : "unavailable";
    const notConfigured = code === "not_configured";
    return NextResponse.json({ code: `ai_briefing_${code}`, error: notConfigured ? "AI briefing not configured" : "AI briefing temporarily unavailable" }, { status: notConfigured ? 503 : 502 });
  }
}
