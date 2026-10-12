import "server-only";
import { calculateDemoComplianceScore } from "@/services/mssp-compliance-metrics";
import type { MsspAccountManagementDemoData, MsspAssetsDemoData, MsspComplianceDemoData, MsspComplianceStatus, MsspDemoAccountMetadata, MsspDemoAssetRiskLevel, MsspDemoTicket, MsspOverviewDemoData, MsspSettingsDemoData, MsspTicketsDemoData } from "@/types/mssp";

const CLIENT_COUNT = 25;
const SERVICE_TYPES = ["SOC Monitoring", "Vulnerability Management", "Threat Intelligence", "Incident Response", "Compliance & Risk", "Log Management", "Endpoint Security", "Email Security", "Cloud Security Monitoring", "Firewall Monitoring"] as const;
const SERVICE_CATEGORIES: Record<typeof SERVICE_TYPES[number], string> = {
  "SOC Monitoring": "Security Monitoring", "Vulnerability Management": "Security Assessment", "Threat Intelligence": "Threat Intelligence", "Incident Response": "Incident Response", "Compliance & Risk": "GRC", "Log Management": "Log Management", "Endpoint Security": "Endpoint Security", "Email Security": "Email Security", "Cloud Security Monitoring": "Cloud Security", "Firewall Monitoring": "Network Security",
};
const INCIDENT_STATUSES = ["New", "Investigating", "In Progress", "Contained"] as const;
const TICKET_STATUSES = ["Open", "In Progress", "Waiting", "Resolved", "Closed"] as const;
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
const TICKET_SNAPSHOT = "2026-09-28T12:00:00.000Z";
const TICKET_SUBJECTS = ["Suspicious authentication activity", "Endpoint security investigation", "Access review request", "Vulnerability remediation follow-up", "Network security investigation", "Security monitoring request", "Incident response coordination"] as const;
const TICKET_CATEGORIES = ["Incident Response", "Endpoint Security", "Access Management", "Vulnerability Management", "Network Security", "Security Monitoring", "Other"] as const;
const TICKET_PRIORITIES = ["Critical", "High", "Medium", "Low", "Informational"] as const;
const TICKET_TEAMS = ["SOC L1 Team", "SOC L2 Team", "Access Team", "Endpoint Team", "Network Team", "Security Operations"] as const;
const tickets: MsspDemoTicket[] = Array.from({ length: 47 }, (_, index) => {
  const status = TICKET_STATUSES[(index * 3 + Math.floor(index / 7)) % TICKET_STATUSES.length];
  const priority = TICKET_PRIORITIES[(index * 2 + Math.floor(index / 5)) % TICKET_PRIORITIES.length];
  const created = Date.parse(TICKET_SNAPSHOT) - (index % 12) * 86_400_000 - (index * 73 % 20) * 3_600_000;
  const target = ({ Critical: 240, High: 480, Medium: 720, Low: 1440, Informational: 2880 } as const)[priority];
  const started = status === "Open" ? null : created + (25 + index % 5 * 15) * 60_000;
  const isResolved = status === "Resolved" || status === "Closed";
  const resolved = isResolved ? created + (target * (index % 6 === 0 ? 1.25 : .45 + index % 4 * .12)) * 60_000 : null;
  const closed = status === "Closed" && resolved ? resolved + (45 + index % 4 * 30) * 60_000 : null;
  const evaluation = resolved ?? Date.parse(TICKET_SNAPSHOT);
  return { id: `DEMO-TKT-${String(index + 1).padStart(3, "0")}`, clientId: clientSeeds[(index * 7 + 2) % clientSeeds.length].id, subject: TICKET_SUBJECTS[index % TICKET_SUBJECTS.length], category: TICKET_CATEGORIES[(index * 3) % TICKET_CATEGORIES.length], priority, status, assignedTeam: TICKET_TEAMS[(index * 5) % TICKET_TEAMS.length], createdAt: new Date(created).toISOString(), startedAt: started ? new Date(started).toISOString() : null, resolvedAt: resolved ? new Date(resolved).toISOString() : null, closedAt: closed ? new Date(closed).toISOString() : null, slaTargetMinutes: target, slaDueAt: new Date(created + target * 60_000).toISOString(), slaStatus: evaluation <= created + target * 60_000 ? "Met" : "Breached" };
});

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
    tickets,
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

