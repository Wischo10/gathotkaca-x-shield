import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/get-session";
import { getRiskEvidenceSuggestions } from "@/services/risk-evidence-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!await getSessionFromRequest(request)) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const data = await getRiskEvidenceSuggestions();
  return NextResponse.json({ status: "ok", data }, { headers: { "Cache-Control": "no-store" } });
}
