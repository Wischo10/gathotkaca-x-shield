import { NextResponse } from "next/server";
import { getActiveResponses } from "@/services/wazuh-manager";
import { getActiveResponseStats, getActiveResponseExecutions } from "@/services/wazuh-indexer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [responses, stats, executions] = await Promise.all([
      getActiveResponses(),
      getActiveResponseStats(),
      getActiveResponseExecutions(10),
    ]);

    // Map active responses to playbook library format
    const library = responses.map((r, i) => ({
      id: `pb-${i}`,
      name: r.name,
      category: "Active Response",
      categoryColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      type: "Response",
      description: `Wazuh active response command: ${r.command} (Location: ${r.location})`,
      lastUpdated: new Date().toLocaleDateString(),
      status: "Active",
      usage: stats.popular.find(p => p.command === r.command)?.count || 0,
      icon: "Shield"
    }));

    // Generate KPIs
    const kpis = {
      totalAlerts: stats.totalExecutions * 125, // Mock total alerts relative to executions
      triggered: stats.totalExecutions,
      successRate: stats.totalExecutions > 0 ? Math.round((stats.successCount / stats.totalExecutions) * 100) : 100,
      successfulResponses: stats.successCount,
      failedUnhandled: stats.failedCount,
      criticalAlerts: 0
    };

    // Format popular playbooks for the sidebar
    const popular = stats.popular.map((p, i) => ({
      id: i,
      name: p.command,
      category: "Active Response",
      executions: p.count,
      trend: p.trend,
      icon: "Shield"
    }));

    // Format recent executions for the sidebar
    const recent = executions.map((e, i) => ({
      id: i,
      playbook: e.command,
      status: e.status,
      time: new Date(e.time).toLocaleString(),
      user: "Wazuh Agent",
      duration: "auto"
    }));

    return NextResponse.json({
      status: "ok",
      data: {
        library,
        kpis,
        popular,
        recent
      }
    });
  } catch (error) {
    console.error("API Error (/api/soc/playbooks):", error);
    return NextResponse.json({ status: "error", message: "Failed to fetch playbooks" }, { status: 500 });
  }
}
