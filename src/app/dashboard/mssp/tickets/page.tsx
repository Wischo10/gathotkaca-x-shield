import { MsspTickets } from "@/components/mssp/MsspTickets";
import { getIncidentTicketingDemo } from "@/services/incident-ticketing-provider";

export const dynamic = "force-dynamic";

export default function TicketsPage() {
  return <MsspTickets demo={getIncidentTicketingDemo()} />;
}
