import "server-only";
import { Pool, QueryResult } from "pg";
import { env } from "@/lib/env";
import fs from "fs";
import path from "path";
import { isOperationalLifecycleEvent } from "@/lib/incident-data-integrity";

/**
 * Storage interface matching basic pg Query interface for seamless fallback.
 */
export interface DbInterface {
  query<T = any>(queryText: string, values?: any[]): Promise<{ rows: T[]; rowCount: number }>;
}

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __fallbackStorage: FileFallbackDb | undefined;
}

/**
 * File-backed fallback database for persistent local recording
 * when PostgreSQL server is not configured or reachable.
 * Keeps data locally in `.data/incident_lifecycle_events.json`
 */
class FileFallbackDb implements DbInterface {
  private dataFilePath: string;

  constructor() {
    const dir = path.join(process.cwd(), ".data");
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch {}
    }
    this.dataFilePath = path.join(dir, "incident_lifecycle_events.json");
    if (!fs.existsSync(this.dataFilePath)) {
      try {
        fs.writeFileSync(this.dataFilePath, JSON.stringify([]), "utf-8");
      } catch {}
    }
  }

  private readEvents(): any[] {
    try {
      if (!fs.existsSync(this.dataFilePath)) return [];
      const content = fs.readFileSync(this.dataFilePath, "utf-8");
      return JSON.parse(content) || [];
    } catch {
      return [];
    }
  }

  private writeEvents(events: any[]) {
    try {
      fs.writeFileSync(this.dataFilePath, JSON.stringify(events, null, 2), "utf-8");
    } catch (err) {
      console.error("[FileDb] Failed to write events file:", err);
    }
  }

  async query<T = any>(queryText: string, values: any[] = []): Promise<{ rows: T[]; rowCount: number }> {
    const trimmed = queryText.trim().toUpperCase();

    // 1. SELECT query by incident_id and event_type
    if (trimmed.startsWith("SELECT") && queryText.includes("FROM incident_lifecycle_events") && queryText.includes("incident_id = $1") && queryText.includes("event_type = $2")) {
      const incidentId = values[0];
      const eventType = values[1];
      const all = this.readEvents();
      const matched = all.filter((e) => e.incident_id === incidentId && e.event_type === eventType);
      return {
        rows: matched.map(m => ({
          ...m,
          event_timestamp: new Date(m.event_timestamp),
          created_at: new Date(m.created_at || m.event_timestamp),
        })) as unknown as T[],
        rowCount: matched.length,
      };
    }

    // 2. SELECT detected query
    if (trimmed.startsWith("SELECT") && queryText.includes("FROM incident_lifecycle_events") && queryText.includes("incident_id = $1") && queryText.includes("event_type = 'detected'")) {
      const incidentId = values[0];
      const all = this.readEvents();
      const matched = all.filter((e) => e.incident_id === incidentId && e.event_type === "detected");
      return {
        rows: matched.map(m => ({
          ...m,
          event_timestamp: new Date(m.event_timestamp),
          created_at: new Date(m.created_at || m.event_timestamp),
        })) as unknown as T[],
        rowCount: matched.length,
      };
    }

    // 3. SELECT by multiple incident_ids: incident_id = ANY($1)
    if (trimmed.startsWith("SELECT") && queryText.includes("FROM incident_lifecycle_events") && queryText.includes("incident_id = ANY($1)")) {
      const ids: string[] = Array.isArray(values[0]) ? values[0] : [];
      const all = this.readEvents();
      const matched = all.filter((e) => ids.includes(e.incident_id));
      return {
        rows: matched.map(m => ({
          ...m,
          event_timestamp: new Date(m.event_timestamp),
          created_at: new Date(m.created_at || m.event_timestamp),
        })) as unknown as T[],
        rowCount: matched.length,
      };
    }

    // 4. COUNT query for last 30 days
    if (trimmed.startsWith("SELECT") && queryText.includes("COUNT(DISTINCT incident_id)")) {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const all = this.readEvents();
      const recent = all.filter(e => isOperationalLifecycleEvent(e)
        && e.event_type === "detected"
        && new Date(e.event_timestamp).getTime() >= thirtyDaysAgo
        && new Date(e.event_timestamp).getTime() <= Date.now());
      const uniqueIds = new Set(recent.map(e => e.incident_id));
      return {
        rows: [{ total_count: uniqueIds.size }] as unknown as T[],
        rowCount: 1,
      };
    }

    // 5. CTE Interval calculation for KPI (MTTA, MTTR, MTTC)
    if (trimmed.startsWith("WITH DETECTED_EVENTS AS") || (queryText.includes("avg_minutes") && queryText.includes("matched_pairs"))) {
      const targetEventType = values[0];
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const all = this.readEvents().filter(e => isOperationalLifecycleEvent(e)
        && new Date(e.event_timestamp).getTime() <= Date.now());

      const detected = all.filter(e => e.event_type === "detected" && new Date(e.event_timestamp).getTime() >= thirtyDaysAgo);
      const target = all.filter(e => e.event_type === targetEventType && new Date(e.event_timestamp).getTime() >= thirtyDaysAgo);

      const diffs: number[] = [];
      for (const d of detected) {
        const t = target.find(item => item.incident_id === d.incident_id);
        if (t) {
          const tTime = new Date(t.event_timestamp).getTime();
          const dTime = new Date(d.event_timestamp).getTime();
          if (tTime >= dTime) {
            const diffMin = (tTime - dTime) / (1000 * 60);
            diffs.push(diffMin);
          }
        }
      }

      if (diffs.length === 0) {
        return {
          rows: [{ avg_minutes: null, sample_count: 0 }] as unknown as T[],
          rowCount: 1,
        };
      }

      const sum = diffs.reduce((a, b) => a + b, 0);
      const avg = sum / diffs.length;

      return {
        rows: [{ avg_minutes: avg, sample_count: diffs.length }] as unknown as T[],
        rowCount: 1,
      };
    }

    // 6. INSERT query
    if (trimmed.startsWith("INSERT INTO INCIDENT_LIFECYCLE_EVENTS")) {
      const all = this.readEvents();
      const [id, incident_id, event_type, event_timestamp, actor_id, actor_name, source, metadata] = values;

      // Check unique constraint (incident_id, event_type)
      const existing = all.find(e => e.incident_id === incident_id && e.event_type === event_type);
      if (existing) {
        if (queryText.includes("DO NOTHING")) {
          return { rows: [] as T[], rowCount: 0 };
        }
        throw new Error(`Unique constraint violation: event '${event_type}' already exists for incident '${incident_id}'.`);
      }

      const newRecord = {
        id,
        incident_id,
        event_type,
        event_timestamp: typeof event_timestamp === "string" ? event_timestamp : event_timestamp.toISOString(),
        actor_id,
        actor_name,
        source,
        metadata: typeof metadata === "string" ? JSON.parse(metadata) : metadata,
        created_at: new Date().toISOString(),
      };

      all.push(newRecord);
      this.writeEvents(all);

      return {
        rows: [{
          ...newRecord,
          event_timestamp: new Date(newRecord.event_timestamp),
          created_at: new Date(newRecord.created_at),
        }] as unknown as T[],
        rowCount: 1,
      };
    }

    return { rows: [] as T[], rowCount: 0 };
  }
}

export function getDb(): DbInterface {
  const dbUrl = env.database.url();
  if (dbUrl) {
    if (!global.__pgPool) {
      global.__pgPool = new Pool({
        connectionString: dbUrl,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    }
    return global.__pgPool;
  }

  // Fallback storage when PostgreSQL is not configured
  if (!global.__fallbackStorage) {
    global.__fallbackStorage = new FileFallbackDb();
  }
  return global.__fallbackStorage;
}

/** PostgreSQL pool for workflows that require an explicit transaction. */
export function getPostgresPool(): Pool {
  if (!env.database.url()) throw new Error("database_not_configured");
  getDb();
  return global.__pgPool!;
}
