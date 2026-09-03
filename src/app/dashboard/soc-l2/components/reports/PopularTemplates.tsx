import { ArrowRight, FileText, ShieldAlert, Activity, FilePieChart, LayoutTemplate } from "lucide-react";

const templates = [
  { id: 1, name: "Security Operations Summary", icon: FileText, color: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/30", count: 24 },
  { id: 2, name: "Incident Summary", icon: ShieldAlert, color: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30", count: 18 },
  { id: 3, name: "Threat Intelligence Report", icon: Activity, color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30", count: 16 },
  { id: 4, name: "Compliance Posture Report", icon: FilePieChart, color: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/30", count: 12 },
  { id: 5, name: "Executive Summary Report", icon: LayoutTemplate, color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30", count: 10 },
];

export function PopularTemplates() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col h-full xl:col-span-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Popular Report Templates</h2>
        <button className="text-xs text-brand-blue font-medium hover:underline">View All</button>
      </div>
      
      <div className="flex flex-col gap-3 flex-1 overflow-auto">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <div key={template.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-md ${template.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium text-slate-900 dark:text-white group-hover:text-brand-blue transition-colors cursor-pointer truncate max-w-[140px]" title={template.name}>
                  {template.name}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                {template.count} reports
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-center mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button className="text-xs text-brand-blue font-medium hover:underline flex items-center gap-1">
          Browse all templates <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
