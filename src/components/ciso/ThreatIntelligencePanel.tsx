"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Panel } from "@/components/ui/Panel";

export function ThreatIntelligencePanel() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/ciso/threat-intel")
      .then((res) => res.json())
      .then((res) => {
        if (res.status === "ok") {
          setData(res.data);
        } else {
          setData(null);
        }
      })
      .catch(() => setData(null));
  }, []);

  const maxCount = data ? Math.max(...data.topSources.map((s: any) => s.count), 1) : 1;

  return (
    <Panel title="Threat Intelligence Overview" className="h-[22rem] flex flex-col justify-between">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {!data ? (
          <div className="flex h-full items-center justify-center text-slate-400">Loading live data...</div>
        ) : (
          <>
            {/* Metric Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              {data.metrics.map((item: any) => (
                <div
                  key={item.label}
                  className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">{item.label}</div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{item.value.toLocaleString()}</span>
                    <span className="text-[9px] font-semibold text-amber-500">{item.change}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Threat Sources Horizontal Bars */}
            <div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                Top Reporting Sources (ThreatFox)
              </div>
              <div className="space-y-2">
                {data.topSources.map((item: any) => (
                  <div key={item.source} className="text-xs">
                    <div className="flex justify-between items-center mb-1 text-slate-700 dark:text-slate-300">
                      <span className="truncate pr-2 max-w-[80%]">{item.source}</span>
                      <span className="font-medium text-slate-900 dark:text-white">{item.count.toLocaleString()}</span>
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
          </>
        )}
      </div>

      <div className="mt-3 text-right">
        <Link
          href="/dashboard/ciso/threat-intel"
          className="text-xs font-medium text-brand-blue hover:underline cursor-pointer"
        >
          View threat intelligence →
        </Link>
      </div>
    </Panel>
  );
}
