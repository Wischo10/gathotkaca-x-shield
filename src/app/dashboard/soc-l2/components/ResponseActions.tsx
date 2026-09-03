import { Panel } from "@/components/ui/Panel";
import { InvestigationCase } from "@/types/soc";
import { Lock, Ban, StopCircle, PlayCircle } from "lucide-react";

interface ResponseActionsProps {
  investigationCase: InvestigationCase | null;
}

export function ResponseActions({ investigationCase }: ResponseActionsProps) {
  if (!investigationCase) {
    return null;
  }

  return (
    <Panel 
      title="Response Actions" 
      action={<a href="#" className="text-brand-blue font-medium text-xs hover:underline">View All Actions</a>}
      className="h-full flex flex-col"
    >
      <div className="flex-1 flex flex-col gap-2 mt-2">
        <div className="grid grid-cols-2 gap-2">
        <button className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-md p-3 text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 shadow-sm">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-1 rounded">
            <Lock className="w-4 h-4 text-orange-500" />
          </div>
          Isolate Asset
        </button>
        <button className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-md p-3 text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 shadow-sm">
          <div className="bg-red-50 dark:bg-red-900/20 p-1 rounded">
            <Ban className="w-4 h-4 text-red-500" />
          </div>
          Block IP
        </button>
        <button className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-md p-3 text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 shadow-sm">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-1 rounded">
            <StopCircle className="w-4 h-4 text-yellow-500" />
          </div>
          Kill Process
        </button>
        </div>
        <button className="w-full mt-1 border border-brand-blue/30 bg-blue-50 dark:bg-brand-blue/10 hover:bg-blue-100 dark:hover:bg-brand-blue/20 transition-colors rounded-lg p-2.5 text-xs font-medium text-brand-blue flex items-center justify-center gap-2 shadow-sm">
          <PlayCircle className="w-4 h-4" />
          Run Playbook
        </button>
      </div>
    </Panel>
  );
}
