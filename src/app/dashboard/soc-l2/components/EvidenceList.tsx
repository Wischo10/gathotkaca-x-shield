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
  { id: "ev-1", name: "wazuh-agent-log.json", type: "Log File", source: "Wazuh Indexer", addedAt: "10:45:12 AM", addedBy: "System" },
  { id: "ev-2", name: "malicious_payload.bin", type: "Binary", source: "Suricata", addedAt: "10:48:30 AM", addedBy: "Fandi Junerry" },
  { id: "ev-3", name: "process_dump.txt", type: "Text", source: "Sysmon", addedAt: "11:05:00 AM", addedBy: "Fandi Junerry" },
];

export function EvidenceList() {
  const getIcon = (type: string) => {
    if (type === "Screenshot") return <ImageIcon className="w-4 h-4 text-slate-400" />;
    return <FileText className="w-4 h-4 text-slate-400" />;
  };

  return (
    <Panel 
      title={`Evidence (${MOCK_EVIDENCE.length})`} 
      action={<a href="#" className="text-brand-blue font-medium text-xs hover:underline">View All</a>}
      className="flex flex-col"
    >
      <div className="overflow-x-auto mt-2">
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
            {MOCK_EVIDENCE.length === 0 ? (
              <tr><td colSpan={6} className="py-4 text-center text-slate-500">No evidence attached yet.</td></tr>
            ) : MOCK_EVIDENCE.map(item => (
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
