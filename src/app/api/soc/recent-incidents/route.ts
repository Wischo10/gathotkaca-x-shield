import { NextResponse } from "next/server";
import { getRecentIncidents } from "@/services/bitdefender-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getRecentIncidents(10);
    return NextResponse.json({ status: "ok", data });
  } catch (error: any) {
    console.error("Incidents API error:", error);
    return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 });
  }
}
