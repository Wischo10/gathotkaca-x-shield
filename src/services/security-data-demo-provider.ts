import {
  DataSource,
  DataSourceCategory,
  DataSourceEnvironment,
  DataSourceStatus,
  DailyIngestionMetric,
  RecentIntegrationAlert,
  SECURITY_DATA_CATEGORIES,
  SECURITY_EVENT_TYPES,
  SecurityEventType,
  SecurityDataIntegration,
  IntegrationActivity,
  IntegrationHealthStatus,
  IntegrationStatusSnapshot,
  DataQualityIssue,
  DataQualityRule,
  SecurityDataQualityProfile,
  SecurityAnalyticsUseCase,
  SecurityAnalyticsIncident,
  SecurityDataExplorerEvent,
  SecuritySavedQuery,
  SourceStatusSnapshot,
} from "@/types/security-data";

export const SECURITY_DATA_RETENTION_DAYS = 180;
export const SECURITY_DATA_CORRELATION_RULE_COUNT = 137;
export const SECURITY_DATA_AS_OF = "2026-10-05T09:00:00+07:00";

const sourceSeeds = [
  ["Demo Perimeter Firewall", "Network Security", "Syslog", "Active", 1184000, 1097300, 97, "2026-10-05T08:57:00+07:00"],
  ["Demo Endpoint Security", "Endpoint Security", "Agent", "Active", 967000, 908980, 95, "2026-10-05T08:55:00+07:00"],
  ["Demo Identity Provider", "Identity & Access", "REST API", "Active", 741000, 696540, 96, "2026-10-05T08:53:00+07:00"],
  ["Demo Cloud Audit", "Cloud Security", "Cloud API", "Active", 635000, 584200, 92, "2026-10-05T08:49:00+07:00"],
  ["Demo Wazuh Manager", "Endpoint Security", "OpenSearch", "Warning", 528000, 469920, 86, "2026-10-05T08:31:00+07:00"],
  ["Demo Network IDS", "Network Security", "Syslog", "Active", 812000, 747040, 94, "2026-10-05T08:56:00+07:00"],
  ["Demo Email Security", "Application Security", "Webhook", "Active", 386000, 351260, 91, "2026-10-05T08:47:00+07:00"],
  ["Demo Application Gateway", "Application Security", "REST API", "Active", 694000, 638480, 93, "2026-10-05T08:52:00+07:00"],
  ["Demo Vulnerability Scanner", "Other", "REST API", "Inactive", 91000, 78260, 81, "2026-10-03T16:20:00+07:00"],
  ["Demo Threat Intelligence Feed", "Threat Intelligence", "STIX/TAXII", "Active", 143000, 134420, 98, "2026-10-05T08:45:00+07:00"],
  ["Demo DNS Security", "Network Security", "Syslog", "Active", 923000, 849160, 94, "2026-10-05T08:58:00+07:00"],
  ["Demo Linux Audit", "Endpoint Security", "Agent", "Active", 477000, 438840, 92, "2026-10-05T08:54:00+07:00"],
  ["Demo Privileged Access", "Identity & Access", "Webhook", "Warning", 214000, 190460, 84, "2026-10-05T08:22:00+07:00"],
  ["Demo Container Runtime", "Cloud Security", "Agent", "Error", 169000, 136890, 72, "2026-10-05T07:41:00+07:00"],
] as const satisfies readonly (readonly [string, DataSourceCategory, string, DataSourceStatus, number, number, number, string])[];

const HEALTH_WEIGHT: Readonly<Record<DataSourceStatus, number>> = Object.freeze({ Active: 100, Warning: 65, Error: 20, Inactive: 0 });
const eventWeights = [18, 17, 12, 20, 10, 6, 5, 4, 5, 3] as const;

const sourceMetadata = [
  ["On-Premise", "2026-08-12", "Perimeter network event collection", "Security Engineering", "Streaming", "CEF", "demo-firewall.local"],
  ["Hybrid", "2026-07-18", "Endpoint activity and posture telemetry", "SOC Team", "Agent streaming", "JSON", "demo-endpoint-fleet"],
  ["Cloud", "2026-06-09", "Authentication and identity audit events", "IAM Team", "API polling", "JSON", "demo-identity.example"],
  ["Cloud", "2026-08-24", "Cloud control-plane audit activity", "Cloud Security Team", "API polling", "JSON", "demo-cloud-audit"],
  ["On-Premise", "2026-05-14", "Demo manager event index", "SOC Team", "Index query", "JSON", "demo-indexer.local"],
  ["On-Premise", "2026-07-02", "Network intrusion detection events", "Security Engineering", "Streaming", "CEF", "demo-network-ids.local"],
  ["Cloud", "2026-09-11", "Email security operational events", "SOC Team", "Webhook", "JSON", "demo-email-security"],
  ["Hybrid", "2026-08-03", "Application ingress security events", "Application Security", "API polling", "JSON", "demo-app-gateway.local"],
  ["On-Premise", "2026-06-22", "Scheduled vulnerability findings", "Vulnerability Management", "API polling", "JSON", "demo-vulnerability-scanner.local"],
  ["Cloud", "2026-10-02", "Curated threat indicator updates", "Threat Intelligence", "Feed polling", "STIX", "demo-threat-feed"],
  ["Hybrid", "2026-07-29", "DNS query and policy events", "Security Engineering", "Streaming", "CEF", "demo-dns-security.local"],
  ["On-Premise", "2026-09-18", "Linux host audit activity", "SOC Team", "Agent streaming", "JSON", "demo-linux-audit.local"],
  ["Cloud", "2026-08-31", "Privileged access audit activity", "IAM Team", "Webhook", "JSON", "demo-privileged-access"],
  ["On-Premise", "2026-09-30", "Container runtime operational events", "Cloud Security Team", "Agent streaming", "JSON", "demo-container-runtime.local"],
] as const satisfies readonly (readonly [DataSourceEnvironment, string, string, string, string, string, string])[];

