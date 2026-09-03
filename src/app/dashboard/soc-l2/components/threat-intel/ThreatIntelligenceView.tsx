import { ThreatKPIs } from "./ThreatKPIs";
import { ThreatMiddleRow } from "./ThreatMiddleRow";
import { ThreatBottomRow } from "./ThreatBottomRow";
import { RecentThreatAlerts } from "./RecentThreatAlerts";

export function ThreatIntelligenceView() {
  return (
    <div className="flex flex-col gap-4">
      <ThreatKPIs />
      <ThreatMiddleRow />
      <ThreatBottomRow />
      <RecentThreatAlerts />
    </div>
  );
}
