import { Panel } from "@/components/ui/Panel";
import { InvestigationCase } from "@/types/soc";
import { SessionUser } from "@/lib/auth";
import { useState, useEffect } from "react";
import { ShieldAlert, Terminal, FileText, Share2, Activity, Server, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface AlertDetailWorkspaceProps {
  investigationCase: InvestigationCase | null;
  user: SessionUser | null;
}

export function AlertDetailWorkspace({ investigationCase, user }: AlertDetailWorkspaceProps) {
  const [isEscalating, setIsEscalating] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);

  // BUG FIX: Reset escalation state whenever the user selects a different alert
  // Without this, the "Escalated" green button stays even after switching to a new alert
  const alertId = investigationCase?.alert?.id;
  useEffect(() => {
    setIsEscalated(false);
    setIsEscalating(false);
  }, [alertId]);

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

  const handleEscalate = async () => {
    setIsEscalating(true);
    try {
      const res = await fetch("/api/soc/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alert_id: alert.id,
          title: alert.title,
          severity: alert.severity.toLowerCase(),
          assigned_to: user?.email || "Analyst"
        })
      });
      if (res.ok) {
        setIsEscalated(true);
      } else {
        const errData = await res.json().catch(() => ({}));
        window.alert(`Gagal mengekskalasi tiket! Pesan error: ${errData.message || 'Internal Server Error'}\n\nApakah Anda sudah membuat tabel soc_cases di Supabase?`);
        console.error("Failed to escalate", errData);
      }
    } catch (error) {
      window.alert("Terjadi kesalahan jaringan saat mengekskalasi.");
      console.error(error);
    } finally {
      setIsEscalating(false);
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
          <button onClick={() => window.alert("Alert telah diabaikan (Dismiss).")} className="text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors px-3 py-1.5 rounded-md">
            Dismiss Alert
          </button>
          <button 
            onClick={handleEscalate}
            disabled={isEscalating || isEscalated}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              isEscalated 
                ? "bg-green-600 text-white cursor-default" 
                : "bg-brand-blue text-white hover:bg-brand-blue/90"
            }`}
          >
            {isEscalated ? (
              <><CheckCircle2 className="w-3.5 h-3.5" /> Escalated to Ticket</>
            ) : isEscalating ? (
              <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Escalating...</>
            ) : (
              <><Share2 className="w-3.5 h-3.5" /> Escalate to Investigation</>
            )}
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
