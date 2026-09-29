import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getSocTelemetry } from "@/services/wazuh-indexer";
import { getPersistedIncidentDetails, getPersistedVerifiedIncidentMetrics, INCIDENT_VERIFICATION_FRESHNESS_MS } from "@/services/incident-lifecycle-service";
import { getCurrentConfirmedIocCount, getTopIocDetections } from "@/services/ioc-correlation";
import { getMsspOverviewDemo } from "@/services/mssp-demo-provider";
import type { ApiResult } from "@/types/soc";
import type { MsspOverviewData } from "@/types/mssp";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResult<MsspOverviewData>>> {
  if (!await getSessionFromRequest(request)) return NextResponse.json({ status: "error", message: "Authentication required." }, { status: 401 });
  const demoData = getMsspOverviewDemo();
  const [telemetryResult, incidentResult, iocResult] = await Promise.allSettled([
    getSocTelemetry("7d"), Promise.all([getPersistedVerifiedIncidentMetrics(7), getPersistedIncidentDetails(7, 5)]), Promise.all([getCurrentConfirmedIocCount(), getTopIocDetections()]),
  ]);
  const telemetry: MsspOverviewData["telemetry"] = telemetryResult.status === "fulfilled"
    ? { status: "available", data: telemetryResult.value, source: "Wazuh / OpenSearch", provenance: "REAL" }
    : { status: "unavailable", source: "Wazuh / OpenSearch", provenance: "NOT_AVAILABLE" };
  const incidents: MsspOverviewData["incidents"] = incidentResult.status === "fulfilled"
    ? { status: "available", data: { count: incidentResult.value[0].uniqueVerifiedIncidentIdsInWindow, lastVerifiedAt: incidentResult.value[0].lastVerifiedAt, stale: !incidentResult.value[0].lastVerifiedAt || Date.now() - Date.parse(incidentResult.value[0].lastVerifiedAt) > INCIDENT_VERIFICATION_FRESHNESS_MS, recent: incidentResult.value[1] }, source: "Persisted verified Bitdefender incidents", provenance: "REAL" }
    : { status: "unavailable", source: "Persisted verified Bitdefender incidents", provenance: "NOT_AVAILABLE" };
  const iocs: MsspOverviewData["iocs"] = iocResult.status === "fulfilled"
    ? { status: "available", data: { count: iocResult.value[0], records: iocResult.value[1] }, source: "Persisted IOC correlation", provenance: "REAL" }
    : { status: "unavailable", source: "Persisted IOC correlation", provenance: "NOT_AVAILABLE" };
  const demo: MsspOverviewData["demo"] = demoData
    ? { status: "available", data: demoData, source: "MSSP Demo Provider", provenance: "DEMO" }
    : { status: "unavailable", source: "MSSP Demo Provider", provenance: "NOT_AVAILABLE" };
  const hasReal = telemetry.status === "available" || incidents.status === "available" || iocs.status === "available";
  const sourceMode: MsspOverviewData["sourceMode"] = demoData ? (hasReal ? "MIXED" : "DEMO") : "REAL";
  return NextResponse.json({ status: "ok", data: { scope: "All Integrated Security Telemetry", range: "7d", sourceMode, telemetry, incidents, iocs, demo } }, { headers: { "Cache-Control": "no-store" } });
}
