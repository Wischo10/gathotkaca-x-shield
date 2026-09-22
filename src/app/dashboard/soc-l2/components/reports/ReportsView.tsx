import { ReportsKPIs } from "./ReportsKPIs";
import { ReportsOverview } from "./ReportsOverview";
import { ReportsTrend } from "./ReportsTrend";
import { TopReportCategories } from "./TopReportCategories";
import { RecentReports } from "./RecentReports";
import { ScheduledReports } from "./ScheduledReports";
import { PopularTemplates } from "./PopularTemplates";
import { ReportDistribution } from "./ReportDistribution";
import { ReportsAuditTrail } from "./ReportsAuditTrail";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export function ReportsView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/soc/reports")
      .then(res => res.json())
      .then(res => {
        if (res.status === "ok") {
          setData(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue mb-4" />
        <p className="text-slate-500 text-sm">Loading reports data from Wazuh...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 min-h-[calc(100vh-200px)]">
      {/* Row 1: KPIs */}
      <ReportsKPIs kpis={data?.kpis} />

      {/* Row 2: Overview, Trend, Top Categories */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 min-h-[300px]">
        <div className="xl:col-span-1">
          <ReportsOverview overview={data?.overview} />
        </div>
        <div className="xl:col-span-2">
          <ReportsTrend trend={data?.trend} />
        </div>
        <div className="xl:col-span-1">
          <TopReportCategories categories={data?.topCategories} />
        </div>
      </div>

      {/* Row 3: Recent, Scheduled, Templates */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 min-h-[350px]">
        <RecentReports recent={data?.recent} />
        <ScheduledReports scheduled={data?.scheduled} />
        <PopularTemplates templates={data?.templates} />
      </div>

      {/* Row 4: Distribution, Audit Trail */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 min-h-[250px]">
        <ReportDistribution />
        <ReportsAuditTrail />
      </div>
    </div>
  );
}
