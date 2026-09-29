import { MsspClients } from "@/components/mssp/MsspClients";
import { getMsspOverviewDemo } from "@/services/mssp-demo-provider";

export default function ClientsPage() {
  return <MsspClients demo={getMsspOverviewDemo()} />;
}
