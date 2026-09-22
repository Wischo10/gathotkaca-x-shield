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

export interface ActiveResponseConfig {
  name: string;
  command: string;
  location: string;
  timeout?: number;
}

export async function getActiveResponses(): Promise<ActiveResponseConfig[]> {
  try {
    const token = await getToken();
    const res = await fetchJson<any>(
      `${env.wazuh.apiUrl().replace(/\/$/, "")}/manager/configuration?section=active-response`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        timeoutMs: env.wazuh.requestTimeoutMs(),
      }
    );
    
    const items = res?.data?.["active-response"] || res?.data?.items || [];
    
    if (!Array.isArray(items) || items.length === 0) {
      return [
        { name: "firewall-drop", command: "firewall-drop", location: "local", timeout: 60 },
        { name: "host-deny", command: "host-deny", location: "local", timeout: 600 },
        { name: "disable-account", command: "disable-account", location: "server" }
      ];
    }
    
    return items.map((i: any, idx: number) => ({
      name: i.name || i.command || `ar-script-${idx}`,
      command: i.command || "unknown",
      location: i.location || "local",
      timeout: i.timeout
    }));
  } catch (err) {
    console.error("Wazuh API Error (getActiveResponses):", err);
    return [
      { name: "firewall-drop", command: "firewall-drop", location: "local", timeout: 60 },
      { name: "host-deny", command: "host-deny", location: "local", timeout: 600 },
      { name: "disable-account", command: "disable-account", location: "server" }
    ];
  }
}
