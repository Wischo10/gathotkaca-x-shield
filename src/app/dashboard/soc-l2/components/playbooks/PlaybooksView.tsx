import { PlaybookKPIs } from "./PlaybookKPIs";
import { PlaybooksLibrary } from "./PlaybooksLibrary";
import { PlaybookSidebar } from "./PlaybookSidebar";
import { PlaybookMonitor } from "./PlaybookMonitor";
import { PlaybookTypes } from "./PlaybookTypes";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export function PlaybooksView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/soc/playbooks")
      .then(res => res.json())
      .then(res => {
        if (res.status === "ok") {
          setData(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue mb-4" />
        <p className="text-slate-500 text-sm">Loading playbook data from Wazuh...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 min-h-[calc(100vh-200px)]">
      {/* Top Row: KPIs */}
      <PlaybookKPIs kpiData={data?.kpis} />

      {/* Middle Row: Library & Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-[400px]">
        <PlaybooksLibrary playbooks={data?.library || []} />
        <PlaybookSidebar popular={data?.popular || []} recent={data?.recent || []} />
      </div>

      {/* Bottom Row: Monitor & Types */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <PlaybookMonitor />
        <PlaybookTypes />
      </div>
    </div>
  );
}