/** Explicit read-only ticket demo provider; never used as an automatic real-provider fallback. */
export function getMsspTicketsDemo(): MsspTicketsDemoData {
  const overview = buildDemoData();
  return structuredClone({ clients: overview.clients, tickets: overview.tickets, snapshotAt: TICKET_SNAPSHOT });
}

const ASSET_SNAPSHOT = "2026-09-28T12:00:00.000Z";
const ASSET_TYPES = ["Server", "Workstation", "Network Device", "Cloud Resource", "Application", "Other"] as const;
const ASSET_PREFIXES = ["SRV", "WS", "NET", "CLOUD", "APP", "AUX"] as const;
const ASSET_OS = ["Windows", "Linux", "Network OS", "macOS", "Other"] as const;
const ASSET_LIFECYCLES = ["Active", "Active", "Active", "Inactive", "Offline", "Decommissioned"] as const;
const ASSET_LOCATIONS = ["Jakarta", "Surabaya", "Singapore", "Tokyo", "Sydney"] as const;
const ASSET_SOURCES = ["Endpoint Agent", "Network Discovery", "Cloud Inventory", "Manual Entry"] as const;

/** Shared demo asset risk rule: High >=75, Medium >=50, Low >=25, otherwise Info. */
export function demoAssetRiskLevel(score: number): MsspDemoAssetRiskLevel {
  if (score >= 75) return "High";
  if (score >= 50) return "Medium";
  if (score >= 25) return "Low";
  return "Info";
}

function buildAssetsDemoData(): MsspAssetsDemoData {
  const clients = buildDemoData().clients;
  const assets = Array.from({ length: 64 }, (_, index) => {
    const assetType = ASSET_TYPES[(index * 5 + Math.floor(index / 8)) % ASSET_TYPES.length];
    const riskScore = (17 + index * 19) % 101;
    const vulnerabilityCount = index % 5 === 0 ? 0 : (index * 7) % 18;
    const firstSeen = Date.parse(ASSET_SNAPSHOT) - (index % 23) * 86_400_000 - (index % 8) * 3_600_000;
    const criticalVulnerabilityCount = vulnerabilityCount && riskScore >= 75 ? 1 + index % 2 : 0;
    const highVulnerabilityCount = vulnerabilityCount ? Math.min(vulnerabilityCount - criticalVulnerabilityCount, index % 4) : 0;
    return { id: `DEMO-ASSET-${String(index + 1).padStart(3, "0")}` as const, assetName: `DEMO-${ASSET_PREFIXES[ASSET_TYPES.indexOf(assetType)]}-${String(index + 1).padStart(2, "0")}` as const, clientId: clients[(index * 11 + 3) % clients.length].id, assetType, operatingSystem: ASSET_OS[(index * 3 + 1) % ASSET_OS.length], managementStatus: index % 5 === 0 || index % 11 === 0 ? "Unmanaged" as const : "Managed" as const, lifecycleStatus: ASSET_LIFECYCLES[(index * 5) % ASSET_LIFECYCLES.length], riskScore, riskLevel: demoAssetRiskLevel(riskScore), vulnerabilityCount, criticalVulnerabilityCount, highVulnerabilityCount, location: ASSET_LOCATIONS[(index * 2 + 1) % ASSET_LOCATIONS.length], discoverySource: ASSET_SOURCES[(index * 3) % ASSET_SOURCES.length], firstSeen: new Date(firstSeen).toISOString(), lastSeen: new Date(Date.parse(ASSET_SNAPSHOT) - (index % 12) * 55 * 60_000).toISOString() };
  });
  const changeTypes = ["New Asset Added", "Risk Level Changed", "Asset Updated", "Vulnerability Detected", "Status Changed", "Management Status Changed"] as const;
  const changes = assets.slice(0, 8).map((asset, index) => ({ id: `DEMO-ASSET-CHANGE-${String(index + 1).padStart(3, "0")}` as const, assetId: asset.id, changedAt: new Date(Date.parse(ASSET_SNAPSHOT) - index * 95 * 60_000).toISOString(), changeType: changeTypes[index % changeTypes.length], changedBy: index % 3 === 0 ? "System" as const : "Inventory Sync" as const }));
  const result: MsspAssetsDemoData = { clients, assets, changes, snapshotAt: ASSET_SNAPSHOT };
  if (assets.some((asset) => !clients.some((client) => client.id === asset.clientId))) throw new Error("MSSP demo asset clients are inconsistent");
  if (assets.some((asset) => asset.riskLevel !== demoAssetRiskLevel(asset.riskScore))) throw new Error("MSSP demo asset risk levels are inconsistent");
  return result;
}

