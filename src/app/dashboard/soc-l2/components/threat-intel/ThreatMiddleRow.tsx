import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ExternalLink, ArrowRight } from "lucide-react";

export function ThreatMiddleRow() {
  const iocData = [
    { name: "IP Address", value: 1024, color: "#ef4444" }, // red
    { name: "Domain", value: 876, color: "#f97316" }, // orange
    { name: "URL", value: 512, color: "#eab308" }, // yellow
    { name: "Hash", value: 268, color: "#10b981" }, // emerald
    { name: "Email", value: 163, color: "#8b5cf6" }, // purple
  ];

  const totalIocs = 2843;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 shadow-sm rounded-md text-sm">
          <p className="font-medium text-slate-900 dark:text-white">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const indicators = [
    { indicator: "185.220.101.2", type: "IP", reputation: "Malicious", firstSeen: "May 19, 10:30 AM", source: "AbuseIPDB" },
    { indicator: "bad-update[.]com", type: "Domain", reputation: "Malicious", firstSeen: "May 19, 09:15 AM", source: "Threat Intel" },
    { indicator: "hxxp://malicious-site[.]ru", type: "URL", reputation: "Malicious", firstSeen: "May 19, 08:42 AM", source: "VirusTotal" },
    { indicator: "3f2a6c9e7bd49a1c0e2f...", type: "Hash", reputation: "Malicious", firstSeen: "May 19, 07:51 AM", source: "VirusTotal" },
    { indicator: "203.0.113.55", type: "IP", reputation: "Suspicious", firstSeen: "May 19, 07:20 AM", source: "AlienVault" },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      
      {/* Global Threat Landscape */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-[320px]">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
          Global Threat Landscape <span className="text-slate-400 font-normal text-xs">&#9432;</span>
        </h3>
        <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 mb-4">
          <button className="text-xs font-semibold text-brand-blue border-b-2 border-brand-blue pb-2">Attack Origin (Last 7 Days)</button>
          <button className="text-xs font-medium text-slate-500 hover:text-slate-700 pb-2">Targeted Attacks</button>
        </div>
        <div className="flex-1 relative flex items-center justify-center bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
          {/* Simple Map Placeholder */}
          <div className="absolute left-2 bottom-2 bg-white/80 dark:bg-slate-900/80 p-2 rounded text-[10px] flex flex-col gap-1 backdrop-blur-sm">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-red-600 rounded-sm"></span> Very High</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-orange-500 rounded-sm"></span> High</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-yellow-500 rounded-sm"></span> Medium</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-yellow-300 rounded-sm"></span> Low</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-slate-200 rounded-sm"></span> Very Low</div>
          </div>
          <svg viewBox="0 0 800 400" className="w-full h-full opacity-60 dark:opacity-40">
            <path d="M150,100 Q180,90 200,120 T250,150 T200,250 T120,200 Z" fill="#cbd5e1" />
            <path d="M400,50 Q450,20 500,80 T600,150 T550,250 T450,280 T380,200 Z" fill="#cbd5e1" />
            <path d="M650,120 Q700,90 750,130 T700,200 T620,160 Z" fill="#cbd5e1" />
            {/* Highlights */}
            <circle cx="200" cy="150" r="15" fill="#ef4444" opacity="0.8" />
            <circle cx="500" cy="120" r="25" fill="#f97316" opacity="0.8" />
            <circle cx="550" cy="200" r="10" fill="#eab308" opacity="0.8" />
            <circle cx="150" cy="180" r="8" fill="#eab308" opacity="0.8" />
            <circle cx="450" cy="80" r="12" fill="#fde047" opacity="0.8" />
          </svg>
        </div>
        <div className="mt-3">
          <button className="text-xs font-medium text-brand-blue flex items-center gap-1 hover:underline">
            View full map <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* IOC Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-[320px]">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-6">
          IOC Summary (This Week) <span className="text-slate-400 font-normal text-xs">&#9432;</span>
        </h3>
        <div className="flex-1 flex items-center justify-between px-2">
          <div className="w-40 h-40 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={iocData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {iocData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">2,843</span>
              <span className="text-xs text-slate-500 font-medium mt-1">Total IOCs</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {iocData.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 w-20">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white text-right w-10">{item.value.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 w-8 text-right">({Math.round((item.value / totalIocs) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 text-right">
          <button className="text-xs font-medium text-brand-blue flex items-center gap-1 ml-auto hover:underline">
            View all IOCs <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Top Malicious Indicators */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-[320px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Top Malicious Indicators</h3>
          <a href="#" className="text-xs font-medium text-brand-blue hover:underline">View All</a>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/50">
              <tr>
                <th className="py-2.5 font-medium">Indicator</th>
                <th className="py-2.5 font-medium">Type</th>
                <th className="py-2.5 font-medium">Reputation</th>
                <th className="py-2.5 font-medium">First Seen</th>
                <th className="py-2.5 font-medium">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
              {indicators.map((ind, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pr-2 font-semibold text-slate-900 dark:text-white truncate max-w-[120px]" title={ind.indicator}>{ind.indicator}</td>
                  <td className="py-3 pr-2 text-slate-500">{ind.type}</td>
                  <td className="py-3 pr-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${ind.reputation === 'Malicious' ? 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-900/50' : 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-900/50'}`}>
                      {ind.reputation}
                    </span>
                  </td>
                  <td className="py-3 pr-2 text-slate-500 whitespace-nowrap">{ind.firstSeen}</td>
                  <td className="py-3 text-slate-500 truncate max-w-[80px]">{ind.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-right">
          <button className="text-xs font-medium text-brand-blue flex items-center gap-1 ml-auto hover:underline">
            View all indicators <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

    </div>
  );
}
