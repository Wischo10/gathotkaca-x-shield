import { Panel } from "@/components/ui/Panel";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { AttackMethod, MitreTactic } from "../types";

interface AttackMethodsProps {
  attackMethods: AttackMethod[] | null;
  mitreTactics: MitreTactic[] | null;
  setSelectedFeature: (f: string) => void;
}

export function AttackMethods({ attackMethods, mitreTactics, setSelectedFeature }: AttackMethodsProps) {
  return (
    <>
      <Panel title="Attack Method Distribution">
        <div className="flex h-56 items-center">
          <div className="h-full w-1/2">
            {!attackMethods ? <div className="flex h-full items-center justify-center text-xs text-slate-400">Loading...</div> :
             attackMethods.length === 0 ? <div className="flex h-full items-center justify-center text-xs text-slate-400">No Data</div> :
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={attackMethods} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" stroke="none">
                  {attackMethods.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold fill-slate-800 dark:fill-white">
                  {attackMethods.reduce((a, b) => a + b.value, 0).toLocaleString()}
                </text>
                <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-[10px] fill-slate-500">Total</text>
              </PieChart>
            </ResponsiveContainer>}
          </div>
          <div className="w-1/2 text-xs flex flex-col gap-2">
            {attackMethods && attackMethods.map(s => (
              <div key={s.name} className="flex justify-between items-center pr-2">
                <span className="flex items-center gap-1 w-24 truncate" title={s.name}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor: s.color}}></span> {s.name}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{s.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        <div onClick={() => setSelectedFeature("Attack Method Distribution")} className="mt-2 text-right text-xs text-brand-blue hover:underline cursor-pointer">View attack analytics →</div>
      </Panel>

      <Panel title="MITRE ATT&CK Tactics (Top by Volume)" action={<span className="text-[10px] font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded-full">Last 30d</span>}>
        <div className="flex flex-col gap-2.5 pt-2">
          {!mitreTactics ? (
            <div className="flex h-32 items-center justify-center text-xs text-slate-400">Loading...</div>
          ) : mitreTactics.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-xs text-slate-400">No MITRE data — rule.mitre.tactic not populated</div>
          ) : mitreTactics.map((tactic, i) => {
            const maxVal = mitreTactics[0]?.value ?? 1;
            const pct = Math.round((tactic.value / maxVal) * 100);
            const tacticColors = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#d946ef","#06b6d4"];
            const color = tacticColors[i % tacticColors.length];
            return (
              <div key={tactic.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    {tactic.name}
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{tactic.value.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}
