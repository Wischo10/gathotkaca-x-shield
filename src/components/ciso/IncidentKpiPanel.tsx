"use client";

import { Panel } from "@/components/ui/Panel";
import { CISO_MOCK_INCIDENT_KPI } from "@/mock/ciso-dashboard.mock";

export function IncidentKpiPanel() {
  return (
    <Panel
      title="Incident KPI"
      action={
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          Last 30 Days
        </span>
      }
      className="flex flex-col justify-between"
    >
      <div className="grid grid-cols-2 gap-3 h-56">
        {CISO_MOCK_INCIDENT_KPI.map((kpi, idx) => {
          const isRightBorder = idx % 2 === 0;
          const isBottomBorder = idx < 2;

          return (
            <div
              key={kpi.id}
              className={`flex flex-col justify-center gap-1 p-2.5 rounded-lg ${
                isRightBorder ? "border-r border-slate-100 dark:border-slate-800" : ""
              } ${isBottomBorder ? "border-b border-slate-100 dark:border-slate-800" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {kpi.label}
                </span>
                <span
                  className={`text-[10px] font-medium ${
                    kpi.isImprovement ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {kpi.changePct < 0 ? "↓" : "↑"} {Math.abs(kpi.changePct)}%
                </span>
              </div>
              <div className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                {kpi.value}
              </div>
              <span className="text-[10px] text-slate-400 truncate">
                {kpi.fullName}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-right text-xs font-medium text-brand-blue hover:underline cursor-pointer">
        View incident performance →
      </div>
    </Panel>
  );
}
