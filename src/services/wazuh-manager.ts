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
  try {
    const token = await getToken();
    const res = await fetchJson<{ data: { total: number; active: number; disconnected: number } }>(
      `${env.wazuh.apiUrl().replace(/\/$/, "")}/agents/summary/status`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        timeoutMs: env.wazuh.requestTimeoutMs(),
      }
    );
    
    return {
      total: res.data.total || 0,
      active: res.data.active || 0,
      disconnected: res.data.disconnected || 0,
    };
  } catch (err) {
    console.error("Wazuh API Error (getAgentsSummary):", err);
    return { total: 0, active: 0, disconnected: 0 };
  }
}
