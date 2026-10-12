import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/get-session";
import { completeThirdPartyAssessment, getThirdParty, validateCompleteAssessment } from "@/services/third-party-register-service";

export const dynamic = "force-dynamic";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const unavailable = () => NextResponse.json({ code: "third_party_storage_unavailable", error: "Third-party register unavailable. Check DATABASE_URL and migration 008." }, { status: 503 });

async function authorize(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!["admin", "ciso"].includes(session.role)) return NextResponse.json({ error: "An admin or ciso role is required." }, { status: 403 });
  return session;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const actor = await authorize(request);
  if (actor instanceof NextResponse) return actor;
  if (!uuidPattern.test(params.id)) return NextResponse.json({ error: "A valid third-party id is required." }, { status: 400 });
  try {
    const item = await getThirdParty(params.id);
    return item ? NextResponse.json({ status: "ok", data: item }, { headers: { "Cache-Control": "no-store" } })
      : NextResponse.json({ error: "Third party not found." }, { status: 404 });
  } catch { return unavailable(); }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const actor = await authorize(request);
  if (actor instanceof NextResponse) return actor;
  if (!uuidPattern.test(params.id)) return NextResponse.json({ error: "A valid third-party id is required." }, { status: 400 });
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: "Cross-origin third-party submissions are not allowed." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 }); }
  const input = validateCompleteAssessment(body);
  if (!input) return NextResponse.json({ error: "Complete every required manual assessment and treatment field with controlled categories and valid dates." }, { status: 400 });
  const assessedBy = actor.email.trim().toLowerCase() || actor.id.trim();
  if (!assessedBy) return NextResponse.json({ error: "Authenticated session identity is required." }, { status: 401 });
  try {
    const item = await completeThirdPartyAssessment(params.id, input, assessedBy);
    return item ? NextResponse.json({ status: "ok", data: item }) : NextResponse.json({ error: "Third party not found." }, { status: 404 });
  } catch { return unavailable(); }
}
