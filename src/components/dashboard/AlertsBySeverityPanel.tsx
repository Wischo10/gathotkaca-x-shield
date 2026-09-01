"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useApiResult } from "@/hooks/useApiResult";
import { Panel, PanelLoading, PanelEmpty, PanelError } from "@/components/ui/Panel";
import type { AlertsBySeverity } from "@/types/soc";

const COLORS: Record<string, string> = {
  Critical: "#E53935",
  High: "#F59E0B",
  Medium: "#EAB308",
  Low: "#22C55E",
};

export function AlertsBySeverityPanel() {
  const state = useApiResult<AlertsBySeverity>("/api/soc/alerts-by-severity?range=7d");

  return (
    <Panel title="Alerts by Severity">
      {state.phase === "loading" && <PanelLoading />}
      {state.phase === "empty" && <PanelEmpty />}
      {state.phase === "error" && (
        <PanelError message={state.message} onRetry={state.reload} />
      )}
      {state.phase === "ready" && (
        <div className="flex items-center gap-6">
          <div className="h-40 w-40 shrink-0">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={toChartData(state.data)}
                  dataKey="value"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {toChartData(state.data).map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex-1 space-y-1.5 text-sm">
            {toChartData(state.data).map((entry) => (
              <li key={entry.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: COLORS[entry.name] }}
                  />
                  {entry.name}
                </span>
                <span className="font-medium text-slate-800 dark:text-white">
                  {entry.value.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}

function toChartData(data: AlertsBySeverity) {
  return [
    { name: "Critical", value: data.critical },
    { name: "High", value: data.high },
    { name: "Medium", value: data.medium },
    { name: "Low", value: data.low },
  ];
}
