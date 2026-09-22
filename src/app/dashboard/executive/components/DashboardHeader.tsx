import { RefreshCw, Download } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { RangeValue } from "../types";

const RANGE_OPTIONS = [
  { label: "Today",       value: "24h" },
  { label: "Last 7 Days", value: "7d"  },
  { label: "Last 30 Days",value: "30d" },
] as const;

interface DashboardHeaderProps {
  globalRange: RangeValue;
  setGlobalRange: (v: RangeValue) => void;
  openSidebar: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  lastRefreshed: Date;
}

export function DashboardHeader({
  globalRange,
  setGlobalRange,
  openSidebar,
  isRefreshing,
  onRefresh,
  lastRefreshed
}: DashboardHeaderProps) {
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <Topbar
      title="Executive Dashboard"
      subtitle="Strategic overview of cybersecurity posture, threats, and performance"
      onMenuClick={openSidebar}
      action={
        <div className="flex items-center gap-2">
          <select
            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-600 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400"
            value={globalRange}
            onChange={(e) => setGlobalRange(e.target.value as RangeValue)}
          >
            {RANGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Refresh all data now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {lastRefreshed.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 text-xs bg-brand-blue text-white rounded-md px-3 py-1.5 hover:bg-brand-blue/90 transition-colors"
            title="Export dashboard as PDF"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      }
    />
  );
}
