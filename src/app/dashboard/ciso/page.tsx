"use client";

import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/app/dashboard/SidebarContext";
import { useState, useEffect } from "react";
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
import Link from "next/link";

export default function CISODashboardPage() {
  const openSidebar = useSidebarToggle();
  const [metrics, setMetrics] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/ciso/metrics")
      .then(res => res.json())
      .then(res => {
        if (res.status === "ok") {
          setMetrics(res.data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <Topbar
        title="CISO Dashboard"
        subtitle="Deep dive into security risk, performance, and compliance"
        onMenuClick={openSidebar}
        action={
          <div className="flex items-center gap-2">
            <Link href="/dashboard/soc" className="text-xs px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">SOC Dashboard</Link>
            <Link href="/dashboard/vulnerability" className="text-xs px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Vulnerability</Link>
            <Link href="/dashboard/compliance" className="text-xs px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">Compliance</Link>
          </div>
        }
      />
      <main className="flex-1 space-y-4 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
        {/* ROW 1: Metrics (6 KPI Cards with Mini Sparklines) */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          {metrics.length === 0 ? (
            <div className="col-span-full h-32 flex items-center justify-center text-slate-400">Loading metrics...</div>
          ) : (
            metrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))
          )}
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
