// Client-side UTM / ad-attribution capture.
//
// On first visit we read tracking params from the URL and persist them to a
// first-party cookie that lives for one year. This survives tab closes and
// new sessions so that a visitor who clicks a Google Ad on Monday and
// finally submits a lead on Friday still carries Monday's GCLID through to
// the offline conversion upload.
//
// Cookie storage was chosen over localStorage because:
//  - Cookies are sent on cross-origin redirects (helpful if Portea ever
//    routes through Stripe or a payment provider)
//  - Cookies have a built-in expiry and are easy to clear
//  - A future server-side conversion upload can read the cookie directly
//
// We keep the existing readAttribution / clearAttribution surface so callers
// (chatbot, lead form, tracking provider) keep working without changes.

export type LeadAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
  landing_path?: string;
  landing_at?: string;
};

export const ATTRIBUTION_COOKIE = "portea_attribution_v2";
// Legacy key from the sessionStorage implementation. We read it once and
// migrate so anyone mid-funnel today does not lose their GCLID overnight.
const LEGACY_SESSION_KEY = "portea-attribution-v1";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const TRACKED_PARAMS: Array<keyof LeadAttribution> = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
];

function writeCookie(value: string) {
  if (typeof document === "undefined") return;
  const isSecure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  const parts = [
    `${ATTRIBUTION_COOKIE}=${encodeURIComponent(value)}`,
    `Path=/`,
    `Max-Age=${ONE_YEAR_SECONDS}`,
    `SameSite=Lax`,
  ];
  if (isSecure) parts.push("Secure");
  document.cookie = parts.join("; ");
}

function readCookie(): string | null {
  if (typeof document === "undefined") return null;
  const all = document.cookie ? document.cookie.split(";") : [];
  for (const raw of all) {
    const [name, ...rest] = raw.trim().split("=");
    if (name === ATTRIBUTION_COOKIE) {
      try {
        return decodeURIComponent(rest.join("="));
      } catch {
        return null;
      }
    }
  }
  return null;
}

function deleteCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${ATTRIBUTION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

// One-shot migration: if a visitor still has the old sessionStorage entry
// and no cookie yet, copy it into the cookie and clear the old key.
function migrateLegacyIfNeeded(): LeadAttribution | null {
  if (typeof window === "undefined") return null;
  if (readCookie()) return null;
  try {
    const legacy = window.sessionStorage.getItem(LEGACY_SESSION_KEY);
    if (!legacy) return null;
    const parsed = JSON.parse(legacy) as LeadAttribution;
    writeCookie(JSON.stringify(parsed));
    window.sessionStorage.removeItem(LEGACY_SESSION_KEY);
    return parsed;
  } catch {
    return null;
  }
}

export function captureAttributionFromUrl(): LeadAttribution {
  if (typeof window === "undefined") return {};

  migrateLegacyIfNeeded();

  const url = new URL(window.location.href);
  const next: LeadAttribution = {};

  for (const key of TRACKED_PARAMS) {
    const value = url.searchParams.get(key);
    if (value) next[key] = value;
  }

  const hasNewParam = TRACKED_PARAMS.some((k) => next[k]);
  if (!hasNewParam) {
    // No attribution params in the URL. Return whatever we already have so the
    // first-touch cookie is preserved.
    return readAttribution();
  }

  next.referrer = document.referrer || undefined;
  next.landing_path = url.pathname;
  next.landing_at = new Date().toISOString();

  try {
    writeCookie(JSON.stringify(next));
  } catch {
    /* cookie write may fail if disabled; non-fatal */
  }

  return next;
}

export function readAttribution(): LeadAttribution {
  const raw = readCookie();
  if (!raw) return {};
  try {
    return JSON.parse(raw) as LeadAttribution;
  } catch {
    return {};
  }
}

export function clearAttribution() {
  deleteCookie();
}