/** Explicit read-only asset demo provider; it never reads Wazuh or external inventory systems. */
export function getMsspAssetsDemo(): MsspAssetsDemoData { return structuredClone(buildAssetsDemoData()); }

const ACCOUNT_SNAPSHOT = ASSET_SNAPSHOT;
const OPEN_TICKET_STATUSES = ["Open", "In Progress", "Waiting"] as const;
const ACCOUNT_SEGMENTS = ["Enterprise", "Large Business", "Medium Business", "Small Business"] as const;
const ACCOUNT_OWNERS = ["Account Manager A", "Account Manager B", "Account Manager C"] as const;
const ACCOUNT_TIERS = ["Premium", "Standard", "Basic"] as const;
const ONBOARDING_STAGES = ["Verification & Setup", "Assessment", "Service Configuration", "Contract Review"] as const;

function buildAccountManagementDemoData(): MsspAccountManagementDemoData {
  const overview = buildDemoData();
  const assetData = buildAssetsDemoData();
  const reference = Date.parse(ACCOUNT_SNAPSHOT);
  const day = 86_400_000;
  const accounts: MsspDemoAccountMetadata[] = overview.clients.map((client, index) => {
    const lifecycleStatus = client.status === "Inactive" ? "Suspended" as const : client.status === "Onboarding" ? "Onboarding" as const : index === overview.clients.length - 1 ? "Offboarding" as const : "Active" as const;
    const onboardingIndex = index % ONBOARDING_STAGES.length;
    return {
      clientId: client.id,
      segment: ACCOUNT_SEGMENTS[index % ACCOUNT_SEGMENTS.length],
      lifecycleStatus,
      contractStart: new Date(reference - (index < 3 ? 8 + index * 9 : 80 + index * 19) * day).toISOString(),
      contractEnd: new Date(reference + (12 + index * 17 % 150) * day).toISOString(),
      serviceTier: ACCOUNT_TIERS[index % ACCOUNT_TIERS.length],
      accountOwner: ACCOUNT_OWNERS[index % ACCOUNT_OWNERS.length],
      onboardingStage: lifecycleStatus === "Onboarding" ? ONBOARDING_STAGES[onboardingIndex] : "Completed",
      onboardingProgress: lifecycleStatus === "Onboarding" ? [20, 45, 70, 90][onboardingIndex] : 100,
      satisfactionScore: 3.7 + index % 7 * .2,
      lastActivityAt: client.lastActivity,
    };
  });
  const rows = accounts.map((account) => {
    const client = overview.clients.find((item) => item.id === account.clientId)!;
    const clientServices = serviceAssignments.filter((item) => item.clientId === account.clientId);
    const metServices = clientServices.filter((item) => item.slaMet).length;
    return {
      ...account,
      clientName: client.name,
      industry: client.industry,
      assets: assetData.assets.filter((asset) => asset.clientId === account.clientId).length,
      openTickets: tickets.filter((ticket) => ticket.clientId === account.clientId && OPEN_TICKET_STATUSES.includes(ticket.status as typeof OPEN_TICKET_STATUSES[number])).length,
      slaPercent: clientServices.length ? metServices / clientServices.length * 100 : 0,
    };
  });
  const current = {
    totalClients: rows.length,
    activeClients: rows.filter((row) => row.lifecycleStatus === "Active").length,
    newClients: rows.filter((row) => reference - Date.parse(row.contractStart) >= 0 && reference - Date.parse(row.contractStart) <= 30 * day).length,
    suspendedClients: rows.filter((row) => row.lifecycleStatus === "Suspended").length,
    expiringContracts: rows.filter((row) => Date.parse(row.contractEnd) > reference && Date.parse(row.contractEnd) - reference <= 30 * day).length,
    satisfactionScore: average(rows.map((row) => row.satisfactionScore)),
  };
  const offsets = [5, 4, 3, 2, 1, 0];
  const result: MsspAccountManagementDemoData = {
    clients: overview.clients,
    accounts,
    rows,
    snapshotAt: ACCOUNT_SNAPSHOT,
    newClientPeriodDays: 30,
    openTicketStatuses: [...OPEN_TICKET_STATUSES],
    kpiHistory: {
      totalClients: offsets.map((offset) => current.totalClients - Math.ceil(offset / 2)),
      activeClients: offsets.map((offset) => current.activeClients - Math.ceil(offset / 3)),
      newClients: [0, 1, 1, 2, 2, current.newClients],
      suspendedClients: offsets.map((offset) => current.suspendedClients + (offset > 3 ? 1 : 0)),
      expiringContracts: offsets.map((offset) => Math.max(0, current.expiringContracts - Math.ceil(offset / 3))),
      satisfactionScore: offsets.map((offset) => current.satisfactionScore - offset * .03),
    },
  };
  if (accounts.length !== overview.clients.length || rows.some((row) => !overview.clients.some((client) => client.id === row.clientId))) throw new Error("MSSP demo account clients are inconsistent");
  if (rows.reduce((sum, row) => sum + row.assets, 0) !== assetData.assets.length) throw new Error("MSSP demo account assets are inconsistent");
  if (rows.reduce((sum, row) => sum + row.openTickets, 0) !== tickets.filter((ticket) => OPEN_TICKET_STATUSES.includes(ticket.status as typeof OPEN_TICKET_STATUSES[number])).length) throw new Error("MSSP demo account tickets are inconsistent");
  return result;
}

