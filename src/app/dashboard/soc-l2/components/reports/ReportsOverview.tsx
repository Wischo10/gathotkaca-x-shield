import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

export function ReportsOverview({ overview = [] }: { overview?: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const total = overview.reduce((acc, curr) => acc + curr.value, 0);

  const renderList = (data: any[]) => (
    <div className="flex flex-col gap-3 flex-1 w-full">
      {data.length === 0 && <span className="text-xs text-slate-500 text-center">No data</span>}
      {data.map((item) => (
        <div key={item.name} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px] sm:max-w-none">{item.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-900 dark:text-white">{item.value}</span>
            <span className="text-[10px] text-slate-500 w-8 text-right">({total > 0 ? Math.round(item.value / total * 100) : 0}%)</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col h-full">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Reports Overview (This Week)</h2>
      
      <div className="flex flex-col md:flex-row items-center gap-6 flex-1">
        <div className="w-40 h-40 relative flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={overview}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {overview.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{total || 0}</span>
            <span className="text-[10px] text-slate-500">Total Reports</span>
          </div>
        </div>
        
        {renderList(overview)}
      </div>
      
      <div className="flex justify-end mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button onClick={() => setIsModalOpen(true)} className="text-xs text-brand-blue font-medium hover:underline flex items-center gap-1">
          View full breakdown <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Reports Breakdown">
        <div className="overflow-auto max-h-[60vh] p-1">
          {renderList(overview)}
        </div>
      </Modal>
    </div>
  );
}
