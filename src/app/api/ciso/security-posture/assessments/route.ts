import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/get-session";
import { env } from "@/lib/env";
import { getDb } from "@/lib/db";
import { getNistPostureAssessment, validateNistAssessmentInput } from "@/services/nist-posture-service";

export const dynamic = "force-dynamic";

async function authorizeWrite(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!env.database.url()) return NextResponse.json({ code: "assessment_database_not_configured", error: "DATABASE_URL is not configured. PostgreSQL is required for assessments." }, { status: 503 });
  const assessedBy = session.email.trim().toLowerCase() || session.id.trim();
  if (!assessedBy) return NextResponse.json({ error: "Authenticated session identity is required." }, { status: 401 });
  // Identity comes only from the verified signed session, never the request body.
  return { assessedBy };
}

const unavailable = () => NextResponse.json(
  { error: "Assessment database unavailable. Check DATABASE_URL and migrations 002 and 004." },
  { status: 503 }
);

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const data = await getNistPostureAssessment();
    if (data.status === "unavailable") return unavailable();
    return NextResponse.json({ status: "ok", data }, { headers: { "Cache-Control": "no-store" } });
  } catch { return unavailable(); }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await authorizeWrite(request);
    if (actor instanceof NextResponse) return actor;
    const origin = request.headers.get("origin");
    if (origin && origin !== request.nextUrl.origin) {
      return NextResponse.json({ error: "Cross-origin assessment submissions are not allowed." }, { status: 403 });
    }
    let body: unknown;
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 }); }
    const input = validateNistAssessmentInput(body);
    if (!input) return NextResponse.json({ error: "Provide a valid function, integer score from 0 to 100, and required assessment rationale up to 10000 characters. No other fields are accepted." }, { status: 400 });

    // Append only. The client cannot choose the assessor, source, or assessment time.
    const { rows } = await getDb().query(
      `INSERT INTO compliance_assessments
       (framework_id, function_name, score, control_id, status, assessed_at, assessed_by, source, evidence, notes)
       SELECT id, $1, $2, NULL, NULL, NOW(), $3, 'manual_assessment', $4, $5
       FROM compliance_frameworks WHERE id = 'nist-csf' AND version = '2.0' AND is_active = true
       RETURNING id, function_name, score, assessed_at, assessed_by, source, evidence, notes`,
      [input.function, input.score, actor.assessedBy, input.evidence?.trim() || null, input.notes?.trim() || null]
    );
    if (!rows[0]) return NextResponse.json({ error: "The active NIST CSF 2.0 framework is missing. Check migration 002." }, { status: 503 });
    return NextResponse.json({ status: "ok", data: rows[0] }, { status: 201 });
  } catch { return unavailable(); }
}
