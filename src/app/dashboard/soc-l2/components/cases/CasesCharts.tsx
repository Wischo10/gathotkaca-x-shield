import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { L2Alert } from "@/types/soc";
import { Modal } from "@/components/ui/Modal";

export function CasesCharts({ alerts = [] }: { alerts?: L2Alert[] }) {
  const total = alerts.length || 1; // Prevent division by zero

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isSeverityModalOpen, setIsSeverityModalOpen] = useState(false);
  const [isSLAModalOpen, setIsSLAModalOpen] = useState(false);

  const inProgressCount = alerts.filter(a => !a.status || a.status === "New" || a.status === "In Progress").length;
  const closedCount = alerts.filter(a => a.status === "Closed").length;
  const onHoldCount = alerts.filter(a => a.status === "On Hold").length;

  const statusData = [
    { name: "New / In Progress", value: inProgressCount, color: "#f97316" }, // orange-500
    { name: "On Hold", value: onHoldCount, color: "#eab308" }, // yellow-500
    { name: "Closed", value: closedCount, color: "#10b981" }, // emerald-500
  ].filter(d => d.value > 0);

  const critCount = alerts.filter(a => a.severity.toLowerCase() === "critical").length;
  const highCount = alerts.filter(a => a.severity.toLowerCase() === "high").length;
  const medCount = alerts.filter(a => a.severity.toLowerCase() === "medium").length;
  const lowCount = alerts.filter(a => a.severity.toLowerCase() === "low").length;

  const severityData = [
    { name: "Critical", value: critCount, color: "#ef4444" }, // red-500
    { name: "High", value: highCount, color: "#f97316" }, // orange-500
    { name: "Medium", value: medCount, color: "#eab308" }, // yellow-500
    { name: "Low", value: lowCount, color: "#3b82f6" }, // blue-500
  ].filter(d => d.value > 0);

  // Since we don't have SLA data from Wazuh, we mock the distribution based on total length
  const slaData = [
    { name: "Within SLA", value: alerts.length > 0 ? alerts.length : 0, total: alerts.length || 1, color: "bg-emerald-500" },
    { name: "At Risk", value: 0, total: alerts.length || 1, color: "bg-orange-500" },
    { name: "Breach", value: 0, total: alerts.length || 1, color: "bg-red-500" },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 shadow-sm rounded-md text-sm">
          <p className="font-medium text-slate-900 dark:text-white">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Cases by Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-full">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Cases by Status</h3>
          <div className="flex-1 flex items-center justify-between">
            <div className="w-32 h-32 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">{alerts.length}</span>
                <span className="text-[10px] text-slate-500 font-medium">Total</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {statusData.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 w-24">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                    {item.name}
                  </span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white text-right w-6">{item.value}</span>
                  <span className="text-[10px] text-slate-500 w-8 text-right">({Math.round((item.value / total) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 text-right">
            <button onClick={() => setIsStatusModalOpen(true)} className="text-xs font-medium text-brand-blue hover:underline">View full report &rarr;</button>
          </div>
        </div>

        {/* Cases by Severity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-full">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Cases by Severity</h3>
          <div className="flex-1 flex items-center justify-between">
            <div className="w-32 h-32 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">{alerts.length}</span>
                <span className="text-[10px] text-slate-500 font-medium">Total</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {severityData.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 w-16">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                    {item.name}
                  </span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white text-right w-6">{item.value}</span>
                  <span className="text-[10px] text-slate-500 w-8 text-right">({Math.round((item.value / total) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 text-right">
            <button onClick={() => setIsSeverityModalOpen(true)} className="text-xs font-medium text-brand-blue hover:underline">View full report &rarr;</button>
          </div>
        </div>

        {/* SLA Overview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-full">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6">SLA Overview</h3>
          <div className="flex flex-col gap-5 flex-1">
            {slaData.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-20">{item.name}</span>
                <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.value / item.total) * 100}%` }}></div>
                </div>
                <div className="flex items-center gap-1.5 w-16 justify-end">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">{item.value}</span>
                  <span className="text-[10px] text-slate-500">({Math.round((item.value / item.total) * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right">
            <button onClick={() => setIsSLAModalOpen(true)} className="text-xs font-medium text-brand-blue hover:underline">View SLA report &rarr;</button>
          </div>
        </div>
      </div>

      <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="Cases by Status">
        <div className="space-y-4">
          {statusData.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-900 dark:text-white">{item.value} Cases</span>
                <span className="text-sm text-slate-500">{Math.round((item.value / total) * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={isSeverityModalOpen} onClose={() => setIsSeverityModalOpen(false)} title="Cases by Severity">
        <div className="space-y-4">
          {severityData.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-900 dark:text-white">{item.value} Cases</span>
                <span className="text-sm text-slate-500">{Math.round((item.value / total) * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={isSLAModalOpen} onClose={() => setIsSLAModalOpen(false)} title="SLA Overview">
        <div className="space-y-4">
          {slaData.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-900 dark:text-white">{item.value} Cases</span>
                <span className="text-sm text-slate-500">{Math.round((item.value / item.total) * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
