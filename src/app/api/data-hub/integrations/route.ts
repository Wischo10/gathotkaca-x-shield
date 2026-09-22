import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const wazuhApiUrl = process.env.WAZUH_API_URL;
  const bitdefenderApiUrl = process.env.BITDEFENDER_API_URL;
  const virusTotalApi = process.env.VIRUSTOTAL_API_KEY;
  
  const integrations = [
    {
      name: "Wazuh",
      status: wazuhApiUrl ? "Connected" : "Disconnected",
      description: "SIEM & XDR Data Source"
    },
    {
      name: "Bitdefender",
      status: bitdefenderApiUrl ? "Connected" : "Disconnected",
      description: "Endpoint Detection & Response"
    },
    {
      name: "VirusTotal",
      status: virusTotalApi ? "Connected" : "Disconnected",
      description: "Threat Intelligence Feed"
    }
  ];

  return NextResponse.json({ data: integrations });
}
