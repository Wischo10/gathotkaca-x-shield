import { MapPin, AlertTriangle, ExternalLink } from "lucide-react";

export function IndonesiaThreats() {
  const indonesiaIOCs = [
    { indicator: "114.122.10.21", type: "ip:port", city: "Jakarta", threat: "C2 Server", severity: "High", firstSeen: "2 hours ago" },
    { indicator: "judi-online-slot-gacor.id", type: "domain", city: "Surabaya", threat: "Phishing/Gambling", severity: "High", firstSeen: "5 hours ago" },
    { indicator: "182.253.33.19", type: "ip", city: "Bandung", threat: "Botnet Node", severity: "Medium", firstSeen: "12 hours ago" },
    { indicator: "pinjol-ilegal-cepat.apk", type: "file_name", city: "Medan", threat: "Malware", severity: "Critical", firstSeen: "1 day ago" },
    { indicator: "36.68.10.15", type: "ip:port", city: "Makassar", threat: "Brute Force", severity: "Medium", firstSeen: "1 day ago" },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-[320px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-500" />
          Threats Detected in Indonesia
        </h3>
        <button onClick={() => window.alert("Opening full Indonesia Threat Report...")} className="text-xs font-medium text-brand-blue hover:underline flex items-center gap-1">
          View All <ExternalLink className="w-3 h-3" />
        </button>
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/50">
            <tr>
              <th className="py-2.5 font-medium">Indicator</th>
              <th className="py-2.5 font-medium">Type</th>
              <th className="py-2.5 font-medium">Location</th>
              <th className="py-2.5 font-medium">Threat</th>
              <th className="py-2.5 font-medium">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
            {indonesiaIOCs.map((ioc, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-3 pr-2 font-semibold text-slate-900 dark:text-white truncate max-w-[120px]" title={ioc.indicator}>{ioc.indicator}</td>
                <td className="py-3 pr-2 text-slate-500">{ioc.type}</td>
                <td className="py-3 pr-2 text-slate-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  {ioc.city}
                </td>
                <td className="py-3 pr-2 text-slate-600 dark:text-slate-400">{ioc.threat}</td>
                <td className="py-3">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                    ioc.severity === 'Critical' ? 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-900/50' : 
                    ioc.severity === 'High' ? 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-900/50' :
                    'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-500/10 dark:border-yellow-900/50'
                  }`}>
                    {ioc.severity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
