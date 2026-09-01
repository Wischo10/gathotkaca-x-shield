"use client";

import { useApiResult } from "@/hooks/useApiResult";
import { Panel, PanelLoading, PanelEmpty, PanelError } from "@/components/ui/Panel";
import type { TopAlertingRule } from "@/types/soc";

export function TopRulesPanel() {
  const state = useApiResult<TopAlertingRule[]>("/api/soc/top-rules?range=7d");
  const max =
    state.phase === "ready"
      ? Math.max(...state.data.map((r) => r.count), 1)
      : 1;

  return (
    <Panel title="Top Alerting Rules">
      {state.phase === "loading" && <PanelLoading />}
      {state.phase === "empty" && <PanelEmpty />}
      {state.phase === "error" && (
        <PanelError message={state.message} onRetry={state.reload} />
      )}
      {state.phase === "ready" && (
        <ul className="space-y-2.5">
          {state.data.map((rule) => (
            <li key={rule.ruleName} className="text-sm">
              <div className="mb-1 flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="truncate pr-2">{rule.ruleName}</span>
                <span className="shrink-0 font-medium text-slate-800 dark:text-white">
                  {rule.count}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-1.5 rounded-full bg-brand-blue"
                  style={{ width: `${(rule.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
