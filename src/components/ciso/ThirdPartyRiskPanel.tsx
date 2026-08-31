"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Panel } from "@/components/ui/Panel";
import { CISO_MOCK_THIRD_PARTY_RISK } from "@/mock/ciso-dashboard.mock";

export function ThirdPartyRiskPanel() {
  const { summary, tierDistribution } = CISO_MOCK_THIRD_PARTY_RISK;

  return (
    <Panel title="Third-Party Risk Overview" className="h-full flex flex-col justify-between">
      <div className="space-y-3">
        {/* Top: Donut Chart & Tier legend */}
        <div className="flex h-32 items-center">
          <div className="h-full w-1/2 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={48}
                  paddingAngle={3}
                  dataKey="count"
                  stroke="none"
                >
                  {tierDistribution.map((entry) => (
                    <Cell key={entry.tier} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-1/2 flex flex-col gap-1.5 text-xs">
            {tierDistribution.map((item) => (
              <div key={item.tier} className="flex justify-between items-center pr-2">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.tier} Risk
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: 4 Key Metrics */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
            <div className="text-[10px] text-slate-400">Total Vendors</div>
            <div className="text-base font-bold text-slate-800 dark:text-white">
              {summary.totalVendors}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
            <div className="text-[10px] text-slate-400">High Risk Vendors</div>
            <div className="text-base font-bold text-rose-500">
              {summary.highRiskVendors}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
            <div className="text-[10px] text-slate-400">Assessment Overdue</div>
            <div className="text-base font-bold text-amber-500">
              {summary.assessmentOverdue}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
            <div className="text-[10px] text-slate-400">Vendor Incidents</div>
            <div className="text-base font-bold text-slate-800 dark:text-white">
              {summary.vendorIncidents}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-right text-xs font-medium text-brand-blue hover:underline cursor-pointer">
        View third-party risk →
      </div>
    </Panel>
  );
}