const ingestionTimes = ["2026-10-05T08:45:00+07:00", "2026-10-05T07:45:00+07:00", "2026-10-05T06:45:00+07:00", "2026-10-05T05:45:00+07:00", "2026-10-05T04:45:00+07:00"] as const;

function ingestionHistory(events7d: number, status: DataSourceStatus, sourceIndex: number) {
  return Object.freeze(ingestionTimes.map((timestamp, index) => Object.freeze({
    timestamp,
    eventsReceived: Math.floor(events7d / (168 + index * 7) + sourceIndex * 13),
    status: index === 0 && status === "Error" ? "Failed" as const : index === 0 && status === "Warning" ? "Delayed" as const : "Received" as const,
  })));
}

function eventDistribution(total: number, sourceIndex: number): Readonly<Record<SecurityEventType, number>> {
  const rotated = eventWeights.map((_, index) => eventWeights[(index + sourceIndex) % eventWeights.length]);
  const result = {} as Record<SecurityEventType, number>;
  let assigned = 0;
  SECURITY_EVENT_TYPES.forEach((type, index) => {
    const count = index === SECURITY_EVENT_TYPES.length - 1 ? total - assigned : Math.floor((total * rotated[index]) / 100);
    result[type] = count;
    assigned += count;
  });
  return Object.freeze(result);
}

export const securityDataSources: readonly DataSource[] = Object.freeze(sourceSeeds.map((seed, index) => Object.freeze({
  id: `DEMO-SRC-${String(index + 1).padStart(3, "0")}` as const,
  name: seed[0], category: seed[1], connector: seed[2], status: seed[3], events7d: seed[4], normalizedEvents7d: seed[5],
  dataQualityScore: seed[6], lastIngestedAt: seed[7], retentionDays: SECURITY_DATA_RETENTION_DAYS,
  integrationHealth: HEALTH_WEIGHT[seed[3]], eventTypeDistribution: eventDistribution(seed[4], index),
  environment: sourceMetadata[index][0], firstSeenAt: sourceMetadata[index][1], sourceDescription: sourceMetadata[index][2],
  ownerTeam: sourceMetadata[index][3], connectorType: sourceMetadata[index][4], dataFormat: sourceMetadata[index][5],
  demoHostOrEndpointLabel: sourceMetadata[index][6], recentIngestionHistory: ingestionHistory(seed[4], seed[3], index),
})));

const totalEvents = securityDataSources.reduce((sum, source) => sum + source.events7d, 0);
const dailyWeights = [13, 14, 15, 13, 16, 14, 15] as const;
const seriesWeights = [26, 20, 15, 14, 16, 9] as const;
const dates = ["2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-05"] as const;

export const dailyIngestionMetrics: readonly DailyIngestionMetric[] = Object.freeze(dates.map((date, dayIndex) => {
  const dayTotal = dayIndex === dates.length - 1
    ? totalEvents - dailyWeights.slice(0, -1).reduce((sum, weight) => sum + Math.floor(totalEvents * weight / 100), 0)
    : Math.floor(totalEvents * dailyWeights[dayIndex] / 100);
  const values = seriesWeights.map((weight) => Math.floor(dayTotal * weight / 100));
  values[values.length - 1] += dayTotal - values.reduce((sum, value) => sum + value, 0);
  return Object.freeze({ date, firewall: values[0], endpoint: values[1], identity: values[2], cloud: values[3], application: values[4], other: values[5] });
}));

export const recentIntegrationAlerts: readonly RecentIntegrationAlert[] = Object.freeze([
  ["001", "Critical", "Demo Container Runtime connector stopped ingesting", "2026-10-05T07:42:00+07:00", 13],
  ["002", "Warning", "Demo Privileged Access ingestion delayed", "2026-10-05T08:23:00+07:00", 12],
  ["003", "Warning", "Demo Wazuh Manager connector latency detected", "2026-10-05T08:32:00+07:00", 4],
  ["004", "Success", "Demo DNS Security source health restored", "2026-10-05T08:05:00+07:00", 10],
  ["005", "Info", "Demo Threat Intelligence Feed source registered", "2026-10-04T16:15:00+07:00", 9],
].map(([id, severity, title, occurredAt, sourceIndex]) => Object.freeze({
  id: `DEMO-DATA-ALERT-${id}`,
  severity,
  title,
  occurredAt,
  sourceId: securityDataSources[Number(sourceIndex)].id,
})) as RecentIntegrationAlert[]);

export const securityDataKpiHistories = Object.freeze({
  totalSources: Object.freeze([11, 11, 12, 12, 13, 13, 14]),
  activeIntegrations: Object.freeze([8, 8, 9, 9, 10, 10, 10]),
  eventsIngested: Object.freeze([82, 86, 89, 84, 94, 91, 97]),
  normalizedEvents: Object.freeze([74, 77, 81, 79, 86, 84, 90]),
  correlationRules: Object.freeze([129, 130, 131, 132, 134, 135, 137]),
  retention: Object.freeze([180, 180, 180, 180, 180, 180, 180]),
});

