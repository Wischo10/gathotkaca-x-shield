export function ReportDistribution() {
  const distribution: any[] = [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-center h-full xl:col-span-1">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-6">Report Distribution (This Week)</h2>
      
      {distribution.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs text-slate-500">No distribution data</span>
        </div>
      ) : (
        <>
          <div className="w-full h-4 rounded-full overflow-hidden flex mb-6">
            {distribution.map((item) => (
              <div 
                key={item.name} 
                className={`h-full ${item.color}`} 
                style={{ width: `${item.percent}%` }}
                title={`${item.name} (${item.percent}%)`}
              />
            ))}
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {distribution.map((item) => (
              <div key={item.name} className="flex flex-col items-center text-center">
                <span className="text-[10px] text-slate-500 mb-1">{item.name}</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white leading-none">{item.percent}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
