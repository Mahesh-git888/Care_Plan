import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  buildSessionPayload,
  COOKIE_NAME,
  getSession,
  hashPassword,
  isAdminConfigured,
  SESSION_TTL_SECONDS,
  signSession,
  verifyPassword,
} from "@/lib/admin-auth";
import { isDbConfigured } from "@/lib/db";
import { findUserById, setUserPassword } from "@/lib/users";

export const dynamic = "force-dynamic";

// POST /api/account/password -> the logged-in user changes their own password.
// Body: { old_password, new_password }. Re-issues the session cookie with the
// "must change password" flag cleared, so the dashboard unblocks immediately.
export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin auth is not configured on this server." },
      { status: 503 },
    );
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Database not configured. Set POSTGRES_URL." },
      { status: 503 },
    );
  }

  let body: { old_password?: string; new_password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const oldPw = body.old_password ?? "";
  const newPw = body.new_password ?? "";
  if (!oldPw || !newPw) {
    return NextResponse.json(
      { error: "Current and new passwords are both required." },
      { status: 400 },
    );
  }
  if (newPw.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters." },
      { status: 400 },
    );
  }
  if (newPw === oldPw) {
    return NextResponse.json(
      { error: "New password must be different from your current one." },
      { status: 400 },
    );
  }

  const user = await findUserById(session.sub);
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  if (!user.active) {
    return NextResponse.json({ error: "Account is inactive." }, { status: 403 });
  }
  if (!verifyPassword(oldPw, user.password_hash)) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 401 },
    );
  }

  const newHash = hashPassword(newPw);
  await setUserPassword(user.id, newHash, false);

  // Re-issue the session cookie without must_change_password so the UI clears
  // the forced password-change gate immediately.
  const payload = buildSessionPayload({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    mustChangePassword: false,
  });
  const token = signSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.json({ ok: true });
}
