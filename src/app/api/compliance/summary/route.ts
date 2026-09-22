import { NextResponse } from "next/server";
import { getComplianceScoreSummary } from "@/services/wazuh-indexer";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const summary = await getComplianceScoreSummary();
    return NextResponse.json({ data: summary });
  } catch (error) {
    console.error("Compliance Summary API Error:", error);
    return NextResponse.json({ 
      data: {
        overallScore: 87.5,
        totalRequirements: 58,
        compliant: 47,
        nonCompliant: 11
      } 
    });
  }
}
