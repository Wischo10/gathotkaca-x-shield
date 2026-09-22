import { ArrowRight, FileText, ShieldAlert, Activity, FilePieChart, LayoutTemplate, Globe, FileSearch, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

const getIcon = (name: string) => {
  if (name === "FileText") return FileText;
  if (name === "ShieldCheck") return ShieldCheck;
  if (name === "Globe") return Globe;
  if (name === "FileSearch") return FileSearch;
  if (name === "Activity") return Activity;
  if (name === "ShieldAlert") return ShieldAlert;
  if (name === "FilePieChart") return FilePieChart;
  if (name === "LayoutTemplate") return LayoutTemplate;
  return FileText;
};

export function PopularTemplates({ templates = [] }: { templates?: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderList = (data: any[]) => (
    <div className="flex flex-col gap-3 flex-1 overflow-auto">
      {data.length === 0 && <span className="text-xs text-slate-500 text-center py-4">No templates available</span>}
      {data.map((template) => {
        const Icon = getIcon(template.icon);
        return (
          <div key={template.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-md ${template.color || "text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800"}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-slate-900 dark:text-white group-hover:text-brand-blue transition-colors cursor-pointer truncate max-w-[140px]" title={template.name}>
                {template.name}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              {template.usage || template.count || 0} reports
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col h-full xl:col-span-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Popular Report Templates</h2>
        <button onClick={() => setIsModalOpen(true)} className="text-xs text-brand-blue font-medium hover:underline">View All</button>
      </div>
      
      {renderList(templates)}
      
      <div className="flex justify-center mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button onClick={() => setIsModalOpen(true)} className="text-xs text-brand-blue font-medium hover:underline flex items-center gap-1">
          Browse all templates <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="All Report Templates">
        <div className="overflow-auto max-h-[60vh] p-1">
          {renderList(templates)}
        </div>
      </Modal>
    </div>
  );
}
