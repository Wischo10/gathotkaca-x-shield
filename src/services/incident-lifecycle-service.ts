import "server-only";
import https from "https";
import crypto from "crypto";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { HttpError } from "@/lib/http";
import { OPERATIONAL_LIFECYCLE_SQL, isOperationalLifecycleEvent } from "@/lib/incident-data-integrity";
import { SessionUser } from "@/lib/auth";
import {
  IncidentLifecycleEvent,
  IncidentLifecycleEventType,
  IncidentLifecycleActionResult,
  IncidentKpiItem,
  IncidentKpiOverview,
  BitdefenderIncidentListItem,
  IncidentListResponse,
} from "@/types/ciso";

// ============================================================================
// Bitdefender API Helpers
// ============================================================================

function bitdefenderAuthHeader(): string {
  const key = env.bitdefender.apiKey();
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

interface BitdefenderIncidentDetail {
  id?: string;
  incidentId?: string;
  status: string;
  created: string;
  lastUpdated: string;
  severity?: string | number;
  severityScore?: number | string;
  priority?: string | number;
  details?: {
    alerts?: Array<{
      id?: string;
      date?: string;
      detectionType?: string;
      name?: string;
      hash?: string;
    }>;
  };
  [key: string]: unknown;
}

function normalizeBitdefenderSeverity(incident: Record<string, unknown>): "Critical" | "High" | "Medium" | "Low" | null {
  const direct = String(incident.severity ?? "").trim().toLowerCase();
  if (["critical", "high", "medium", "low"].includes(direct)) return direct[0].toUpperCase() + direct.slice(1) as "Critical" | "High" | "Medium" | "Low";
  const scoreSource = incident.severityScore ?? incident.priority;
  if (scoreSource === undefined || scoreSource === null || scoreSource === "") return null;
  const score = Number(scoreSource);
  if (!Number.isFinite(score)) return null;
  return score >= 70 ? "Critical" : score >= 50 ? "High" : score >= 20 ? "Medium" : "Low";
}

/**
 * Fetch incident details from Bitdefender API to verify existence and extract
 * the earliest detection alert timestamp (`details.alerts[].date`).
 */
export async function getBitdefenderIncident(
  incidentId: string,
  rateLimitRetry = 0
): Promise<BitdefenderIncidentDetail | null> {
  const postData = JSON.stringify({
    jsonrpc: "2.0",
    id: `incident_fetch_${Date.now()}`,
    method: "getIncident",
    params: {
      id: incidentId,
    },
  });

  const parsedUrl = new URL(env.bitdefender.apiUrl());

  return new Promise<BitdefenderIncidentDetail | null>((resolve, reject) => {
    const req = https.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: "POST",
        headers: {
          Authorization: bitdefenderAuthHeader(),
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
        timeout: 10000,
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", async () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(raw);
              if (parsed.result) {
                resolve(parsed.result as BitdefenderIncidentDetail);
              } else {
                const code = parsed?.error?.code;
                const message = parsed?.error?.message;
                console.warn(`[Bitdefender] getIncident unavailable for ${incidentId}: HTTP ${res.statusCode}; code ${String(code ?? "unknown")}; ${typeof message === "string" ? message : "missing result"}`);
                resolve(null);
              }
            } catch {
              console.warn(`[Bitdefender] getIncident returned invalid JSON for ${incidentId}: HTTP ${res.statusCode ?? "unknown"}`);
              resolve(null);
            }
          } else if (res.statusCode === 429 && rateLimitRetry < 2) {
            const retryAfterSeconds = Number(res.headers["retry-after"] ?? 2);
            const retryDelayMs = Number.isFinite(retryAfterSeconds) ? Math.min(10000, Math.max(2000, retryAfterSeconds * 1000)) : 2000;
            await new Promise((retryResolve) => setTimeout(retryResolve, retryDelayMs));
            resolve(await getBitdefenderIncident(incidentId, rateLimitRetry + 1));
          } else {
            console.warn(`[Bitdefender] getIncident unavailable for ${incidentId}: HTTP ${res.statusCode ?? "unknown"}`);
            resolve(null);
          }
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("Bitdefender request timed out"));
      resolve(null);
    });
    req.on("error", () => resolve(null));
    req.write(postData);
    req.end();
  });
}

/** Fetch authoritative incident details in one request to stay within API limits. */
async function getBitdefenderIncidentsByIds(
  incidentIds: string[]
): Promise<BitdefenderIncidentDetail[]> {
  if (incidentIds.length === 0) return [];
  const postData = JSON.stringify({
    jsonrpc: "2.0",
    id: `incident_batch_${Date.now()}`,
    method: "getIncidentsByIds",
    params: { ids: incidentIds },
  });
  const parsedUrl = new URL(env.bitdefender.apiUrl());

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: "POST",
        headers: {
          Authorization: bitdefenderAuthHeader(),
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
        timeout: 10000,
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", async () => {
          if (res.statusCode === 429) {
            reject(new HttpError(`Bitdefender incident details rate limited (HTTP 429; Retry-After ${res.headers["retry-after"] ?? "not provided"})`, "rate_limit", 429));
            return;
          }
          try {
            const parsed = JSON.parse(raw);
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300
              && !parsed.error && Array.isArray(parsed.result)) {
              resolve(parsed.result as BitdefenderIncidentDetail[]);
            } else {
              const providerCode = parsed?.error?.code;
              const providerMessage = parsed?.error?.message;
              const providerData = parsed?.error?.data;
              const detail = [
                `HTTP ${res.statusCode ?? "unknown"}`,
                providerCode === undefined ? null : `code ${String(providerCode)}`,
                typeof providerMessage === "string" ? providerMessage : null,
                providerData === undefined ? null : `data ${JSON.stringify(providerData)}`,
              ].filter(Boolean).join("; ");
              reject(new HttpError(`Bitdefender incident detail batch failed (${detail})`, "server", res.statusCode));
            }
          } catch {
            reject(new HttpError(`Bitdefender incident detail batch returned invalid JSON (HTTP ${res.statusCode ?? "unknown"})`, "invalid_response", res.statusCode));
          }
        });
      }
    );
    req.on("timeout", () => req.destroy(new HttpError("Bitdefender incident detail batch timed out", "timeout")));
    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Extract earliest alert detection date from Bitdefender incident details.
 * Strictly uses sensor detection timestamp from `details.alerts[].date`.
 * Returns null if alerts array is missing or contains no valid timestamp.
 */
