"use client";

import { Topbar } from "@/components/layout/Topbar";
import { useSidebarToggle } from "@/app/dashboard/layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertsBySeverityPanel } from "@/components/dashboard/AlertsBySeverityPanel";
import { AlertsTrendPanel } from "@/components/dashboard/AlertsTrendPanel";
import { LiveEventsPanel } from "@/components/dashboard/LiveEventsPanel";
import { TopRulesPanel } from "@/components/dashboard/TopRulesPanel";

export default function SocDashboardPage() {
  const openSidebar = useSidebarToggle();

  return (
    <>
      <Topbar
        title="SOC Dashboard"
        subtitle="Real-time monitoring, detection, and response overview"
        onMenuClick={openSidebar}
      />
      <main className="flex-1 flex flex-col p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 space-y-4">
        {/* KPI Stat Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <StatCard label="Total Events" value="1,248,780" changePct={12} />
          <StatCard label="Total Alerts" value="2,843" changePct={-5} />
          <StatCard label="Incidents" value="128" changePct={8} />
          <StatCard label="Critical Alerts" value="312" changePct={-14} />
          <StatCard label="MTTD" value="21m" changePct={-16} />
          <StatCard label="MTTR" value="4h 12m" changePct={-18} />
        </div>

        {/* Row 1: Severity Donut + Trend Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <AlertsBySeverityPanel />
          <AlertsTrendPanel />
        </div>

        {/* Row 2: Live Events Table + Top Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <LiveEventsPanel />
          <TopRulesPanel />
        </div>
      </main>
    </>
  );
}

