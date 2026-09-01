"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useApiResult } from "@/hooks/useApiResult";
import { Panel, PanelLoading, PanelEmpty, PanelError } from "@/components/ui/Panel";
import type { TimeSeriesPoint } from "@/types/soc";

export function AlertsTrendPanel() {
  const state = useApiResult<TimeSeriesPoint[]>("/api/soc/alerts-trend?range=7d");

  return (
    <Panel title="Alerts Over Time" className="lg:col-span-2">
      {state.phase === "loading" && <PanelLoading />}
      {state.phase === "empty" && <PanelEmpty />}
      {state.phase === "error" && (
        <PanelError message={state.message} onRetry={state.reload} />
      )}
      {state.phase === "ready" && (
        <div className="h-56 w-full">
          <ResponsiveContainer>
            <AreaChart data={state.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) =>
                  new Date(d).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                }
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="critical"
                stackId="1"
                stroke="#E53935"
                fill="#E53935"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="high"
                stackId="1"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="medium"
                stackId="1"
                stroke="#EAB308"
                fill="#EAB308"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="low"
                stackId="1"
                stroke="#22C55E"
                fill="#22C55E"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}
