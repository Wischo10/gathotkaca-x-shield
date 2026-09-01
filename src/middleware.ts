import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Middleware runs on the Edge runtime, so it re-verifies the JWT directly
// with `jose` rather than importing lib/auth.ts (which pulls in `pg`, a
// Node-only driver that can't run on the Edge runtime). This is a
// lightweight signature check — full user lookup happens in
// /api/auth/me and in any route that needs live user data.
const SESSION_COOKIE = "gxs_session";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const loginUrl = new URL("/login", req.url);

  if (!token) {
    loginUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    loginUrl.searchParams.set("next", req.nextUrl.pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
