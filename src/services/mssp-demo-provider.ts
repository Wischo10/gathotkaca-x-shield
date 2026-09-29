import "server-only";
import type { MsspOverviewDemoData } from "@/types/mssp";

const CLIENT_COUNT = 25;
const SERVICE_TYPES = ["SOC Monitoring", "Vulnerability Management", "Threat Intelligence", "Incident Response", "Compliance & Risk", "Log Management", "Endpoint Security", "Email Security", "Cloud Security Monitoring", "Firewall Monitoring"] as const;
const SERVICE_CATEGORIES: Record<typeof SERVICE_TYPES[number], string> = {
  "SOC Monitoring": "Security Monitoring", "Vulnerability Management": "Security Assessment", "Threat Intelligence": "Threat Intelligence", "Incident Response": "Incident Response", "Compliance & Risk": "GRC", "Log Management": "Log Management", "Endpoint Security": "Endpoint Security", "Email Security": "Email Security", "Cloud Security Monitoring": "Cloud Security", "Firewall Monitoring": "Network Security",
};
const INCIDENT_STATUSES = ["New", "Investigating", "In Progress", "Contained"] as const;
const TICKET_STATUSES = ["Open", "In Progress", "Waiting for Client", "Resolved", "Closed"] as const;
const INCIDENT_NAMES = ["Suspicious authentication activity", "Endpoint malware investigation", "Unusual outbound connection", "Privileged access review", "Potential data exposure"] as const;
const INCIDENT_OWNERS = ["SOC L1", "SOC L2", "IR Team", "Threat Analysis"] as const;
const INCIDENT_SEVERITIES = ["critical", "high", "medium", "low"] as const;
const INDUSTRIES = ["Manufacturing", "Financial Services", "Retail", "Technology", "Healthcare", "Logistics", "Energy", "Professional Services"] as const;
const LOCATIONS = [{ city: "Jakarta", region: "DKI Jakarta" }, { city: "Surabaya", region: "East Java" }, { city: "Bandung", region: "West Java" }, { city: "Semarang", region: "Central Java" }, { city: "Medan", region: "North Sumatra" }, { city: "Makassar", region: "South Sulawesi" }] as const;
const ACTIVITY_TYPES = ["Incident Updated", "Ticket Updated", "Service Health Event", "SLA Event", "Client Review Activity"] as const;
const NAME_PREFIXES = ["Northstar", "Cedar", "Blue Harbor", "Meridian", "Pinecrest", "Atlas", "Willow", "Quartz", "Silverline", "Redwood", "Brightfield", "Stonebridge", "Clearwater", "Suncrest", "Ironwood", "Evergreen", "Lighthouse"] as const;
const NAME_SUFFIXES = ["Systems", "Industries", "Digital", "Solutions", "Works", "Group", "Networks", "Technologies", "Logistics", "Holdings"] as const;
const REPORT_TEMPLATES = [
  { id: "DEMO-TEMPLATE-001", name: "SOC Operations Summary", category: "Security Operations" },
  { id: "DEMO-TEMPLATE-002", name: "Vulnerability Exposure Review", category: "Vulnerability Management" },
  { id: "DEMO-TEMPLATE-003", name: "Compliance Posture Overview", category: "Compliance & Risk" },
  { id: "DEMO-TEMPLATE-004", name: "Threat Intelligence Brief", category: "Threat Intelligence" },
  { id: "DEMO-TEMPLATE-005", name: "Incident Response Summary", category: "Incident Response" },
] as const;
const REPORT_CATEGORY_SEQUENCE = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4] as const;
const REPORT_GENERATORS = ["System", "SOC L1", "SOC L2", "Security Operations", "Compliance Team"] as const;
const REPORT_CONSUMERS = ["SOC Team", "Security Operations", "Compliance Team", "Management", "Client Administrators"] as const;

type ServiceAssignment = { id: string; clientId: string; type: typeof SERVICE_TYPES[number]; uptimePercent: number; slaMet: boolean };
type IncidentRecord = { id: string; clientId: `DEMO-CLIENT-${string}`; name: string; owner: string; severity: typeof INCIDENT_SEVERITIES[number]; status: typeof INCIDENT_STATUSES[number] | "Resolved"; openedAt: string; resolvedAt: string | null };
type TicketRecord = { id: string; status: typeof TICKET_STATUSES[number] };

