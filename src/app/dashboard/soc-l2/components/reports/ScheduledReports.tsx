import { ArrowRight, Clock, Activity, ShieldAlert, FilePieChart, FileText } from "lucide-react";

const schedules = [
  { id: 1, name: "Weekly Security Operations Summary", time: "Every Monday 09:00 AM", status: "Active", icon: Activity, color: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/30" },
  { id: 2, name: "Daily Alert Summary", time: "Every Day 08:00 AM", status: "Active", icon: Clock, color: "text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800" },
  { id: 3, name: "Incident Summary Report", time: "Every Monday 08:30 AM", status: "Active", icon: ShieldAlert, color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30" },
  { id: 4, name: "Compliance Report (UU PDP)", time: "Every Sunday 10:00 PM", status: "Active", icon: FilePieChart, color: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30" },
  { id: 5, name: "Threat Intelligence Digest", time: "Every Day 07:30 AM", status: "Active", icon: FileText, color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30" },
];

export function ScheduledReports() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col h-full xl:col-span-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Scheduled Reports</h2>
        <button className="text-xs text-brand-blue font-medium hover:underline">View All</button>
      </div>
      
      <div className="flex flex-col gap-3 flex-1 overflow-auto">
        {schedules.map((schedule) => {
          const Icon = schedule.icon;
          return (
            <div key={schedule.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-md ${schedule.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[140px] group-hover:text-brand-blue transition-colors cursor-pointer" title={schedule.name}>
                    {schedule.name}
                  </span>
                  <span className="text-[10px] text-slate-500">{schedule.time}</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50">
                {schedule.status}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-center mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button className="text-xs text-brand-blue font-medium hover:underline flex items-center gap-1">
          Manage schedules <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
