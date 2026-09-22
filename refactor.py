import re

def main():
    with open('src/app/dashboard/executive/page.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Imports
    imports_replacement = """
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
"""
    content = re.sub(r'"use client";.*?const WorldHeatmap = dynamic', imports_replacement.strip() + "\n\n// Dynamic import — react-simple-maps uses SVG/browser APIs, must be client-only\nconst WorldHeatmap = dynamic", content, flags=re.DOTALL)

    # 2. Remove inline RangeSelect and MetricCard types/components
    content = re.sub(r'// ─── Types ────────────────────────────────────────────────────────────────────.*?// ─── Page ──────────────────────────────────────────────────────────────────────', '// ─── Page ──────────────────────────────────────────────────────────────────────', content, flags=re.DOTALL)

    # 3. Replace state and fetchers
    state_replacement = """
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
"""
    content = re.sub(r'export default function ExecutiveDashboardPage\(\) \{.*?// ── Derived data ─────────────────────────────────────────────────────────────', state_replacement.strip() + "\n", content, flags=re.DOTALL)

    # 4. Remove derived data for AlertsStatus and Trend
    content = re.sub(r'const alertStatusData = alerts \? \[.*?\}\)\);', '', content, flags=re.DOTALL)

    # 5. Replace Topbar
    topbar_regex = r'<Topbar\s+title="Executive Dashboard".*?/>'
    topbar_replacement = """
      <DashboardHeader
        globalRange={globalRange}
        setGlobalRange={setGlobalRange}
        openSidebar={openSidebar}
        isRefreshing={isRefreshing}
        onRefresh={refreshAll}
        lastRefreshed={new Date()}
      />
"""
    content = re.sub(topbar_regex, topbar_replacement.strip(), content, flags=re.DOTALL)

    # 6. Replace AlertsOverview
    alerts_overview_regex = r'\{\/\* Alerts by Status \*\/\}.*?\{\/\* Top Risks by Domain \*\/\}'
    alerts_overview_replacement = """
          <AlertsOverview alerts={alerts} trend={trend} setSelectedFeature={setSelectedFeature} />

          {/* Top Risks by Domain */}
"""
    content = re.sub(alerts_overview_regex, alerts_overview_replacement.strip(), content, flags=re.DOTALL)

    # 7. Replace AttackMethods
    attack_methods_regex = r'\{\/\* Attack Method Distribution \*\/\}.*?\{\/\* Top 10 Victim \*\/\}'
    attack_methods_replacement = """
          <AttackMethods attackMethods={attackMethods} mitreTactics={mitreTactics} setSelectedFeature={setSelectedFeature} />

          {/* Top 10 Victim */}
"""
    content = re.sub(attack_methods_regex, attack_methods_replacement.strip(), content, flags=re.DOTALL)

    # 8. Replace IncidentsTable
    incidents_table_regex = r'<Panel title="Recent Critical Incidents ⓘ".*?</Panel>'
    incidents_table_replacement = """
          <IncidentsTable incidents={incidents} setSelectedFeature={setSelectedFeature} />
"""
    content = re.sub(incidents_table_regex, incidents_table_replacement.strip(), content, flags=re.DOTALL)

    # Also remove MITRE panel since it was moved to AttackMethods
    mitre_regex = r'\{\/\* MITRE ATT&CK Coverage \*\/\}.*?\{\/\* Agent Health \*\/\}'
    content = re.sub(mitre_regex, "{/* Agent Health */}", content, flags=re.DOTALL)

    with open('src/app/dashboard/executive/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    main()
