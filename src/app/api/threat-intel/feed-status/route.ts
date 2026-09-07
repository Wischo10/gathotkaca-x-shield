import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date().toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const feeds = [
    {
      name: "ThreatFox IOCs",
      source: "ThreatFox",
      status: process.env.THREATFOX_API_KEY ? "Configured" : "Not Configured",
      statusColor: process.env.THREATFOX_API_KEY ? "bg-emerald-500" : "bg-orange-500",
      lastUpdate: process.env.THREATFOX_API_KEY ? now : "-",
    },
    {
      name: "AbuseIPDB Reports",
      source: "AbuseIPDB",
      status: process.env.ABUSEIPDB_API_KEY ? "Configured" : "Not Configured",
      statusColor: process.env.ABUSEIPDB_API_KEY ? "bg-emerald-500" : "bg-orange-500",
      lastUpdate: process.env.ABUSEIPDB_API_KEY ? now : "-",
    },
    {
      name: "VirusTotal",
      source: "VirusTotal",
      status: process.env.VIRUSTOTAL_API_KEY ? "Configured" : "Not Configured",
      statusColor: process.env.VIRUSTOTAL_API_KEY ? "bg-emerald-500" : "bg-orange-500",
      lastUpdate: process.env.VIRUSTOTAL_API_KEY ? now : "-",
    },
  ];

  return NextResponse.json({ status: "ok", data: feeds });
}
