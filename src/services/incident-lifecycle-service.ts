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

/**
 * Fetch incident details from Bitdefender API to verify existence and extract
 * the earliest detection alert timestamp (`details.alerts[].date`).
 */
export async function getBitdefenderIncident(
  incidentId: string
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
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(raw);
              if (parsed.result) {
                resolve(parsed.result as BitdefenderIncidentDetail);
              } else {
                resolve(null);
              }
            } catch (err) {
              reject(err);
            }
          } else {
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
        res.on("end", () => {
          try {
            const parsed = JSON.parse(raw);
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300
              && !parsed.error && Array.isArray(parsed.result)) {
              resolve(parsed.result as BitdefenderIncidentDetail[]);
            } else {
              reject(new HttpError("Bitdefender incident detail batch failed", "server", res.statusCode));
            }
          } catch (err) {
            reject(err);
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
  incident: Pick<BitdefenderIncidentDetail, "details">
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
      }),
    ]
  );
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
