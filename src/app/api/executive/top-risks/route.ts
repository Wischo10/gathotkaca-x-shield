import { NextRequest, NextResponse } from "next/server";
import { getTopRisksByDomain } from "@/services/wazuh-indexer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const range = req.nextUrl.searchParams.get("range") || "30d";
    const data = await getTopRisksByDomain(range);

    return NextResponse.json({ status: "ok", data });
  } catch (error) {
    console.error("[/api/executive/top-risks] Error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch top risks by domain" },
      { status: 500 }
    );
  }
}
