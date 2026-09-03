import { Panel } from "@/components/ui/Panel";
import { InvestigationCase } from "@/types/soc";
import { SessionUser } from "@/lib/auth";
import { Clock, Circle, Edit2, Plus } from "lucide-react";

interface CaseSummaryProps {
  investigationCase: InvestigationCase | null;
  user: SessionUser | null;
}

export function CaseSummary({ investigationCase, user }: CaseSummaryProps) {
  if (!investigationCase) {
    return null;
  }

  const { alert } = investigationCase;

  return (
    <Panel 
      title="Investigation Details" 
      action={<button className="p-1 text-slate-400 hover:text-slate-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>}
      className="h-full flex flex-col"
    >
      <div className="flex flex-col gap-4 text-xs text-slate-700 dark:text-slate-300 mt-2">
        
        <div className="grid grid-cols-[100px_1fr] gap-4 items-start">
          <span className="text-slate-500 mt-0.5">Status</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {alert.status || "In Progress"}
          </span>
        </div>

        <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
          <span className="text-slate-500">Severity</span>
          <div>
            <span className="text-red-700 dark:text-red-400 font-medium flex items-center gap-1.5">
              <Circle className="w-2 h-2 fill-red-500 text-red-500" />
              <span className="capitalize">{alert.severity}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
          <span className="text-slate-500">Priority</span>
          <div>
            <span className="text-red-700 dark:text-red-400 font-medium">
              P1 - Highest
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[100px_1fr] gap-4">
          <span className="text-slate-500">Assigned To</span>
          <span className="font-medium text-slate-900 dark:text-white">{user?.fullName || alert.assignee || 'Fandi Junerry'} (SOC Analyst)</span>
        </div>

        <div className="grid grid-cols-[100px_1fr] gap-4">
          <span className="text-slate-500">Created</span>
          <span className="font-medium text-slate-900 dark:text-white">May 19, 2025 10:31:45 AM</span>
        </div>

        <div className="grid grid-cols-[100px_1fr] gap-4">
          <span className="text-slate-500">Last Update</span>
          <span className="font-medium text-slate-900 dark:text-white">May 19, 2025 10:55:12 AM</span>
        </div>

        <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
          <span className="text-slate-500">SLA</span>
          <span className="font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-red-500" /> 
            <span className="text-red-600 dark:text-red-400">00:42:30</span> 
            <span className="text-slate-400 font-normal">/ 01:00:00</span>
          </span>
        </div>
        
        <div className="grid grid-cols-[100px_1fr] gap-4">
          <span className="text-slate-500">MITRE ATT&CK</span>
          <a href="#" className="font-medium text-slate-900 dark:text-white hover:text-brand-blue hover:underline">T1110 - Brute Force</a>
        </div>
        
        <div className="grid grid-cols-[100px_1fr] gap-4">
          <span className="text-slate-500 mt-1">Tags</span>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded">Authentication</span>
            <span className="text-[10px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded">Brute Force</span>
            <span className="text-[10px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded">VPN</span>
            <button className="text-[10px] font-medium text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 border-dashed inline-flex items-center">
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </Panel>
  );
}
