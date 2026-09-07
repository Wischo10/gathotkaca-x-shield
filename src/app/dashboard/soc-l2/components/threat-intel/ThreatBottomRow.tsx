import { useState, useEffect } from "react";
import { ArrowRight, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { getFeedStatus, FeedStatus } from "@/services/threat-intel-service";

export function ThreatBottomRow() {
  const [feeds, setFeeds] = useState<FeedStatus[]>([]);
  const [loadingFeeds, setLoadingFeeds] = useState(true);

  useEffect(() => {
    getFeedStatus().then((data) => {
      setFeeds(data);
      setLoadingFeeds(false);
    });
  }, []);

  const industries: any[] = [];
  const actors: any[] = [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      
      {/* Top Targeted Industries */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-[380px]">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6">Top Targeted Industries (This Week)</h3>
        <div className="flex flex-col gap-5 flex-1 overflow-auto">
          {industries.length > 0 ? (
            industries.map((ind, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-24 truncate">{ind.name}</span>
                <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${ind.color}`} style={{ width: `${ind.percent}%` }}></div>
                </div>
                <div className="flex items-center gap-1.5 w-16 justify-end">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">{ind.value}</span>
                  <span className="text-[10px] text-slate-500">({ind.percent}%)</span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">No data available</div>
          )}
        </div>
        <div className="mt-4 text-right">
          <button className="text-xs font-medium text-brand-blue flex items-center gap-1 ml-auto hover:underline">
            View full report <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Threat Actor Activity */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-[380px]">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Threat Actor Activity (This Week)</h3>
        <div className="flex-1 overflow-auto">
          {actors.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/50">
                <tr>
                  <th className="py-2.5 font-medium">Threat Actor</th>
                  <th className="py-2.5 font-medium text-center">Activity Level</th>
                  <th className="py-2.5 font-medium text-center">Trend</th>
                  <th className="py-2.5 font-medium">Top TTPs</th>
                  <th className="py-2.5 font-medium">Targeted Industries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                {actors.map((actor, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 pr-2 font-semibold text-slate-900 dark:text-white">{actor.name}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${actor.levelClass}`}>
                        {actor.level}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex justify-center">
                        {actor.trend === "up" ? (
                          <ArrowUp className={`w-3.5 h-3.5 ${actor.trendColor}`} />
                        ) : (
                          <ArrowDown className={`w-3.5 h-3.5 ${actor.trendColor}`} />
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-2 text-slate-600 dark:text-slate-400">{actor.ttps}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400 truncate max-w-[100px]" title={actor.targets}>{actor.targets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">No data available</div>
          )}
        </div>
        <div className="mt-2 text-right">
          <button className="text-xs font-medium text-brand-blue flex items-center gap-1 ml-auto hover:underline">
            View all threat actors <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Threat Intelligence Feeds */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-[380px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Threat Intelligence Feeds (Status)</h3>
          <a href="#" className="text-xs font-medium text-brand-blue hover:underline">View All</a>
        </div>
        <div className="flex-1 overflow-auto">
          {loadingFeeds ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
            </div>
          ) : feeds.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/50">
                <tr>
                  <th className="py-2.5 font-medium">Feed Name</th>
                  <th className="py-2.5 font-medium">Source</th>
                  <th className="py-2.5 font-medium">Status</th>
                  <th className="py-2.5 font-medium">Last Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                {feeds.map((feed, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 pr-2 font-medium text-slate-900 dark:text-white truncate max-w-[100px]" title={feed.name}>{feed.name}</td>
                    <td className="py-2.5 pr-2 text-slate-500">{feed.source}</td>
                    <td className="py-2.5 pr-2">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                        <span className={`w-1.5 h-1.5 rounded-full ${feed.statusColor}`}></span>
                        {feed.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-500">{feed.lastUpdate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <div className="flex items-center justify-center h-full text-slate-500 text-sm">No feeds configured</div>
          )}
        </div>
        <div className="mt-2 text-right">
          <button className="text-xs font-medium text-brand-blue flex items-center gap-1 ml-auto hover:underline">
            Manage all feeds & sources <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

    </div>
  );
}
