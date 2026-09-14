import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Returns aggregate stats for the Cases tab.
 * Pulls from the soc_cases Supabase table.
 */
export async function GET(req: NextRequest) {
  try {
    const range = req.nextUrl.searchParams.get("range") ?? "7d";
    const daysBack = range === "30d" ? 30 : range === "7d" ? 7 : 1;
    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

    const { data: cases, error } = await supabase
      .from("soc_cases")
      .select("id, status, severity, created_at")
      .gte("created_at", since);

    if (error) throw error;

    const total = cases?.length ?? 0;
    const inProgress = cases?.filter(c => c.status === "in_progress").length ?? 0;
    const closed = cases?.filter(c => c.status === "closed").length ?? 0;
    const critical = cases?.filter(c => c.severity === "critical").length ?? 0;
    const high = cases?.filter(c => c.severity === "high").length ?? 0;

    return NextResponse.json({
      status: "ok",
      data: { total, inProgress, closed, critical, high, range }
    });
  } catch (error: any) {
    console.error("[/api/soc/cases/aggregate] Error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch cases aggregate" },
      { status: 500 }
    );
  }
}
