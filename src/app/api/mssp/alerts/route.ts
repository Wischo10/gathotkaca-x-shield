import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getPersistedIncidentDetails, getPersistedVerifiedIncidentMetrics, INCIDENT_VERIFICATION_FRESHNESS_MS } from "@/services/incident-lifecycle-service";
import { getSocTelemetry } from "@/services/wazuh-indexer";
import { getMsspOverviewDemo } from "@/services/mssp-demo-provider";
import type { MsspAlertsData } from "@/types/mssp";
import type { ApiResult } from "@/types/soc";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResult<MsspAlertsData>>> {
  if (!await getSessionFromRequest(request)) {
    return NextResponse.json({ status: "error", message: "Authentication required." }, { status: 401 });
  }
  const demoData = getMsspOverviewDemo();

  const [telemetryResult, incidentResult] = await Promise.allSettled([
    getSocTelemetry("7d"),
    Promise.all([getPersistedVerifiedIncidentMetrics(7), getPersistedIncidentDetails(7, 5)]),
  ]);

  const telemetry: MsspAlertsData["telemetry"] = telemetryResult.status === "fulfilled"
    ? { status: "available", data: telemetryResult.value, source: "Wazuh / OpenSearch", provenance: "REAL" }
    : { status: "unavailable", source: "Wazuh / OpenSearch", provenance: "NOT_AVAILABLE" };

  const incidents: MsspAlertsData["incidents"] = incidentResult.status === "fulfilled"
    ? {
        status: "available",
        data: {
          count: incidentResult.value[0].uniqueVerifiedIncidentIdsInWindow,
          lastVerifiedAt: incidentResult.value[0].lastVerifiedAt,
          stale: incidentResult.value[0].uniqueVerifiedIncidentIdsInWindow > 0
            && (!incidentResult.value[0].lastVerifiedAt
              || Date.now() - Date.parse(incidentResult.value[0].lastVerifiedAt) > INCIDENT_VERIFICATION_FRESHNESS_MS),
          recent: incidentResult.value[1],
        },
        source: "Persisted verified Bitdefender incidents",
        provenance: "REAL",
      }
    : { status: "unavailable", source: "Persisted verified Bitdefender incidents", provenance: "NOT_AVAILABLE" };
  const demo: MsspAlertsData["demo"] = { status: "available", data: demoData, source: "MSSP Demo Provider", provenance: "DEMO" };

  return NextResponse.json(
    { status: "ok", data: { scope: "All Integrated Security Telemetry", range: "7d", telemetry, incidents, demo } },
    { headers: { "Cache-Control": "no-store" } },
  );
}
