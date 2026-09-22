import { Panel } from "@/components/ui/Panel";
import { Incident } from "../types";

interface IncidentsTableProps {
  incidents: Incident[] | null;
  setSelectedFeature: (f: string) => void;
}

export function IncidentsTable({ incidents, setSelectedFeature }: IncidentsTableProps) {
  return (
    <Panel title="Recent Critical Incidents ⓘ" className="lg:col-span-2">
      {!incidents ? (
          <div className="flex h-56 items-center justify-center text-xs text-slate-400">Loading incidents...</div>
      ) : incidents.length === 0 ? (
          <div className="flex h-56 items-center justify-center text-xs text-slate-400">No Critical Incidents</div>
      ) : (
        <div className="overflow-x-auto h-56">
          <table className="w-full text-left text-[11px] text-slate-600 dark:text-slate-400">
            <thead className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500">
              <tr>
                <th className="py-2 font-medium">Time</th>
                <th className="py-2 font-medium">Incident Name</th>
                <th className="py-2 font-medium">Affected Assets</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium">Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50">
                  <td className="py-2.5 whitespace-nowrap">{new Date(inc.creationTime).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">{inc.name}</td>
                  <td className="py-2.5">{inc.endpoint}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] ${
                      inc.status === "Investigating" ? "border-blue-200 text-blue-600 bg-transparent" :
                      inc.status === "In Progress"   ? "border-orange-200 text-orange-500 bg-transparent" :
                      inc.status === "Resolved"      ? "border-emerald-200 text-emerald-500 bg-transparent" :
                      inc.status === "Monitoring"    ? "border-indigo-200 text-indigo-500 bg-transparent" :
                      "border-slate-200 text-slate-500 bg-transparent"
                    }`}>
                      {inc.status}
                    </span>
                  </td>
                  <td className="py-2.5">SOC L2 Team</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div onClick={() => setSelectedFeature("Recent Critical Incidents")} className="mt-3 text-right text-xs text-brand-blue hover:underline cursor-pointer">View all incidents →</div>
    </Panel>
  );
}
