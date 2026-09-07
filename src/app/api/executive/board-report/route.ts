import { NextResponse } from "next/server";
import {
  getAlertsBySeverity,
  getAttackMethods,
  getComplianceSummary,
  getVulnerabilityStats,
  getTopRisksByDomain,
} from "@/services/wazuh-indexer";
import { getAgentsSummary } from "@/services/wazuh-manager";

export const dynamic = "force-dynamic";

/**
 * Aggregates multiple Wazuh data sources into a single Board Report payload.
 * All sub-queries run in parallel for performance.
 */
export async function GET() {
  try {
    const [
      alertsCurrent,  // last 30 days
      alertsPrev,     // previous 30 days (for MoM trend)
      attackMethods,
      compliance,
      vulnStats,
      topRisks,
      agents,
    ] = await Promise.allSettled([
      getAlertsBySeverity("30d"),
      getAlertsBySeverity("7d"),   // we'll use 7d as "last week" comparison
      getAttackMethods(5),
      getComplianceSummary(),
      getVulnerabilityStats(),
      getTopRisksByDomain("30d"),
      getAgentsSummary(),
    ]);

    function val<T>(r: PromiseSettledResult<T>, fallback: T): T {
      return r.status === "fulfilled" ? r.value : fallback;
    }

    const current  = val(alertsCurrent, { total: 0, critical: 0, high: 0, medium: 0, low: 0 });
    const prev7d   = val(alertsPrev,    { total: 0, critical: 0, high: 0, medium: 0, low: 0 });
    const methods  = val(attackMethods, []);
    const comp     = val(compliance, []);
    const vuln     = val(vulnStats, { total: 0, critical: 0, high: 0, medium: 0, low: 0 });
    const risks    = val(topRisks, []);
    const agentSum = val(agents, { total: 0, active: 0, disconnected: 0 });

    // Derive overall security posture score (0-100)
    // Logic: start at 100, penalise for critical & high alerts/vulns, reward agent coverage
    const criticalPenalty = Math.min(50, (current.critical / Math.max(current.total, 1)) * 100);
    const highPenalty     = Math.min(30, (current.high    / Math.max(current.total, 1)) * 60);
    const agentBonus      = agentSum.total > 0
      ? (agentSum.active / agentSum.total) * 10
      : 0;
    const securityScore = Math.max(0, Math.round(100 - criticalPenalty - highPenalty + agentBonus));

    // Compliance coverage: how many frameworks have > 0 alerts flagged (meaning Wazuh is checking them)
    const totalComplianceEvents = comp.reduce((s, c) => s + c.value, 0);
    const compliancePct = comp.length > 0
      ? Math.round((comp.filter(c => c.value > 0).length / comp.length) * 100)
      : 0;

    // High-risk domain count
    const highRiskDomains = risks.filter(r => r.level === "critical" || r.level === "high").length;

    // Top attack method
    const topAttackMethod = methods.length > 0 ? methods[0].name : "N/A";

    // Quarter label
    const now = new Date();
    const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;

    const data = {
      quarter,
      generatedAt: now.toISOString(),
      // Headline KPIs
      securityScore,
      totalAlerts: current.total,
      criticalAlerts: current.critical,
      highAlerts: current.high,
      mediumAlerts: current.medium,
      lowAlerts: current.low,
      // Vulnerability
      totalVulnerabilities: vuln.total,
      criticalVulnerabilities: vuln.critical,
      highVulnerabilities: vuln.high,
      // Agent health
      totalAgents: agentSum.total,
      activeAgents: agentSum.active,
      disconnectedAgents: agentSum.disconnected,
      // Attack landscape
      topAttackMethod,
      attackMethods: methods.slice(0, 3).map(m => ({ name: m.name, count: m.value })),
      // Compliance
      compliancePct,
      totalComplianceEvents,
      complianceFrameworks: comp,
      // Risk
      highRiskDomains,
      topRisks: risks.slice(0, 3),
      // Trend (compare 30d total vs 7d * ~4 as rough MoM proxy)
      weeklyAlerts: prev7d.total,
    };

    return NextResponse.json({ status: "ok", data });
  } catch (error) {
    console.error("[/api/executive/board-report] Error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to generate board report" },
      { status: 500 }
    );
  }
}
