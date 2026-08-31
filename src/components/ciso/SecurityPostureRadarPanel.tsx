"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Panel } from "@/components/ui/Panel";
import { CISO_MOCK_POSTURE_DOMAINS } from "@/mock/ciso-dashboard.mock";

export function SecurityPostureRadarPanel() {
  return (
    <Panel
      title="Security Posture Overview"
      action={
        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          NIST CSF 2.0
        </span>
      }
      className="flex flex-col justify-between"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
        {/* Radar Chart */}
        <div className="h-56 md:col-span-7">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={CISO_MOCK_POSTURE_DOMAINS}>
              <PolarGrid stroke="#cbd5e1" strokeOpacity={0.4} />
              <PolarAngleAxis
                dataKey="domain"
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" tick={false} axisLine={false} />
              <Radar
                name="Posture Score"
                dataKey="score"
                stroke="#2563EB"
                fill="#3B82F6"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown table & score list */}
        <div className="md:col-span-5 space-y-1.5 text-xs">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400">
            <span>Domain</span>
            <span>Score / Trend</span>
          </div>
          {CISO_MOCK_POSTURE_DOMAINS.map((item) => (
            <div
              key={item.domain}
              className="flex items-center justify-between py-1 text-slate-700 dark:text-slate-300"
            >
              <span className="font-medium">{item.domain}</span>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {item.score}
                </span>
                <span
                  className={`text-[10px] font-medium ${
                    item.isUp ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {item.isUp ? "↑" : "↓"} {item.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 text-right text-xs font-medium text-brand-blue hover:underline cursor-pointer">
        View full security posture →
      </div>
    </Panel>
  );
}
