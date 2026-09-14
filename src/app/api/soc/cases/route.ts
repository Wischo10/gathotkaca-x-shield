import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { alert_id, title, severity, assigned_to } = body;

    if (!alert_id || !title) {
      return NextResponse.json({ error: "alert_id and title are required" }, { status: 400 });
    }

    // Insert into Supabase soc_cases table
    const { data, error } = await supabase
      .from("soc_cases")
      .insert([
        {
          alert_id,
          title,
          status: "in_progress",
          resolution_type: "manual", // Default to manual when escalated by an analyst
          severity: severity || "medium",
          assigned_to: assigned_to || "unassigned",
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("[/api/soc/cases] Supabase Insert Error:", error);
      throw error;
    }

    return NextResponse.json({ status: "ok", data });
  } catch (error) {
    console.error("[/api/soc/cases] Error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to create SOC case" },
      { status: 500 }
    );
  }
}
