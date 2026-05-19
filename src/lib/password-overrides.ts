// Password overrides.
//
// The seed passwords for each user live in PORTEA_USERS_JSON. Once a user
// changes their password through the dashboard we need to persist the new
// hash somewhere the running app can both read and write. Vercel env vars
// only support reads, so we use the existing Google Sheets + Apps Script
// pipeline: a "PasswordOverrides" tab that the app upserts via doPost and
// reads via doGet.
//
// Lookup order on login:
//   1. Override row in Sheets   (newest password)
//   2. password_hash in PORTEA_USERS_JSON   (seed)
//   3. PORTEA_ADMIN_PASSWORD     (legacy fallback)
//
// Reads are cached for 60s per Vercel instance to avoid hammering Apps Script
// on every login attempt.

const CACHE_TTL_MS = 60_000;

type OverrideEntry = {
  email: string;
  password_hash: string;
  updated_at?: string;
};

let cache: { at: number; entries: Map<string, OverrideEntry> } | null = null;

function getWebhookUrl(): URL | null {
  const raw = process.env.PORTEA_LEADS_WEBHOOK_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

export function invalidateOverrideCache(): void {
  cache = null;
}

export async function fetchPasswordOverrides(): Promise<Map<string, OverrideEntry>> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.entries;

  const webhook = getWebhookUrl();
  const secret = process.env.PORTEA_LEADS_READ_SECRET?.trim();
  if (!webhook || !secret) {
    // No persistence configured. Return an empty map so the caller falls
    // back to seed credentials.
    return new Map();
  }

  const url = new URL(webhook.toString());
  url.searchParams.set("secret", secret);
  url.searchParams.set("action", "get_password_overrides");

  try {
    const res = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
      redirect: "follow",
    });
    if (!res.ok) return cache?.entries ?? new Map();
    const body = (await res.json()) as {
      ok?: boolean;
      overrides?: Array<{ email?: string; password_hash?: string; updated_at?: string }>;
    };
    if (!body.ok || !Array.isArray(body.overrides)) {
      return cache?.entries ?? new Map();
    }
    const map = new Map<string, OverrideEntry>();
    for (const row of body.overrides) {
      const email = String(row.email ?? "").toLowerCase().trim();
      const hash = String(row.password_hash ?? "").trim();
      if (email && hash) {
        map.set(email, {
          email,
          password_hash: hash,
          updated_at: row.updated_at ? String(row.updated_at) : undefined,
        });
      }
    }
    cache = { at: Date.now(), entries: map };
    return map;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[password-overrides] fetch failed", err);
    return cache?.entries ?? new Map();
  }
}

export async function getOverrideForEmail(email: string): Promise<OverrideEntry | null> {
  const key = email.toLowerCase().trim();
  if (!key) return null;
  const map = await fetchPasswordOverrides();
  return map.get(key) ?? null;
}

export async function setPasswordOverride(
  email: string,
  passwordHash: string,
  updatedBy: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const webhook = getWebhookUrl();
  const secret = process.env.PORTEA_LEADS_READ_SECRET?.trim();
  if (!webhook || !secret) {
    return {
      ok: false,
      error:
        "Password persistence requires PORTEA_LEADS_WEBHOOK_URL and PORTEA_LEADS_READ_SECRET on the server.",
    };
  }

  try {
    const res = await fetch(webhook.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "set_user_password",
        secret,
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        updated_by: updatedBy,
      }),
      signal: AbortSignal.timeout(10_000),
      redirect: "follow",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      // eslint-disable-next-line no-console
      console.warn("[password-overrides] upstream non-2xx", res.status, text);
      return { ok: false, error: `Apps Script returned ${res.status}` };
    }
    // Optimistically clear the cache so the next login reads the new hash.
    invalidateOverrideCache();
    return { ok: true };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[password-overrides] post failed", err);
    return { ok: false, error: "Network error while saving the new password." };
  }
}
