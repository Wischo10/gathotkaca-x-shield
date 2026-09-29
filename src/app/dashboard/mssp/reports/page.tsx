import { MsspReports } from "@/components/mssp/MsspReports";
import { getMsspOverviewDemo } from "@/services/mssp-demo-provider";

export default function ReportsPage() {
  return <MsspReports demo={getMsspOverviewDemo()} />;
}