/** Read-only client lifecycle view composed from the shared client, asset, ticket, and service fixtures. */
export function getMsspAccountManagementDemo(): MsspAccountManagementDemoData { return structuredClone(buildAccountManagementDemoData()); }

const SETTINGS_SNAPSHOT = "2026-09-28T12:00:00.000Z";

function buildSettingsDemoData(): MsspSettingsDemoData {
  const roles = [
    { id: "DEMO-ROLE-ADMIN", name: "MSSP Admin", description: "Administrative preview role" },
    { id: "DEMO-ROLE-MANAGER", name: "SOC Manager", description: "Operations oversight preview" },
    { id: "DEMO-ROLE-L2", name: "SOC Analyst L2", description: "Advanced investigation preview" },
    { id: "DEMO-ROLE-L1", name: "SOC Analyst L1", description: "Triage workflow preview" },
    { id: "DEMO-ROLE-THREAT", name: "Threat Analyst", description: "Threat research preview" },
    { id: "DEMO-ROLE-VIEWER", name: "Client Viewer", description: "Read-only client preview" },
    { id: "DEMO-ROLE-AUDITOR", name: "Auditor", description: "Audit review preview" },
  ];
  const identities = [
    ["Demo Admin", "demo.admin", 0, "Active"], ["Demo SOC Manager", "demo.soc.manager", 1, "Active"],
    ["Demo Analyst 01", "demo.analyst01", 3, "Active"], ["Demo Analyst 02", "demo.analyst02", 3, "Active"],
    ["Demo Senior Analyst", "demo.senior.analyst", 2, "Active"], ["Demo Threat Analyst", "demo.threat", 4, "Active"],
    ["Demo Client Viewer", "demo.client.viewer", 5, "Active"], ["Demo Auditor", "demo.auditor", 6, "Inactive"],
    ["Demo Analyst 03", "demo.analyst03", 3, "Inactive"],
  ] as const;
  const users = identities.map(([displayName, alias, roleIndex, status], index) => ({ id: `DEMO-ADMIN-USER-${String(index + 1).padStart(2, "0")}`, displayName, emailAlias: `${alias}@example.invalid` as const, roleId: roles[roleIndex].id, status, lastLoginAt: status === "Active" ? new Date(Date.parse(SETTINGS_SNAPSHOT) - (index * 9 + 2) * 3_600_000).toISOString() : null }));
  const actions = ["Login", "View Dashboard", "Review Incident", "View Asset Inventory", "Generate Demo Report", "Update Demo Preference"] as const;
  const resources = ["Signed session", "MSSP dashboard", "Demo incident", "Demo asset inventory", "Demo report", "Demo notification preference"];
  const auditEvents = Array.from({ length: 18 }, (_, index) => ({ id: `DEMO-AUDIT-${String(index + 1).padStart(3, "0")}`, timestamp: new Date(Date.parse(SETTINGS_SNAPSHOT) - (index * 8 + 1) * 3_600_000).toISOString(), actor: users[index % users.length].displayName, action: actions[index % actions.length], resource: resources[index % resources.length], source: "Demo Admin Preview" as const }));
  const integrations: MsspSettingsDemoData["integrations"] = [
    ["Wazuh Manager", "Security telemetry capability", "AVAILABLE"], ["Wazuh / OpenSearch", "Security analytics capability", "AVAILABLE"],
    ["Bitdefender", "Endpoint incident capability", "AVAILABLE"], ["AbuseIPDB", "Threat intelligence capability", "AVAILABLE"],
    ["PostgreSQL", "Application persistence capability", "AVAILABLE"], ["Incident Ticketing", "External service desk capability", "NOT CONFIGURED"],
  ].map(([name, type, state]) => ({ name, type, state: state as "AVAILABLE" | "NOT CONFIGURED", health: "UNKNOWN", healthChecked: false }));
  const result: MsspSettingsDemoData = {
    snapshotAt: SETTINGS_SNAPSHOT, uptimePercent: 99.86, uptimeHistory: [99.72, 99.78, 99.75, 99.81, 99.83, 99.86],
    users, roles, auditEvents, auditHistory: [11, 13, 12, 15, 14, 16, 18], integrations,
    notifications: ["Critical Alerts", "High Severity Alerts", "System Notifications", "Daily Reports", "Compliance Alerts", "Maintenance Alerts"].map((name, index) => ({ name, email: index !== 5, inApp: index !== 3 })),
    apiAccess: { apiKeys: 7, activeApiKeys: 5, webhookEndpoints: 3, trustedIpRules: 6 },
    storage: { storageUsedPercent: 61, storageUsed: "366 GB of 600 GB", logStorage7Days: "84 GB", backups30Days: 12, lastBackupAt: "2026-09-28T02:30:00.000Z" },
    activities: [
      ["Demo backup verification completed", 2], ["Integration configuration reviewed", 7], ["Demo user activity recorded", 13],
      ["Security settings reviewed", 22], ["Demo report generated", 31],
    ].map(([activity, hours], index) => ({ id: `DEMO-SYSTEM-ACTIVITY-${index + 1}`, activity: String(activity), timestamp: new Date(Date.parse(SETTINGS_SNAPSHOT) - Number(hours) * 3_600_000).toISOString() })),
  };
  const roleUserTotal = roles.reduce((sum, role) => sum + users.filter((user) => user.roleId === role.id).length, 0);
  if (roleUserTotal !== users.length) throw new Error("MSSP demo settings role counts are inconsistent");
  if (auditEvents.some((event) => Date.parse(SETTINGS_SNAPSHOT) - Date.parse(event.timestamp) > 7 * 86_400_000)) throw new Error("MSSP demo settings audit period is inconsistent");
  return result;
}