export const sourceStatusHistory: readonly SourceStatusSnapshot[] = Object.freeze([
  { date: "2026-09-29", Active: 9, Warning: 2, Error: 1, Inactive: 2 },
  { date: "2026-09-30", Active: 10, Warning: 1, Error: 1, Inactive: 2 },
  { date: "2026-10-01", Active: 9, Warning: 2, Error: 2, Inactive: 1 },
  { date: "2026-10-02", Active: 10, Warning: 2, Error: 1, Inactive: 1 },
  { date: "2026-10-03", Active: 11, Warning: 1, Error: 1, Inactive: 1 },
  { date: "2026-10-04", Active: 10, Warning: 2, Error: 1, Inactive: 1 },
  { date: "2026-10-05", Active: 10, Warning: 2, Error: 1, Inactive: 1 },
]);

const integrationHealth: readonly IntegrationHealthStatus[] = ["Healthy", "Healthy", "Healthy", "Healthy", "Warning", "Healthy", "Healthy", "Healthy", "Disabled", "Healthy", "Healthy", "Healthy", "Warning", "Failed"];
const integrationLatency = [0.8, 1.1, 0.6, 1.4, 3.8, 0.9, 1.2, 1.6, null, 0.7, 0.9, 1.0, 4.6, null] as const;
const integrationAttempts = [820, 790, 760, 710, 680, 805, 640, 735, 120, 610, 780, 700, 590, 430] as const;
const integrationFailures: Readonly<Record<number, readonly (readonly [string, string, string])[]>> = Object.freeze({
  4: Object.freeze([["Connector timeout", "2026-10-02T11:20:00+07:00", "2026-10-05T08:30:00+07:00"] as const]),
  12: Object.freeze([["Rate limit exceeded", "2026-10-03T14:10:00+07:00", "2026-10-05T08:20:00+07:00"] as const]),
  13: Object.freeze([["Endpoint unavailable", "2026-10-01T09:15:00+07:00", "2026-10-05T07:40:00+07:00"] as const]),
});

export const securityDataIntegrations: readonly SecurityDataIntegration[] = Object.freeze(securityDataSources.map((source, index) => {
  const healthStatus = integrationHealth[index];
  const totalAttempts = integrationAttempts[index];
  const failedAttempts = healthStatus === "Healthy" ? 2 + index % 3 : healthStatus === "Warning" ? 18 + index : healthStatus === "Failed" ? 96 : 8;
  const successfulAttempts = totalAttempts - failedAttempts;
  return Object.freeze({
    id: `DEMO-INT-${String(index + 1).padStart(3, "0")}` as const,
    sourceId: source.id,
    connector: source.connector,
    healthStatus,
    lastIngestionAt: source.lastIngestedAt,
    ingestionLatencyMinutes: integrationLatency[index],
    ingestedEvents7d: source.events7d,
    successfulIngestionAttempts7d: successfulAttempts,
    totalIngestionAttempts7d: totalAttempts,
    successRate: Number((successfulAttempts / totalAttempts * 100).toFixed(1)),
    enabled: healthStatus !== "Disabled",
    failureHistory: Object.freeze((integrationFailures[index] ?? []).map(([error, firstOccurredAt, lastOccurredAt]) => Object.freeze({ error, firstOccurredAt, lastOccurredAt }))),
  });
}));

export const integrationStatusHistory: readonly IntegrationStatusSnapshot[] = Object.freeze([
  { date: "2026-09-29", Healthy: 9, Warning: 2, Failed: 1, Disabled: 2 },
  { date: "2026-09-30", Healthy: 10, Warning: 1, Failed: 1, Disabled: 2 },
  { date: "2026-10-01", Healthy: 9, Warning: 2, Failed: 2, Disabled: 1 },
  { date: "2026-10-02", Healthy: 10, Warning: 2, Failed: 1, Disabled: 1 },
  { date: "2026-10-03", Healthy: 11, Warning: 1, Failed: 1, Disabled: 1 },
  { date: "2026-10-04", Healthy: 10, Warning: 2, Failed: 1, Disabled: 1 },
  { date: "2026-10-05", Healthy: 10, Warning: 2, Failed: 1, Disabled: 1 },
]);

export const recentIntegrationActivity: readonly IntegrationActivity[] = Object.freeze([
  { id: "DEMO-INT-ACT-001", integrationId: "DEMO-INT-014", type: "FAILED", message: "Demo endpoint connectivity failure recorded", occurredAt: "2026-10-05T07:42:00+07:00", metadata: "No credentials involved" },
  { id: "DEMO-INT-ACT-002", integrationId: "DEMO-INT-013", type: "WARNING", message: "Elevated ingestion latency detected", occurredAt: "2026-10-05T08:23:00+07:00", metadata: "4.6 min latency" },
  { id: "DEMO-INT-ACT-003", integrationId: "DEMO-INT-005", type: "WARNING", message: "Demo connector processing delayed", occurredAt: "2026-10-05T08:32:00+07:00", metadata: "3.8 min latency" },
  { id: "DEMO-INT-ACT-004", integrationId: "DEMO-INT-011", type: "RECOVERED", message: "Demo integration health restored", occurredAt: "2026-10-05T08:05:00+07:00", metadata: "Latency returned to normal" },
  { id: "DEMO-INT-ACT-005", integrationId: "DEMO-INT-010", type: "SUCCESS", message: "Demo ingestion completed successfully", occurredAt: "2026-10-05T07:55:00+07:00", metadata: "842 events received" },
]);

