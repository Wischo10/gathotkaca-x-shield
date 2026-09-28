import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Returns active escalated incidents from soc_cases.
 */
export async function GET(req: NextRequest) {
  try {
    const { data: cases, error } = await supabase
      .from("soc_cases")
      .select("id, title, severity, status, assigned_to, created_at, latest_action")
      .eq("status", "in_progress")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    const enrichedCases = (cases || []).map((c) => ({
      ...c,
      latest_action: c.latest_action || "Menunggu pembaruan status...",
    }));

    return NextResponse.json({ status: "ok", data: enrichedCases });
  } catch (error: any) {
    console.error("[/api/executive/active-incidents] Error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch active incidents" },
      { status: 500 }
    );
  }
}