const clientSeeds = Array.from({ length: CLIENT_COUNT }, (_, index) => ({
  id: `DEMO-CLIENT-${String(index + 1).padStart(3, "0")}` as const,
  name: `${NAME_PREFIXES[index % NAME_PREFIXES.length]} ${NAME_SUFFIXES[index % NAME_SUFFIXES.length]}`,
  industry: INDUSTRIES[index % INDUSTRIES.length],
  ...LOCATIONS[index % LOCATIONS.length],
  status: index % 17 === 0 ? "Inactive" as const : index % 11 === 0 ? "Onboarding" as const : "Active" as const,
  openAlerts: 2 + (index * 7) % 29,
  riskScore: 29 + (index * 11) % 60,
  lastActivity: new Date(Date.parse("2026-09-28T10:00:00.000Z") - index * 60 * 60 * 1000).toISOString(),
}));

const serviceAssignments: ServiceAssignment[] = clientSeeds.flatMap((client, clientIndex) =>
  Array.from({ length: 2 + clientIndex % 4 }, (_, serviceIndex) => {
    const sequence = serviceAssignmentsSequence(clientIndex, serviceIndex);
    return {
      id: `DEMO-SERVICE-${String(sequence + 1).padStart(3, "0")}`,
      clientId: client.id,
      type: SERVICE_TYPES[sequence % SERVICE_TYPES.length],
      uptimePercent: 99.2 + sequence % 8 * 0.09,
      slaMet: sequence % 13 !== 0,
    };
  }),
);

const resolvedIncidents: IncidentRecord[] = clientSeeds.map((client, index) => {
  const openedAt = Date.parse("2026-09-20T08:00:00.000Z") + index * 2 * 60 * 60 * 1000;
  const resolutionMinutes = 45 + index % 9 * 6;
  return {
    id: `DEMO-INC-${String(index + 1).padStart(3, "0")}`,
    clientId: client.id,
    name: INCIDENT_NAMES[index % INCIDENT_NAMES.length],
    owner: INCIDENT_OWNERS[index % INCIDENT_OWNERS.length],
    severity: INCIDENT_SEVERITIES[index % INCIDENT_SEVERITIES.length],
    status: "Resolved",
    openedAt: new Date(openedAt).toISOString(),
    resolvedAt: new Date(openedAt + resolutionMinutes * 60 * 1000).toISOString(),
  };
});

const openIncidents: IncidentRecord[] = Array.from({ length: 41 }, (_, index) => ({
  id: `DEMO-INC-${String(clientSeeds.length + index + 1).padStart(3, "0")}`,
  clientId: clientSeeds[index % clientSeeds.length].id,
  name: INCIDENT_NAMES[(index + 2) % INCIDENT_NAMES.length],
  owner: INCIDENT_OWNERS[(index + 1) % INCIDENT_OWNERS.length],
  severity: INCIDENT_SEVERITIES[(index + 1) % INCIDENT_SEVERITIES.length],
  status: INCIDENT_STATUSES[index % INCIDENT_STATUSES.length],
  openedAt: new Date(Date.parse("2026-09-27T06:00:00.000Z") + index * 30 * 60 * 1000).toISOString(),
  resolvedAt: null,
}));

const incidents = [...resolvedIncidents, ...openIncidents];
const tickets: TicketRecord[] = Array.from({ length: 47 }, (_, index) => ({ id: `DEMO-TICKET-${String(index + 1).padStart(3, "0")}`, status: TICKET_STATUSES[index % TICKET_STATUSES.length] }));

function serviceAssignmentsSequence(clientIndex: number, serviceIndex: number) {
  const completeCycles = Math.floor(clientIndex / 4) * 14;
  const cycleOffset = [0, 2, 5, 9][clientIndex % 4];
  return completeCycles + cycleOffset + serviceIndex;
}

