"use client";

import { Panel } from "@/components/ui/Panel";
import { CISO_MOCK_THREAT_INTEL } from "@/mock/ciso-dashboard.mock";

export function ThreatIntelligencePanel() {
  const maxCount = Math.max(...CISO_MOCK_THREAT_INTEL.topSources.map((s) => s.count), 1);

  return (
    <Panel title="Threat Intelligence Overview" className="h-full flex flex-col justify-between">
      <div className="space-y-4">
        {/* Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CISO_MOCK_THREAT_INTEL.metrics.slice(0, 3).map((item) => (
            <div
              key={item.label}
              className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
            >
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{item.label}</div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-800 dark:text-white">{item.value}</span>
                <span className="text-[10px] font-medium text-amber-500">{item.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Top Threat Sources Horizontal Bars */}
        <div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
            Top Threat Sources
          </div>
          <div className="space-y-2">
            {CISO_MOCK_THREAT_INTEL.topSources.map((item) => (
              <div key={item.source} className="text-xs">
                <div className="flex justify-between items-center mb-1 text-slate-700 dark:text-slate-300">
                  <span className="truncate pr-2">{item.source}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{item.count}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-1.5 rounded-full bg-rose-500"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 text-right text-xs font-medium text-brand-blue hover:underline cursor-pointer">
        View threat intelligence →
      </div>
    </Panel>
  );
}
