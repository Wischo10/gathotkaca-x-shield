export function ReportDistribution() {
  const distribution = [
    { name: "Internal Users", percent: 72, color: "bg-purple-600 dark:bg-purple-500" },
    { name: "Email", percent: 17, color: "bg-blue-500 dark:bg-blue-400" },
    { name: "Dashboard", percent: 8, color: "bg-cyan-400 dark:bg-cyan-500" },
    { name: "Others", percent: 3, color: "bg-orange-400 dark:bg-orange-500" },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-center h-full xl:col-span-1">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-6">Report Distribution (This Week)</h2>
      
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
    </div>
  );
}