/** Read-only settings preview; contains no environment values, secrets, endpoints, or runtime health claims. */
export function getMsspSettingsDemo(): MsspSettingsDemoData { return structuredClone(buildSettingsDemoData()); }

const COMPLIANCE_FRAMEWORKS: MsspComplianceDemoData["frameworks"] = [
  { id: "DEMO-FRAMEWORK-ISO27001", name: "ISO 27001", totalControls: 12 }, { id: "DEMO-FRAMEWORK-NISTCSF", name: "NIST CSF", totalControls: 10 },
  { id: "DEMO-FRAMEWORK-CIS", name: "CIS Controls", totalControls: 14 }, { id: "DEMO-FRAMEWORK-PCIDSS", name: "PCI DSS", totalControls: 9 },
];

function buildComplianceDemoData(): MsspComplianceDemoData {
  const clients = buildDemoData().clients;
  const statusCycle: MsspComplianceStatus[] = ["compliant", "compliant", "compliant", "partially-compliant", "compliant", "non-compliant", "compliant", "partially-compliant"];
  const assessments = COMPLIANCE_FRAMEWORKS.flatMap((framework, frameworkIndex) => clients.flatMap((client, clientIndex) => Array.from({ length: framework.totalControls }, (_, controlIndex) => {
    const sequence = frameworkIndex * 503 + clientIndex * 47 + controlIndex * 11;
    return { controlId: `DEMO-CONTROL-${frameworkIndex + 1}-${String(clientIndex + 1).padStart(2, "0")}-${String(controlIndex + 1).padStart(2, "0")}` as const, frameworkId: framework.id, clientId: client.id, status: sequence % 17 === 0 ? "not-applicable" as const : statusCycle[sequence % statusCycle.length], assessedAt: new Date(Date.parse("2026-09-28T00:00:00.000Z") - (sequence % 8) * 86_400_000).toISOString() };
  })));
  const gapNames = ["Access Review Coverage", "Vulnerability Remediation Evidence", "Incident Response Exercise", "Data Classification Review", "Backup Recovery Evidence", "Third-Party Risk Assessment", "Audit Logging Review"];
  const gaps = gapNames.map((title, index) => ({ id: `DEMO-GAP-${String(index + 1).padStart(3, "0")}` as const, title, frameworkId: COMPLIANCE_FRAMEWORKS[index % 4].id, affectedClientIds: clients.filter((_, clientIndex) => (clientIndex + index * 2) % (4 + index % 3) === 0).map((client) => client.id), riskLevel: (["Critical", "High", "High", "Medium", "Medium", "Low", "Critical"] as const)[index], status: (["Open", "Mitigating", "In Review"] as const)[index % 3] }));
  const audits = Array.from({ length: 5 }, (_, index) => ({ id: `DEMO-AUDIT-${String(index + 1).padStart(3, "0")}` as const, clientId: clients[(index * 4 + 1) % clients.length].id, auditType: ["Readiness Review", "Control Review", "Evidence Review", "Internal Audit", "Scope Review"][index], frameworkId: COMPLIANCE_FRAMEWORKS[index % 4].id, scheduledDate: new Date(Date.parse("2026-10-08T00:00:00.000Z") + index * 6 * 86_400_000).toISOString(), status: (["Preparation", "Scheduled", "Upcoming"] as const)[index % 3] }));
  const activityNames = ["Review Access Control Policy", "Update Risk Register", "Conduct Vulnerability Review", "Review Data Classification", "Update Incident Response Plan"];
  const activities = activityNames.map((activity, index) => ({ id: `DEMO-ACTIVITY-${String(index + 1).padStart(3, "0")}` as const, activity, clientId: clients[(index * 5 + 2) % clients.length].id, frameworkId: COMPLIANCE_FRAMEWORKS[(index + 1) % 4].id, dueDate: new Date(Date.parse("2026-10-04T00:00:00.000Z") + index * 5 * 86_400_000).toISOString(), status: (["Pending", "In Progress", "Completed"] as const)[index % 3] }));
  const documentNames = ["Access Control Policy Register", "Control Assessment Summary", "Incident Response Procedure", "Evidence Tracking Matrix", "Risk Review Evidence Index"];
  const documentTypes = ["Policy", "Report", "Procedure", "Spreadsheet", "Evidence"] as const;
  const documents = documentNames.map((documentName, index) => ({ id: `DEMO-DOC-${String(index + 1).padStart(3, "0")}` as const, documentName, frameworkId: COMPLIANCE_FRAMEWORKS[index % 4].id, lastUpdated: new Date(Date.parse("2026-09-27T00:00:00.000Z") - index * 4 * 86_400_000).toISOString(), type: documentTypes[index] }));
  const currentScore = calculateDemoComplianceScore(assessments.map((assessment) => assessment.status));
  const scoreTrend = [-3.8, -3.1, -2.4, -1.7, -1.2, -0.5, 0].map((offset, index) => ({ date: new Date(Date.parse("2026-09-22T00:00:00.000Z") + index * 86_400_000).toISOString(), score: currentScore + offset }));
  const result: MsspComplianceDemoData = { clients, frameworks: COMPLIANCE_FRAMEWORKS.map((item) => ({ ...item })), assessments, gaps, audits, activities, documents, scoreTrend };
  if (assessments.some((assessment) => !clients.some((client) => client.id === assessment.clientId))) throw new Error("MSSP demo compliance clients are inconsistent");
  if (assessments.length !== clients.length * COMPLIANCE_FRAMEWORKS.reduce((total, framework) => total + framework.totalControls, 0)) throw new Error("MSSP demo compliance controls are inconsistent");
  return result;
}

/** Shared deterministic, read-only compliance preview. It does not consume security telemetry. */
export function getMsspComplianceDemo(): MsspComplianceDemoData { return structuredClone(buildComplianceDemoData()); }
