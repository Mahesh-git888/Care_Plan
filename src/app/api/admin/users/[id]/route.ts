import { NextResponse } from "next/server";

import { getSession, hashPassword, isAdminConfigured } from "@/lib/admin-auth";
import { isDbConfigured } from "@/lib/db";
import {
  findUserById,
  setUserActive,
  setUserPassword,
  setUserRole,
  type UserRole,
} from "@/lib/users";

export const dynamic = "force-dynamic";

// PATCH /api/admin/users/[id] -> update a user (admin only). Body may include:
//   { active?: boolean, role?: "admin"|"cm", reset_password?: string }
// Multiple fields can be sent in one request. reset_password always sets
// must_change_password=true so the user has to pick a real password next time.
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin auth is not configured on this server." },
      { status: 503 },
    );
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Database not configured. Set POSTGRES_URL." },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Missing user id." }, { status: 400 });

  const existing = await findUserById(id);
  if (!existing) return NextResponse.json({ error: "User not found." }, { status: 404 });

  let body: { active?: boolean; role?: string; reset_password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Guard rails: an admin should not lock themselves out by their own action.
  const isSelf = existing.email === session.email;

  if (typeof body.active === "boolean") {
    if (body.active === false && isSelf) {
      return NextResponse.json(
        { error: "You cannot deactivate your own account." },
        { status: 400 },
      );
    }
    await setUserActive(id, body.active);
  }

  if (body.role === "admin" || body.role === "cm") {
    const newRole = body.role as UserRole;
    if (newRole !== "admin" && isSelf) {
      return NextResponse.json(
        { error: "You cannot change your own role." },
        { status: 400 },
      );
    }
    await setUserRole(id, newRole);
  }

  if (typeof body.reset_password === "string" && body.reset_password.length > 0) {
    if (body.reset_password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }
    await setUserPassword(id, hashPassword(body.reset_password), true);
  }

  return NextResponse.json({ ok: true });
}
