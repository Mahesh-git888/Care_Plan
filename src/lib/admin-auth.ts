// Admin authentication.
//
// Three pieces:
//   1. Password hashing  -- PBKDF2-SHA256, 210k iterations, 16-byte salt
//                          (OWASP 2023 recommendation, no external deps)
//   2. Session tokens    -- HMAC-SHA256 signed { email, role, exp } payload
//   3. Cookie management -- HttpOnly + Secure + SameSite=Lax, 24h Max-Age
//
// Backward compatibility: if PORTEA_USERS_JSON is unset, the old single-
// password flow keeps working against PORTEA_ADMIN_PASSWORD so a deploy
// doesn't immediately lock out the team. Once real user accounts are
// configured, remove PORTEA_ADMIN_PASSWORD to disable the fallback.

import crypto from "node:crypto";
import { cookies } from "next/headers";

import { execute, query } from "@/lib/db";
import { findUserByEmail, hasAnyUser, type UserRole } from "@/lib/users";

export const COOKIE_NAME = "portea_admin_session";

export const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24 hours

const PBKDF2_ITERATIONS = 210_000;
const PBKDF2_KEYLEN = 32;
const PBKDF2_DIGEST = "sha256";

export type SessionPayload = {
  sub: string; // user id
  email: string;
  name: string;
  role: UserRole;
  // Set when the user is on a temporary password (just created, or admin
  // reset). The dashboard forces a password change before unlocking the UI.
  mustChangePassword?: boolean;
  iat: number; // issued at, seconds since epoch
  exp: number; // expiry, seconds since epoch
};

// --- Password hashing ------------------------------------------------------

export function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(
    plain,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEYLEN,
    PBKDF2_DIGEST,
  );
  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = parseInt(parts[1], 10);
  if (!Number.isFinite(iterations) || iterations < 1000) return false;
  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(parts[2], "hex");
    expected = Buffer.from(parts[3], "hex");
  } catch {
    return false;
  }
  const got = crypto.pbkdf2Sync(plain, salt, iterations, expected.length, PBKDF2_DIGEST);
  if (got.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(got, expected);
  } catch {
    return false;
  }
}

// --- Session signing -------------------------------------------------------

function getAuthSecret(): string {
  const secret = process.env.PORTEA_AUTH_SECRET?.trim();
  if (secret && secret.length >= 16) return secret;
  // Soft fallback so the app doesn't crash if the env var is missing. NEVER
  // ship without setting PORTEA_AUTH_SECRET in production.
  return "dev-fallback-secret-do-not-use-in-production-please";
}

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64url(s: string): Buffer {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - (s.length % 4)) % 4);
  return Buffer.from(padded, "base64");
}

export function signSession(payload: SessionPayload): string {
  const body = base64url(Buffer.from(JSON.stringify(payload)));
  const sig = base64url(
    crypto.createHmac("sha256", getAuthSecret()).update(body).digest(),
  );
  return `${body}.${sig}`;
}

export function verifySession(token: string): SessionPayload | null {
  if (!token || typeof token !== "string") return null;
  const dot = token.indexOf(".");
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expectedSig = base64url(
    crypto.createHmac("sha256", getAuthSecret()).update(body).digest(),
  );
  // Constant-time comparison
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return null;
  try {
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  } catch {
    return null;
  }
  let payload: SessionPayload;
  try {
    payload = JSON.parse(fromBase64url(body).toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
  if (typeof payload.exp !== "number" || payload.exp < nowSeconds()) return null;
  return payload;
}

export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function buildSessionPayload(user: {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  mustChangePassword?: boolean;
}): SessionPayload {
  const iat = nowSeconds();
  return {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    ...(user.mustChangePassword ? { mustChangePassword: true } : {}),
    iat,
    exp: iat + SESSION_TTL_SECONDS,
  };
}

// --- Cookie helpers (server) ----------------------------------------------

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

// Back-compat wrapper. Existing routes call isAdminAuthed(); keep it.
export async function isAdminAuthed(): Promise<boolean> {
  return (await getSession()) !== null;
}

// True if any auth path is configured: PORTEA_USERS_JSON (seed), legacy
// PORTEA_ADMIN_PASSWORD, or at least one user already in the DB. Routes
// short-circuit with a 503 when this is false.
export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.PORTEA_USERS_JSON?.trim() || process.env.PORTEA_ADMIN_PASSWORD?.trim(),
  );
}

