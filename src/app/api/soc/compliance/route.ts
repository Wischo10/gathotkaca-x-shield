import { NextResponse } from "next/server";
import { getComplianceSummary } from "@/services/wazuh-indexer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getComplianceSummary();
    return NextResponse.json({ status: "ok", data });
  } catch (error: any) {
    console.error("Compliance Summary API error:", error);
    return NextResponse.json({ error: "Failed to fetch compliance summary" }, { status: 500 });
  }
}
