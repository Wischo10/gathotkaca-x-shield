import "server-only";
import { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE, SessionUser } from "@/lib/auth";

/**
 * Extracts and verifies the authenticated SessionUser from a NextRequest.
 * Checks both cookie and Authorization header (Bearer token).
 * Returns null if unauthenticated or token is invalid/expired.
 */
export async function getSessionFromRequest(
  request: NextRequest
): Promise<SessionUser | null> {
  // 1. Try session cookie first
  const cookie = request.cookies.get(SESSION_COOKIE);
  if (cookie?.value) {
    const user = await verifySessionToken(cookie.value);
    if (user) return user;
  }

  // 2. Try Authorization Bearer header fallback
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const user = await verifySessionToken(token);
      if (user) return user;
    }
  }

  return null;
}
