"use client";

import { Panel } from "@/components/ui/Panel";
import { CISO_MOCK_COMPLIANCE } from "@/mock/ciso-dashboard.mock";

export function ComplianceOverviewPanel() {
  return (
    <Panel title="Compliance Overview" className="h-full flex flex-col justify-between">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 dark:border-slate-800">
              <th className="pb-2 font-medium">Framework</th>
              <th className="pb-2 font-medium">Score</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {CISO_MOCK_COMPLIANCE.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-2.5 pr-2">
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    {item.framework}
                  </div>
                  {item.version && (
                    <div className="text-[10px] text-slate-400">{item.version}</div>
                  )}
                </td>
                <td className="py-2.5 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.score}%
                    </span>
                    <div className="h-1.5 w-12 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-1.5 rounded-full bg-brand-blue"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-2.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      item.status === "Compliant"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-right text-xs font-medium text-brand-blue hover:underline cursor-pointer">
        View compliance dashboard →
      </div>
    </Panel>
  );
}