const enabledLatencies = securityDataIntegrations.filter((integration) => integration.enabled && integration.ingestionLatencyMinutes !== null).map((integration) => integration.ingestionLatencyMinutes as number);
const totalIntegrationAttempts = securityDataIntegrations.reduce((sum, integration) => sum + integration.totalIngestionAttempts7d, 0);
const successfulIntegrationAttempts = securityDataIntegrations.reduce((sum, integration) => sum + integration.successfulIngestionAttempts7d, 0);
export const integrationKpiHistories = Object.freeze({
  total: Object.freeze([14, 14, 14, 14, 14, 14, 14]), active: Object.freeze([11, 11, 11, 12, 12, 12, 12]),
  failed: Object.freeze([1, 1, 2, 2, 3, 3, 3]), latency: Object.freeze([1.5, 1.6, 1.7, 1.8, 1.7, 1.6, 1.5]),
  volume: Object.freeze([88, 91, 90, 94, 96, 95, 98]), success: Object.freeze([97.1, 97.3, 96.8, 97.5, 97.2, 97.7, 98.0]),
});

export const DATA_QUALITY_THRESHOLD = 90;
const qualityIssueSeeds = [
  ["001", "Missing Fields", "High", [4, 13], 1842, "2026-10-05T06:40:00+07:00", "Open", [2200, 2110, 2050, 1980, 1910, 1870, 1842]],
  ["002", "Data Inconsistency", "Medium", [7, 12], 963, "2026-10-04T15:20:00+07:00", "Monitoring", [1100, 1080, 1040, 1010, 990, 978, 963]],
  ["003", "Duplicate Records", "Low", [1, 10], 428, "2026-10-03T10:15:00+07:00", "Monitoring", [520, 501, 480, 466, 451, 439, 428]],
  ["004", "Parsing Errors", "High", [13], 721, "2026-10-05T07:45:00+07:00", "Open", [610, 630, 650, 672, 690, 705, 721]],
  ["005", "Outdated Data", "Medium", [8, 12], 315, "2026-10-04T18:30:00+07:00", "Open", [390, 375, 360, 348, 336, 324, 315]],
  ["006", "Schema Mismatch", "Medium", [3, 6], 547, "2026-10-02T12:10:00+07:00", "Monitoring", [680, 651, 625, 601, 580, 561, 547]],
  ["007", "Timestamp Quality", "Low", [4, 8], 204, "2026-10-03T09:00:00+07:00", "Monitoring", [290, 276, 260, 244, 229, 216, 204]],
] as const;

export const dataQualityIssues: readonly DataQualityIssue[] = Object.freeze(qualityIssueSeeds.map(seed => Object.freeze({
  id: `DEMO-DQ-ISSUE-${seed[0]}` as const, type: seed[1], severity: seed[2],
  affectedSourceIds: Object.freeze(seed[3].map(index => securityDataSources[index].id)), recordsAffected: seed[4],
  detectedAt: seed[5], status: seed[6], trend: Object.freeze([...seed[7]]),
})));

export const dataQualityProfiles: readonly SecurityDataQualityProfile[] = Object.freeze(securityDataSources.map((source, index) => {
  const score = source.dataQualityScore;
  const completeness = Math.min(100, score + 2), accuracy = Math.min(100, score + 1), consistency = score, timeliness = score - 2, uniqueness = score - 1;
  const overallScore = Number(((completeness + accuracy + consistency + timeliness + uniqueness) / 5).toFixed(1));
  return Object.freeze({ sourceId: source.id, completeness, accuracy, consistency, timeliness, uniqueness, overallScore,
    issueIds: Object.freeze(dataQualityIssues.filter(issue => issue.affectedSourceIds.includes(source.id)).map(issue => issue.id)),
    trend: Object.freeze([score - 2.4, score - 2.0, score - 1.5, score - 1.2, score - 0.8, score - 0.3, score].map(value => Number(value.toFixed(1)))),
  });
}));

const qualityRuleSeeds = [
  ["Required Field Presence", "Completeness", "High", "Warning", [4,13]], ["Timestamp Freshness", "Timeliness", "Medium", "Warning", [8,12]],
  ["Address Format Validation", "Accuracy", "Medium", "Passed", []], ["Identifier Consistency", "Consistency", "Medium", "Passed", []],
  ["Duplicate Event Check", "Uniqueness", "Low", "Warning", [1,10]], ["Schema Field Validation", "Consistency", "High", "Failed", [13]],
  ["Event Timestamp Validation", "Accuracy", "Medium", "Passed", []], ["Required Identifier Check", "Completeness", "High", "Passed", []],
  ["Freshness Window Check", "Timeliness", "Medium", "Passed", []], ["Normalized Value Check", "Accuracy", "Low", "Passed", []],
  ["Record Uniqueness Check", "Uniqueness", "Low", "Passed", []], ["Category Consistency Check", "Consistency", "Medium", "Passed", []],
] as const;
export const dataQualityRules: readonly DataQualityRule[] = Object.freeze(qualityRuleSeeds.map((seed,index)=>Object.freeze({
  id:`DEMO-DQ-RULE-${String(index+1).padStart(3,"0")}` as const,name:seed[0],dimension:seed[1],severity:seed[2],status:seed[3],
  lastRunAt:`2026-10-05T0${8-index%4}:${String(10+index*3).padStart(2,"0")}:00+07:00`,affectedSourceIds:Object.freeze(seed[4].map(sourceIndex=>securityDataSources[sourceIndex].id)),
})));

