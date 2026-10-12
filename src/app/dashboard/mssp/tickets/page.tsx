import { MsspTickets } from "@/components/mssp/MsspTickets";
import { getMsspTicketsDemo } from "@/services/mssp-demo-provider";

export default function TicketsPage() {
  return <MsspTickets demo={getMsspTicketsDemo()} />;
}
