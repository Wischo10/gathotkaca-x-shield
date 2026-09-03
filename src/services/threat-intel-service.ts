export interface ThreatFoxIOC {
  id: string;
  ioc_value: string;
  ioc_type: string;
  threat_type: string;
  fk_malware: string;
  malware_alias: string;
  malware_printable: string;
  first_seen_utc: string;
  last_seen_utc: string;
  confidence_level: number;
  reference: string;
  reporter: string;
}

export interface AbuseIPDBReport {
  ipAddress: string;
  abuseConfidenceScore: number;
  lastReportedAt: string;
}

export async function getThreatFoxIOCs(): Promise<ThreatFoxIOC[]> {
  try {
    const response = await fetch("/api/threat-intel/threatfox");
    if (!response.ok) {
      throw new Error("Failed to fetch ThreatFox data");
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching ThreatFox IOCs:", error);
    return [];
  }
}

export async function getAbuseIPDBReports(): Promise<AbuseIPDBReport[]> {
  try {
    const response = await fetch("/api/threat-intel/abuseipdb");
    if (!response.ok) {
      throw new Error("Failed to fetch AbuseIPDB data");
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching AbuseIPDB reports:", error);
    return [];
  }
}
