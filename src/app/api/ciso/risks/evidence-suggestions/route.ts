import { NextResponse } from "next/server";
import { getRiskEvidenceSuggestions } from "@/services/risk-evidence-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getRiskEvidenceSuggestions();
  return NextResponse.json({ status: "ok", data }, { headers: { "Cache-Control": "no-store" } });
}
