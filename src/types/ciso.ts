export type IncidentLifecycleEventType =
  | "detected"
  | "acknowledged"
  | "response_started"
  | "response_completed"
  | "contained"
  | "closed";

export interface IncidentLifecycleEvent {
  id: string;
  incidentId: string;
  eventType: IncidentLifecycleEventType;
  eventTimestamp: string;
  actorId: string;
  actorName: string;
  source: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface IncidentLifecycleActionResult {
  success: boolean;
  event?: IncidentLifecycleEvent;
  error?: string;
  message?: string;
}

export interface IncidentKpiItem {
  value: number | null;
  unit: "minutes";
  trend30d: number | null;
  trendAvailable: boolean;
  sampleSize: number;
  eligibleIncidents?: number;
  excludedIncidents?: number;
  source: string;
  calculationMethod?: string;
  timestampFieldsUsed?: string;
  explanation?: string;
}

export interface IncidentKpiOverview {
  period: "last_30_days";
  mttd: IncidentKpiItem;
  mtta: IncidentKpiItem;
  mttr: IncidentKpiItem;
  mttc: IncidentKpiItem;
  dataAvailable: boolean;
  explanation: string;
}

export interface BitdefenderIncidentListItem {
  id: string;
  name: string;
  detectionName?: string | null;
  endpoint?: string | null;
  attackTypes?: string[];
  severity: string;
  status: string;
  detectedAt: string | null;
  alertCount: number;
  mainAction?: string;
  acknowledgedAt?: string | null;
  respondedAt?: string | null;
  containedAt?: string | null;
  latestEvent?: IncidentLifecycleEventType | null;
  lifecycleStatus: "detected" | "acknowledged" | "responding" | "contained" | "unhandled";
}

export interface IncidentListResponse {
  total: number;
  items: BitdefenderIncidentListItem[];
}
