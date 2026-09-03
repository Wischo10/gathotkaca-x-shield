import { NextResponse } from "next/server";
import { getAttackMethods } from "@/services/wazuh-indexer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getAttackMethods(5);
    return NextResponse.json({ status: "ok", data });
  } catch (error: any) {
    console.error("Attack Methods API error:", error);
    return NextResponse.json({ error: "Failed to fetch attack methods" }, { status: 500 });
  }
}
