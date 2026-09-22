import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("reports_config")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[/api/soc/reports-config] Supabase Select Error:", error);
      throw error;
    }

    return NextResponse.json({ status: "ok", data });
  } catch (error) {
    console.error("[/api/soc/reports-config] GET Error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch reports config" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, schedule_cron, status, format } = body;

    if (!title || !schedule_cron) {
      return NextResponse.json({ error: "title and schedule_cron are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("reports_config")
      .insert([
        {
          title,
          description: description || null,
          schedule_cron,
          status: status || 'Active',
          format: format || 'PDF'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("[/api/soc/reports-config] Supabase Insert Error:", error);
      throw error;
    }

    return NextResponse.json({ status: "ok", data });
  } catch (error) {
    console.error("[/api/soc/reports-config] POST Error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to create reports config" },
      { status: 500 }
    );
  }
}
