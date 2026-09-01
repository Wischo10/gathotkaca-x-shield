import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, createSessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/auth";
import { HttpError } from "@/lib/http";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { status: "error", message: "Invalid request body." },
      { status: 400 }
    );
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json(
      { status: "error", message: "Email and password are required." },
      { status: 400 }
    );
  }

  try {
    const user = await verifyCredentials(email, password);
    if (!user) {
      // Generic message — never reveal whether the email exists.
      return NextResponse.json(
        { status: "error", message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = await createSessionToken(user);
    const res = NextResponse.json({ status: "ok", data: { user } });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
    return res;
  } catch (err) {
    // Database connection failure, etc. Never leak DB error details.
    return NextResponse.json(
      {
        status: "error",
        message: "Login is temporarily unavailable. Please try again shortly.",
      },
      { status: 503 }
    );
  }
}
