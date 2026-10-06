import { MsspCompliance } from "@/components/mssp/MsspCompliance";
import { getMsspComplianceDemo } from "@/services/mssp-demo-provider";

export default function CompliancePage() {
  return <MsspCompliance demo={getMsspComplianceDemo()} />;
}
