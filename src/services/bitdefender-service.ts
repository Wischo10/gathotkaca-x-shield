import "server-only";
import { env } from "@/lib/env";
import { fetchJson } from "@/lib/http";

export interface BitdefenderIncident {
  id: string;
  name: string;
  status: string;
  severity: "critical" | "high" | "medium" | "low";
  creationTime: string;
  endpoint: string;
}

export async function getRecentIncidents(limit = 10): Promise<BitdefenderIncident[]> {
  const apiUrl = process.env.BITDEFENDER_API_URL;
  const apiKey = process.env.BITDEFENDER_API_KEY;

  if (!apiUrl || !apiKey) {
    console.warn("Bitdefender API not fully configured");
    return [];
  }

  const basicAuth = Buffer.from(`${apiKey}:`).toString("base64");

  const rpcBody = {
    jsonrpc: "2.0",
    method: "getIncidentsList",
    params: {
      page: 1,
      perPage: limit,
      filters: {}
    },
    id: "gathotkaca-" + Date.now()
  };

  try {
    const res = await fetchJson<any>(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${basicAuth}`
      },
      body: JSON.stringify(rpcBody)
    });

    if (res.error) {
      console.error("Bitdefender API JSON-RPC Error:", res.error);
      return [];
    }

    const items = res.result?.items || [];
    
    // Map the response to our internal format
    return items.map((item: any) => ({
      id: item.id || item.incidentId || "Unknown",
      name: item.name || item.description || "Incident Detected",
      status: item.status || "Investigating",
      severity: item.severity ? item.severity.toLowerCase() : "medium",
      creationTime: item.creationTime || new Date().toISOString(),
      endpoint: item.endpointName || item.computerName || "Unknown Asset"
    }));

  } catch (error) {
    console.error("Bitdefender Service Error:", error);
    return [];
  }
}
