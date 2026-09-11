import "server-only";
import { getSocAlertCounts } from "@/services/wazuh-indexer";
import { getLifecycleMetrics, getPersistedVerifiedIncidentMetrics } from "@/services/incident-lifecycle-service";
import type { SocMetric, SocMetrics } from "@/types/soc";

const RANGE = "7d" as const;
const WAZUH_SOURCE = "Wazuh Indexer alerts index";
const INCIDENT_VERIFICATION_FRESHNESS_MS = 24 * 60 * 60 * 1000;

function unavailable(source: string, reason: string, sampleCount?: number): SocMetric {
  return { value: null, source, reason, ...(sampleCount === undefined ? {} : { sampleCount }) };
}

/**
 * Assemble independently nullable Row 1 SOC KPIs.
 *
 * Incidents means Bitdefender incidents whose earliest valid
 * details.alerts[].date falls inside the dashboard window. MTTD remains
 * unavailable by methodology. MTTR uses genuine detected + response_started
 * operational lifecycle pairs in the same window.
 */
export async function getSocMetrics(includeWazuh = true): Promise<SocMetrics> {
  let totalEvents = unavailable(WAZUH_SOURCE, "Wazuh Indexer unavailable");
  let totalAlerts = unavailable(WAZUH_SOURCE, "Wazuh Indexer unavailable");
  let criticalAlerts = unavailable(WAZUH_SOURCE, "Wazuh Indexer unavailable");
  let incidents = unavailable("Bitdefender GravityZone incidents", "Bitdefender unavailable");
  let mttrMinutes = unavailable("incident_lifecycle_events", "Lifecycle storage unavailable", 0);

  const [wazuhResult, incidentsResult, lifecycleResult] = await Promise.allSettled([
    includeWazuh ? getSocAlertCounts(RANGE) : Promise.reject(new Error("Wazuh omitted from this request")),
    getPersistedVerifiedIncidentMetrics(7),
    getLifecycleMetrics(7),
  ]);

  if (wazuhResult.status === "fulfilled") {
    const wazuh = wazuhResult.value;
    totalEvents = { value: wazuh.totalEvents, source: WAZUH_SOURCE };
    totalAlerts = { value: wazuh.totalAlerts, source: WAZUH_SOURCE };
    criticalAlerts = { value: wazuh.criticalAlerts, source: `${WAZUH_SOURCE}; rule.level >= 14` };
  } else if (includeWazuh) {
    console.warn("[SOC metrics] Wazuh counts unavailable:", wazuhResult.reason instanceof Error ? wazuhResult.reason.message : "unknown error");
  }

  if (incidentsResult.status === "fulfilled" && incidentsResult.value.uniqueVerifiedIncidentIds > 0) {
    const lastVerifiedAt = incidentsResult.value.lastVerifiedAt;
    const isFresh = lastVerifiedAt !== null
      && Date.now() - Date.parse(lastVerifiedAt) <= INCIDENT_VERIFICATION_FRESHNESS_MS;
    incidents = {
      value: incidentsResult.value.uniqueVerifiedIncidentIdsInWindow,
      availability: isFresh ? "available" : "stale",
      source: "incident_lifecycle_events (verified Bitdefender details.alerts[].date)",
      lastVerifiedAt,
    };
  } else if (incidentsResult.status === "fulfilled") {
    incidents = unavailable("incident_lifecycle_events", "No verified persisted Bitdefender detections");
    incidents.availability = "unavailable";
    incidents.lastVerifiedAt = null;
  } else {
    console.warn("[SOC metrics] Persisted incidents unavailable:", incidentsResult.reason instanceof Error ? incidentsResult.reason.message : "unknown error");
  }

  if (lifecycleResult.status === "fulfilled") {
    const lifecycle = lifecycleResult.value;
    mttrMinutes = lifecycle.validMttrPairs > 0 && lifecycle.mttrMinutes !== null
      ? { value: lifecycle.mttrMinutes, source: "incident_lifecycle_events", sampleCount: lifecycle.validMttrPairs }
      : unavailable("incident_lifecycle_events", "No valid detected/response_started pairs in the window", 0);
  } else {
    console.warn("[SOC metrics] Lifecycle metrics unavailable:", lifecycleResult.reason instanceof Error ? lifecycleResult.reason.message : "unknown error");
  }

  return {
    range: RANGE,
    totalEvents,
    totalAlerts,
    incidents,
    criticalAlerts,
    mttdMinutes: unavailable("Bitdefender GravityZone telemetry", "No defensible occurrence timestamp is established"),
    mttrMinutes,
    verification: {
      incidents: incidentsResult.status === "fulfilled" ? incidentsResult.value : null,
      lifecycle: lifecycleResult.status === "fulfilled" ? {
        detectedEvents: lifecycleResult.value.detectedEvents,
        acknowledgedEvents: lifecycleResult.value.acknowledgedEvents,
        responseStartedEvents: lifecycleResult.value.responseStartedEvents,
        containedEvents: lifecycleResult.value.containedEvents,
        validMttrPairs: lifecycleResult.value.validMttrPairs,
      } : null,
    },
  };
}
