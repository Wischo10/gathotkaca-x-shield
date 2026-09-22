import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const alert_id = searchParams.get("alert_id");

    if (!alert_id) {
      return NextResponse.json({ error: "alert_id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("case_notes")
      .select("*")
      .eq("alert_id", alert_id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[/api/soc/notes] Supabase Select Error:", error);
      throw error;
    }

    return NextResponse.json({ status: "ok", data });
  } catch (error) {
    console.error("[/api/soc/notes] GET Error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { alert_id, author, role, content } = body;

    if (!alert_id || !author || !content) {
      return NextResponse.json({ error: "alert_id, author, and content are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("case_notes")
      .insert([
        {
          alert_id,
          author,
          role: role || null,
          content
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("[/api/soc/notes] Supabase Insert Error:", error);
      throw error;
    }

    return NextResponse.json({ status: "ok", data });
  } catch (error) {
    console.error("[/api/soc/notes] POST Error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to create note" },
      { status: 500 }
    );
  }
}
