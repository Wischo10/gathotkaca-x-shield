import { Search, Filter, Play, Edit, MoreVertical, Shield, Bug, Mail, Database, Key, Server, Cloud, ListFilter, LayoutGrid, Clock, Star, ArrowRight, BookOpen, AlertTriangle, PlayCircle, Edit2, Trash2 } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { useState } from "react";

export function PlaybooksLibrary({ playbooks = [] }: { playbooks?: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredPlaybooks = playbooks.filter(pb => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return pb.name.toLowerCase().includes(q) || pb.description?.toLowerCase().includes(q) || pb.type?.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filteredPlaybooks.length / itemsPerPage));
  const validPage = Math.min(currentPage, totalPages);
  const displayedPlaybooks = filteredPlaybooks.slice((validPage - 1) * itemsPerPage, validPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col shadow-sm col-span-1 xl:col-span-2 h-full">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Playbooks Library</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search playbooks..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-1.5 text-sm w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none">
              <option>All Categories</option>
              <option>Authentication</option>
              <option>Malware</option>
            </select>
            <select className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none">
              <option>All Types</option>
              <option>Response</option>
              <option>Investigation</option>
            </select>
            <select className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none">
              <option>All Status</option>
              <option>Active</option>
              <option>Draft</option>
            </select>
            <button onClick={() => window.alert("Opening Filter menu...")} className="flex items-center gap-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 sticky top-0">
            <tr>
              <th className="font-medium py-3 px-4">Playbook Name</th>
              <th className="font-medium py-3 px-4">Category</th>
              <th className="font-medium py-3 px-4">Type</th>
              <th className="font-medium py-3 px-4 w-1/4">Description</th>
              <th className="font-medium py-3 px-4">Last Updated</th>
              <th className="font-medium py-3 px-4">Status</th>
              <th className="font-medium py-3 px-4 text-center">Usage (30 Days)</th>
              <th className="font-medium py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {displayedPlaybooks.length === 0 ? (
              <tr><td colSpan={8} className="py-8 text-center text-slate-500">No playbooks found.</td></tr>
            ) : displayedPlaybooks.map((pb) => {
              const Icon = Shield; // Fallback to Shield since it's dynamic
              return (
                <tr key={pb.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="font-medium text-slate-900 dark:text-white whitespace-nowrap">{pb.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${pb.categoryColor}`}>
                      {pb.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{pb.type}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs truncate max-w-[200px]" title={pb.description}>
                    {pb.description}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-xs whitespace-pre-line">
                    {pb.lastUpdated}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                      {pb.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-300">
                    {pb.usage}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => window.alert("Executing playbook...")} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors" title="Execute">
                        <PlayCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => window.alert("Opening playbook editor...")} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => window.alert("Deleting playbook...")} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing {filteredPlaybooks.length > 0 ? (validPage - 1) * itemsPerPage + 1 : 0} to {Math.min(validPage * itemsPerPage, filteredPlaybooks.length)} of {filteredPlaybooks.length} playbooks
        </span>
        <Pagination 
          currentPage={validPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
