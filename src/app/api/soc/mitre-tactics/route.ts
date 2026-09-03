import { NextResponse } from "next/server";
import { getMitreTactics } from "@/services/wazuh-indexer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getMitreTactics(5);
    return NextResponse.json({ status: "ok", data });
  } catch (error: any) {
    console.error("MITRE Tactics API error:", error);
    return NextResponse.json({ error: "Failed to fetch MITRE Tactics" }, { status: 500 });
  }
}
