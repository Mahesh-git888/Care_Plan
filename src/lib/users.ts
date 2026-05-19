// Admin user store.
//
// Users are kept in the PORTEA_USERS_JSON environment variable as a JSON
// array. Each user has: id, email, name, role, password_hash. The hash
// format is `pbkdf2$iterations$salt$hash` (see admin-auth.ts).
//
// Generate password hashes locally with:
//   node scripts/hash-password.mjs
//
// Then paste the array into Vercel as a single-line JSON string.
//
// Example value:
//   [{"id":"u_meera","email":"meera@portea.com","name":"Meera",
//     "role":"cm","password_hash":"pbkdf2$210000$abc...$def..."},
//    {"id":"u_admin","email":"admin@portea.com","name":"Admin",
//     "role":"admin","password_hash":"pbkdf2$210000$..."}]

export type UserRole = "admin" | "cm";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password_hash: string;
};

function isValidUser(value: unknown): value is AdminUser {
  if (!value || typeof value !== "object") return false;
  const u = value as Partial<AdminUser>;
  return (
    typeof u.email === "string" &&
    typeof u.name === "string" &&
    typeof u.password_hash === "string" &&
    (u.role === "admin" || u.role === "cm")
  );
}

export function readUsers(): AdminUser[] {
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
  return parsed
    .filter(isValidUser)
    .map((u) => ({
      ...u,
      id: u.id?.trim() || `u_${u.email.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
      email: u.email.toLowerCase().trim(),
    }));
}

export function findUserByEmail(email: string): AdminUser | null {
  const target = email.trim().toLowerCase();
  if (!target) return null;
  return readUsers().find((u) => u.email === target) ?? null;
}