const avg = (values: readonly number[]) => Number((values.reduce((sum,value)=>sum+value,0)/values.length).toFixed(1));
const qualityDimensions = Object.freeze({ completeness: avg(dataQualityProfiles.map(profile=>profile.completeness)), accuracy: avg(dataQualityProfiles.map(profile=>profile.accuracy)), consistency: avg(dataQualityProfiles.map(profile=>profile.consistency)), timeliness: avg(dataQualityProfiles.map(profile=>profile.timeliness)), uniqueness: avg(dataQualityProfiles.map(profile=>profile.uniqueness)) });
const overallQualityScore = avg(dataQualityProfiles.map(profile=>profile.overallScore));
export const dataQualityHistory = Object.freeze(["2026-09-29","2026-09-30","2026-10-01","2026-10-02","2026-10-03","2026-10-04","2026-10-05"].map((date,index)=>{
  const offset=[-2.1,-1.8,-1.4,-1.0,-0.7,-0.3,0][index]; return Object.freeze({date,overall:Number((overallQualityScore+offset).toFixed(1)),completeness:Number((qualityDimensions.completeness+offset).toFixed(1)),accuracy:Number((qualityDimensions.accuracy+offset).toFixed(1)),consistency:Number((qualityDimensions.consistency+offset).toFixed(1)),timeliness:Number((qualityDimensions.timeliness+offset).toFixed(1)),uniqueness:Number((qualityDimensions.uniqueness+offset).toFixed(1))});
}));

export const dataQualityRecommendations = Object.freeze(dataQualityIssues.map(issue=>Object.freeze({
  issueId:issue.id, recommendation: ({"Missing Fields":"Review field mapping for affected sources","Data Inconsistency":"Review normalization consistency for affected sources","Duplicate Records":"Review deduplication logic","Parsing Errors":"Review parser and mapping configuration","Outdated Data":"Review ingestion freshness for affected sources","Schema Mismatch":"Review normalized field mapping","Timestamp Quality":"Review event timestamp handling"} as Record<string,string>)[issue.type],
  affectedSourceCount:issue.affectedSourceIds.length, estimatedRecordImpact:issue.recordsAffected, impact:issue.severity==="Critical"||issue.severity==="High"?"High":issue.severity==="Medium"?"Medium":"Low",
})));

