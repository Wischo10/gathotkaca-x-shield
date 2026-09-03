import { Panel } from "@/components/ui/Panel";
import { useState } from "react";

export function IOCs() {
  const [activeTab, setActiveTab] = useState("All");

  const tabs = [
    { name: "All", count: 12 },
    { name: "IP", count: 4 },
    { name: "Domain", count: 3 },
    { name: "Hash", count: 3 },
    { name: "URL", count: 2 },
  ];

  const iocs = [
    { value: "185.220.101.2", type: "IP", reputation: "Malicious", source: "AbuseIPDB" },
    { value: "hxxp://malicious-site[.]com", type: "URL", reputation: "Malicious", source: "Threat Intel" },
    { value: "3f2a6c9e7b4d9a1c0e2f", type: "Hash", reputation: "Malicious", source: "VirusTotal" },
    { value: "203.0.113.55", type: "IP", reputation: "Suspicious", source: "Threat Intel" },
    { value: "login.brute[.]ru", type: "Domain", reputation: "Malicious", source: "AlienVault" },
  ];

  const getReputationBadge = (rep: string) => {
    if (rep === "Malicious") {
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10 border-red-200 dark:border-red-900/50";
    }
    if (rep === "Suspicious") {
      return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10 border-orange-200 dark:border-orange-900/50";
    }
    return "text-slate-600 bg-slate-50 border-slate-200";
  };

  return (
    <Panel 
      title="IOCs (12)" 
      action={<a href="#" className="text-brand-blue font-medium text-xs hover:underline">View All</a>}
      className="h-full flex flex-col"
    >
      <div className="flex border-b border-slate-200 dark:border-slate-800 mt-2 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap border-b-2 ${
              activeTab === tab.name
                ? "border-brand-blue text-brand-blue"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab.name} {tab.count !== undefined && `(${tab.count})`}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-2 px-1 font-medium">IOC Value</th>
              <th className="py-2 px-1 font-medium">Type</th>
              <th className="py-2 px-1 font-medium">Reputation</th>
              <th className="py-2 px-1 font-medium">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {iocs.map((ioc, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="py-2 px-1 font-medium text-slate-900 dark:text-white truncate max-w-[120px]" title={ioc.value}>
                  {ioc.value}
                </td>
                <td className="py-2 px-1 text-slate-500">{ioc.type}</td>
                <td className="py-2 px-1">
                  <span className={`inline-flex px-1.5 py-0.5 rounded-[4px] text-[10px] font-medium border ${getReputationBadge(ioc.reputation)}`}>
                    {ioc.reputation}
                  </span>
                </td>
                <td className="py-2 px-1 text-slate-500">{ioc.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
