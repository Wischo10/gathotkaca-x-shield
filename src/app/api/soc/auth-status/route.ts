import { NextResponse } from "next/server";
import { getAuthStatus } from "@/services/wazuh-indexer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getAuthStatus();
    return NextResponse.json({ status: "ok", data });
  } catch (error: any) {
    console.error("Auth Status API error:", error);
    return NextResponse.json({ error: "Failed to fetch auth status" }, { status: 500 });
  }
}
