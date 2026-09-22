export interface Control {
  id: string;
  domain: string;
  name: string;
  description: string | null;
  framework: string;
  status: "Compliant" | "Non-Compliant" | "Pending";
  riskCategoryId: string | null;
  createdAt: string;
  updatedAt: string;
}
