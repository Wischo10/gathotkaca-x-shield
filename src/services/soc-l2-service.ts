import { InvestigationCase, L2Alert, Severity } from "@/types/soc";

/**
 * Service Layer for the SOC L2 Console.
 * Currently uses mock data.
 */

const mockAlerts: L2Alert[] = [
  {
    id: "alert-1",
    title: "Brute Force Login Detected",
    description: "Multiple failed login attempts detected from external IP targeting VPN portal.",
    severity: "critical",
    source: "WAF-01",
    asset: "192.168.10.25",
    status: "In Progress",
    assignee: "Fandi Junerry",
    firstSeen: "2025-05-19T10:30:21Z",
    lastSeen: "2025-05-19T10:32:15Z",
    totalEvents: 24,
  },
  {
    id: "alert-2",
    title: "Malware Execution Blocked",
    description: "Suspicious executable blocked from running on financial server.",
    severity: "high",
    source: "EDR-02",
    asset: "FIN-SRV-01",
    status: "New",
    firstSeen: "2025-05-19T11:15:00Z",
    lastSeen: "2025-05-19T11:15:00Z",
    totalEvents: 1,
  },
  {
    id: "alert-3",
    title: "Suspicious PowerShell Activity",
    description: "Encoded PowerShell command executed by regular user.",
    severity: "high",
    source: "SIEM-01",
    asset: "FIN-WS-23",
    status: "New",
    firstSeen: "2025-05-19T09:42:10Z",
    lastSeen: "2025-05-19T09:42:10Z",
    totalEvents: 3,
  },
  {
    id: "alert-4",
    title: "Web Application Attack",
    description: "SQL Injection attempts targeting customer login endpoint.",
    severity: "medium",
    source: "WAF-01",
    asset: "203.0.113.55",
    status: "New",
    firstSeen: "2025-05-19T08:10:00Z",
    lastSeen: "2025-05-19T08:25:00Z",
    totalEvents: 15,
  }
];

export async function getL2Alerts(): Promise<L2Alert[]> {
  return mockAlerts;
}

export async function getInvestigationCase(alertId: string): Promise<InvestigationCase | null> {
  const alert = mockAlerts.find((a) => a.id === alertId);
  if (!alert) return null;

  return {
    alert,
    timeline: [
      {
        id: "t1",
        time: "2025-05-19T10:30:21Z",
        description: "Initial detection of malicious activity."
      },
      {
        id: "t2",
        time: "2025-05-19T10:31:02Z",
        description: "Automated response triggered by policy."
      }
    ],
    entities: [
      { id: "e1", type: "IP Address", value: "185.220.101.2" },
      { id: "e2", type: "User Account", value: "admin" }
    ],
    iocs: [
      { id: "i1", type: "Hash", value: "c9c7f...", confidence: 90 },
      { id: "i2", type: "URL", value: "http://malicious.com", confidence: 85 }
    ]
  };
}
