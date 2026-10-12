import { SocAnalyticsClient } from "./SocAnalyticsClient";
import type { SocAnalyticsView } from "@/components/dashboard/SocDrilldownLink";

const VIEWS: SocAnalyticsView[] = ["severity", "trend", "status", "aging", "incidents", "mitre", "rules", "iocs", "alerts", "countries", "sources"];

export default function SocAnalyticsPage({ searchParams }: { searchParams?: { view?: string | string[] } }) {
  const requested = typeof searchParams?.view === "string" ? searchParams.view : "";
  const view = VIEWS.includes(requested as SocAnalyticsView) ? requested as SocAnalyticsView : null;
  return <SocAnalyticsClient view={view} />;
}
