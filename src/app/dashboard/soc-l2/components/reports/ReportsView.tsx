import { ReportsKPIs } from "./ReportsKPIs";
import { ReportsOverview } from "./ReportsOverview";
import { ReportsTrend } from "./ReportsTrend";
import { TopReportCategories } from "./TopReportCategories";
import { RecentReports } from "./RecentReports";
import { ScheduledReports } from "./ScheduledReports";
import { PopularTemplates } from "./PopularTemplates";
import { ReportDistribution } from "./ReportDistribution";
import { ReportsAuditTrail } from "./ReportsAuditTrail";

export function ReportsView() {
  return (
    <div className="flex flex-col gap-4 min-h-[calc(100vh-200px)]">
      {/* Row 1: KPIs */}
      <ReportsKPIs />

      {/* Row 2: Overview, Trend, Top Categories */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 min-h-[300px]">
        <div className="xl:col-span-1">
          <ReportsOverview />
        </div>
        <div className="xl:col-span-2">
          <ReportsTrend />
        </div>
        <div className="xl:col-span-1">
          <TopReportCategories />
        </div>
      </div>

      {/* Row 3: Recent, Scheduled, Templates */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 min-h-[350px]">
        <RecentReports />
        <ScheduledReports />
        <PopularTemplates />
      </div>

      {/* Row 4: Distribution, Audit Trail */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 min-h-[250px]">
        <ReportDistribution />
        <ReportsAuditTrail />
      </div>
    </div>
  );
}