const useCaseSeeds = [
  ["Brute Force Detection","Identity Threat","Active","Critical","Identity Security",[2,12],1840,6,4.8,94,"Detect repeated authentication failures against accounts within a defined demo time window."],
  ["Impossible Travel Detection","User Behavior","Active","High","Threat Detection",[2,12],620,3,6.2,91,"Correlate authentication geography and session timing for improbable travel patterns."],
  ["Suspicious Authentication","Identity Threat","Active","High","Identity Security",[2,12],1330,5,5.6,92,"Identify unusual authentication context using demo identity and privileged-access signals."],
  ["Malware Communication","Network Threat","Active","Critical","Threat Detection",[0,5,10],980,4,3.9,96,"Correlate endpoint and network indicators associated with suspicious outbound communication."],
  ["Data Exfiltration Detection","Data Protection","Active","Critical","SOC Team",[0,5,7],740,4,7.8,89,"Review unusual outbound data volume and destination context across network sources."],
  ["Privileged Account Abuse","Identity Threat","Active","High","Identity Security",[2,12],510,3,8.4,87,"Correlate privileged access activity with unusual authentication and access behavior."],
  ["Lateral Movement Detection","Network Threat","Active","Critical","Detection Engineering",[1,5,11],1120,5,5.1,93,"Identify unusual east-west access patterns and endpoint authentication sequences."],
  ["Phishing Detection","Email Security","Active","High","SOC Team",[6,2],860,4,6.7,90,"Correlate suspicious email indicators with subsequent authentication activity."],
  ["Suspicious Cloud Configuration","Cloud Security","Active","High","Cloud Security",[3,13],430,3,9.5,84,"Identify unusual demo cloud configuration changes and runtime control events."],
  ["Ransomware Behavior","Endpoint Threat","Active","Critical","Detection Engineering",[1,4,11],690,4,3.6,95,"Correlate rapid file activity, endpoint signals, and host audit behavior."],
  ["Anomalous Login","User Behavior","Paused","Medium","Identity Security",[2],280,1,10.2,82,"Review login behavior that differs from established demo session patterns."],
  ["Suspicious Network Scanning","Network Threat","Draft","Medium","Threat Detection",[0,5,10],350,2,7.1,86,"Identify concentrated connection attempts across multiple destinations and services."],
] as const;
const distribute = (total:number,weights:readonly number[]) => {let used=0;return Object.freeze(weights.map((weight,index)=>{const value=index===weights.length-1?total-used:Math.floor(total*weight/100);used+=value;return value}))};
const alertDayWeights=[12,14,13,16,15,14,16] as const,incidentDayWeights=[14,14,15,14,14,14,15] as const;
export const analyticsUseCases: readonly SecurityAnalyticsUseCase[] = Object.freeze(useCaseSeeds.map((seed,index)=>{
  const effectiveness=seed[9];
  return Object.freeze({id:`DEMO-UC-${String(index+1).padStart(3,"0")}` as const,name:seed[0],description:`Demo analytics: ${seed[0].toLowerCase()} monitoring.`,category:seed[1],status:seed[2],priority:seed[3],ownerTeam:seed[4],createdAt:`2026-0${index%6+3}-12T09:00:00+07:00`,updatedAt:`2026-10-0${index%5+1}T10:00:00+07:00`,lastTriggeredAt:seed[7]>0?`2026-10-05T0${8-index%4}:20:00+07:00`:null,
    sourceIds:Object.freeze(seed[5].map(sourceIndex=>securityDataSources[sourceIndex].id)),alerts7d:seed[6],incidents7d:seed[7],meanTimeToDetectMinutes:seed[8],effectivenessScore:effectiveness,
    effectivenessHistory:Object.freeze(Array.from({length:30},(_,day)=>Number((effectiveness-3.2+(day/29)*3.2+Math.sin((day+index)/4)*0.5).toFixed(1))).map((value,day)=>day===29?effectiveness:value)),
    alertHistory7d:distribute(seed[6],alertDayWeights),incidentHistory7d:distribute(seed[7],incidentDayWeights),logicSummary:seed[10],});
}));
const incidentSeverities=["Critical","High","Medium","Low"] as const,incidentStatuses=["Investigating","Monitoring","Closed"] as const;
export const analyticsIncidents: readonly SecurityAnalyticsIncident[] = Object.freeze(analyticsUseCases.flatMap((useCase,useCaseIndex)=>Array.from({length:useCase.incidents7d},(_,incidentIndex)=>Object.freeze({
  id:`DEMO-AN-INC-${String(useCaseIndex+1).padStart(2,"0")}-${String(incidentIndex+1).padStart(2,"0")}` as const,useCaseId:useCase.id,severity:incidentSeverities[(useCaseIndex+incidentIndex)%4],status:incidentStatuses[(useCaseIndex+incidentIndex)%3],triggeredAt:`2026-10-${String(5-(incidentIndex%5)).padStart(2,"0")}T${String(8+(useCaseIndex%8)).padStart(2,"0")}:15:00+07:00`,title:`Demo ${useCase.name} analytical incident`,
}))));
const activeUseCases=analyticsUseCases.filter(useCase=>useCase.status==="Active"),eligibleSources=new Set(securityDataSources.filter(source=>source.status==="Active"||source.status==="Warning").map(source=>source.id));
const coveredUseCases=activeUseCases.filter(useCase=>useCase.sourceIds.every(sourceId=>eligibleSources.has(sourceId)));
const totalAnalyticsIncidents=analyticsUseCases.reduce((sum,useCase)=>sum+useCase.incidents7d,0);
const analyticsMttd=Number((analyticsUseCases.filter(useCase=>useCase.incidents7d>0).reduce((sum,useCase)=>sum+useCase.meanTimeToDetectMinutes*useCase.incidents7d,0)/totalAnalyticsIncidents).toFixed(1));
export const analyticsDailyHistory=Object.freeze(["2026-09-29","2026-09-30","2026-10-01","2026-10-02","2026-10-03","2026-10-04","2026-10-05"].map((date,index)=>Object.freeze({date,alerts:activeUseCases.reduce((sum,useCase)=>sum+useCase.alertHistory7d[index],0),incidents:analyticsUseCases.reduce((sum,useCase)=>sum+useCase.incidentHistory7d[index],0)})));
export const analyticsCombinations=Object.freeze([[0,1],[3,4],[7,10],[8,5]].map(([left,right])=>Object.freeze({leftUseCaseId:analyticsUseCases[left].id,rightUseCaseId:analyticsUseCases[right].id,combinedActivity:analyticsUseCases[left].alerts7d+analyticsUseCases[right].alerts7d})));
const medianMttd=[...analyticsUseCases].sort((a,b)=>a.meanTimeToDetectMinutes-b.meanTimeToDetectMinutes)[Math.floor(analyticsUseCases.length/2)].meanTimeToDetectMinutes;
export const analyticsRecommendations=Object.freeze(activeUseCases.flatMap(useCase=>{
  const items:string[]=[];if(!useCase.sourceIds.every(id=>eligibleSources.has(id)))items.push(`Review source availability to improve coverage for ${useCase.name}.`);if(useCase.meanTimeToDetectMinutes>medianMttd)items.push(`Review detection conditions for ${useCase.name} to improve detection time.`);if(useCase.effectivenessScore<90)items.push(`Review analytical logic for ${useCase.name}.`);if(useCase.sourceIds.filter(id=>eligibleSources.has(id)).length<2)items.push(`Consider additional relevant data-source coverage for ${useCase.name}.`);return items.map(text=>Object.freeze({useCaseId:useCase.id,text}));
}).slice(0,4));
export const analyticsKpiHistories=Object.freeze({total:Object.freeze([10,10,11,11,12,12,12]),active:Object.freeze([8,8,9,9,9,10,10]),alerts:Object.freeze([8100,8350,8640,8870,9010,9060,activeUseCases.reduce((sum,useCase)=>sum+useCase.alerts7d,0)]),incidents:Object.freeze([31,33,35,37,39,41,totalAnalyticsIncidents]),mttd:Object.freeze([7.4,7.2,7.0,6.8,6.6,6.5,analyticsMttd]),coverage:Object.freeze([70,70,75,75,80,80,Number((coveredUseCases.length/activeUseCases.length*100).toFixed(1))])});

