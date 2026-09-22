export interface BusinessImpact {
  id: string;
  name: string;
  description: string | null;
  estimatedLossUsd: number | null;
  createdAt: string;
}
