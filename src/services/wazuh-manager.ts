import "server-only";
import { env } from "@/lib/env";
import { fetchJson } from "@/lib/http";

/**
 * Service layer for the Wazuh Manager REST API (distinct from the Wazuh
 * Indexer above). Handles the login handshake and caches the short-lived
 * JWT it issues so we don't re-authenticate on every request.
 */

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const basicAuth = Buffer.from(
    `${env.wazuh.username()}:${env.wazuh.password()}`
  ).toString("base64");

  const res = await fetchJson<{ data: { token: string } }>(
    `${env.wazuh.apiUrl().replace(/\/$/, "")}/security/user/authenticate`,
    {
      method: "POST",
      headers: { Authorization: `Basic ${basicAuth}` },
      timeoutMs: env.wazuh.requestTimeoutMs(),
    }
  );

  // Wazuh JWTs are typically valid for 15 minutes; refresh a little early.
  cachedToken = {
    token: res.data.token,
    expiresAt: Date.now() + 13 * 60 * 1000,
  };
  return cachedToken.token;
}

export interface AgentsSummary {
  total: number;
  active: number;
  disconnected: number;
}

/** Agent connectivity summary — used to sanity-check data source health. */
export async function getAgentsSummary(): Promise<AgentsSummary> {
  // --- MOCK DATA IMPLEMENTATION ---
  return {
    total: 100,
    active: 85,
    disconnected: 15,
  };
}
