import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/get-session";
import { recordAnalystLifecycleEvent } from "@/services/incident-lifecycle-service";

interface RouteParams { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = await getSessionFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized: Active session required to record lifecycle action" }, { status: 401 });
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Incident ID is required" }, { status: 400 });
  const result = await recordAnalystLifecycleEvent(id, "resolved", user, "ciso_dashboard_action");
  if (!result.success) return NextResponse.json({ error: result.error }, { status: result.error?.includes("already recorded") ? 409 : 400 });
  return NextResponse.json({ success: true, message: result.message, event: result.event });
}
