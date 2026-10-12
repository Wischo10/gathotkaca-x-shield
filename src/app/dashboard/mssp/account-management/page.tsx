import { MsspAccountManagement } from "@/components/mssp/MsspAccountManagement";
import { getMsspAccountManagementDemo } from "@/services/mssp-demo-provider";

export default function AccountManagementPage() {
  return <MsspAccountManagement demo={getMsspAccountManagementDemo()} />;
}
