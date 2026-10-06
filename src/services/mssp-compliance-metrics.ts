import type { MsspComplianceStatus } from "@/types/mssp";

/** Demo score rule: compliant=1, partially compliant=0.5, non-compliant=0; N/A is excluded. */
export function calculateDemoComplianceScore(statuses: MsspComplianceStatus[]) {
  const applicable = statuses.filter((status) => status !== "not-applicable");
  if (!applicable.length) return 0;
  return applicable.reduce((total, status) => total + (status === "compliant" ? 1 : status === "partially-compliant" ? 0.5 : 0), 0) / applicable.length * 100;
}
