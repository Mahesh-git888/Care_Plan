import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  attemptLogin,
  buildSessionPayload,
  COOKIE_NAME,
  getSession,
  SESSION_TTL_SECONDS,
  signSession,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { email, password } = body as { email?: string; password?: string };

  if (!password || typeof password !== "string") {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  const result = attemptLogin(typeof email === "string" ? email : undefined, password);

  if (!result.ok) {
    if (result.reason === "not_configured") {
      return NextResponse.json(
        {
          error:
            "Admin auth is not configured on this server. Set PORTEA_USERS_JSON (and PORTEA_AUTH_SECRET) on Vercel.",
        },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const payload = buildSessionPayload(result.user);
  const token = signSession(payload);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.json({
    success: true,
    user: {
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
    },
  });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
  return NextResponse.json({
    authenticated: true,
    user: {
      email: session.email,
      name: session.name,
      role: session.role,
      exp: session.exp,
    },
  });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ success: true });
}
