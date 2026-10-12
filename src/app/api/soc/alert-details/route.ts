import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { toErrorResult } from "@/lib/api-result";
import { getSocAlertDetails, SOC_DETECTION_SOURCE_LABELS } from "@/services/wazuh-indexer";
import type { ApiResult, Severity, SocAlertDetailResult } from "@/types/soc";

export const dynamic = "force-dynamic";

const SEVERITIES = new Set<Severity>(["critical", "high", "medium", "low"]);
const AGE_BUCKETS = new Set(["0-15m", "15-60m", "1-4h", "4-24h", ">24h"]);
const SAFE_EXACT = /^[\w .:@/\-]{1,128}$/;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  if (!await getSessionFromRequest(request)) return NextResponse.json({ status: "error", message: "Authentication required." }, { status: 401 });
  const params = request.nextUrl.searchParams;
  const severity = params.get("severity") || undefined;
  const ageBucket = params.get("ageBucket") || undefined;
  const day = params.get("day") || undefined;
  const exact = Object.fromEntries(["ruleId", "agent", "sourceIp", "tactic"].map((key) => [key, params.get(key) || undefined]));
  const detectionSource = params.get("detectionSource") || undefined;
  const limit = Number(params.get("limit") ?? "25");
  const offset = Number(params.get("offset") ?? "0");
  const invalid = (severity && !SEVERITIES.has(severity as Severity))
    || (ageBucket && !AGE_BUCKETS.has(ageBucket))
    || (day && (!ISO_DAY.test(day) || Number.isNaN(Date.parse(`${day}T00:00:00.000Z`))))
    || Object.values(exact).some((value) => value && !SAFE_EXACT.test(value))
    || (detectionSource && !SOC_DETECTION_SOURCE_LABELS.includes(detectionSource as typeof SOC_DETECTION_SOURCE_LABELS[number]))
    || !Number.isInteger(limit) || limit < 1 || limit > 50 || !Number.isInteger(offset) || offset < 0 || offset > 500;
  if (invalid) return NextResponse.json({ status: "error", message: "Invalid SOC alert filter." }, { status: 400 });
  try {
    const data = await getSocAlertDetails({ severity: severity as Severity | undefined, ageBucket: ageBucket as "0-15m" | "15-60m" | "1-4h" | "4-24h" | ">24h" | undefined, day, detectionSource, limit, offset, ...exact });
    const body: ApiResult<SocAlertDetailResult> = { status: "ok", data };
    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json(toErrorResult(error, "Failed to load SOC alert evidence."), { status: 200 });
  }
}
