import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { COOKIE_NAME, expectedCookieValue, isAdminAuthed } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { password } = body as { password?: string };

  const expected = expectedCookieValue();
  const adminPassword = process.env.PORTEA_ADMIN_PASSWORD?.trim();

  if (!adminPassword || !expected) {
    return Response.json(
      { error: "PORTEA_ADMIN_PASSWORD is not configured on the server." },
      { status: 500 },
    );
  }

  if (password === adminPassword) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, expected, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return Response.json({ success: true });
  }

  return Response.json({ error: "Incorrect password" }, { status: 401 });
}

export async function GET() {
  return Response.json({ authenticated: await isAdminAuthed() });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return Response.json({ success: true });
}
