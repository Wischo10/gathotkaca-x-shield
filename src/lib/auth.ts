import "server-only";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

const SESSION_COOKIE = "gxs_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function secretKey() {
  return new TextEncoder().encode(env.jwtSecret());
}

/**
 * Verifies email/password against the `users` table. Returns null on any
 * failure (unknown email, wrong password, inactive account) — the caller
 * is responsible for returning a generic "invalid credentials" message so
 * we don't leak which part was wrong.
 */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<SessionUser | null> {
  // --- MOCK DATA IMPLEMENTATION ---
  // Since the DB is not ready, we use dummy data for login.
  if (email.toLowerCase().trim() === "admin@test.com" && password === "admin123") {
    return {
      id: "mock-user-1",
      email: "admin@test.com",
      fullName: "Admin Dummy",
      role: "admin",
    };
  }
  
  if (email.toLowerCase().trim() === "user@test.com" && password === "user123") {
    return {
      id: "mock-user-2",
      email: "user@test.com",
      fullName: "User Dummy",
      role: "user",
    };
  }

  // If we wanted to keep the DB query for later, we can just return null 
  // if dummy credentials are not met.
  return null;
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (
      typeof payload.id === "string" &&
      typeof payload.email === "string" &&
      typeof payload.fullName === "string" &&
      typeof payload.role === "string"
    ) {
      return {
        id: payload.id,
        email: payload.email,
        fullName: payload.fullName,
        role: payload.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE, SESSION_TTL_SECONDS };