function extractDetectedTimestamp(incident: Pick<BitdefenderIncidentDetail, "details">): string | null {
  const alerts = incident.details?.alerts;
  if (alerts && Array.isArray(alerts) && alerts.length > 0) {
    const validDates = alerts
      .map((a) => a.date)
      .filter((d): d is string => typeof d === "string" && !isNaN(Date.parse(d)))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    if (validDates.length > 0) {
      return validDates[0];
    }
  }

  return null;
}

async function persistDetectedEventFromIncident(
  incidentId: string,
  incident: Pick<BitdefenderIncidentDetail, "details"> & Record<string, unknown>
): Promise<void> {
  const detectedTimeStr = extractDetectedTimestamp(incident);
  if (!detectedTimeStr) return;

  await getDb().query(
    `INSERT INTO incident_lifecycle_events
     (id, incident_id, event_type, event_timestamp, actor_id, actor_name, source, metadata, created_at)
     VALUES ($1, $2, 'detected', $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (incident_id, event_type) DO NOTHING`,
    [
      `evt_${crypto.randomUUID()}`,
      incidentId,
      new Date(detectedTimeStr),
      "system:bitdefender",
      "Bitdefender Sensor",
      "bitdefender_sensor",
      JSON.stringify({
        bitdefenderIncidentId: incidentId,
        alertCount: incident.details?.alerts?.length ?? 0,
        originalDetectionDate: detectedTimeStr,
        ...(normalizeBitdefenderSeverity(incident) ? { bitdefenderSeverity: normalizeBitdefenderSeverity(incident) } : {}),
      }),
    ]
  );
}

/**
 * Explicit sync-time enrichment for already verified IDs. Dashboard reads do
 * not call this function; it performs at most one provider batch request for
 * the currently unclassified verified IDs (the provider batch limit is 10).
 */
export async function enrichPersistedIncidentSeverities(): Promise<{ requested: number; updated: number }> {
  const rows = (await getDb().query(`
    SELECT DISTINCT incident_id
    FROM incident_lifecycle_events
    WHERE event_type = 'detected' AND source = 'bitdefender_sensor'
      AND incident_id IS NOT NULL AND btrim(incident_id) <> ''
      AND metadata->>'bitdefenderIncidentId' = incident_id
      AND (metadata->>'bitdefenderSeverity' IS NULL OR metadata->>'bitdefenderSeverity' = '')
      AND ${OPERATIONAL_LIFECYCLE_SQL}
    ORDER BY incident_id
    LIMIT 10
  `)).rows as Array<{ incident_id: string }>;
  if (rows.length === 0) return { requested: 0, updated: 0 };
  const details = await getBitdefenderIncidentsByIds(rows.map((row) => row.incident_id));
  const byId = new Map(details.map((detail) => [String(detail.incidentId ?? detail.id), detail]));
  let updated = 0;
  for (const row of rows) {
    const severity = byId.get(row.incident_id) ? normalizeBitdefenderSeverity(byId.get(row.incident_id) as unknown as Record<string, unknown>) : null;
    if (!severity) continue;
    await getDb().query(`UPDATE incident_lifecycle_events SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('bitdefenderSeverity', $2::text) WHERE incident_id = $1 AND event_type = 'detected' AND source = 'bitdefender_sensor'`, [row.incident_id, severity]);
    updated++;
  }
  return { requested: rows.length, updated };
}

// ============================================================================
// Database Lifecycle Event Management
// ============================================================================

/**
 * Ensure that a `detected` event exists in the database for the given incident.
 * Sourced directly from Bitdefender alert telemetry (`details.alerts[0].date`).
 */
export async function ensureDetectedEvent(
  incidentId: string
): Promise<IncidentLifecycleEvent | null> {
  const db = getDb();

  // Check if detected event already exists
  const existingRes = await db.query(
    `SELECT id, incident_id, event_type, event_timestamp, actor_id, actor_name, source, metadata, created_at 
     FROM incident_lifecycle_events 
     WHERE incident_id = $1 AND event_type = 'detected'`,
    [incidentId]
  );

  if (existingRes.rows.length > 0) {
    const row = existingRes.rows[0];
    return {
      id: row.id,
      incidentId: row.incident_id,
      eventType: row.event_type,
      eventTimestamp: row.event_timestamp.toISOString(),
      actorId: row.actor_id,
      actorName: row.actor_name,
      source: row.source,
      metadata: row.metadata,
      createdAt: row.created_at.toISOString(),
    };
  }

  // Fetch incident from Bitdefender to get real sensor detection timestamp
  const incident = await getBitdefenderIncident(incidentId);
  if (!incident) {
    return null;
  }

  const detectedTimeStr = extractDetectedTimestamp(incident);
  if (!detectedTimeStr) {
    return null;
  }

  const eventId = `evt_${crypto.randomUUID()}`;
  const detectedDate = new Date(detectedTimeStr);

  const insertRes = await db.query(
    `INSERT INTO incident_lifecycle_events 
     (id, incident_id, event_type, event_timestamp, actor_id, actor_name, source, metadata, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     ON CONFLICT (incident_id, event_type) DO NOTHING
     RETURNING id, incident_id, event_type, event_timestamp, actor_id, actor_name, source, metadata, created_at`,
    [
      eventId,
      incidentId,
      "detected",
      detectedDate,
      "system:bitdefender",
      "Bitdefender Sensor",
      "bitdefender_sensor",
      JSON.stringify({
        bitdefenderIncidentId: incidentId,
        alertCount: incident.details?.alerts?.length ?? 0,
        originalDetectionDate: detectedTimeStr,
      }),
    ]
  );

  if (insertRes.rows.length > 0) {
    const row = insertRes.rows[0];
    return {
      id: row.id,
      incidentId: row.incident_id,
      eventType: row.event_type,
      eventTimestamp: row.event_timestamp.toISOString(),
      actorId: row.actor_id,
      actorName: row.actor_name,
      source: row.source,
      metadata: row.metadata,
      createdAt: row.created_at.toISOString(),
    };
  }

  // If conflict happened concurrently, fetch existing
  const recheck = await db.query(
    `SELECT id, incident_id, event_type, event_timestamp, actor_id, actor_name, source, metadata, created_at 
     FROM incident_lifecycle_events 
     WHERE incident_id = $1 AND event_type = 'detected'`,
    [incidentId]
  );

  if (recheck.rows.length > 0) {
    const row = recheck.rows[0];
    return {
      id: row.id,
      incidentId: row.incident_id,
      eventType: row.event_type,
      eventTimestamp: row.event_timestamp.toISOString(),
      actorId: row.actor_id,
      actorName: row.actor_name,
      source: row.source,
      metadata: row.metadata,
      createdAt: row.created_at.toISOString(),
    };
  }

  return null;
}

