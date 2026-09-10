import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/get-session";
import { createRisk, listRisks, updateRisk, validateRiskAssessment, validateRiskUpdate } from "@/services/risk-register-service";

export const dynamic = "force-dynamic";

const unavailable = () => NextResponse.json(
  { code: "risk_storage_unavailable", error: "Risk storage unavailable" },
  { status: 503 }
);

export async function GET() {
  try {
    const items = await listRisks();
    return NextResponse.json(
      { status: "ok", data: { items, storageAvailable: true } },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return unavailable();
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!["admin", "ciso"].includes(session.role)) {
    return NextResponse.json({ error: "An admin or ciso role is required." }, { status: 403 });
  }
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Cross-origin risk submissions are not allowed." }, { status: 403 });
  }
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 }); }
  const input = validateRiskAssessment(body);
  if (!input) {
    return NextResponse.json({ error: "Complete every required manual risk assessment field with valid dates." }, { status: 400 });
  }
  try {
    const risk = await createRisk(input);
    return NextResponse.json({ status: "ok", data: risk }, { status: 201 });
  } catch {
    return unavailable();
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!["admin", "ciso"].includes(session.role)) return NextResponse.json({ error: "An admin or ciso role is required." }, { status: 403 });
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: "Cross-origin risk submissions are not allowed." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "A risk id and complete assessment are required." }, { status: 400 });
  const { id, ...assessment } = body as Record<string, unknown>;
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "A valid risk id is required." }, { status: 400 });
  const input = validateRiskUpdate(assessment);
  if (!input || input.assessmentStatus !== "assessed") return NextResponse.json({ error: "Completing a risk requires every assessed business, ownership, treatment, and date field." }, { status: 400 });
  try {
    return NextResponse.json({ status: "ok", data: await updateRisk(id, input) });
  } catch { return unavailable(); }
}
