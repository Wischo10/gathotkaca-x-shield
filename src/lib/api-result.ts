import { HttpError } from "@/lib/http";
import type { ApiResult } from "@/types/soc";

const MESSAGES: Record<string, string> = {
  timeout: "The upstream service took too long to respond.",
  network: "Could not connect to the upstream service.",
  auth: "Authentication with the upstream service failed — check credentials.",
  not_found: "The requested resource was not found upstream.",
  rate_limit: "Upstream service is rate limiting requests. Try again shortly.",
  server: "The upstream service returned a server error.",
  invalid_response: "Received an unexpected response from the upstream service.",
};

export function toErrorResult(err: unknown, fallback: string): ApiResult<never> {
  if (err instanceof HttpError) {
    return {
      status: "error",
      message: MESSAGES[err.kind] ?? fallback,
      code: err.kind,
    };
  }
  return { status: "error", message: fallback };
}
