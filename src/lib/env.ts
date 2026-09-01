import "server-only";

/**
 * Centralized, server-only access to environment variables.
 *
 * Importing "server-only" makes Next.js throw a build error if this module
 * is ever imported from a Client Component, which is our main guardrail
 * against accidentally leaking credentials to the browser bundle.
 *
 * Every credential-bearing value used by this app MUST be read through
 * this file — never call `process.env.X` directly elsewhere for a secret.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Set it in your .env file (see .env.example).`
    );
  }
  return value;
}

function optional(name: string, fallback?: string): string | undefined {
  return process.env[name] ?? fallback;
}

export const env = {
  wazuh: {
    apiUrl: () => required("WAZUH_API_URL"),
    username: () => required("WAZUH_API_USERNAME"),
    password: () => required("WAZUH_API_PASSWORD"),
    requestTimeoutMs: () => Number(optional("WAZUH_REQUEST_TIMEOUT_MS", "10000")),
    allowSelfSigned: () => optional("WAZUH_ALLOW_SELF_SIGNED", "false") === "true",
  },
  wazuhIndexer: {
    url: () => required("WAZUH_INDEXER_URL"),
    username: () => required("WAZUH_INDEXER_USERNAME"),
    password: () => required("WAZUH_INDEXER_PASSWORD"),
    alertsIndex: () => required("WAZUH_INDEXER_ALERTS_INDEX"),
    vulnerabilityIndex: () => required("WAZUH_INDEXER_VULNERABILITY_INDEX"),
  },
  bitdefender: {
    apiUrl: () => required("BITDEFENDER_API_URL"),
    apiKey: () => required("BITDEFENDER_API_KEY"),
  },
  ollama: {
    url: () => required("OLLAMA_URL"),
    model: () => required("OLLAMA_MODEL"),
  },
  threatIntel: {
    threatFoxApiKey: () => optional("THREATFOX_API_KEY"),
    virusTotalApiKey: () => optional("VIRUSTOTAL_API_KEY"),
    abuseIpDbApiKey: () => optional("ABUSEIPDB_API_KEY"),
  },
  database: {
    url: () => required("DATABASE_URL"),
  },
  jwtSecret: () => required("JWT_SECRET"),
};
