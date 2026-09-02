import Link from "next/link";
import { Panel } from "@/components/ui/Panel";
import { CISO_MOCK_TOP_RISKS } from "@/mock/ciso-dashboard.mock";

const IMPACT_COLORS: Record<string, string> = {
  Critical: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800",
  High: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
  Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
};

export function TopRisksPanel() {
  return (
    <Panel title="Top Risks" className="h-full flex flex-col justify-between">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 dark:border-slate-800">
              <th className="pb-2 font-medium">Risk / Threat</th>
              <th className="pb-2 font-medium">Impact</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {CISO_MOCK_TOP_RISKS.map((risk) => (
              <tr key={risk.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-2 pr-2">
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    {risk.threat}
                  </div>
                  <div className="text-[10px] text-slate-400">{risk.category}</div>
                </td>
                <td className="py-2 pr-2">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      IMPACT_COLORS[risk.impact] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {risk.impact}
                  </span>
                </td>
                <td className="py-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  {risk.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-right">
        <Link
          href="/dashboard/ciso/all-risks"
          className="text-xs font-medium text-brand-blue hover:underline cursor-pointer"
        >
          View all risks →
        </Link>
      </div>
    </Panel>
  );
}
