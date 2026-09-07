import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { Server, ShieldAlert, User, Network } from "lucide-react";
import { RelatedEntity } from "@/types/soc";

export function RelatedEntities({ entities }: { entities?: RelatedEntity[] }) {
  const [activeTab, setActiveTab] = useState<string>("Assets");

  const safeEntities = entities || [];
  
  const assets = safeEntities.filter(e => e.type === "Asset" || e.type === "Server" || e.type === "Network Device" || e.type === "Web Application Firewall");
  const users = safeEntities.filter(e => e.type === "User" || e.type === "Domain Admin" || e.type === "Local Admin");
  const ips = safeEntities.filter(e => e.type === "IP" || e.type === "External IP" || e.type === "Internal IP");

  const tabs = [
    { name: "Assets", count: assets.length }, 
    { name: "Users", count: users.length }, 
    { name: "IPs", count: ips.length }
  ];

  const getCriticalityBadge = (criticality: string) => {
    switch (criticality) {
      case "Critical": return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10 border border-red-200 dark:border-red-900/50";
      case "High": return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-900/50";
      case "Medium": return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-900/50";
      case "Low": return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-900/50";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getIcon = (type: string) => {
     if (type === "User" || type === "Domain Admin" || type === "Local Admin") return User;
     if (type === "IP" || type === "External IP" || type === "Internal IP" || type === "Network Device") return Network;
     if (type === "Web Application Firewall") return ShieldAlert;
     return Server;
  }

  const activeList = activeTab === "Assets" ? assets : activeTab === "Users" ? users : ips;

  return (
    <Panel 
      title={`Related Entities (${safeEntities.length})`} 
      action={<a href="#" className="text-brand-blue font-medium text-xs hover:underline">View All</a>}
      className="h-full flex flex-col"
    >
      <div className="flex border-b border-slate-200 dark:border-slate-800 mt-2 mb-4">
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
            {tab.name} ({tab.count})
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-2 pr-2">
        {activeList.map(entity => {
          const Icon = getIcon(entity.type);
          return (
            <div key={entity.id} className="flex items-center justify-between group p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 flex-shrink-0 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-colors">
                  <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{entity.value}</p>
                  <p className="text-[10px] text-slate-500">{entity.type}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${getCriticalityBadge("High")}`}>
                High
              </span>
            </div>
          );
        })}
        {activeList.length === 0 && (
          <div className="text-center text-slate-400 dark:text-slate-500 text-xs py-4">
            No {activeTab.toLowerCase()} found.
          </div>
        )}
      </div>
    </Panel>
  );
}
