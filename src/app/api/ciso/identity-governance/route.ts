import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/get-session";
import { getIdentityGovernanceOverview } from "@/services/identity-governance-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!await getSessionFromRequest(request)) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const data = await getIdentityGovernanceOverview();
  return NextResponse.json({ status: "ok", data }, { headers: { "Cache-Control": "no-store" } });
}
