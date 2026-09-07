import { Panel } from "@/components/ui/Panel";
import { InvestigationCase } from "@/types/soc";
import { SessionUser } from "@/lib/auth";
import { ShieldAlert, Terminal, FileText, Share2, Activity, Server, Clock, AlertTriangle } from "lucide-react";

interface AlertDetailWorkspaceProps {
  investigationCase: InvestigationCase | null;
  user: SessionUser | null;
}

export function AlertDetailWorkspace({ investigationCase, user }: AlertDetailWorkspaceProps) {
  if (!investigationCase) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-[800px]">
        <div className="flex-1 flex items-center justify-center text-slate-400">
          Select an alert from the queue to view details.
        </div>
      </div>
    );
  }

  const { alert } = investigationCase;
  
  const getSeverityColor = (severity: string) => {
    switch(severity.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-900/50';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-900/50';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-500/10 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50';
      default: return 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-900/50';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm h-auto xl:min-h-[800px]">
      {/* Header */}
      <div className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex-shrink-0">
            <AlertTriangle className={`w-8 h-8 ${alert.severity.toLowerCase() === 'critical' ? 'text-red-500' : 'text-orange-500'}`} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {alert.title}
              </h2>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border capitalize ${getSeverityColor(alert.severity)}`}>
                {alert.severity}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Alert ID: {alert.id} &bull; Source: {alert.source}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors px-3 py-1.5 rounded-md">
            Dismiss Alert
          </button>
          <button className="text-xs font-medium bg-brand-blue text-white px-3 py-1.5 rounded-md hover:bg-brand-blue/90 transition-colors flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" /> Escalate to Investigation
          </button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50 flex-1 grid grid-cols-1 xl:grid-cols-3 gap-4">
        
        {/* Left Column: Basic Details */}
        <div className="xl:col-span-1 flex flex-col gap-4">
          <Panel title="Alert Information" className="h-full">
            <div className="flex flex-col gap-4 text-xs mt-2">
              <div className="grid grid-cols-[100px_1fr] gap-4">
                <span className="text-slate-500">Asset</span>
                <span className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-slate-400" /> {alert.asset}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-4">
                <span className="text-slate-500">Time Detected</span>
                <span className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {new Date(alert.firstSeen).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-4">
                <span className="text-slate-500">Status</span>
                <span className="font-medium text-slate-900 dark:text-white">{alert.status || "New"}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-4">
                <span className="text-slate-500">Description</span>
                <span className="font-medium text-slate-900 dark:text-white">{alert.description || `${alert.title} targeting ${alert.asset}`}</span>
              </div>
              
            </div>
          </Panel>
        </div>
        
        {/* Right Column: Raw Logs / Payload */}
        <div className="xl:col-span-2">
          <Panel title="Raw Log Data (Wazuh Document)" className="h-full">
            <div className="bg-slate-900 rounded-lg p-4 mt-2 overflow-x-auto h-[500px]">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                {JSON.stringify(investigationCase, null, 2)}
              </pre>
            </div>
          </Panel>
        </div>

      </div>
    </div>
  );
}
