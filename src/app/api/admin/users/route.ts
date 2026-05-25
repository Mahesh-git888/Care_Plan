import { NextResponse } from "next/server";

import {
  getSession,
  hashPassword,
  isAdminConfigured,
  type SessionPayload,
} from "@/lib/admin-auth";
import { isDbConfigured } from "@/lib/db";
import {
  createUser,
  emailExists,
  listUserSummaries,
  type UserRole,
} from "@/lib/users";

export const dynamic = "force-dynamic";

type Guard =
  | { ok: true; session: SessionPayload }
  | { ok: false; status: number; error: string };

async function requireAdmin(): Promise<Guard> {
  if (!isAdminConfigured()) {
    return { ok: false, status: 503, error: "Admin auth is not configured on this server." };
  }
  const session = await getSession();
  if (!session) return { ok: false, status: 401, error: "Unauthorized" };
  if (session.role !== "admin") {
    return { ok: false, status: 403, error: "Admins only." };
  }
  if (!isDbConfigured()) {
    return { ok: false, status: 503, error: "Database not configured. Set POSTGRES_URL." };
  }
  return { ok: true, session };
}

// GET /api/admin/users -> list all users (admin only).
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
  const users = await listUserSummaries();
  return NextResponse.json({ users });
}

// POST /api/admin/users -> create a new user (admin only). Body:
//   { email, name, role: "admin"|"cm", password }
// The created user is flagged must_change_password=true so they have to set
// their own password on first sign-in.
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  let body: { email?: string; name?: string; role?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const name = body.name?.trim() ?? "";
  const roleRaw = body.role;
  const role: UserRole | null =
    roleRaw === "admin" ? "admin" : roleRaw === "cm" ? "cm" : null;
  const password = body.password ?? "";

  if (!email || !name || !role || !password) {
    return NextResponse.json(
      { error: "Email, name, role and password are all required." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }
  if (await emailExists(email)) {
    return NextResponse.json(
      { error: "A user with that email already exists." },
      { status: 409 },
    );
  }

  const password_hash = hashPassword(password);
  const created = await createUser({
    email,
    name,
    role,
    password_hash,
    created_by: guard.session.email,
    must_change_password: true,
  });

  return NextResponse.json({
    user: {
      id: created.id,
      email: created.email,
      name: created.name,
      role: created.role,
      active: created.active,
      must_change_password: created.must_change_password,
      created_at: created.created_at,
    },
  });
}
