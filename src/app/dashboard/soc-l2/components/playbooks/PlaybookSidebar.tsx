import { Shield, Bug, Mail, Database, Server } from "lucide-react";

const popularPlaybooks = [
  { id: 1, name: "Brute Force - Account Lockout", category: "Authentication", icon: Shield, executions: 28, trend: "+25%" },
  { id: 2, name: "IOC Enrichment & Blocking", category: "Threat Intel", icon: Database, executions: 24, trend: "+41%" },
  { id: 3, name: "Malware Detected - Endpoint", category: "Malware", icon: Bug, executions: 20, trend: "+18%" },
  { id: 4, name: "Phishing Email Reported", category: "Phishing", icon: Mail, executions: 18, trend: "+12%" },
  { id: 5, name: "Data Exfiltration - Investigation", category: "Data Loss", icon: Server, executions: 12, trend: "-5%" },
];

const recentExecutions = [
  { id: 1, playbook: "Brute Force - Account Lockout", status: "Success", time: "May 19, 10:22 AM", user: "Fandi Juncrry", duration: "2m 18s" },
  { id: 2, playbook: "Malware Detected - Endpoint", status: "Success", time: "May 19, 09:58 AM", user: "Rizky Pratama", duration: "4m 32s" },
  { id: 3, playbook: "Phishing Email Reported", status: "Success", time: "May 19, 09:41 AM", user: "Siti Aisyah", duration: "1m 45s" },
  { id: 4, playbook: "IOC Enrichment & Blocking", status: "Failed", time: "May 19, 09:30 AM", user: "Andi Wijaya", duration: "3m 12s" },
  { id: 5, playbook: "Data Exfiltration - Investigation", status: "Success", time: "May 19, 09:15 AM", user: "Dewi Lestari", duration: "6m 05s" },
];

export function PlaybookSidebar() {
  return (
    <div className="flex flex-col gap-4 col-span-1 h-full">
      {/* Popular Playbooks */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Popular Playbooks (This Week)</h2>
          <button className="text-xs text-brand-blue font-medium hover:underline">View All</button>
        </div>
        <div className="flex flex-col gap-3">
          {popularPlaybooks.map((pb, idx) => {
            const Icon = pb.icon;
            const isTrendUp = pb.trend.startsWith('+');
            return (
              <div key={pb.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-medium w-3">{idx + 1}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700`}>
                    <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-brand-blue transition-colors cursor-pointer truncate max-w-[150px]">{pb.name}</span>
                    <span className="text-[10px] text-slate-500">{pb.category}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-500">Executions</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{pb.executions}</span>
                    <span className={`text-[10px] font-medium ${isTrendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {pb.trend}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Executions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Executions</h2>
          <button className="text-xs text-brand-blue font-medium hover:underline">View All</button>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 dark:text-slate-400">
              <tr>
                <th className="font-medium pb-2 pr-2">Playbook</th>
                <th className="font-medium pb-2 px-2 text-center">Status</th>
                <th className="font-medium pb-2 px-2">Started At</th>
                <th className="font-medium pb-2 px-2">Executed By</th>
                <th className="font-medium pb-2 pl-2 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentExecutions.map((exec) => (
                <tr key={exec.id}>
                  <td className="py-2 pr-2 text-slate-900 dark:text-slate-200 font-medium truncate max-w-[100px]" title={exec.playbook}>
                    {exec.playbook}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium border ${
                      exec.status === "Success" 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50" 
                        : "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50"
                    }`}>
                      {exec.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-slate-500 dark:text-slate-400 whitespace-nowrap">{exec.time}</td>
                  <td className="py-2 px-2 text-slate-600 dark:text-slate-300">{exec.user}</td>
                  <td className="py-2 pl-2 text-right text-slate-500 dark:text-slate-400">{exec.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
