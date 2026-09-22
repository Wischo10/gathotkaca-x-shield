export function PlaybookTypes() {
  const types: any[] = [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm col-span-1 h-full">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-6">Playbook Types</h2>
      
      {types.length === 0 ? (
        <div className="flex-1 flex items-center justify-center mt-8">
          <span className="text-xs text-slate-500">No playbook types data</span>
        </div>
      ) : (
        <div className="flex flex-col gap-5 mt-2">
          {types.map((type) => (
            <div key={type.name} className="flex items-center gap-3">
              <span className="text-xs text-slate-600 dark:text-slate-300 w-20">{type.name}</span>
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${type.color} rounded-full`}
                  style={{ width: `${type.percentage}%` }}
                />
              </div>
              <div className="w-16 flex items-center justify-end gap-1">
                <span className="text-xs font-medium text-slate-900 dark:text-white">{type.count}</span>
                <span className="text-[10px] text-slate-500">({type.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
