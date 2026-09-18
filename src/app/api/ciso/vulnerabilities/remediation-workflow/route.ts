import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/get-session";
import { getRemediationWorkflowOverview } from "@/services/remediation-workflow-provider-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!await getSessionFromRequest(request)) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const data = await getRemediationWorkflowOverview();
  return NextResponse.json({ status: "ok", data }, { headers: { "Cache-Control": "no-store" } });
}
