import { NextRequest, NextResponse } from "next/server";
import { getTopVictims } from "@/services/wazuh-indexer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const range = req.nextUrl.searchParams.get("range") ?? "30d";
    const data = await getTopVictims(10, range);
    return NextResponse.json({ status: "ok", data });
  } catch (error: any) {
    console.error("Top Victims API error:", error);
    return NextResponse.json({ error: "Failed to fetch top victims" }, { status: 500 });
  }
}
