import { ArrowRight, Clock, Activity, ShieldAlert, FilePieChart, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";

export function ScheduledReports({ scheduled = [] }: { scheduled?: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dbSchedules, setDbSchedules] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/soc/reports-config")
      .then(res => res.json())
      .then(res => {
        if (res.status === "ok" && res.data) {
          const mapped = res.data.map((item: any) => ({
            id: item.id,
            name: item.title,
            schedule: item.schedule_cron,
            status: item.status,
            icon: FileText
          }));
          setDbSchedules(mapped);
        }
      })
      .catch(console.error);
  }, []);

  const renderList = (data: any[]) => (
    <div className="flex flex-col gap-3 flex-1 overflow-auto">
      {data.length === 0 && (
        <span className="text-xs text-slate-500 text-center py-4">No scheduled reports</span>
      )}
      {data.map((schedule) => {
        const Icon = schedule.icon || FileText;
        return (
          <div key={schedule.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-md ${schedule.color || "text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800"}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[140px] group-hover:text-brand-blue transition-colors cursor-pointer" title={schedule.name}>
                  {schedule.name}
                </span>
                <span className="text-[10px] text-slate-500">{schedule.schedule || schedule.time}</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50">
              {schedule.status}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col h-full xl:col-span-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Scheduled Reports</h2>
        <button onClick={() => setIsModalOpen(true)} className="text-xs text-brand-blue font-medium hover:underline">View All</button>
      </div>
      
      {renderList(dbSchedules.length > 0 ? dbSchedules : scheduled)}
      
      <div className="flex justify-center mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button onClick={() => setIsModalOpen(true)} className="text-xs text-brand-blue font-medium hover:underline flex items-center gap-1">
          Manage schedules <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="All Scheduled Reports">
        <div className="overflow-auto max-h-[60vh] p-1">
          {renderList(dbSchedules.length > 0 ? dbSchedules : scheduled)}
        </div>
      </Modal>
    </div>
  );
}
