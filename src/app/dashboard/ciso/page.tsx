"use client";

import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/app/dashboard/layout";
import { CISO_MOCK_METRICS } from "@/mock/ciso-dashboard.mock";
import { MetricCard } from "@/components/ciso/MetricCard";
import { SecurityPostureRadarPanel } from "@/components/ciso/SecurityPostureRadarPanel";
import { IncidentKpiPanel } from "@/components/ciso/IncidentKpiPanel";
import { VulnerabilitySlaPanel } from "@/components/ciso/VulnerabilitySlaPanel";
import { ThreatIntelligencePanel } from "@/components/ciso/ThreatIntelligencePanel";
import { RiskRegisterPanel } from "@/components/ciso/RiskRegisterPanel";
import { TopRisksPanel } from "@/components/ciso/TopRisksPanel";
import { ComplianceOverviewPanel } from "@/components/ciso/ComplianceOverviewPanel";
import { ThirdPartyRiskPanel } from "@/components/ciso/ThirdPartyRiskPanel";
import { AiCisoBriefingPanel } from "@/components/ciso/AiCisoBriefingPanel";

export default function CISODashboardPage() {
  const openSidebar = useSidebarToggle();

  return (
    <>
      <Topbar
        title="CISO Dashboard"
        subtitle="Deep dive into security risk, performance, and compliance"
        onMenuClick={openSidebar}
      />
      <main className="flex-1 space-y-4 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        {/* ROW 1: Metrics (6 KPI Cards with Mini Sparklines) */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          {CISO_MOCK_METRICS.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>

        {/* ROW 2: Posture Radar, Incident KPI, Vulnerability SLA */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SecurityPostureRadarPanel />
          <IncidentKpiPanel />
          <VulnerabilitySlaPanel />
        </div>

        {/* ROW 3: Threat Intelligence, Risk Register, Top Risks */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ThreatIntelligencePanel />
          <RiskRegisterPanel />
          <TopRisksPanel />
        </div>

        {/* ROW 4: Compliance Overview, Third-Party Risk, AI CISO Briefing */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ComplianceOverviewPanel />
          <ThirdPartyRiskPanel />
          <AiCisoBriefingPanel />
        </div>
      </main>
    </>
  );
}
