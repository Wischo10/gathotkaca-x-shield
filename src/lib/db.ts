import "server-only";
import { Pool } from "pg";
import { env } from "@/lib/env";

/**
 * Single shared pg Pool for the whole server process. Reused across
 * hot-reloads in dev via globalThis to avoid exhausting connections.
 */
declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

export function getDb(): Pool {
  if (!global.__pgPool) {
    global.__pgPool = new Pool({
      connectionString: env.database.url(),
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return global.__pgPool;
}
