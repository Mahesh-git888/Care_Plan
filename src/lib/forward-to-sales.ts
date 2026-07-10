// Forward a paid lead to the Portea sales team's ops webhook (Unbounce-style
// ingestion at .../webservice/ubWebhook).
//
// PROVEN FORMAT (verified by probing stage.ops directly):
//   POST application/x-www-form-urlencoded with two fields:
//     page_uuid=<registered page uuid>   — top-level. The endpoint looks this
//       up in its pages registry and answers 400 "page_uuid not found!" if it
//       is missing OR not registered in that ops environment (stage uuids and
//       prod uuids differ).
//     data.json=<JSON string>            — a flat object whose EVERY value is a
//       single-element array, e.g. {"mobile":["98..."]}. The cron consumer
//       (processUnbounceLeads) decodes this and pushes it to the lead API.
//
// REQUIRED FROM OPS before this can succeed (set via env, no code change):
//   SALES_PAGE_UUID[_<VERTICAL>] — a page_uuid registered in the SAME ops env
//     we post to. Without a valid one the endpoint rejects every lead.
//   SALES_SERVICE_<VERTICAL>     — the exact ops service name. Unknown names
//     fall back to "Physiotherapy" inside the consumer.
//
// Server-side only. Safe no-op until SALES_WEBHOOK_URL + a page_uuid are set.

import type { LeadRecord } from "@/lib/lead-types";

// Ops service name each program maps to. TODO(ops): confirm exact strings.
const SERVICE_BY_VERTICAL: Record<string, string> = {
  "elder-care": process.env.SALES_SERVICE_ELDER_CARE?.trim() || "Elder Care",
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

// The registered ops page_uuid to file this lead under. A per-vertical override
// falls back to a single shared uuid. Must be registered in the ops env we post
// to, or the endpoint answers "page_uuid not found!".
function pageUuidFor(vertical: string): string {
  const perVertical =
    vertical === "elder-care"
      ? process.env.SALES_PAGE_UUID_ELDER_CARE
      : vertical === "dementia"
        ? process.env.SALES_PAGE_UUID_DEMENTIA
        : vertical === "post-discharge"
          ? process.env.SALES_PAGE_UUID_POST_DISCHARGE
          : undefined;
  return perVertical?.trim() || process.env.SALES_PAGE_UUID?.trim() || "";
}

export type SalesForwardResult = {
  ok: boolean;
  // "ok" | "skipped:no-url" | "skipped:no-phone" | "skipped:no-page-uuid"
  //  | "http:<code> <body>" | "error:<name>"
  status: string;
};

export async function forwardLeadToSales(
  lead: LeadRecord,
): Promise<SalesForwardResult> {
  const url = process.env.SALES_WEBHOOK_URL?.trim();
  if (!url) return { ok: false, status: "skipped:no-url" };

  const mobile = tenDigit(lead.phone);
  if (mobile.length !== 10) return { ok: false, status: "skipped:no-phone" };

  const vertical = lead.vertical ?? "";
  const pageUuid = pageUuidFor(vertical);
  // No registered page_uuid → the endpoint would reject it. Skip and fall back
  // to the care team rather than fire a request we know will 400.
  if (!pageUuid) return { ok: false, status: "skipped:no-page-uuid" };

  const attr = lead.attribution ?? {};
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

  // Unbounce data.json shape: flat object, every value a single-element array.
  const data: Record<string, [string]> = {
    page_uuid: [pageUuid],
    name: [clean(lead.full_name) || "Unknown"],
    mobile: [mobile],
    email: [""],
    gender: [""],
    city: [clean(lead.city)],
    service: [service],
    category: ["sales"],
    subcategory: ["general"],
    brandId: [process.env.SALES_BRAND_ID?.trim() || "1"],
    page_type: ["general"],
    page_name: [`care.portea.com ${program}`.trim()],
    page_url: [pageUrl],
    comments: [comments],
    unique_id_for_lead: [lead.id],
    utm_source: [attr.utm_source ?? ""],
    utm_medium: [attr.utm_medium ?? ""],
    utm_campaign: [attr.utm_campaign ?? ""],
    utm_term: [attr.utm_term ?? ""],
    utm_content: [attr.utm_content ?? ""],
    gclid: [attr.gclid ?? ""],
    variant: [lead.ab_variant ?? ""],
    // otp_enabled=0 tells the consumer to create the lead without an OTP gate
    // (we already validate the phone + capture consent on our side).
    otp_enabled: ["0"],
    ticket_status: ["open"],
    loadToDialer: ["1"],
    terms: [CONSENT_TEXT],
  };

  const form = new URLSearchParams();
  form.append("page_uuid", pageUuid);
  form.append("data.json", JSON.stringify(data));

  const token = process.env.SALES_WEBHOOK_TOKEN?.trim();

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: form.toString(),
      signal: AbortSignal.timeout(8_000),
    });
    if (res.ok) return { ok: true, status: "ok" };
    // Capture a snippet of the endpoint's error so failures are diagnosable
    // from the dashboard / DB (sales_forward_status) without digging in logs.
    let detail = "";
    try {
      detail = (await res.text()).replace(/\s+/g, " ").trim().slice(0, 140);
    } catch {
      /* body unreadable; the status code alone still tells us something */
    }
    // eslint-disable-next-line no-console
    console.warn("[forward-to-sales] webhook non-2xx", res.status, detail);
    return { ok: false, status: `http:${res.status}${detail ? ` ${detail}` : ""}` };
  } catch (err) {
    const name = err instanceof Error ? err.name : "error";
    // eslint-disable-next-line no-console
    console.warn("[forward-to-sales] webhook failed (non-fatal)", err);
    return { ok: false, status: `error:${name}` };
  }
}