const explorerCategories=["authentication","network","process","configuration","malware","access","dns"] as const;
const explorerActions=["login_failed","connection_allowed","process_started","setting_changed","indicator_detected","access_granted","query_observed"] as const;
const explorerSeverities=["Low","Medium","High","Critical"] as const;
const explorerUsers=["demo.analyst","demo.operator","service.reader","demo.admin","system.account","demo.reviewer"] as const;
export const explorerEvents: readonly SecurityDataExplorerEvent[] = Object.freeze(securityDataSources.flatMap((source,sourceIndex)=>Array.from({length:6},(_,eventIndex)=>{
  const sequence=sourceIndex*6+eventIndex,day=29+(sequence%7),date=day<=30?`2026-09-${day}`:`2026-10-${String(day-30).padStart(2,"0")}`;
  return Object.freeze({id:`DEMO-EVT-${String(sequence+1).padStart(4,"0")}` as const,timestamp:`${date}T${String(8+(sequence%12)).padStart(2,"0")}:${String((sequence*7)%60).padStart(2,"0")}:00+07:00`,sourceId:source.id,
    category:explorerCategories[sequence%explorerCategories.length],action:explorerActions[sequence%explorerActions.length],severity:explorerSeverities[(sourceIndex+eventIndex)%4],sourceIp:`192.0.2.${10+sequence}`,destinationIp:`198.51.100.${20+(sequence%80)}`,userName:explorerUsers[sequence%explorerUsers.length],hostName:`demo-host-${String(sourceIndex+1).padStart(2,"0")}`,message:`Demo ${explorerActions[sequence%explorerActions.length].replaceAll("_"," ")} event from normalized ${explorerCategories[sequence%explorerCategories.length]} telemetry.`,recordSizeBytes:780+(sequence%9)*137,
  });
})));
export const explorerSavedQueries: readonly SecuritySavedQuery[] = Object.freeze([
  {id:"DEMO-QUERY-001",name:"Failed Authentication Activity",conditions:[{boolean:"AND",field:"event.action",operator:"Equals",value:"login_failed"}],sourceScope:"all",timeRange:"7d",updatedAt:"2026-10-05T08:20:00+07:00",createdByRole:"SOC Team"},
  {id:"DEMO-QUERY-002",name:"Suspicious Network Scanning",conditions:[{boolean:"AND",field:"event.category",operator:"Equals",value:"network"},{boolean:"AND",field:"event.severity",operator:"In",value:"High,Critical"}],sourceScope:"all",timeRange:"7d",updatedAt:"2026-10-04T16:10:00+07:00",createdByRole:"Detection Engineering"},
  {id:"DEMO-QUERY-003",name:"Privileged Account Changes",conditions:[{boolean:"AND",field:"user.name",operator:"Contains",value:"admin"}],sourceScope:"all",timeRange:"7d",updatedAt:"2026-10-04T11:30:00+07:00",createdByRole:"Security Operations"},
  {id:"DEMO-QUERY-004",name:"Suspicious Endpoint Execution",conditions:[{boolean:"AND",field:"event.category",operator:"Equals",value:"process"}],sourceScope:"all",timeRange:"24h",updatedAt:"2026-10-03T14:40:00+07:00",createdByRole:"Detection Engineering"},
  {id:"DEMO-QUERY-005",name:"Data Exfiltration Signals",conditions:[{boolean:"AND",field:"event.severity",operator:"Equals",value:"Critical"}],sourceScope:"DEMO-SRC-001",timeRange:"30d",updatedAt:"2026-10-02T09:15:00+07:00",createdByRole:"SOC Team"},
]);
export const explorerUsageHistory=Object.freeze([
  {date:"2026-09-29",searches:48,uniqueQueries:13,recordsReturned:12640,durationSeconds:71,exports:1},{date:"2026-09-30",searches:55,uniqueQueries:15,recordsReturned:14820,durationSeconds:79,exports:2},{date:"2026-10-01",searches:61,uniqueQueries:17,recordsReturned:16230,durationSeconds:85,exports:1},{date:"2026-10-02",searches:58,uniqueQueries:16,recordsReturned:15110,durationSeconds:81,exports:2},{date:"2026-10-03",searches:67,uniqueQueries:18,recordsReturned:18340,durationSeconds:92,exports:2},{date:"2026-10-04",searches:63,uniqueQueries:17,recordsReturned:17680,durationSeconds:88,exports:1},{date:"2026-10-05",searches:72,uniqueQueries:19,recordsReturned:20150,durationSeconds:101,exports:3},
]);
export const explorerTopFields=Object.freeze([{field:"source.ip",count:186},{field:"user.name",count:153},{field:"event.category",count:141},{field:"destination.ip",count:119},{field:"event.action",count:104}]);

