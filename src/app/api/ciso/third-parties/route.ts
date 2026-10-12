import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/get-session";
import { createThirdParty, deriveThirdPartySummary, listThirdParties, validateCreateThirdParty } from "@/services/third-party-register-service";

export const dynamic = "force-dynamic";

const unavailable = () => NextResponse.json(
  { code: "third_party_storage_unavailable", error: "Third-party register unavailable. Check DATABASE_URL and migration 008." },
  { status: 503 }
);

async function authorize(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!["admin", "ciso"].includes(session.role)) return NextResponse.json({ error: "An admin or ciso role is required." }, { status: 403 });
  return session;
}

export async function GET(request: NextRequest) {
  const actor = await authorize(request);
  if (actor instanceof NextResponse) return actor;
  try {
    const items = await listThirdParties();
    return NextResponse.json({ status: "ok", data: { items, summary: deriveThirdPartySummary(items), storageAvailable: true } }, { headers: { "Cache-Control": "no-store" } });
  } catch { return unavailable(); }
}

export async function POST(request: NextRequest) {
  const actor = await authorize(request);
  if (actor instanceof NextResponse) return actor;
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: "Cross-origin third-party submissions are not allowed." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 }); }
  const input = validateCreateThirdParty(body);
  if (!input) return NextResponse.json({ error: "Provide vendor name, provided service, internal owner, criticality, and lifecycle status. No other fields are accepted." }, { status: 400 });
  try { return NextResponse.json({ status: "ok", data: await createThirdParty(input) }, { status: 201 }); }
  catch { return unavailable(); }
}
