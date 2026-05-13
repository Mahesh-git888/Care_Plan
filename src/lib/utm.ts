// Client-side UTM / ad-attribution capture.
// On first visit, we read tracking params from the URL and persist them to
// sessionStorage so the chatbot + click trackers can attach them to leads.
// Persisting in sessionStorage (not localStorage) keeps attribution scoped to
// the current visit, which matches how ad platforms reconcile conversions.

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

export const ATTRIBUTION_KEY = "portea-attribution-v1";

const TRACKED_PARAMS: Array<keyof LeadAttribution> = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
];

export function captureAttributionFromUrl(): LeadAttribution {
  if (typeof window === "undefined") return {};
  const url = new URL(window.location.href);
  const out: LeadAttribution = {};

  for (const key of TRACKED_PARAMS) {
    const value = url.searchParams.get(key);
    if (value) out[key] = value;
  }

  // Only persist new attribution if at least one param was present, otherwise
  // we'd wipe out previously stored attribution from the entry page.
  const hasParam = TRACKED_PARAMS.some((k) => out[k]);
  if (!hasParam) return readAttribution();

  out.referrer = document.referrer || undefined;
  out.landing_path = url.pathname;
  out.landing_at = new Date().toISOString();

  try {
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(out));
  } catch {
    /* sessionStorage may be disabled in incognito; non-fatal */
  }

  return out;
}

export function readAttribution(): LeadAttribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as LeadAttribution;
  } catch {
    return {};
  }
}

export function clearAttribution() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(ATTRIBUTION_KEY);
  } catch {
    /* noop */
  }
}
