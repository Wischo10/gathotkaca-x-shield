"use client";

import { useState, useEffect } from "react";
import { Panel } from "@/components/ui/Panel";
import { AiCisoBriefingInsight } from "@/mock/ciso-dashboard.mock";

const TAG_STYLES: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  red: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  orange: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
};

export function AiCisoBriefingPanel() {
  const [insights, setInsights] = useState<AiCisoBriefingInsight[] | null>(null);

  useEffect(() => {
    fetch("/api/ciso/ai-briefing")
      .then((res) => res.json())
      .then((res) => {
        if (res.status === "ok") {
          setInsights(res.data);
        } else {
          setInsights([]);
        }
      })
      .catch(() => setInsights([]));
  }, []);

  return (
    <Panel
      title="AI CISO Briefing"
      action={
        <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1 dark:bg-purple-950 dark:text-purple-400">
          ✨ Powered by AI
        </span>
      }
      className="h-[22rem] flex flex-col justify-between"
    >
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {!insights ? (
          <div className="flex h-full items-center justify-center text-slate-400">
            Generative AI is analyzing...
          </div>
        ) : insights.length === 0 ? (
          <div className="flex h-full items-center justify-center text-slate-400">
            No Insights available.
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    TAG_STYLES[insight.tagColor] || TAG_STYLES.blue
                  }`}
                >
                  {insight.tag}
                </span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {insight.title}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                {insight.description}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 text-right text-xs font-medium text-brand-blue hover:underline cursor-pointer">
        View full AI briefing &rarr;
      </div>
    </Panel>
  );
}
