import { NextRequest, NextResponse } from "next/server";
import { getMitreTactics } from "@/services/wazuh-indexer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "8");
    const range = req.nextUrl.searchParams.get("range") ?? "30d";
    const data = await getMitreTactics(limit, range);
    return NextResponse.json({ status: "ok", data });
  } catch (error: any) {
    console.error("[/api/executive/mitre-tactics] Error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch MITRE tactics" },
      { status: 500 }
    );
  }
}
