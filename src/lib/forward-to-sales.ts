// Forward a paid lead to the Portea sales team's ops webhook (Unbounce-style
// ingestion at .../webservice/ubWebhook).
//
// The endpoint expects the Unbounce shape: a flat object where EVERY value is
// a single-element array of strings, e.g. {"mobile":["9899817922"]}. The ops
// consumer (processUnbounceLeads) logs the request, then a cron pushes it into
// Portea's internal lead API, creating a ticket + dialer entry.
//
// Server-side only (reads env, makes an outbound request). No-op unless
// SALES_WEBHOOK_URL is set, so it is safe to deploy before the URL is wired.
//
// IMPORTANT (ops consumer behaviour): if `service` is empty or unrecognised,
// the consumer DEFAULTS it to "Physiotherapy". So SERVICE_BY_VERTICAL below
// MUST be set to the real ops service names before production forwarding — the
// placeholders are almost certainly not what the ops DB expects. Confirm the
// exact strings with the ops team and set them here or via env.

import type { LeadRecord } from "@/lib/lead-types";

// Ops service name each program maps to. Env overrides let staging/prod differ
// without a code change. TODO(ops): confirm exact service strings with Loka.
const SERVICE_BY_VERTICAL: Record<string, string> = {
  "elder-care":
    process.env.SALES_SERVICE_ELDER_CARE?.trim() || "Elder Care",
  dementia: process.env.SALES_SERVICE_DEMENTIA?.trim() || "Dementia Care",
  "post-discharge":
    process.env.SALES_SERVICE_POST_DISCHARGE?.trim() ||
    "Post Hospitalization Care",
};

const PROGRAM_LABEL: Record<string, string> = {
  "elder-care": "Elder Care",
  dementia: "Dementia Care",
  "post-discharge": "Post-Discharge Care",
};

const CONSENT_TEXT =
  "I authorize Portea to contact me and I understand that this will override the DND status on my mobile number";

const PENDING = "Awaiting details";

function clean(v?: string | null): string {
  const s = (v ?? "").trim();
  return s === PENDING ? "" : s;
}

function tenDigit(phone?: string | null): string {
  return (phone ?? "").replace(/\D/g, "").slice(-10);
}

// Wrap a value in the single-element array the ops webhook expects.
function w(v?: string | null): [string] {
  return [v == null ? "" : String(v)];
}

export type SalesForwardResult = {
  ok: boolean;
  // "ok" | "skipped:no-url" | "skipped:no-phone" | "http:<code>" | "error:<name>"
  status: string;
};

export async function forwardLeadToSales(
  lead: LeadRecord,
): Promise<SalesForwardResult> {
  const url = process.env.SALES_WEBHOOK_URL?.trim();
  if (!url) return { ok: false, status: "skipped:no-url" };

  const mobile = tenDigit(lead.phone);
  if (mobile.length !== 10) return { ok: false, status: "skipped:no-phone" };

  const attr = lead.attribution ?? {};
  const vertical = lead.vertical ?? "";
  const program = PROGRAM_LABEL[vertical] ?? vertical;
  const service = SERVICE_BY_VERTICAL[vertical] ?? "";

  // A readable note for the dialer agent, built from whatever we captured.
  const comments = [
    program && `Program: ${program}`,
    clean(lead.condition) && `Condition: ${clean(lead.condition)}`,
    clean(lead.needs) && `Needs: ${clean(lead.needs)}`,
    clean(lead.relationship) && `Relationship: ${clean(lead.relationship)}`,
    clean(lead.situation),
  ]
    .filter(Boolean)
    .join(". ");

  const pageUrl = attr.landing_path
    ? `https://care.portea.com${attr.landing_path}`
    : `https://care.portea.com/${vertical}`.replace(/\/$/, "");

  const payload: Record<string, [string]> = {
    name: w(clean(lead.full_name) || "Unknown"),
    mobile: w(mobile),
    city: w(clean(lead.city)),
    service: w(service),
    category: w("sales"),
    subcategory: w("general"),
    brandId: w(process.env.SALES_BRAND_ID?.trim() || "1"),
    comments: w(comments),
    page_name: w(`care.portea.com ${program}`.trim()),
    page_url: w(pageUrl),
    unique_id_for_lead: w(lead.id),
    utm_source: w(attr.utm_source),
    utm_medium: w(attr.utm_medium),
    utm_campaign: w(attr.utm_campaign),
    utm_term: w(attr.utm_term),
    utm_content: w(attr.utm_content),
    gclid: w(attr.gclid),
    variant: w(lead.ab_variant),
    terms: w(CONSENT_TEXT),
  };

  const token = process.env.SALES_WEBHOOK_TOKEN?.trim();

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8_000),
    });
    return { ok: res.ok, status: res.ok ? "ok" : `http:${res.status}` };
  } catch (err) {
    const name = err instanceof Error ? err.name : "error";
    // eslint-disable-next-line no-console
    console.warn("[forward-to-sales] webhook failed (non-fatal)", err);
    return { ok: false, status: `error:${name}` };
  }
}
