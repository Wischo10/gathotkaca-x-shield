import "server-only";

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly kind:
      | "timeout"
      | "network"
      | "auth"
      | "not_found"
      | "rate_limit"
      | "server"
      | "invalid_response",
    public readonly status?: number
  ) {
    super(message);
    this.name = "HttpError";
  }
}

interface FetchJsonOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * fetch() wrapper used by every service that talks to an external API
 * (Wazuh, Wazuh Indexer, Bitdefender, Ollama, ThreatFox, VirusTotal,
 * AbuseIPDB). Centralizes timeout handling and turns HTTP/network failures
 * into typed HttpError instances so route handlers can map them to
 * consistent user-facing messages instead of leaking raw stack traces.
 */
export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions = {}
): Promise<T> {
  const { timeoutMs = 10000, ...init } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new HttpError(`Request to ${safeHost(url)} timed out`, "timeout");
    }
    throw new HttpError(
      `Could not reach ${safeHost(url)}: network error`,
      "network"
    );
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 401 || response.status === 403) {
    throw new HttpError(
      `Authentication failed for ${safeHost(url)}`,
      "auth",
      response.status
    );
  }
  if (response.status === 404) {
    throw new HttpError(`Not found: ${safeHost(url)}`, "not_found", 404);
  }
  if (response.status === 429) {
    throw new HttpError(
      `Rate limited by ${safeHost(url)}`,
      "rate_limit",
      429
    );
  }
  if (response.status >= 500) {
    throw new HttpError(
      `${safeHost(url)} returned a server error`,
      "server",
      response.status
    );
  }
  if (!response.ok) {
    throw new HttpError(
      `Unexpected response from ${safeHost(url)}`,
      "server",
      response.status
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new HttpError(
      `Invalid JSON response from ${safeHost(url)}`,
      "invalid_response"
    );
  }
}

// Never let a full URL (which may contain query params with tokens) leak
// into an error message that could reach the client.
function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "upstream service";
  }
}