// --- Rate limiting (in-memory, per Vercel instance) -----------------------
//
// Caveat: Vercel runs multiple function instances. Counters live in each
// instance's memory, so a brute-force attacker could rotate across IPs or
// hit different instances and dilute the effect. For a small admin tool
// this raises the bar from zero to "annoying," which is the goal. For
// stronger protection, swap this for Vercel KV or Upstash Redis later.

const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const attemptsByKey = new Map<string, { count: number; firstAt: number }>();

function pruneStale(key: string) {
  const entry = attemptsByKey.get(key);
  if (entry && Date.now() - entry.firstAt > ATTEMPT_WINDOW_MS) {
    attemptsByKey.delete(key);
  }
}

export function isLoginRateLimited(key: string): boolean {
  pruneStale(key);
  const entry = attemptsByKey.get(key);
  return Boolean(entry && entry.count >= MAX_ATTEMPTS);
}

export function recordLoginAttempt(key: string, success: boolean): void {
  pruneStale(key);
  if (success) {
    attemptsByKey.delete(key);
    return;
  }
  const entry = attemptsByKey.get(key);
  if (!entry) {
    attemptsByKey.set(key, { count: 1, firstAt: Date.now() });
    return;
  }
  entry.count += 1;
}

export function loginAttemptsRemaining(key: string): number {
  pruneStale(key);
  const entry = attemptsByKey.get(key);
  if (!entry) return MAX_ATTEMPTS;
  return Math.max(0, MAX_ATTEMPTS - entry.count);
}

// --- Audit logging ---------------------------------------------------------
//
// Writes a single-line JSON record to stdout (visible in Vercel Runtime
// Logs). Lightweight, no external dependencies. Filter the logs by the
// "audit.*" prefix to see who signed in when.

export type AuditEvent = {
  type:
    | "auth.login.success"
    | "auth.login.failure"
    | "auth.login.rate_limited"
    | "auth.logout";
  ts: string;
  email?: string;
  user_id?: string;
  ip?: string;
  user_agent?: string;
  reason?: string;
};

export function audit(event: AuditEvent): void {
  // Always log to stdout (visible in Vercel Runtime Logs).
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(event));
  // Also persist to Postgres, fire-and-forget so it never blocks the request.
  void execute(
    `INSERT INTO login_audit (type, ts, email, user_id, ip, user_agent, reason)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      event.type,
      event.ts,
      event.email ?? null,
      event.user_id ?? null,
      event.ip ?? null,
      event.user_agent ?? null,
      event.reason ?? null,
    ],
  ).catch((err) => {
    // eslint-disable-next-line no-console
    console.warn("[audit] db write failed", err);
  });
}

export function extractClientIp(request: Request): string | undefined {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim();
  return request.headers.get("x-real-ip") ?? undefined;
}

// --- Credential check ------------------------------------------------------

export type LoginResult =
  | {
      ok: true;
      user: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        mustChangePassword: boolean;
      };
    }
  | { ok: false; reason: "not_configured" | "invalid_credentials" };

export async function attemptLogin(
  email: string | undefined,
  password: string,
): Promise<LoginResult> {
  if (!password) return { ok: false, reason: "invalid_credentials" };

  // Path 1: per-user accounts from the Postgres "users" table. The table is
  // auto-seeded from PORTEA_USERS_JSON on first read, so legacy deployments
  // keep working without any extra migration step.
  if (email) {
    const user = await findUserByEmail(email);
    if (user) {
      if (!user.active) return { ok: false, reason: "invalid_credentials" };
      if (!verifyPassword(password, user.password_hash)) {
        return { ok: false, reason: "invalid_credentials" };
      }
      return {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          mustChangePassword: user.must_change_password,
        },
      };
    }
  }

  // Path 2: legacy single-password fallback. Honoured only when no DB user
  // is configured at all.
  const legacyPassword = process.env.PORTEA_ADMIN_PASSWORD?.trim();
  if (legacyPassword) {
    if (password !== legacyPassword) {
      return { ok: false, reason: "invalid_credentials" };
    }
    return {
      ok: true,
      user: {
        id: "legacy-admin",
        email: email?.trim().toLowerCase() || "admin@portea.local",
        name: "Admin",
        role: "admin",
        mustChangePassword: false,
      },
    };
  }

  // No DB user found and no legacy password. Was the system ever configured
  // (env JSON set, or any user in DB)? If so, this is just a wrong-credentials
  // attempt. If not, the server has no auth set up at all.
  const usersJsonSet = Boolean(process.env.PORTEA_USERS_JSON?.trim());
  if (usersJsonSet) return { ok: false, reason: "invalid_credentials" };
  if (await hasAnyUser()) return { ok: false, reason: "invalid_credentials" };
  return { ok: false, reason: "not_configured" };
}
