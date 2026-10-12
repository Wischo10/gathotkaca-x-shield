import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: "Missing case id" }, { status: 400 });
    }

    const { data: logs, error } = await supabase
      .from("case_logs")
      .select("*")
      .eq("case_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ status: "ok", data: logs || [] });
  } catch (error: any) {
    console.error(`[/api/executive/active-incidents/${params.id}/logs] Error:`, error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch case logs" },
      { status: 500 }
    );
  }
}
