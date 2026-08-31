"use client";

import { Panel } from "@/components/ui/Panel";
import { CISO_MOCK_AI_BRIEFING } from "@/mock/ciso-dashboard.mock";

const TAG_STYLES: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  red: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  orange: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
};

export function AiCisoBriefingPanel() {
  return (
    <Panel
      title="AI CISO Briefing"
      action={
        <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1 dark:bg-purple-950 dark:text-purple-400">
          ✨ Powered by AI
        </span>
      }
      className="h-full flex flex-col justify-between"
    >
      <div className="space-y-3">
        {CISO_MOCK_AI_BRIEFING.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/40"
          >
            <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {item.title}
                </span>
                <span
                  className={`shrink-0 rounded border px-1.5 py-0.2 text-[9px] font-medium ${
                    TAG_STYLES[item.tagColor] || TAG_STYLES.blue
                  }`}
                >
                  {item.tag}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-right text-xs font-medium text-brand-blue hover:underline cursor-pointer">
        View full AI briefing →
      </div>
    </Panel>
  );
}
