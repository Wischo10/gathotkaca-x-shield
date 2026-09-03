import { Search, Filter, Play, Edit, MoreVertical, Shield, Bug, Mail, Database, Key, Server, Cloud } from "lucide-react";
import { useState } from "react";

const playbooksData = [
  {
    id: 1,
    name: "Brute Force - Account Lockout",
    category: "Authentication",
    categoryColor: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30",
    type: "Response",
    description: "Detect & respond to brute force login attempts and lock suspicious accounts.",
    lastUpdated: "May 18, 2025\n09:15 AM",
    status: "Active",
    usage: 28,
    icon: Shield
  },
  {
    id: 2,
    name: "Malware Detected - Endpoint",
    category: "Malware",
    categoryColor: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30",
    type: "Response",
    description: "Contain and remediate malware detected on endpoints.",
    lastUpdated: "May 17, 2025\n02:45 PM",
    status: "Active",
    usage: 20,
    icon: Bug
  },
  {
    id: 3,
    name: "Phishing Email Reported",
    category: "Phishing",
    categoryColor: "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30",
    type: "Response",
    description: "Analyze reported phishing email and take containment actions.",
    lastUpdated: "May 16, 2025\n11:30 AM",
    status: "Active",
    usage: 18,
    icon: Mail
  },
  {
    id: 4,
    name: "IOC Enrichment & Blocking",
    category: "Threat Intel",
    categoryColor: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/30",
    type: "Response",
    description: "Enrich IOC and block related indicators across security controls.",
    lastUpdated: "May 15, 2025\n04:20 PM",
    status: "Active",
    usage: 34,
    icon: Database
  },
  {
    id: 5,
    name: "Data Exfiltration - Investigation",
    category: "Data Loss",
    categoryColor: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/30",
    type: "Investigation",
    description: "Investigate possible data exfiltration activities and collect evidence.",
    lastUpdated: "May 14, 2025\n10:10 AM",
    status: "Active",
    usage: 12,
    icon: Server
  },
  {
    id: 6,
    name: "Privilege Escalation - Windows",
    category: "Privilege",
    categoryColor: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30",
    type: "Response",
    description: "Detect and respond to privilege escalation attempts on Windows systems.",
    lastUpdated: "May 13, 2025\n03:05 PM",
    status: "Active",
    usage: 16,
    icon: Key
  },
  {
    id: 7,
    name: "Ransomware - Containment",
    category: "Ransomware",
    categoryColor: "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/30",
    type: "Response",
    description: "Isolate affected hosts and contain ransomware spread.",
    lastUpdated: "May 12, 2025\n09:40 AM",
    status: "Active",
    usage: 9,
    icon: Bug
  },
  {
    id: 8,
    name: "Cloud - Suspicious Activity",
    category: "Cloud",
    categoryColor: "text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/30",
    type: "Investigation",
    description: "Investigate suspicious activities in cloud environments.",
    lastUpdated: "May 11, 2025\n01:25 PM",
    status: "Active",
    usage: 15,
    icon: Cloud
  }
];

export function PlaybooksLibrary() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col shadow-sm col-span-1 xl:col-span-2 h-full">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Playbooks Library</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search playbooks..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-sm w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none">
              <option>All Categories</option>
              <option>Authentication</option>
              <option>Malware</option>
            </select>
            <select className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none">
              <option>All Types</option>
              <option>Response</option>
              <option>Investigation</option>
            </select>
            <select className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none">
              <option>All Status</option>
              <option>Active</option>
              <option>Draft</option>
            </select>
            <button className="flex items-center gap-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 sticky top-0">
            <tr>
              <th className="font-medium py-3 px-4">Playbook Name</th>
              <th className="font-medium py-3 px-4">Category</th>
              <th className="font-medium py-3 px-4">Type</th>
              <th className="font-medium py-3 px-4 w-1/4">Description</th>
              <th className="font-medium py-3 px-4">Last Updated</th>
              <th className="font-medium py-3 px-4">Status</th>
              <th className="font-medium py-3 px-4 text-center">Usage (30 Days)</th>
              <th className="font-medium py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {playbooksData.map((pb) => {
              const Icon = pb.icon;
              return (
                <tr key={pb.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="font-medium text-slate-900 dark:text-white whitespace-nowrap">{pb.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${pb.categoryColor}`}>
                      {pb.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{pb.type}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs truncate max-w-[200px]" title={pb.description}>
                    {pb.description}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-xs whitespace-pre-line">
                    {pb.lastUpdated}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                      {pb.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-300">
                    {pb.usage}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors" title="Execute">
                        <Play className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <span>Showing 1 to 8 of 48 playbooks</span>
        <div className="flex items-center gap-1">
          <button className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800">&lt;</button>
          <button className="px-2.5 py-1 bg-brand-blue text-white rounded">1</button>
          <button className="px-2.5 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">2</button>
          <button className="px-2.5 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">3</button>
          <button className="px-2.5 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">4</button>
          <button className="px-2.5 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">5</button>
          <span>...</span>
          <button className="px-2.5 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">8</button>
          <button className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800">&gt;</button>
        </div>
      </div>
    </div>
  );
}
