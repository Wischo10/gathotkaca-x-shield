import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { alert_id, title, severity, assigned_to, latest_action } = body;

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
          severity: severity || "medium",
          assigned_to: assigned_to || "unassigned",
          latest_action: latest_action || "Menunggu pembaruan status...",
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("[/api/soc/cases] Supabase Insert Error:", error);
      throw error;
    }

    // Create Audit Log (Timeline)
    if (data && data.id) {
      const logAction = latest_action || "Menunggu pembaruan status...";
      await supabase.from("case_logs").insert([
        {
          case_id: data.id,
          analyst_name: assigned_to || "unassigned",
          action_taken: logAction
        }
      ]);
    }

    return NextResponse.json({ status: "ok", data });
  } catch (error: any) {
    console.error("[/api/soc/cases] Error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to create SOC case", detail: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const alert_id = searchParams.get("alert_id");

    if (alert_id) {
      const { data, error } = await supabase
        .from("soc_cases")
        .select("*")
        .eq("alert_id", alert_id)
        .single();
      
      if (error && error.code !== "PGRST116") {
        throw error;
      }
      return NextResponse.json({ status: "ok", data: data || null });
    }

    const { data, error } = await supabase.from("soc_cases").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    
    return NextResponse.json({ status: "ok", data });
  } catch (error: any) {
    console.error("[GET /api/soc/cases] Error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { alert_id, status } = body;

    if (!alert_id || !status) {
      return NextResponse.json({ error: "alert_id and status are required" }, { status: 400 });
    }

    const dbStatus = status === "In Progress" ? "in_progress" : status;

    const { data, error } = await supabase
      .from("soc_cases")
      .update({ status: dbStatus })
      .eq("alert_id", alert_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ status: "ok", data });
  } catch (error: any) {
    console.error("[PATCH /api/soc/cases] Error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
