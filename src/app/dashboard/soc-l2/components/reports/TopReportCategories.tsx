import { ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

export function TopReportCategories({ categories = [] }: { categories?: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderTable = (data: any[]) => (
    <table className="w-full text-left text-xs">
      <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
        <tr>
          <th className="font-medium pb-2 pr-2">Category</th>
          <th className="font-medium pb-2 px-2 text-center">Reports</th>
          <th className="font-medium pb-2 px-2 text-center">% of Total</th>
          <th className="font-medium pb-2 pl-2 text-right">Trend</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {data.length === 0 && (
          <tr>
            <td colSpan={4} className="py-8 text-center text-xs text-slate-500">No categories data</td>
          </tr>
        )}
        {data.map((item) => (
          <tr key={item.category} className="group">
            <td className="py-2.5 pr-2 text-slate-700 dark:text-slate-300 font-medium">
              {item.category}
            </td>
            <td className="py-2.5 px-2 text-center text-slate-900 dark:text-white font-semibold">
              {item.reports}
            </td>
            <td className="py-2.5 px-2 text-center text-slate-500 dark:text-slate-400">
              {item.percent}%
            </td>
            <td className={`py-2.5 pl-2 text-right font-medium flex justify-end items-center gap-1 ${item.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {item.trendUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {item.trend.replace('+', '').replace('-', '')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col h-full">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Top Report Categories (This Week)</h2>
      
      <div className="flex-1 overflow-auto">
        {renderTable(categories)}
      </div>
      
      <div className="flex justify-end mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button onClick={() => setIsModalOpen(true)} className="text-xs text-brand-blue font-medium hover:underline flex items-center gap-1">
          View all categories <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="All Report Categories">
        <div className="overflow-auto max-h-[60vh]">
          {renderTable(categories)}
        </div>
      </Modal>
    </div>
  );
}
