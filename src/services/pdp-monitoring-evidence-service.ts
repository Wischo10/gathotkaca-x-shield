import "server-only";
import { getPdpLoggingCandidateEvidence } from "@/services/pdp-logging-evidence-service";
import { getBitdefenderActiveIncidents } from "@/services/ciso-service";
import { getMitreAttackCoverage } from "@/services/compliance-service";
import { getThreatIntelligenceOverview } from "@/services/threat-intel";
import type { PdpMonitoringCandidateEvidence } from "@/types/pdp";

export async function getPdpMonitoringCandidateEvidence(): Promise<PdpMonitoringCandidateEvidence> {
  const [loggingResult, incidentResult, mitreResult, threatResult] = await Promise.allSettled([
    getPdpLoggingCandidateEvidence(),
    getBitdefenderActiveIncidents(),
    getMitreAttackCoverage(),
    getThreatIntelligenceOverview(),
  ]);
  const logging = loggingResult.status === "fulfilled" ? loggingResult.value : null;
  const incident = incidentResult.status === "fulfilled" ? incidentResult.value : null;
  const mitre = mitreResult.status === "fulfilled" ? mitreResult.value : null;
  const threat = threatResult.status === "fulfilled" ? threatResult.value : null;
  const bitdefenderCurrent = incident?.availability?.status === "available" && typeof incident.value === "number"
    ? incident.value : null;
  const bitdefenderRetained = logging?.bitdefender ?? {
    status: "unavailable" as const, observedRecords: null, latestObservationAt: null,
    detail: "Bitdefender candidate evidence is currently unavailable.",
  };
  const providerAvailable = (status: string | undefined) => status === "ok" || status === "degraded";
  const sources: PdpMonitoringCandidateEvidence["sources"] = {
    wazuh: logging?.wazuh ?? {
      status: "unavailable", observedRecords: null, latestObservationAt: null,
      detail: "Wazuh/OpenSearch candidate evidence is currently unavailable.",
    },
    bitdefender: {
      ...bitdefenderRetained,
      status: bitdefenderRetained.status === "available" || bitdefenderCurrent !== null ? "available" : "unavailable",
      currentIncidents: bitdefenderCurrent,
    },
    mitre: {
      status: mitre ? "available" : "unavailable",
      observedTechniques: mitre?.passed ?? null,
      breadthPercent: mitre?.score ?? null,
    },
    threatFox: {
      status: threat && providerAvailable(threat.providers.threatFox.status) && threat.kpis !== null ? "available" : "unavailable",
      observedIocs: threat?.kpis?.totalIocs ?? null,
      latestObservationAt: threat?.observedAt ?? null,
    },
    abuseIpDb: { status: threat && providerAvailable(threat.providers.abuseIpDb.status) ? "available" : "unavailable" },
    virusTotal: { status: threat && providerAvailable(threat.providers.virusTotal.status) ? "available" : "unavailable" },
  };
  return {
    controlCode: "PDP-SC-04",
    readiness: Object.values(sources).some(source => source.status === "available")
      ? "candidate_evidence_available" : "unavailable",
    generatedAt: new Date().toISOString(),
    sources,
  };
}