/**
 * Record an analyst lifecycle event (acknowledged, response_started, contained, etc.)
 * Strictly captures server-side timestamp and authenticated session user.
 */
export async function recordAnalystLifecycleEvent(
  incidentId: string,
  eventType: IncidentLifecycleEventType,
  user: SessionUser,
  source: string = "analyst_action",
  extraMetadata?: Record<string, unknown>
): Promise<IncidentLifecycleActionResult> {
  const db = getDb();

  // Enforce the operational lifecycle before recording a new action. Run this
  // before detection synchronization so an invalid transition writes nothing.
  const prerequisiteByEvent: Partial<Record<IncidentLifecycleEventType, IncidentLifecycleEventType>> = {
    response_started: "acknowledged",
    contained: "response_started",
  };
  const prerequisite = prerequisiteByEvent[eventType];
  if (prerequisite) {
    const prerequisiteRes = await db.query(
      `SELECT id, event_timestamp, actor_name FROM incident_lifecycle_events WHERE incident_id = $1 AND event_type = $2`,
      [incidentId, prerequisite]
    );
    if (prerequisiteRes.rows.length === 0) {
      return {
        success: false,
        error: `Event '${eventType}' requires '${prerequisite}' to be recorded first for incident '${incidentId}'.`,
      };
    }
  }

  // 1. Ensure the detected event exists from Bitdefender telemetry
  const detectedEvent = await ensureDetectedEvent(incidentId);
  if (!detectedEvent) {
    return {
      success: false,
      error: `Incident '${incidentId}' not found in Bitdefender or missing valid detection timestamp.`,
    };
  }

  // 2. Check if this event type was already recorded
  const checkRes = await db.query(
    `SELECT id, event_timestamp, actor_name FROM incident_lifecycle_events WHERE incident_id = $1 AND event_type = $2`,
    [incidentId, eventType]
  );

  if (checkRes.rows.length > 0) {
    const existing = checkRes.rows[0];
    return {
      success: false,
      error: `Event '${eventType}' was already recorded for incident '${incidentId}' at ${new Date(existing.event_timestamp).toISOString()} by ${existing.actor_name}.`,
    };
  }

  // 3. Server-side generated timestamp (never from client)
  const now = new Date();
  const eventId = `evt_${crypto.randomUUID()}`;

  const metadata = {
    ...extraMetadata,
    recordedByRole: user.role,
    recordedByEmail: user.email,
  };

  try {
    const insertRes = await db.query(
      `INSERT INTO incident_lifecycle_events 
       (id, incident_id, event_type, event_timestamp, actor_id, actor_name, source, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id, incident_id, event_type, event_timestamp, actor_id, actor_name, source, metadata, created_at`,
      [
        eventId,
        incidentId,
        eventType,
        now,
        user.id,
        user.fullName || user.email,
        source,
        JSON.stringify(metadata),
      ]
    );

    const row = insertRes.rows[0];
    const event: IncidentLifecycleEvent = {
      id: row.id,
      incidentId: row.incident_id,
      eventType: row.event_type,
      eventTimestamp: row.event_timestamp.toISOString(),
      actorId: row.actor_id,
      actorName: row.actor_name,
      source: row.source,
      metadata: row.metadata,
      createdAt: row.created_at.toISOString(),
    };

    return {
      success: true,
      event,
      message: `Successfully recorded '${eventType}' for incident '${incidentId}'.`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Failed to record event: ${errorMsg}`,
    };
  }
}

// ============================================================================
// Real KPI Calculation Engine (SQL-based)
// ============================================================================

export interface BitdefenderWindowMetrics {
  incidentsFetched: number;
  incidentsInWindow: number;
  validDetectionTimestamps: number;
  availability: "available" | "cached";
  observedAt: string;
  listRequests: number;
  detailRequests: number;
}

const BITDEFENDER_SUCCESS_CACHE_TTL_MS = 60_000;
interface BitdefenderMetricsCacheEntry {
  expiresAt: number;
  result: BitdefenderWindowMetrics;
}

declare global {
  // eslint-disable-next-line no-var
  var __socBitdefenderMetricsCache: Map<number, BitdefenderMetricsCacheEntry> | undefined;
  // eslint-disable-next-line no-var
  var __socBitdefenderMetricsInflight: Map<number, Promise<BitdefenderWindowMetrics>> | undefined;
  // eslint-disable-next-line no-var
  var __socBitdefenderRetryNotBefore: number | undefined;
}

function metricsCache() {
  return global.__socBitdefenderMetricsCache ??= new Map();
}

function metricsInflight() {
  return global.__socBitdefenderMetricsInflight ??= new Map();
}

/**
 * Read-only incident count for SOC. It reuses the validated GravityZone
 * authentication, list and batch-detail semantics in this service and never
 * persists lifecycle events.
 */
export async function getBitdefenderIncidentMetrics(
  windowDays = 7
): Promise<BitdefenderWindowMetrics> {
  const cached = metricsCache().get(windowDays);
  if (cached && cached.expiresAt > Date.now()) {
    return { ...cached.result, availability: "cached", listRequests: 0, detailRequests: 0 };
  }
  if (cached) metricsCache().delete(windowDays);
  if ((global.__socBitdefenderRetryNotBefore ?? 0) > Date.now()) {
    throw new HttpError("Bitdefender rate-limit cooldown is active", "rate_limit", 429);
  }

  const existing = metricsInflight().get(windowDays);
  if (existing) return existing;

  const request = fetchBitdefenderIncidentMetrics(windowDays)
    .then((result) => {
      global.__socBitdefenderRetryNotBefore = undefined;
      metricsCache().set(windowDays, { result, expiresAt: Date.now() + BITDEFENDER_SUCCESS_CACHE_TTL_MS });
      return result;
    })
    .catch((error) => {
      if (error instanceof HttpError && error.kind === "rate_limit") {
        global.__socBitdefenderRetryNotBefore = Date.now() + 60_000;
      }
      throw error;
    })
    .finally(() => metricsInflight().delete(windowDays));
  metricsInflight().set(windowDays, request);
  return request;
}

async function fetchBitdefenderIncidentMetrics(windowDays: number): Promise<BitdefenderWindowMetrics> {
  const perPage = 50;
  let page = 1;
  let total = 0;
  let incidentsFetched = 0;
  let incidentsInWindow = 0;
  let validDetectionTimestamps = 0;
  let listRequests = 0;
  let detailRequests = 0;
  const windowStart = Date.now() - windowDays * 24 * 60 * 60 * 1000;
  const now = Date.now();
  let lastProviderRequestAt = 0;
  const waitForProviderSlot = async () => {
    const waitMs = Math.max(0, 21_000 - (Date.now() - lastProviderRequestAt));
    if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
    lastProviderRequestAt = Date.now();
  };

  do {
    await waitForProviderSlot();
    listRequests++;
    const postData = JSON.stringify({
      jsonrpc: "2.0",
      id: `soc_incident_list_${Date.now()}_${page}`,
      method: "getIncidentsList",
      params: { filters: { status: ["open", "closed"] }, page, perPage },
    });
    const parsedUrl = new URL(env.bitdefender.apiUrl());
    const result = await new Promise<{ total: number; items: Array<Record<string, unknown>> }>((resolve, reject) => {
      const req = https.request({
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: "POST",
        headers: {
          Authorization: bitdefenderAuthHeader(),
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
        timeout: 10000,
      }, (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(raw);
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300
              && !parsed.error && typeof parsed.result?.total === "number"
              && Array.isArray(parsed.result.items)) {
              resolve(parsed.result);
            } else {
              const providerDetail = parsed?.error
                ? `; code ${String(parsed.error.code ?? "unknown")}; ${String(parsed.error.message ?? "unknown error")}; data ${JSON.stringify(parsed.error.data ?? null)}`
                : "";
              const rateLimited = res.statusCode === 429 || parsed?.error?.code === -32003;
              reject(new HttpError(`Bitdefender incident list request failed (HTTP ${res.statusCode ?? "unknown"}${providerDetail})`, rateLimited ? "rate_limit" : "server", res.statusCode));
            }
          } catch {
            reject(new HttpError(`Bitdefender incident list returned invalid JSON (HTTP ${res.statusCode ?? "unknown"})`, "invalid_response", res.statusCode));
          }
        });
      });
      req.on("timeout", () => req.destroy(new HttpError("Bitdefender incident list timed out", "timeout")));
      req.on("error", reject);
      req.write(postData);
      req.end();
    });

    total = result.total;
    incidentsFetched += result.items.length;
    const ids = result.items
      .map((item) => item.incidentId ?? item.id)
      .filter((id): id is string | number => typeof id === "string" || typeof id === "number")
      .map(String);
    const details: BitdefenderIncidentDetail[] = [];
    for (let offset = 0; offset < ids.length; offset += 10) {
      await waitForProviderSlot();
      detailRequests++;
      details.push(...await getBitdefenderIncidentsByIds(ids.slice(offset, offset + 10)));
    }
    for (const incident of details) {
      const detectedAt = extractDetectedTimestamp(incident);
      if (!detectedAt) continue;
      validDetectionTimestamps++;
      const timestamp = Date.parse(detectedAt);
      if (timestamp >= windowStart && timestamp <= now) incidentsInWindow++;
    }
    if (result.items.length === 0) break;
    page++;
  } while (incidentsFetched < total);

  return {
    incidentsFetched,
    incidentsInWindow,
    validDetectionTimestamps,
    availability: "available",
    observedAt: new Date().toISOString(),
    listRequests,
    detailRequests,
  };
}

export interface LifecycleWindowMetrics {
  detectedEvents: number;
  acknowledgedEvents: number;
  responseStartedEvents: number;
  containedEvents: number;
  mttrMinutes: number | null;
  validMttrPairs: number;
}

export interface PersistedVerifiedIncidentMetrics {
  totalDetectedEvents: number;
  uniqueVerifiedIncidentIds: number;
  detectedEventsInWindow: number;
  uniqueVerifiedIncidentIdsInWindow: number;
  matchingBitdefenderIds: number;
  lastVerifiedAt: string | null;
}

export interface PersistedIncidentSeverityMetrics {
  totalIncidents: number;
  classifiedIncidents: number;
  unclassifiedIncidents: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  lastVerifiedAt: string | null;
}

/** SELECT-only incident severity read model; it never calls Bitdefender. */
export async function getPersistedIncidentSeverityMetrics(windowDays = 7): Promise<PersistedIncidentSeverityMetrics> {
  const res = await getDb().query(`
    WITH verified AS (
      SELECT DISTINCT ON (incident_id)
        incident_id, event_timestamp, created_at,
        NULLIF(metadata->>'bitdefenderSeverity', '') AS severity
      FROM incident_lifecycle_events
      WHERE event_type = 'detected'
        AND event_timestamp >= NOW() - ($1 * INTERVAL '1 day')
        AND event_timestamp <= NOW()
        AND source = 'bitdefender_sensor'
        AND incident_id IS NOT NULL
        AND btrim(incident_id) <> ''
        AND metadata->>'bitdefenderIncidentId' = incident_id
        AND ${OPERATIONAL_LIFECYCLE_SQL}
      ORDER BY incident_id, event_timestamp ASC
    )
    SELECT COUNT(*) AS total_incidents,
      COUNT(*) FILTER (WHERE severity IN ('Critical','High','Medium','Low')) AS classified_incidents,
      COUNT(*) FILTER (WHERE severity IS NULL OR severity NOT IN ('Critical','High','Medium','Low')) AS unclassified_incidents,
      COUNT(*) FILTER (WHERE severity = 'Critical') AS critical,
      COUNT(*) FILTER (WHERE severity = 'High') AS high,
      COUNT(*) FILTER (WHERE severity = 'Medium') AS medium,
      COUNT(*) FILTER (WHERE severity = 'Low') AS low,
      MAX(created_at) AS last_verified_at
    FROM verified
  `, [windowDays]);
  const row = res.rows[0] as Record<string, string | Date | null> | undefined;
  const lastVerified = row?.last_verified_at;
  return {
    totalIncidents: Number(row?.total_incidents ?? 0),
    classifiedIncidents: Number(row?.classified_incidents ?? 0),
    unclassifiedIncidents: Number(row?.unclassified_incidents ?? 0),
    critical: Number(row?.critical ?? 0),
    high: Number(row?.high ?? 0),
    medium: Number(row?.medium ?? 0),
    low: Number(row?.low ?? 0),
    lastVerifiedAt: lastVerified ? new Date(lastVerified).toISOString() : null,
  };
}

/**
 * Read model for Bitdefender detections already verified and persisted by the
 * lifecycle synchronization path. This function is SELECT-only and performs
 * no provider requests or lifecycle writes.
 */
export async function getPersistedVerifiedIncidentMetrics(
  windowDays = 7
): Promise<PersistedVerifiedIncidentMetrics> {
  const res = await getDb().query(`
    WITH operational_detected AS (
      SELECT incident_id, event_timestamp, created_at, source, metadata
      FROM incident_lifecycle_events
      WHERE event_type = 'detected'
        AND event_timestamp <= NOW()
        AND ${OPERATIONAL_LIFECYCLE_SQL}
    ),
    verified_detected AS (
      SELECT * FROM operational_detected
      WHERE source = 'bitdefender_sensor'
        AND incident_id IS NOT NULL
        AND btrim(incident_id) <> ''
        AND metadata->>'bitdefenderIncidentId' = incident_id
    )
    SELECT
      (SELECT COUNT(*) FROM operational_detected) AS total_detected_events,
      COUNT(DISTINCT incident_id) AS unique_verified_incident_ids,
      COUNT(*) FILTER (WHERE event_timestamp >= NOW() - ($1 * INTERVAL '1 day')) AS detected_events_in_window,
      COUNT(DISTINCT incident_id) FILTER (WHERE event_timestamp >= NOW() - ($1 * INTERVAL '1 day')) AS unique_verified_incident_ids_in_window,
      COUNT(DISTINCT incident_id) AS matching_bitdefender_ids,
      MAX(created_at) AS last_verified_at
    FROM verified_detected
  `, [windowDays]);
  const row = res.rows[0] as Record<string, string | Date | null> | undefined;
  const lastVerified = row?.last_verified_at;
  return {
    totalDetectedEvents: Number(row?.total_detected_events ?? 0),
    uniqueVerifiedIncidentIds: Number(row?.unique_verified_incident_ids ?? 0),
    detectedEventsInWindow: Number(row?.detected_events_in_window ?? 0),
    uniqueVerifiedIncidentIdsInWindow: Number(row?.unique_verified_incident_ids_in_window ?? 0),
    matchingBitdefenderIds: Number(row?.matching_bitdefender_ids ?? 0),
    lastVerifiedAt: lastVerified ? new Date(lastVerified).toISOString() : null,
  };
}

/** Read-only SOC lifecycle summary using the validated operational-data filter. */
export async function getLifecycleMetrics(windowDays = 7): Promise<LifecycleWindowMetrics> {
  const res = await getDb().query(`
    WITH window_events AS (
      SELECT incident_id, event_type, event_timestamp
      FROM incident_lifecycle_events
      WHERE event_timestamp >= NOW() - ($1 * INTERVAL '1 day')
        AND event_timestamp <= NOW()
        AND ${OPERATIONAL_LIFECYCLE_SQL}
    ),
    detected_events AS (
      SELECT incident_id, MIN(event_timestamp) AS detected_at
      FROM window_events WHERE event_type = 'detected' GROUP BY incident_id
    ),
    response_events AS (
      SELECT incident_id, MIN(event_timestamp) AS response_started_at
      FROM window_events WHERE event_type = 'response_started' GROUP BY incident_id
    ),
    valid_pairs AS (
      SELECT EXTRACT(EPOCH FROM (r.response_started_at - d.detected_at)) / 60.0 AS diff_minutes
      FROM detected_events d JOIN response_events r USING (incident_id)
      WHERE r.response_started_at >= d.detected_at
    )
    SELECT
      COUNT(*) FILTER (WHERE event_type = 'detected') AS detected_count,
      COUNT(*) FILTER (WHERE event_type = 'acknowledged') AS acknowledged_count,
      COUNT(*) FILTER (WHERE event_type = 'response_started') AS response_count,
      COUNT(*) FILTER (WHERE event_type = 'contained') AS contained_count,
      (SELECT COUNT(*) FROM valid_pairs) AS valid_pair_count,
      (SELECT AVG(diff_minutes) FROM valid_pairs) AS avg_mttr_minutes
    FROM window_events
  `, [windowDays]);
  const row = res.rows[0] as Record<string, string | number | null> | undefined;
  const validMttrPairs = Number(row?.valid_pair_count ?? 0);
  return {
    detectedEvents: Number(row?.detected_count ?? 0),
    acknowledgedEvents: Number(row?.acknowledged_count ?? 0),
    responseStartedEvents: Number(row?.response_count ?? 0),
    containedEvents: Number(row?.contained_count ?? 0),
    mttrMinutes: validMttrPairs > 0 && row?.avg_mttr_minutes != null ? Number(row.avg_mttr_minutes) : null,
    validMttrPairs,
  };
}

interface MetricIntervalStat {
  avgMinutes: number | null;
  sampleCount: number;
}

/**
 * Query DB for mean interval (in minutes) between `detected` event and a target lifecycle event.
 * Only incidents having BOTH events within the last 30 days are included.
 */
async function queryKpiInterval(
  targetEventType: "acknowledged" | "response_started" | "contained"
): Promise<MetricIntervalStat> {
  const db = getDb();

  const query = `
    WITH detected_events AS (
      SELECT incident_id, event_timestamp AS detected_at
      FROM incident_lifecycle_events
      WHERE event_type = 'detected'
        AND event_timestamp >= NOW() - INTERVAL '30 days'
        AND event_timestamp <= NOW()
        AND ${OPERATIONAL_LIFECYCLE_SQL}
    ),
    target_events AS (
      SELECT incident_id, event_timestamp AS target_at
      FROM incident_lifecycle_events
      WHERE event_type = $1
        AND event_timestamp >= NOW() - INTERVAL '30 days'
        AND event_timestamp <= NOW()
        AND ${OPERATIONAL_LIFECYCLE_SQL}
    ),
    matched_pairs AS (
      SELECT 
        d.incident_id,
        EXTRACT(EPOCH FROM (t.target_at - d.detected_at)) / 60.0 AS diff_minutes
      FROM detected_events d
      JOIN target_events t ON d.incident_id = t.incident_id
      WHERE t.target_at >= d.detected_at
    )
    SELECT 
      AVG(diff_minutes) AS avg_minutes,
      COUNT(*) AS sample_count
    FROM matched_pairs;
  `;

  const res = await db.query(query, [targetEventType]);
  const row = res.rows[0];

  const avgMinutes = row?.avg_minutes !== null && row?.avg_minutes !== undefined
    ? Math.round(Number(row.avg_minutes) * 10) / 10
    : null;
  const sampleCount = Number(row?.sample_count ?? 0);

  return { avgMinutes, sampleCount };
}

/**
 * Count total detected incidents in the last 30 days.
 */
async function countTotalIncidentsInWindow(): Promise<number> {
  const db = getDb();
  const res = await db.query(`
    SELECT COUNT(DISTINCT incident_id) AS total_count
    FROM incident_lifecycle_events
    WHERE event_timestamp >= NOW() - INTERVAL '30 days'
      AND event_timestamp <= NOW()
      AND event_type = 'detected'
      AND ${OPERATIONAL_LIFECYCLE_SQL}
  `);
  return Number(res.rows[0]?.total_count ?? 0);
}

/**
 * Real Incident KPI calculation from recorded lifecycle events.
 * 
 * Rules:
 * - MTTD is N/A (no defensible occurred_at mapping is established)
 * - MTTA = AVG(acknowledged_at - detected_at) in minutes for complete pairs
 * - MTTR = AVG(response_started_at - detected_at) in minutes for complete pairs
 * - MTTC = AVG(contained_at - detected_at) in minutes for complete pairs
 * - Trend 30d is null / trendAvailable = false until multi-period historical snapshots exist
 * - If no events recorded or DB unavailable, returns defensive N/A with clear explanation
 */
export async function calculateRealIncidentKpis(
  bitdefenderTotalIncidents?: number
): Promise<IncidentKpiOverview> {
  try {
    const [mttaStat, mttrStat, mttcStat, dbTotalIncidents] = await Promise.all([
      queryKpiInterval("acknowledged"),
      queryKpiInterval("response_started"),
      queryKpiInterval("contained"),
      countTotalIncidentsInWindow(),
    ]);

    const totalTracked = Math.max(dbTotalIncidents, bitdefenderTotalIncidents ?? 0);
    const hasAnyKpiData = mttaStat.sampleCount > 0 || mttrStat.sampleCount > 0 || mttcStat.sampleCount > 0;

    // MTTD item (permanently N/A)
    const mttd: IncidentKpiItem = {
      value: null,
      unit: "minutes",
      trend30d: null,
      trendAvailable: false,
      sampleSize: 0,
      eligibleIncidents: 0,
      excludedIncidents: totalTracked,
      source: "Bitdefender GravityZone Telemetry",
      calculationMethod: "Requires detected_at - occurred_at; no defensible occurred_at mapping is established",
      timestampFieldsUsed: "None (occurred_at is missing)",
      explanation: "No verified occurrence timestamp is mapped; other Bitdefender dates are not substituted for occurred_at.",
    };

    // MTTA item
    const mtta: IncidentKpiItem = {
      value: mttaStat.avgMinutes,
      unit: "minutes",
      trend30d: null,
      trendAvailable: false,
      sampleSize: mttaStat.sampleCount,
      eligibleIncidents: mttaStat.sampleCount,
      excludedIncidents: Math.max(0, totalTracked - mttaStat.sampleCount),
      source: "incident_lifecycle_events (detected + acknowledged)",
      calculationMethod: "AVG(acknowledged_at - detected_at) for incidents with both events in last 30d",
      timestampFieldsUsed: "detected_at (Bitdefender alert sensor), acknowledged_at (analyst action)",
      explanation: mttaStat.sampleCount > 0
        ? `Calculated from ${mttaStat.sampleCount} real incident acknowledgement(s).`
        : "No incidents acknowledged in the last 30 days via analyst action.",
    };

    // MTTR item
    const mttr: IncidentKpiItem = {
      value: mttrStat.avgMinutes,
      unit: "minutes",
      trend30d: null,
      trendAvailable: false,
      sampleSize: mttrStat.sampleCount,
      eligibleIncidents: mttrStat.sampleCount,
      excludedIncidents: Math.max(0, totalTracked - mttrStat.sampleCount),
      source: "incident_lifecycle_events (detected + response_started)",
      calculationMethod: "AVG(response_started_at - detected_at) for incidents with both events in last 30d",
      timestampFieldsUsed: "detected_at (Bitdefender alert sensor), response_started_at (analyst action)",
      explanation: mttrStat.sampleCount > 0
        ? `Calculated from ${mttrStat.sampleCount} real incident response action(s).`
        : "No response actions recorded in the last 30 days via analyst action.",
    };

    // MTTC item
    const mttc: IncidentKpiItem = {
      value: mttcStat.avgMinutes,
      unit: "minutes",
      trend30d: null,
      trendAvailable: false,
      sampleSize: mttcStat.sampleCount,
      eligibleIncidents: mttcStat.sampleCount,
      excludedIncidents: Math.max(0, totalTracked - mttcStat.sampleCount),
      source: "incident_lifecycle_events (detected + contained)",
      calculationMethod: "AVG(contained_at - detected_at) for incidents with both events in last 30d",
      timestampFieldsUsed: "detected_at (Bitdefender alert sensor), contained_at (analyst action)",
      explanation: mttcStat.sampleCount > 0
        ? `Calculated from ${mttcStat.sampleCount} real incident containment(s).`
        : "No incidents contained in the last 30 days via analyst action.",
    };

    return {
      period: "last_30_days",
      mttd,
      mtta,
      mttr,
      mttc,
      dataAvailable: hasAnyKpiData,
      explanation: hasAnyKpiData
        ? `Real KPI calculated from analyst lifecycle events. MTTA: ${mttaStat.sampleCount} sample(s), MTTR: ${mttrStat.sampleCount} sample(s), MTTC: ${mttcStat.sampleCount} sample(s). MTTD remains N/A due to absence of occurred_at.`
        : "No valid operational lifecycle pairs in the last 30 days after excluding test/E2E events. MTTD is unavailable (missing occurred_at).",
    };
  } catch (err) {
    console.warn("[IncidentLifecycle] Failed to query KPI stats from DB:", err instanceof Error ? err.message : err);
    return {
      period: "last_30_days",
      mttd: {
        value: null,
        unit: "minutes",
        trend30d: null,
        trendAvailable: false,
        sampleSize: 0,
        eligibleIncidents: 0,
        excludedIncidents: bitdefenderTotalIncidents ?? 0,
        source: "Bitdefender GravityZone Telemetry",
        calculationMethod: "Requires detected_at - occurred_at; no defensible occurred_at mapping is established",
        timestampFieldsUsed: "None (occurred_at is missing)",
        explanation: "Occurrence timestamp unavailable. Bitdefender creation and processing timestamps are not substituted.",
      },
      mtta: {
        value: null,
        unit: "minutes",
        trend30d: null,
        trendAvailable: false,
        sampleSize: 0,
        eligibleIncidents: 0,
        excludedIncidents: bitdefenderTotalIncidents ?? 0,
        source: "Bitdefender / incident_lifecycle_events (Unavailable)",
        explanation: "No operational acknowledgement samples are currently available from lifecycle storage.",
      },
      mttr: {
        value: null,
        unit: "minutes",
        trend30d: null,
        trendAvailable: false,
        sampleSize: 0,
        eligibleIncidents: 0,
        excludedIncidents: bitdefenderTotalIncidents ?? 0,
        source: "Bitdefender / incident_lifecycle_events (Unavailable)",
        explanation: "No operational response samples are currently available from lifecycle storage.",
      },
      mttc: {
        value: null,
        unit: "minutes",
        trend30d: null,
        trendAvailable: false,
        sampleSize: 0,
        eligibleIncidents: 0,
        excludedIncidents: bitdefenderTotalIncidents ?? 0,
        source: "Bitdefender / incident_lifecycle_events (Unavailable)",
        explanation: "No verified containment samples are currently available from lifecycle storage.",
      },
      dataAvailable: false,
      explanation: "Incident lifecycle events database table is not reachable or unconfigured.",
    };
  }
}

/**
 * Fetch Bitdefender open/closed incidents merged with their current DB lifecycle events.
 * Used by the CISO Dashboard incident table to render actionable buttons.
 */
export async function getBitdefenderIncidentsWithLifecycle(
  page = 1,
  perPage = 10
): Promise<IncidentListResponse> {
  try {
    const postData = JSON.stringify({
      jsonrpc: "2.0",
      id: `incident_list_${Date.now()}`,
      method: "getIncidentsList",
      params: {
        filters: {
          status: ["open", "closed"],
        },
        page: Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1,
        perPage: Number.isFinite(perPage) ? Math.min(50, Math.max(10, Math.floor(perPage))) : 10,
      },
    });

    const parsedUrl = new URL(env.bitdefender.apiUrl());

    const result = await new Promise<{ total: number; items?: Array<Record<string, unknown>> }>(
      (resolve, reject) => {
        const req = https.request(
          {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: parsedUrl.pathname + parsedUrl.search,
            method: "POST",
            headers: {
              Authorization: bitdefenderAuthHeader(),
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(postData),
            },
            timeout: 10000,
          },
          (res) => {
            let raw = "";
            res.on("data", (chunk) => (raw += chunk));
            res.on("end", () => {
              if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                try {
                  const parsed = JSON.parse(raw);
                  if (parsed.error) {
                    reject(new HttpError("Bitdefender rejected the incident list request", "server"));
                  } else if (typeof parsed.result?.total === "number"
                    && parsed.result.total >= 0 && Array.isArray(parsed.result.items)) {
                    resolve(parsed.result);
                  } else {
                    reject(new HttpError("Invalid Bitdefender incident list response", "invalid_response"));
                  }
                } catch (err) {
                  reject(err);
                }
              } else {
                reject(new HttpError("Bitdefender incident list HTTP error", "server", res.statusCode));
              }
            });
          }
        );

        req.on("timeout", () => {
          req.destroy(new HttpError("Bitdefender incident list timed out", "timeout"));
        });
        req.on("error", (err) => reject(err));
        req.write(postData);
        req.end();
      }
    );

    const total = result.total ?? 0;
    const rawItems = result.items ?? [];
    if (rawItems.length === 0) {
      return { total, items: [] };
    }

    // Extract incident IDs (Bitdefender uses `incidentId`)
    const incidentIds = rawItems.map((item) => String(item.incidentId || item.id));

    // The list payload does not consistently include alert timestamps. Fetch
    // authoritative details in one batch, then idempotently register only the
    // genuine earliest sensor detection for each incident.
    const detailedIncidents = await getBitdefenderIncidentsByIds(incidentIds);
    const detailsById = new Map(
      detailedIncidents.map((incident) => [String(incident.incidentId || incident.id), incident])
    );
    const incidents = rawItems.map((raw) => {
      const detail = detailsById.get(String(raw.incidentId || raw.id));
      return detail ? { ...raw, ...detail, details: detail.details ?? raw.details } : raw;
    });
    await Promise.all(incidents.map(async (incident) => {
      const incidentId = String(incident.incidentId || incident.id);
      const detail = detailsById.get(incidentId);
      if (detail) await persistDetectedEventFromIncident(incidentId, detail);
    }));

    // Fetch DB lifecycle events for these incidents
    let dbEventsMap = new Map<string, Record<string, IncidentLifecycleEvent>>();
    try {
      const db = getDb();
      const eventsRes = await db.query(
        `SELECT id, incident_id, event_type, event_timestamp, actor_id, actor_name, source, metadata, created_at
         FROM incident_lifecycle_events
         WHERE incident_id = ANY($1)
         ORDER BY event_timestamp ASC`,
        [incidentIds]
      );

      for (const row of eventsRes.rows) {
        if (!isOperationalLifecycleEvent(row)) continue;
        const incId = row.incident_id;
        if (!dbEventsMap.has(incId)) {
          dbEventsMap.set(incId, {});
        }
        dbEventsMap.get(incId)![row.event_type] = {
          id: row.id,
          incidentId: row.incident_id,
          eventType: row.event_type,
          eventTimestamp: row.event_timestamp.toISOString(),
          actorId: row.actor_id,
          actorName: row.actor_name,
          source: row.source,
          metadata: row.metadata,
          createdAt: row.created_at.toISOString(),
        };
      }
    } catch {
      // If DB fails, proceed with empty DB events map
    }

    const items: BitdefenderIncidentListItem[] = incidents.map((raw) => {
      const id = String(raw.incidentId || raw.id);
      const incEvents = dbEventsMap.get(id) || {};

      const ackEvent = incEvents["acknowledged"];
      const respEvent = incEvents["response_started"];
      const contEvent = incEvents["contained"];

      let lifecycleStatus: BitdefenderIncidentListItem["lifecycleStatus"] = "unhandled";
      let latestEvent: IncidentLifecycleEventType | null = null;

      if (contEvent) {
        lifecycleStatus = "contained";
        latestEvent = "contained";
      } else if (respEvent) {
        lifecycleStatus = "responding";
        latestEvent = "response_started";
      } else if (ackEvent) {
        lifecycleStatus = "acknowledged";
        latestEvent = "acknowledged";
      } else if (incEvents["detected"]) {
        lifecycleStatus = "detected";
        latestEvent = "detected";
      }

      const details = raw.details as {
        detectionName?: string;
        alerts?: Array<{ date?: string }>;
        computerName?: string;
      } | undefined;

      // Match KPI detection semantics: earliest valid sensor alert, otherwise unavailable.
      const detectedAt = extractDetectedTimestamp({ details });

      // Severity mapping from severityScore or priority
      const score = Number(raw.severityScore ?? 0);
      const severity = score >= 70 ? "Critical" : score >= 50 ? "High" : score >= 20 ? "Medium" : "Low";
      const detectionName = details?.detectionName || (raw.attackTypes && Array.isArray(raw.attackTypes) ? raw.attackTypes.join(", ") : undefined);
      const host = details?.computerName ? ` on ${details.computerName}` : "";
      const name = detectionName ? `${detectionName}${host}` : String(raw.name || `Incident #${raw.incidentNumber || id}`);

      return {
        id,
        name,
        detectionName: detectionName ?? null,
        endpoint: details?.computerName ?? null,
        attackTypes: Array.isArray(raw.attackTypes) ? raw.attackTypes.map(String) : [],
        severity,
        status: String(raw.status || "open"),
        detectedAt,
        alertCount: Number(raw.alertCount ?? details?.alerts?.length ?? 1),
        mainAction: raw.mainAction ? String(raw.mainAction) : undefined,
        acknowledgedAt: ackEvent ? ackEvent.eventTimestamp : null,
        respondedAt: respEvent ? respEvent.eventTimestamp : null,
        containedAt: contEvent ? contEvent.eventTimestamp : null,
        latestEvent,
        lifecycleStatus,
      };
    });

    return { total, items };
  } catch (err) {
    console.warn("[IncidentLifecycle] Failed to fetch incidents with lifecycle:", err);
    throw err;
  }
}
