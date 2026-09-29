import { MsspServices } from "@/components/mssp/MsspServices";
import { getMsspOverviewDemo } from "@/services/mssp-demo-provider";

export default function ServicesPage() {
  return <MsspServices demo={getMsspOverviewDemo()} />;
}
