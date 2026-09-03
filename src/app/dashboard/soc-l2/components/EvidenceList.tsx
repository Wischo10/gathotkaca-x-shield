import { Panel } from "@/components/ui/Panel";
import { Download, FileText, Image as ImageIcon } from "lucide-react";

interface Evidence {
  id: string;
  name: string;
  type: string;
  source: string;
  addedAt: string;
  addedBy: string;
}

const MOCK_EVIDENCE: Evidence[] = [
  { id: "1", name: "waf-01-20250519.log", type: "Log File", source: "WAF-01", addedAt: "10:32:22 AM", addedBy: "Fandi Junerry" },
  { id: "2", name: "vpn-gateway.log", type: "Log File", source: "VPN-GW-01", addedAt: "10:32:25 AM", addedBy: "Fandi Junerry" },
  { id: "3", name: "firewall-block.log", type: "Log File", source: "Firewall", addedAt: "10:32:27 AM", addedBy: "Fandi Junerry" },
  { id: "4", name: "failed-login-screenshot.png", type: "Screenshot", source: "WAF-01", addedAt: "10:32:30 AM", addedBy: "Fandi Junerry" },
  { id: "5", name: "brute-force-summary.txt", type: "Report", source: "SIEM-01", addedAt: "10:32:35 AM", addedBy: "Fandi Junerry" },
];

export function EvidenceList() {
  const getIcon = (type: string) => {
    if (type === "Screenshot") return <ImageIcon className="w-4 h-4 text-slate-400" />;
    return <FileText className="w-4 h-4 text-slate-400" />;
  };

  return (
    <Panel 
      title="Evidence (5)" 
      action={<a href="#" className="text-brand-blue font-medium text-xs hover:underline">View All</a>}
      className="h-full flex flex-col"
    >
      <div className="flex-1 overflow-auto mt-2">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-2 px-1 font-medium">Evidence Name</th>
              <th className="py-2 px-1 font-medium">Type</th>
              <th className="py-2 px-1 font-medium">Source</th>
              <th className="py-2 px-1 font-medium">Collected At</th>
              <th className="py-2 px-1 font-medium">Collected By</th>
              <th className="py-2 px-1"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {MOCK_EVIDENCE.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2.5 px-1 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                  {item.name}
                </td>
                <td className="py-2.5 px-1 text-slate-500 dark:text-slate-400">{item.type}</td>
                <td className="py-2.5 px-1 text-slate-500 dark:text-slate-400">{item.source}</td>
                <td className="py-2.5 px-1 text-slate-500 dark:text-slate-400">May 19, 2025 {item.addedAt}</td>
                <td className="py-2.5 px-1 text-slate-500 dark:text-slate-400">{item.addedBy}</td>
                <td className="py-2.5 px-1 text-right">
                  <button className="text-brand-blue hover:text-brand-blue/80 p-1" title="Download">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