function average(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function countBy<T extends string>(values: T[], key: T) {
  return values.filter((value) => value === key).length;
}

function resolutionMinutes(incident: IncidentRecord) {
  return incident.resolvedAt ? (Date.parse(incident.resolvedAt) - Date.parse(incident.openedAt)) / 60_000 : null;
}

function riskLevel(score: number): MsspOverviewDemoData["clients"][number]["riskLevel"] {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function buildDemoData(): MsspOverviewDemoData {
  const clients = clientSeeds.map((client) => {
    const services = serviceAssignments.filter((item) => item.clientId === client.id);
    const clientIncidents = incidents.filter((item) => item.clientId === client.id);
    const resolvedDurations = clientIncidents.flatMap((item) => {
      const duration = resolutionMinutes(item);
      return duration === null ? [] : [duration];
    });
    return {
      ...client,
      services: services.length,
      openIncidents: clientIncidents.filter((item) => item.status !== "Resolved").length,
      mttrMinutes: Math.round(average(resolvedDurations)),
      riskLevel: riskLevel(client.riskScore),
      serviceUptimePercent: average(services.map((item) => item.uptimePercent)),
      serviceTypes: services.map((item) => item.type),
      slaStatus: services.every((item) => item.slaMet) ? "Met" as const : "Breached" as const,
    };
  });
  const slaMet = serviceAssignments.filter((item) => item.slaMet).length;
  const slaTotal = serviceAssignments.length;
  const resolvedDurations = incidents.flatMap((item) => {
    const duration = resolutionMinutes(item);
    return duration === null ? [] : [duration];
  });
  const activeClients = clients.filter((client) => client.status === "Active").length;
  const inactiveClients = clients.filter((client) => client.status === "Inactive").length;
  const atRiskClients = clients.filter((client) => client.riskLevel === "High" || client.riskLevel === "Critical").length;
  const clientsMeetingSla = clients.filter((client) => client.slaStatus === "Met").length;
  const averageClientRisk = average(clients.map((client) => client.riskScore));
  const totalOpenAlerts = clients.reduce((total, client) => total + client.openAlerts, 0);
  const totalOpenIncidents = clients.reduce((total, client) => total + client.openIncidents, 0);
  const historyOffsets = [3, 3, 2, 2, 1, 1, 0];
  const incidentSnapshot = Date.parse("2026-09-28T04:00:00.000Z");
  const demoIncidents = incidents.map((incident) => {
    const elapsedMinutes = Math.max(0, Math.round(((incident.resolvedAt ? Date.parse(incident.resolvedAt) : incidentSnapshot) - Date.parse(incident.openedAt)) / 60_000));
    const slaTargetMinutes = { critical: 240, high: 480, medium: 720, low: 1440 }[incident.severity];
    return { ...incident, clientName: clientSeeds.find((client) => client.id === incident.clientId)!.name, elapsedMinutes, slaTargetMinutes, slaState: elapsedMinutes > slaTargetMinutes ? "Breached" as const : elapsedMinutes >= slaTargetMinutes * 0.75 ? "At Risk" as const : "Healthy" as const };
  });
  const needingAttention = demoIncidents.filter((incident) => incident.status !== "Resolved" && (incident.status === "New" || incident.status === "Investigating" || incident.slaState === "Breached")).length;
  const offeringBase = SERVICE_TYPES.map((name, index) => {
    const assignments = serviceAssignments.filter((item) => item.type === name);
    const met = assignments.filter((item) => item.slaMet).length;
    const status = index === 4 || index === 9 ? "Maintenance" as const : index === 2 || index === 7 ? "Warning" as const : "Active" as const;
    const healthScore = status === "Warning" ? 79 + index % 4 : status === "Maintenance" ? 87 + index % 3 : 93 + index % 6;
    return { id: `DEMO-OFFERING-${String(index + 1).padStart(3, "0")}`, name, type: SERVICE_CATEGORIES[name], clients: new Set(assignments.map((item) => item.clientId)).size, assignments: assignments.length, status, healthScore, slaPercent: assignments.length ? met / assignments.length * 100 : 0, lastActivity: new Date(Date.parse("2026-09-28T09:30:00.000Z") - index * 47 * 60_000).toISOString() };
  });
  const issueConcepts = ["Log ingestion delay", "Policy synchronization delay", "Agent connectivity degradation", "Elevated processing latency", "Service availability degradation", "Rule deployment delay"] as const;
  const openServiceIssues = offeringBase.slice(0, 6).map((service, index) => ({ id: `DEMO-SVC-ISSUE-${String(index + 1).padStart(3, "0")}`, serviceName: service.name, issue: issueConcepts[index], severity: (["High", "Medium", "Critical", "Medium", "High", "Low"] as const)[index], affectedClients: Math.min(service.clients, 1 + index % 3), status: (["Investigating", "Identified", "Monitoring", "Investigating", "Identified", "Monitoring"] as const)[index], detectedAt: new Date(Date.parse("2026-09-27T04:00:00.000Z") + index * 95 * 60_000).toISOString(), resolvedAt: null, resolutionMinutes: null }));
  const resolvedServiceIssues = offeringBase.map((service, index) => { const detected = Date.parse("2026-09-18T03:00:00.000Z") + index * 4 * 60 * 60_000; const duration = 42 + index * 7; return { id: `DEMO-SVC-ISSUE-${String(openServiceIssues.length + index + 1).padStart(3, "0")}`, serviceName: service.name, issue: issueConcepts[index % issueConcepts.length], severity: (["Medium", "Low", "High", "Medium"] as const)[index % 4], affectedClients: Math.min(service.clients, 1 + index % 2), status: "Resolved" as const, detectedAt: new Date(detected).toISOString(), resolvedAt: new Date(detected + duration * 60_000).toISOString(), resolutionMinutes: duration } } );
  const serviceIssues = [...openServiceIssues, ...resolvedServiceIssues];
  const serviceOfferings = offeringBase.map((service) => { const durations = resolvedServiceIssues.filter((issue) => issue.serviceName === service.name).map((issue) => issue.resolutionMinutes); return { ...service, mttrMinutes: durations.length ? Math.round(average(durations)) : null }; });
  const maintenanceWindows = [4, 9, 1, 6, 3, 8].map((serviceIndex, index) => { const start = Date.parse("2026-10-03T01:00:00.000Z") + index * 30 * 60 * 60_000; return { id: `DEMO-MAINT-${String(index + 1).padStart(3, "0")}`, serviceName: serviceOfferings[serviceIndex].name, startAt: new Date(start).toISOString(), endAt: new Date(start + (90 + index % 3 * 30) * 60_000).toISOString(), affectedClients: Math.min(serviceOfferings[serviceIndex].clients, 2 + index % 4) }; });
  const healthSeries = serviceOfferings.filter((service) => ["SOC Monitoring", "Vulnerability Management", "Incident Response", "Compliance & Risk"].includes(service.name));
  const dailyScheduled = [2, 1, 2, 1, 2, 2, 2];
  const dailyOnDemand = [3, 4, 3, 4, 2, 3, 4];
  const reportModes = dailyScheduled.flatMap((scheduled, dayIndex) => [...Array(scheduled).fill({ dayIndex, mode: "scheduled" as const }), ...Array(dailyOnDemand[dayIndex]).fill({ dayIndex, mode: "on-demand" as const })]);
  const reports = reportModes.map(({ dayIndex, mode }, index) => {
    const template = REPORT_TEMPLATES[REPORT_CATEGORY_SEQUENCE[index]];
    const format = index % 10 < 5 ? "PDF" as const : index % 10 < 7 ? "Excel" as const : index % 10 < 9 ? "CSV" as const : "HTML" as const;
    return { id: `DEMO-REPORT-${String(index + 1).padStart(3, "0")}` as const, templateId: template.id, reportName: `${template.name} · ${String(index + 1).padStart(2, "0")}`, clientId: clientSeeds[(index * 3) % clientSeeds.length].id, clientName: clientSeeds[(index * 3) % clientSeeds.length].name, category: template.category, generationMode: mode, generatedBy: REPORT_GENERATORS[index % REPORT_GENERATORS.length], generatedAt: new Date(Date.parse("2026-09-22T01:00:00.000Z") + dayIndex * 86_400_000 + (index % 5) * 2 * 60 * 60_000).toISOString(), status: index % 11 === 0 ? "failed" as const : "success" as const, format, generationDurationSeconds: 48 + index % 9 * 17, downloadCount: 1 + index % 6, consumer: REPORT_CONSUMERS[(index * 2) % REPORT_CONSUMERS.length] };
  });
  const reportSchedules = REPORT_TEMPLATES.map((template, index) => ({ id: `DEMO-SCHEDULE-${String(index + 1).padStart(3, "0")}`, templateId: template.id, reportName: template.name, frequency: (["Daily", "Weekly", "Monthly", "Weekly", "Monthly"] as const)[index], nextRun: new Date(Date.parse("2026-10-01T01:00:00.000Z") + index * 7 * 60 * 60_000).toISOString(), recipients: 2 + index * 2, status: index === 3 ? "Paused" as const : "Active" as const }));
  const result: MsspOverviewDemoData = {
    clients,
    activeServices: serviceAssignments.length,
    openIncidents: incidents.filter((item) => item.status !== "Resolved").length,
    mttrMinutes: Math.round(average(resolvedDurations)),
    serviceUptimePercent: average(serviceAssignments.map((item) => item.uptimePercent)),
    incidentStatuses: [...INCIDENT_STATUSES, "Resolved" as const].map((status) => ({ status, count: countBy(incidents.map((item) => item.status), status) })),
    recentIncidents: incidents
      .slice()
      .sort((left, right) => Date.parse(right.openedAt) - Date.parse(left.openedAt))
      .slice(0, 5)
      .map((incident) => ({
        id: incident.id,
        time: incident.openedAt,
        clientId: incident.clientId,
        clientName: clientSeeds.find((client) => client.id === incident.clientId)!.name,
        name: incident.name,
        status: incident.status,
        owner: incident.owner,
      })),
    demoIncidents,
    servicesByType: SERVICE_TYPES.map((type) => ({ type, count: serviceAssignments.filter((item) => item.type === type).length })),
    sla: { met: slaMet, breached: slaTotal - slaMet, total: slaTotal, percentage: slaMet / slaTotal * 100 },
    ticketStatuses: TICKET_STATUSES.map((status) => ({ status, count: countBy(tickets.map((item) => item.status), status) })),
    clientActivities: clients.map((client, index) => ({ clientId: client.id, timestamp: client.lastActivity, type: ACTIVITY_TYPES[index % ACTIVITY_TYPES.length] })),
    clientKpiHistory: historyOffsets.map((offset, index) => ({
      date: new Date(Date.parse("2026-09-22T00:00:00.000Z") + index * 86_400_000).toISOString(),
      totalClients: clients.length - offset,
      activeClients: Math.max(0, activeClients - [2, 2, 1, 1, 1, 0, 0][index]),
      atRiskClients: atRiskClients + [2, 1, 1, 0, 1, 0, 0][index],
      inactiveClients: inactiveClients + [1, 1, 0, 0, 0, 0, 0][index],
      slaPercent: clientsMeetingSla / clients.length * 100 + [-2.4, -1.8, -1.2, -0.8, -0.4, -0.2, 0][index],
      averageRisk: averageClientRisk + [2, 1.5, 1, 0.8, 0.5, 0.2, 0][index],
      newClients: index === 0 ? 0 : historyOffsets[index - 1] - offset,
      openAlerts: Math.round(totalOpenAlerts * [0.86, 0.9, 0.88, 0.94, 0.97, 0.95, 1][index]),
      openIncidents: Math.round(totalOpenIncidents * [0.78, 0.84, 0.9, 0.86, 0.94, 0.96, 1][index]),
    })),
    incidentKpiHistory: historyOffsets.map((_, index) => ({
      date: new Date(Date.parse("2026-09-22T00:00:00.000Z") + index * 86_400_000).toISOString(),
      openIncidents: Math.round(totalOpenIncidents * [0.78, 0.84, 0.9, 0.86, 0.94, 0.96, 1][index]),
      mttrMinutes: [76, 74, 73, 72, 70, 69, Math.round(average(resolvedDurations))][index],
      needingAttention: Math.max(0, needingAttention + [3, 2, 2, 1, 1, 0, 0][index]),
    })),
    serviceOfferings,
    serviceIssues,
    maintenanceWindows,
    serviceHealthHistory: historyOffsets.map((_, index) => ({ date: new Date(Date.parse("2026-09-22T00:00:00.000Z") + index * 86_400_000).toISOString(), scores: healthSeries.map((service, serviceIndex) => ({ serviceName: service.name, score: index === 6 ? service.healthScore : Math.max(0, service.healthScore - [4, 3, 5, 2, 3, 1][(index + serviceIndex) % 6]) })) })),
    serviceKpiHistory: historyOffsets.map((offset, index) => ({ date: new Date(Date.parse("2026-09-22T00:00:00.000Z") + index * 86_400_000).toISOString(), totalServices: serviceAssignments.length - offset, activeServices: serviceAssignments.length - offset, serviceIssues: openServiceIssues.length + [2, 2, 1, 1, 1, 0, 0][index], maintenanceWindows: maintenanceWindows.length - [2, 2, 1, 1, 0, 0, 0][index], slaPercent: slaMet / slaTotal * 100 + [-1.8, -1.4, -1, -0.7, -0.4, -0.2, 0][index], slaBreached: slaTotal - slaMet + [2, 2, 1, 1, 1, 0, 0][index] })),
    reports,
    reportTemplates: REPORT_TEMPLATES.map((template) => ({ ...template })),
    reportSchedules,
    reportHistory: historyOffsets.map((_, index) => { const dayReports = reports.filter((report) => report.generatedAt.startsWith(`2026-09-${String(22 + index).padStart(2, "0")}`)); const successful = dayReports.filter((report) => report.status === "success").length; return { date: new Date(Date.parse("2026-09-22T00:00:00.000Z") + index * 86_400_000).toISOString(), scheduled: dayReports.filter((report) => report.generationMode === "scheduled").length, onDemand: dayReports.filter((report) => report.generationMode === "on-demand").length, downloads: dayReports.reduce((total, report) => total + report.downloadCount, 0), successRate: dayReports.length ? successful / dayReports.length * 100 : 0 }; }),
  };
  assertConsistent(result);
  return result;
}

function assertConsistent(data: MsspOverviewDemoData) {
  const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
  if (data.clients.length !== CLIENT_COUNT) throw new Error("MSSP demo client population is inconsistent");
  if (sum(data.clients.map((client) => client.services)) !== data.activeServices) throw new Error("MSSP demo service assignments are inconsistent");
  if (sum(data.clients.map((client) => client.openIncidents)) !== data.openIncidents) throw new Error("MSSP demo client incidents are inconsistent");
  if (sum(data.incidentStatuses.filter((item) => item.status !== "Resolved").map((item) => item.count)) !== data.openIncidents) throw new Error("MSSP demo incident workflow is inconsistent");
  if (data.recentIncidents.length > 5 || data.recentIncidents.some((recent) => !incidents.some((incident) => incident.id === recent.id))) throw new Error("MSSP demo recent incidents are inconsistent");
  if (sum(data.servicesByType.map((item) => item.count)) !== data.activeServices) throw new Error("MSSP demo service types are inconsistent");
  if (data.sla.met + data.sla.breached !== data.sla.total || data.sla.total !== data.activeServices) throw new Error("MSSP demo SLA population is inconsistent");
  if (Math.abs(data.sla.percentage - data.sla.met / data.sla.total * 100) > Number.EPSILON) throw new Error("MSSP demo SLA percentage is inconsistent");
  if (sum(data.ticketStatuses.map((item) => item.count)) !== tickets.length) throw new Error("MSSP demo ticket workflow is inconsistent");
  if (data.clientActivities.length !== data.clients.length || data.clientActivities.some((activity) => !data.clients.some((client) => client.id === activity.clientId))) throw new Error("MSSP demo client activities are inconsistent");
  const latestHistory = data.clientKpiHistory.at(-1);
  if (!latestHistory || latestHistory.totalClients !== data.clients.length || latestHistory.openIncidents !== data.openIncidents) throw new Error("MSSP demo client history is inconsistent");
  const latestIncidentHistory = data.incidentKpiHistory.at(-1);
  if (!latestIncidentHistory || latestIncidentHistory.openIncidents !== data.openIncidents || latestIncidentHistory.mttrMinutes !== data.mttrMinutes) throw new Error("MSSP demo incident history is inconsistent");
  if (sum(data.serviceOfferings.map((service) => service.assignments)) !== data.activeServices) throw new Error("MSSP demo service offerings are inconsistent");
  if (data.serviceIssues.filter((issue) => issue.status !== "Resolved").length !== data.serviceKpiHistory.at(-1)?.serviceIssues) throw new Error("MSSP demo service issues are inconsistent");
  if (data.maintenanceWindows.length !== data.serviceKpiHistory.at(-1)?.maintenanceWindows) throw new Error("MSSP demo maintenance windows are inconsistent");
  if (data.serviceKpiHistory.at(-1)?.activeServices !== data.activeServices) throw new Error("MSSP demo service history is inconsistent");
  if (data.reports.length !== REPORT_CATEGORY_SEQUENCE.length) throw new Error("MSSP demo report population is inconsistent");
  if (sum(data.reportHistory.map((item) => item.scheduled + item.onDemand)) !== data.reports.length) throw new Error("MSSP demo report history is inconsistent");
  if (data.reports.some((report) => !data.clients.some((client) => client.id === report.clientId))) throw new Error("MSSP demo report clients are inconsistent");
  if (data.reports.some((report) => !data.reportTemplates.some((template) => template.id === report.templateId))) throw new Error("MSSP demo report templates are inconsistent");
}

/** Shared deterministic read model for MSSP enterprise demo capabilities. */
export function getMsspOverviewDemo(): MsspOverviewDemoData {
  return structuredClone(buildDemoData());
}
