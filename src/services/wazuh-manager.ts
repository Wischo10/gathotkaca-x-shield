import "server-only";
import https from "node:https";
import { env } from "@/lib/env";

const httpsAgent = new https.Agent({
  rejectUnauthorized: !env.wazuh.allowSelfSigned(),
});

function fetchWazuhApi<T>(
  path: string,
  options: { method?: string; headers?: Record<string, string>; body?: string } = {}
): Promise<T> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(`${env.wazuh.apiUrl().replace(/\/$/, "")}${path}`);
    const req = https.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 55000,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || "GET",
        headers: options.headers || {},
        agent: httpsAgent,
        timeout: env.wazuh.requestTimeoutMs(),
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(raw) as T);
            } catch (err) {
              reject(err);
            }
          } else {
            reject(new Error(`Wazuh API error ${res.statusCode}: ${raw}`));
          }
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error(`Wazuh API request timed out after ${env.wazuh.requestTimeoutMs()}ms`));
    });
    req.on("error", (err) => reject(err));
    if (options.body) req.write(options.body);
    req.end();
  });
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const basicAuth = Buffer.from(
    `${env.wazuh.username()}:${env.wazuh.password()}`
  ).toString("base64");

  const res = await fetchWazuhApi<{ data: { token: string } }>(
    "/security/user/authenticate",
    {
      method: "POST",
      headers: { Authorization: `Basic ${basicAuth}` },
    }
  );

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
  never_connected: number;
  pending: number;
}

/** Agent connectivity summary — fetches live from Wazuh Manager API. */
export async function getAgentsSummary(): Promise<AgentsSummary | null> {
  try {
    const token = await getToken();
    const res = await fetchWazuhApi<{
      data: {
        connection: {
          total: number;
          active: number;
          disconnected: number;
          never_connected: number;
          pending: number;
        };
      };
    }>("/agents/summary/status", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const conn = res.data?.connection;
    if (!conn || ![conn.total, conn.active, conn.disconnected, conn.never_connected, conn.pending]
      .every(value => Number.isInteger(value) && value >= 0) || conn.active > conn.total) {
      return null;
    }
    return {
      total: conn.total,
      active: conn.active,
      disconnected: conn.disconnected,
      never_connected: conn.never_connected,
      pending: conn.pending,
    };
  } catch (err) {
    console.warn("[Wazuh Manager] getAgentsSummary failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
