import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Panel } from "@/components/ui/Panel";
import { CISO_MOCK_RISK_REGISTER } from "@/mock/ciso-dashboard.mock";

export function RiskRegisterPanel() {
  const total = CISO_MOCK_RISK_REGISTER.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Panel title="Risk Register Summary" className="h-full flex flex-col justify-between">
      <div className="flex h-52 items-center">
        <div className="h-full w-1/2 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={CISO_MOCK_RISK_REGISTER}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="count"
                stroke="none"
              >
                {CISO_MOCK_RISK_REGISTER.map((entry) => (
                  <Cell key={entry.severity} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
              {total}
            </span>
            <span className="text-[10px] text-slate-400">Total Risks</span>
          </div>
        </div>

        <div className="w-1/2 flex flex-col gap-2.5 text-xs pl-2">
          {CISO_MOCK_RISK_REGISTER.map((item) => (
            <div key={item.severity} className="flex justify-between items-center pr-2">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.severity}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 text-right">
        <Link
          href="/dashboard/ciso/risk-register"
          className="text-xs font-medium text-brand-blue hover:underline cursor-pointer"
        >
          View risk register →
        </Link>
      </div>
    </Panel>
  );
}
