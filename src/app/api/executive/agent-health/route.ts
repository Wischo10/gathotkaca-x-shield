import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import "server-only";

export const dynamic = "force-dynamic";

/**
 * Fetches agent list from Wazuh Manager REST API and returns health status.
 * Wazuh Manager API: GET /agents?limit=500
 */
export async function GET(req: NextRequest) {
  try {
    const wazuhUrl = env.wazuh.apiUrl().replace(/\/$/, "");
    const username = env.wazuh.username();
    const password = env.wazuh.password();
    const token = Buffer.from(`${username}:${password}`).toString("base64");

    // Step 1: Get JWT token from Wazuh Manager
    const authRes = await fetch(`${wazuhUrl}/security/user/authenticate`, {
      method: "GET",
      headers: { Authorization: `Basic ${token}` },
      // @ts-ignore
      ...(process.env.WAZUH_ALLOW_SELF_SIGNED === "true"
        ? { agent: false }
        : {}),
    });

    if (!authRes.ok) {
      throw new Error(`Wazuh auth failed: ${authRes.status}`);
    }

    const authData = await authRes.json();
    const jwt = authData?.data?.token;

    if (!jwt) throw new Error("No JWT token from Wazuh");

    // Step 2: Fetch agents list
    const agentsRes = await fetch(`${wazuhUrl}/agents?limit=500&sort=-lastKeepAlive`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    if (!agentsRes.ok) {
      throw new Error(`Wazuh agents fetch failed: ${agentsRes.status}`);
    }

    const agentsData = await agentsRes.json();
    const agents: any[] = agentsData?.data?.affected_items ?? [];

    const formatted = agents.map((a: any) => ({
      id: a.id,
      name: a.name,
      ip: a.ip || "N/A",
      os: a.os?.platform ? `${a.os.platform} ${a.os.version ?? ""}`.trim() : "Unknown",
      status: a.status as "active" | "disconnected" | "pending" | "never_connected",
      lastKeepAlive: a.lastKeepAlive || null,
      version: a.version || "Unknown",
    }));

    const summary = {
      total: formatted.length,
      active: formatted.filter((a) => a.status === "active").length,
      disconnected: formatted.filter((a) => a.status === "disconnected").length,
      pending: formatted.filter((a) => a.status === "pending" || a.status === "never_connected").length,
    };

    return NextResponse.json({ status: "ok", data: { agents: formatted.slice(0, 50), summary } });
  } catch (error: any) {
    console.error("[/api/executive/agent-health] Error:", error.message);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch agent health" },
      { status: 500 }
    );
  }
}
