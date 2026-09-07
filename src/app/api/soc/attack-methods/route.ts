import { NextRequest, NextResponse } from "next/server";
import { getAttackMethods } from "@/services/wazuh-indexer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const range = req.nextUrl.searchParams.get("range") ?? "30d";
    const data = await getAttackMethods(5, range);
    return NextResponse.json({ status: "ok", data });
  } catch (error: any) {
    console.error("Attack Methods API error:", error);
    return NextResponse.json({ error: "Failed to fetch attack methods" }, { status: 500 });
  }
}
