import { ThreatKPIs } from "./ThreatKPIs";
import { ThreatMiddleRow } from "./ThreatMiddleRow";
import { ThreatBottomRow } from "./ThreatBottomRow";
import { RecentThreatAlerts } from "./RecentThreatAlerts";
import { IndonesiaThreats } from "./IndonesiaThreats";

export function ThreatIntelligenceView() {
  return (
    <div className="flex flex-col gap-4">
      <ThreatKPIs />
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-3">
          <ThreatMiddleRow />
        </div>
        <div className="xl:col-span-1 h-full">
          <IndonesiaThreats />
        </div>
      </div>
      <ThreatBottomRow />
      <RecentThreatAlerts />
    </div>
  );
}
