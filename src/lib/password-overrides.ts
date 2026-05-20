// Password overrides.
//
// The seed passwords for each user live in PORTEA_USERS_JSON. When a user
// changes their password through the dashboard, the new hash is persisted
// here in the Postgres `password_overrides` table.
//
// Lookup order on login:
//   1. Override row in Postgres (newest password)
//   2. password_hash in PORTEA_USERS_JSON (seed)
//   3. PORTEA_ADMIN_PASSWORD (legacy fallback)

import { execute, query } from "@/lib/db";

export type OverrideEntry = {
  email: string;
  password_hash: string;
  updated_at?: string;
};

export async function getOverrideForEmail(email: string): Promise<OverrideEntry | null> {
  const key = email.trim().toLowerCase();
  if (!key) return null;
  try {
    const rows = await query<{
      email: string;
      password_hash: string;
      updated_at: Date | string;
    }>(
      `SELECT email, password_hash, updated_at FROM password_overrides WHERE email = $1 LIMIT 1`,
      [key],
    );
    if (!rows[0]) return null;
    return {
      email: rows[0].email,
      password_hash: rows[0].password_hash,
      updated_at:
        rows[0].updated_at instanceof Date
          ? rows[0].updated_at.toISOString()
          : String(rows[0].updated_at),
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[password-overrides] read failed", err);
    return null;
  }
}

export async function setPasswordOverride(
  email: string,
  passwordHash: string,
  updatedBy: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = email.trim().toLowerCase();
  if (!key || !passwordHash) {
    return { ok: false, error: "Email and password hash are required." };
  }
  try {
    await execute(
      `INSERT INTO password_overrides (email, password_hash, updated_at, updated_by)
       VALUES ($1, $2, now(), $3)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         updated_at = now(),
         updated_by = EXCLUDED.updated_by`,
      [key, passwordHash, updatedBy],
    );
    return { ok: true };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[password-overrides] write failed", err);
    return { ok: false, error: "Failed to save the new password." };
  }
}
