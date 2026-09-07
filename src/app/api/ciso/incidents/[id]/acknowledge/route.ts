import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/get-session";
import { recordAnalystLifecycleEvent } from "@/services/incident-lifecycle-service";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // 1. Authenticate user from session
    const user = await getSessionFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Active session required to record lifecycle action" },
        { status: 401 }
      );
    }

    // 2. Resolve route parameters
    const { id: incidentId } = await params;
    if (!incidentId) {
      return NextResponse.json(
        { error: "Incident ID is required" },
        { status: 400 }
      );
    }

    // 3. Parse optional metadata from request body (safe parsing)
    let extraMetadata: Record<string, unknown> | undefined;
    try {
      const body = await request.json();
      if (body && typeof body === "object") {
        extraMetadata = body;
      }
    } catch {
      // Body is optional
    }

    // 4. Record event
    const result = await recordAnalystLifecycleEvent(
      incidentId,
      "acknowledged",
      user,
      "ciso_dashboard_action",
      extraMetadata
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error?.includes("already recorded") ? 409 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      event: result.event,
    });
  } catch (err) {
    console.error("[IncidentAction] Error in acknowledge route:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