// Settings is a read-only capability preview. Only values without an existing
// registry live here; shared source, integration, quality, and analytics values
// continue to be derived from their canonical collections below.
export const securityDataSettingsDemo = Object.freeze({
  ingestion: Object.freeze({ schedules: "Demo Configuration", normalization: "Demo Configuration", deduplication: "Demo Configuration" }),
  access: Object.freeze({ users: 6, roles: 3, permissionPolicies: 4, sso: "Not Configured" }),
  notifications: Object.freeze({ alertRules: 6, channels: 3, escalation: "Demo Configuration", quietHours: "Demo Configuration" }),
  retention: Object.freeze({ policies: 3, archive: "Demo Configuration", purgeRules: "Demo Configuration", storage: "Demo Configuration" }),
  quality: Object.freeze({ enrichment: "Demo Configuration" }),
  system: Object.freeze({ preferences: "Demo Configuration", performance: "Not Configured", maintenance: "Demo Configuration", logs: "Not Configured" }),
  compliance: Object.freeze({ auditLogs: "Demo Configuration", frameworks: 3, reports: "Not Configured", evidence: "Not Configured" }),
});

export const securityDataDemo = Object.freeze({
  asOf: SECURITY_DATA_AS_OF,
  sources: securityDataSources,
  dailyIngestion: dailyIngestionMetrics,
  recentAlerts: recentIntegrationAlerts,
  correlationRuleCount: SECURITY_DATA_CORRELATION_RULE_COUNT,
  retentionDays: SECURITY_DATA_RETENTION_DAYS,
  kpiHistories: securityDataKpiHistories,
  sourceStatusHistory,
  integrations: securityDataIntegrations,
  integrationStatusHistory,
  recentIntegrationActivity,
  integrationKpiHistories,
  integrationTotals: Object.freeze({
    total: securityDataIntegrations.length,
    active: securityDataIntegrations.filter((integration) => integration.enabled && (integration.healthStatus === "Healthy" || integration.healthStatus === "Warning")).length,
    failed7d: securityDataIntegrations.filter((integration) => integration.failureHistory.length > 0).length,
    averageLatencyMinutes: Number((enabledLatencies.reduce((sum, latency) => sum + latency, 0) / enabledLatencies.length).toFixed(1)),
    ingestionVolume7d: securityDataIntegrations.reduce((sum, integration) => sum + integration.ingestedEvents7d, 0),
    successfulAttempts7d: successfulIntegrationAttempts,
    totalAttempts7d: totalIntegrationAttempts,
    successRate7d: Number((successfulIntegrationAttempts / totalIntegrationAttempts * 100).toFixed(1)),
  }),
  dataQuality: Object.freeze({ profiles:dataQualityProfiles, issues:dataQualityIssues, rules:dataQualityRules, recommendations:dataQualityRecommendations, history:dataQualityHistory, threshold:DATA_QUALITY_THRESHOLD,
    totals:Object.freeze({overall:overallQualityScore,...qualityDimensions,meetingThreshold:dataQualityProfiles.filter(profile=>profile.overallScore>=DATA_QUALITY_THRESHOLD).length}) }),
  analytics:Object.freeze({useCases:analyticsUseCases,incidents:analyticsIncidents,dailyHistory:analyticsDailyHistory,combinations:analyticsCombinations,recommendations:analyticsRecommendations,kpiHistories:analyticsKpiHistories,
    totals:Object.freeze({total:analyticsUseCases.length,active:activeUseCases.length,alerts7d:analyticsUseCases.filter(useCase=>useCase.status==="Active").reduce((sum,useCase)=>sum+useCase.alerts7d,0),incidents7d:totalAnalyticsIncidents,meanTimeToDetectMinutes:analyticsMttd,coverage:Number((coveredUseCases.length/activeUseCases.length*100).toFixed(1)),coveredActive:coveredUseCases.length})}),
  explorer:Object.freeze({events:explorerEvents,savedQueries:explorerSavedQueries,usageHistory:explorerUsageHistory,topFields:explorerTopFields,
    usageTotals:Object.freeze({totalSearches:explorerUsageHistory.reduce((sum,row)=>sum+row.searches,0),uniqueQueries:explorerUsageHistory.reduce((sum,row)=>sum+row.uniqueQueries,0),recordsReturned:explorerUsageHistory.reduce((sum,row)=>sum+row.recordsReturned,0),averageSearchSeconds:Number((explorerUsageHistory.reduce((sum,row)=>sum+row.durationSeconds,0)/explorerUsageHistory.reduce((sum,row)=>sum+row.searches,0)).toFixed(1)),savedQueries:explorerSavedQueries.length,exports:explorerUsageHistory.reduce((sum,row)=>sum+row.exports,0)})}),
  settings: securityDataSettingsDemo,
  totals: Object.freeze({
    sources: securityDataSources.length,
    activeIntegrations: securityDataSources.filter((source) => source.status === "Active").length,
    events7d: totalEvents,
    normalizedEvents7d: securityDataSources.reduce((sum, source) => sum + source.normalizedEvents7d, 0),
  }),
  categories: Object.freeze(SECURITY_DATA_CATEGORIES.map((category) => Object.freeze({ category, count: securityDataSources.filter((source) => source.category === category).length }))),
  eventTypes: Object.freeze(SECURITY_EVENT_TYPES.map((type) => Object.freeze({ type, count: securityDataSources.reduce((sum, source) => sum + source.eventTypeDistribution[type], 0) }))),
  statuses: Object.freeze((["Active", "Warning", "Error", "Inactive"] as const).map((status) => Object.freeze({ status, count: securityDataSources.filter((source) => source.status === status).length }))),
  // Weighted source health: Active=100, Warning=65, Error=20, Inactive=0; result is the population average.
  integrationHealth: Math.round(securityDataSources.reduce((sum, source) => sum + HEALTH_WEIGHT[source.status], 0) / securityDataSources.length),
});
