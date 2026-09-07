import { Panel } from "@/components/ui/Panel";
import { useState } from "react";
import { IoC } from "@/types/soc";

export function IOCs({ iocs }: { iocs?: IoC[] }) {
  const [activeTab, setActiveTab] = useState("All");

  const safeIocs = iocs || [];

  const ips = safeIocs.filter(i => i.type === "IP");
  const domains = safeIocs.filter(i => i.type === "Domain");
  const hashes = safeIocs.filter(i => i.type === "Hash");
  const urls = safeIocs.filter(i => i.type === "URL");

  const tabs = [
    { name: "All", count: safeIocs.length },
    { name: "IP", count: ips.length },
    { name: "Domain", count: domains.length },
    { name: "Hash", count: hashes.length },
    { name: "URL", count: urls.length },
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
  
  const getReputationFromConfidence = (conf: number) => {
    if (conf >= 80) return "Malicious";
    if (conf >= 50) return "Suspicious";
    return "Unknown";
  }

  const activeList = activeTab === "All" ? safeIocs : activeTab === "IP" ? ips : activeTab === "Domain" ? domains : activeTab === "Hash" ? hashes : urls;

  return (
    <Panel 
      title={`IOCs (${safeIocs.length})`} 
      action={<a href="#" className="text-brand-blue font-medium text-xs hover:underline">View All</a>}
      className="h-full flex flex-col"
    >
      <div className="flex border-b border-slate-200 dark:border-slate-800 mt-2 mb-3 overflow-x-auto">
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
            {activeList.map((ioc, i) => {
              const rep = getReputationFromConfidence(ioc.confidence);
              return (
              <tr key={ioc.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="py-2 px-1 font-medium text-slate-900 dark:text-white truncate max-w-[120px]" title={ioc.value}>
                  {ioc.value}
                </td>
                <td className="py-2 px-1 text-slate-500">{ioc.type}</td>
                <td className="py-2 px-1">
                  <span className={`inline-flex px-1.5 py-0.5 rounded-[4px] text-[10px] font-medium border ${getReputationBadge(rep)}`}>
                    {rep}
                  </span>
                </td>
                <td className="py-2 px-1 text-slate-500">Wazuh</td>
              </tr>
            )})}
            {activeList.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-slate-400 dark:text-slate-500 text-xs py-4">
                  No {activeTab.toLowerCase()} IOCs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
