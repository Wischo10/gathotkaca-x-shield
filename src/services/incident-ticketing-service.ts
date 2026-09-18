import "server-only";
import { selectIncidentTicketingProvider } from "@/integrations/incident-ticketing/provider-factory";
import type { IncidentKpiItem, IncidentKpiOverview } from "@/types/ciso";
import type { IncidentTicketingOverview, IncidentTicketingProviderResult, NormalizedIncidentTicket } from "@/types/incident-ticketing";
import type { DataProvenance } from "@/types/provenance";

const unavailable = (explanation: string): IncidentTicketingOverview => ({
  records: [], incidentKpi: null,
  provenance: { mode: "NOT_AVAILABLE", sources: [], explanation },
});

function averageMinutes(records: NormalizedIncidentTicket[], end: keyof Pick<NormalizedIncidentTicket, "detectedAt" | "acknowledgedAt" | "containedAt" | "resolvedAt">, start: "occurredAt" | "detectedAt") {
  const values = records.flatMap(record => {
    const startValue = record[start];
    const endValue = record[end];
    if (!startValue || !endValue) return [];
    const duration = (Date.parse(endValue) - Date.parse(startValue)) / 60000;
    return Number.isFinite(duration) && duration >= 0 ? [duration] : [];
  });
  return { value: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 10) / 10 : null, count: values.length };
}

function kpiItem(value: number | null, count: number, total: number, source: string, fields: string, provenance: DataProvenance): IncidentKpiItem {
  return {
    value, unit: "minutes", trend30d: null, trendAvailable: false, sampleSize: count,
    eligibleIncidents: count, excludedIncidents: total - count, source,
    calculationMethod: `Arithmetic mean of valid ${fields} pairs`, timestampFieldsUsed: fields,
    explanation: `${count} eligible provider lifecycle record${count === 1 ? "" : "s"}.`, provenance,
  };
}

function calculateProviderKpis(result: IncidentTicketingProviderResult): IncidentKpiOverview {
  const total = result.records.length;
  const mttd = averageMinutes(result.records, "detectedAt", "occurredAt");
  const mtta = averageMinutes(result.records, "acknowledgedAt", "detectedAt");
  const mttc = averageMinutes(result.records, "containedAt", "detectedAt");
  const mttr = averageMinutes(result.records, "resolvedAt", "detectedAt");
  return {
    period: "last_30_days",
    mttd: kpiItem(mttd.value, mttd.count, total, result.provenance.sources.join(", "), "detectedAt - occurredAt", result.provenance),
    mtta: kpiItem(mtta.value, mtta.count, total, result.provenance.sources.join(", "), "acknowledgedAt - detectedAt", result.provenance),
    mttc: kpiItem(mttc.value, mttc.count, total, result.provenance.sources.join(", "), "containedAt - detectedAt", result.provenance),
    mttr: kpiItem(mttr.value, mttr.count, total, result.provenance.sources.join(", "), "resolvedAt - detectedAt", result.provenance),
    dataAvailable: total > 0,
    explanation: "Calculated independently from normalized ticketing-provider lifecycle records. It does not alter operational Bitdefender lifecycle KPIs.",
    provenance: result.provenance,
  };
}

export async function getIncidentTicketingOverview(): Promise<IncidentTicketingOverview> {
  const selection = selectIncidentTicketingProvider();
  if (selection.status === "not_available") return unavailable(selection.reason);
  try {
    const result = await selection.provider.listIncidents();
    return { records: result.records, incidentKpi: calculateProviderKpis(result), provenance: result.provenance };
  } catch (error) {
    return unavailable(error instanceof Error ? error.message : "Incident/ticketing provider failed.");
  }
}
