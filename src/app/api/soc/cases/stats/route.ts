import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const range = req.nextUrl.searchParams.get("range") ?? "30d";

    const { data, error } = await supabase.rpc("get_executive_cases_stats", { p_range: range });
    if (error) throw error;

    // The RPC returns a single row with the counts
    const stats = data?.[0] || { total_processed_manual: 0, total_processed_auto: 0, total_closed: 0 };

    return NextResponse.json({ status: "ok", data: stats });
  } catch (error) {
    console.error("[/api/soc/cases/stats] Error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch SOC cases stats from Supabase" },
      { status: 500 }
    );
  }
}
