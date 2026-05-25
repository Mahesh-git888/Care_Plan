// Admin user store.
//
// Users live in the Postgres `users` table. On first run (when the table is
// empty), accounts are seeded from the legacy PORTEA_USERS_JSON environment
// variable so nothing breaks during migration. After seeding, the env var is
// ignored: all CRUD goes through the admin user-management UI.
//
// Server-side only. Do NOT import this file from a "use client" component.

import crypto from "node:crypto";

import { execute, query } from "@/lib/db";
import { getOverrideForEmail } from "@/lib/password-overrides";

export type UserRole = "admin" | "cm";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password_hash: string;
  must_change_password: boolean;
  active: boolean;
  created_at?: string;
};

// What we return to the dashboard UI. Same fields as AdminUser minus the
// password hash.
export type UserSummary = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  must_change_password: boolean;
  active: boolean;
  created_at: string;
};

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  password_hash: string;
  must_change_password: boolean | null;
  active: boolean | null;
  created_at: Date | string;
  created_by: string | null;
  updated_at: Date | string | null;
};

function rowToUser(row: UserRow): AdminUser {
  const role: UserRole = row.role === "admin" ? "admin" : "cm";
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role,
    password_hash: row.password_hash,
    must_change_password: row.must_change_password ?? false,
    active: row.active ?? true,
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

function toSummary(u: AdminUser): UserSummary {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    must_change_password: u.must_change_password,
    active: u.active,
    created_at: u.created_at ?? "",
  };
}

// --- Env-var seed (legacy source, used once to populate the DB) ------------

type SeedUser = {
  id?: string;
  email: string;
  name: string;
  role: UserRole;
  password_hash: string;
};

function isValidSeed(value: unknown): value is SeedUser {
  if (!value || typeof value !== "object") return false;
  const u = value as Partial<SeedUser>;
  return (
    typeof u.email === "string" &&
    typeof u.name === "string" &&
    typeof u.password_hash === "string" &&
    (u.role === "admin" || u.role === "cm")
  );
}

function readSeedFromEnv(): SeedUser[] {
  const raw = process.env.PORTEA_USERS_JSON?.trim();
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[users] PORTEA_USERS_JSON is not valid JSON", err);
    return [];
  }
  if (!Array.isArray(parsed)) {
    // eslint-disable-next-line no-console
    console.error("[users] PORTEA_USERS_JSON must be a JSON array");
    return [];
  }
  return parsed.filter(isValidSeed).map((u) => ({
    ...u,
    email: u.email.toLowerCase().trim(),
    id: u.id?.trim() || `u_${u.email.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
  }));
}

// One-time seed. Runs lazily on the first DB read. If a previous password
// override existed for the user's email (from the old override-table flow),
// that hash is used so the user keeps their current password through the
// migration.
let seedAttempted = false;
async function ensureSeed(): Promise<void> {
  if (seedAttempted) return;
  seedAttempted = true;
  try {
    const existing = await query<{ x: number }>(
      `SELECT 1 AS x FROM users LIMIT 1`,
    );
    if (existing.length > 0) return;
    const envUsers = readSeedFromEnv();
    if (envUsers.length === 0) return;
    for (const u of envUsers) {
      const override = await getOverrideForEmail(u.email);
      const passwordHash = override?.password_hash ?? u.password_hash;
      await execute(
        `INSERT INTO users
           (id, email, name, role, password_hash, must_change_password, active, created_by)
         VALUES ($1, $2, $3, $4, $5, FALSE, TRUE, 'seed:PORTEA_USERS_JSON')
         ON CONFLICT (email) DO NOTHING`,
        [u.id, u.email, u.name, u.role, passwordHash],
      );
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[users] seed failed; will retry on next call", err);
    seedAttempted = false; // allow retry
  }
}

// --- Reads -----------------------------------------------------------------

export async function readUsers(): Promise<AdminUser[]> {
  await ensureSeed();
  const rows = await query<UserRow>(
    `SELECT * FROM users ORDER BY created_at ASC`,
  );
  return rows.map(rowToUser);
}

export async function listUserSummaries(): Promise<UserSummary[]> {
  const users = await readUsers();
  return users.map(toSummary);
}

export async function findUserByEmail(email: string): Promise<AdminUser | null> {
  const key = email.trim().toLowerCase();
  if (!key) return null;
  await ensureSeed();
  const rows = await query<UserRow>(
    `SELECT * FROM users WHERE email = $1 LIMIT 1`,
    [key],
  );
  return rows[0] ? rowToUser(rows[0]) : null;
}

export async function findUserById(id: string): Promise<AdminUser | null> {
  if (!id) return null;
  await ensureSeed();
  const rows = await query<UserRow>(
    `SELECT * FROM users WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] ? rowToUser(rows[0]) : null;
}

export async function emailExists(email: string): Promise<boolean> {
  const key = email.trim().toLowerCase();
  if (!key) return false;
  const rows = await query<{ x: number }>(
    `SELECT 1 AS x FROM users WHERE email = $1 LIMIT 1`,
    [key],
  );
  return rows.length > 0;
}

// True if at least one user exists in the DB. Used by attemptLogin to tell
// "wrong credentials" apart from "no auth configured yet".
export async function hasAnyUser(): Promise<boolean> {
  try {
    const rows = await query<{ x: number }>(
      `SELECT 1 AS x FROM users LIMIT 1`,
    );
    return rows.length > 0;
  } catch {
    return false;
  }
}

// --- Writes ----------------------------------------------------------------

export type CreateUserInput = {
  email: string;
  name: string;
  role: UserRole;
  password_hash: string;
  created_by?: string;
  must_change_password?: boolean;
};

export async function createUser(input: CreateUserInput): Promise<AdminUser> {
  const id = `u_${crypto.randomBytes(6).toString("hex")}`;
  const email = input.email.trim().toLowerCase();
  await execute(
    `INSERT INTO users
       (id, email, name, role, password_hash, must_change_password, active, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7)`,
    [
      id,
      email,
      input.name.trim(),
      input.role,
      input.password_hash,
      input.must_change_password ?? true,
      input.created_by ?? null,
    ],
  );
  const created = await findUserById(id);
  if (!created) throw new Error("Failed to create user");
  return created;
}

export async function setUserActive(id: string, active: boolean): Promise<boolean> {
  const rowCount = await execute(
    `UPDATE users SET active = $1, updated_at = now() WHERE id = $2`,
    [active, id],
  );
  return rowCount > 0;
}

export async function setUserRole(id: string, role: UserRole): Promise<boolean> {
  const rowCount = await execute(
    `UPDATE users SET role = $1, updated_at = now() WHERE id = $2`,
    [role, id],
  );
  return rowCount > 0;
}

export async function setUserPassword(
  id: string,
  passwordHash: string,
  mustChangePassword: boolean,
): Promise<boolean> {
  const rowCount = await execute(
    `UPDATE users SET password_hash = $1, must_change_password = $2, updated_at = now() WHERE id = $3`,
    [passwordHash, mustChangePassword, id],
  );
  return rowCount > 0;
}
