const fs = require('fs');

function main() {
    let content = fs.readFileSync('src/app/dashboard/executive/page.tsx', 'utf-8');

    // 1. Imports
    const imports_replacement = `
"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Panel } from "@/components/ui/Panel";
import { useSidebarToggle } from "@/app/dashboard/SidebarContext";
import { Modal } from "@/components/ui/Modal";
import { AlertTriangle as AlertTriangleIcon, X } from "lucide-react";
import { MetricCard } from "./components/MetricCard";
import { DashboardHeader } from "./components/DashboardHeader";
import { AlertsOverview } from "./components/AlertsOverview";
import { IncidentsTable } from "./components/IncidentsTable";
import { AttackMethods } from "./components/AttackMethods";
import { useExecutiveData } from "./hooks/useExecutiveData";
import { RangeValue } from "./types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
`;
    content = content.replace(/"use client";[\s\S]*?const WorldHeatmap = dynamic/, imports_replacement.trim() + "\n\n// Dynamic import — react-simple-maps uses SVG/browser APIs, must be client-only\nconst WorldHeatmap = dynamic");

    // 2. Remove inline RangeSelect and MetricCard types/components
    content = content.replace(/\/\/ ─── Types ────────────────────────────────────────────────────────────────────[\s\S]*?\/\/ ─── Page ──────────────────────────────────────────────────────────────────────/, '// ─── Page ──────────────────────────────────────────────────────────────────────');

    // 3. Replace state and fetchers
    const state_replacement = `
export default function ExecutiveDashboardPage() {
  const openSidebar = useSidebarToggle();
  const [globalRange, setGlobalRange] = useState<RangeValue>("24h");
  
  const { 
    alerts, alertsPrev, trend, attackMethods, topVictims, topRisks, heatmapData, 
    casesStats, mitreTactics, agentHealth, incidents, aiSummary, boardReport, 
    isRefreshing, refreshAll 
  } = useExecutiveData(globalRange);

  const [selectedCountry, setSelectedCountry] = useState<any | null>(null);
  const [drillDownAlerts, setDrillDownAlerts] = useState<any | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  // ── Derived data ─────────────────────────────────────────────────────────────
`;
    content = content.replace(/export default function ExecutiveDashboardPage\(\) \{[\s\S]*?\/\/ ── Derived data ─────────────────────────────────────────────────────────────/, state_replacement.trim() + "\n");

    // 4. Remove derived data for AlertsStatus and Trend
    content = content.replace(/const alertStatusData = alerts \? \[[\s\S]*?\}\)\);/, '');

    // 5. Replace Topbar
    const topbar_regex = /<Topbar\s+title="Executive Dashboard"[\s\S]*?\/>/;
    const topbar_replacement = `
      <DashboardHeader
        globalRange={globalRange}
        setGlobalRange={setGlobalRange}
        openSidebar={openSidebar}
        isRefreshing={isRefreshing}
        onRefresh={refreshAll}
        lastRefreshed={new Date()}
      />
`;
    content = content.replace(topbar_regex, topbar_replacement.trim());

    // 6. Replace AlertsOverview
    const alerts_overview_regex = /\{\/\* Alerts by Status \*\/\}[\s\S]*?\{\/\* Top Risks by Domain \*\/\}/;
    const alerts_overview_replacement = `
          <AlertsOverview alerts={alerts} trend={trend} setSelectedFeature={setSelectedFeature} />

          {/* Top Risks by Domain */}
`;
    content = content.replace(alerts_overview_regex, alerts_overview_replacement.trim());

    // 7. Replace AttackMethods
    const attack_methods_regex = /\{\/\* Attack Method Distribution \*\/\}[\s\S]*?\{\/\* Top 10 Victim \*\/\}/;
    const attack_methods_replacement = `
          <AttackMethods attackMethods={attackMethods} mitreTactics={mitreTactics} setSelectedFeature={setSelectedFeature} />

          {/* Top 10 Victim */}
`;
    content = content.replace(attack_methods_regex, attack_methods_replacement.trim());

    // 8. Replace IncidentsTable
    const incidents_table_regex = /<Panel title="Recent Critical Incidents ⓘ"[\s\S]*?<\/Panel>/;
    const incidents_table_replacement = `
          <IncidentsTable incidents={incidents} setSelectedFeature={setSelectedFeature} />
`;
    content = content.replace(incidents_table_regex, incidents_table_replacement.trim());

    // Also remove MITRE panel since it was moved to AttackMethods
    const mitre_regex = /\{\/\* MITRE ATT&CK Coverage \*\/\}[\s\S]*?\{\/\* Agent Health \*\/\}/;
    content = content.replace(mitre_regex, "{/* Agent Health */}");

    fs.writeFileSync('src/app/dashboard/executive/page.tsx', content, 'utf-8');
}

main();
