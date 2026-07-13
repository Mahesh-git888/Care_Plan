// Forward a paid lead to the Portea sales team's ops webhook (Unbounce-style
// ingestion at .../webservice/ubWebhook).
//
// PROVEN FORMAT (verified against stage.ops, returns {"status":"success"}):
//   POST application/x-www-form-urlencoded with ONE field:
//     data_json=<JSON string>   — a flat object whose EVERY value is a
//       single-element array, e.g. {"mobile":["98..."]}.
//
// From the receiver (Unbounce::process) and the cron (processUnbounceLeads):
//   - The field is read as $this->input->post('data_json'). PHP also maps a
//     posted "data.json" onto that name, but we send data_json explicitly.
//   - `page_uuid` must be present and NON-EMPTY inside the JSON. It is only an
//     empty() check, there is NO registry lookup, so any stable id works. It is
//     stored on unbounce_log purely to label the source page.
//   - `mobile` must be non-empty.
//   - `variant`, `utm_source` and `otp_enabled` are read without an isset
//     guard, so always send them.
//   - `otp_enabled: 0` makes the cron create the lead without an OTP gate (we
//     already validate the phone and capture consent on our side).
//   - An unrecognised `service` silently becomes "Physiotherapy" in the cron,
//     so it must match an ops service name exactly.
//
// Server-side only. Safe no-op until SALES_WEBHOOK_URL is set.

import type { LeadRecord } from "@/lib/lead-types";

// Ops service name each program maps to. TODO(ops): Loka gave
// "12 Hr Nursing - Classic"; confirm whether dementia and post-discharge
// should map to a different service.
const DEFAULT_SERVICE = "12 Hr Nursing - Classic";

const SERVICE_BY_VERTICAL: Record<string, string> = {
  "elder-care": process.env.SALES_SERVICE_ELDER_CARE?.trim() || DEFAULT_SERVICE,
  dementia: process.env.SALES_SERVICE_DEMENTIA?.trim() || DEFAULT_SERVICE,
  "post-discharge":
    process.env.SALES_SERVICE_POST_DISCHARGE?.trim() || DEFAULT_SERVICE,
};

// Stable per-program identifiers stored on unbounce_log.page_uuid so ops can
// tell which care.portea.com page a lead came from. Any non-empty value is
// accepted; these are ours, not Unbounce's.
const PAGE_UUID_BY_VERTICAL: Record<string, string> = {
  "elder-care":
    process.env.SALES_PAGE_UUID_ELDER_CARE?.trim() ||
    "c1f4e2a0-7b3d-4c8e-9a15-6d2b8e0f3a71",
  dementia:
    process.env.SALES_PAGE_UUID_DEMENTIA?.trim() ||
    "2b6d9c14-8e05-4f37-a6c1-93f7d5b2e480",
  "post-discharge":
    process.env.SALES_PAGE_UUID_POST_DISCHARGE?.trim() ||
    "7f3a5e28-1c94-4b6d-8e02-af51c73d9b64",
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

export type SalesForwardResult = {
  ok: boolean;
  // "ok" | "skipped:no-url" | "skipped:no-phone" | "http:<code> <body>"
  //  | "error:<name>"
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
  const attr = lead.attribution ?? {};
  const program = PROGRAM_LABEL[vertical] ?? vertical;
  const service = SERVICE_BY_VERTICAL[vertical] ?? DEFAULT_SERVICE;
  const pageUuid =
    PAGE_UUID_BY_VERTICAL[vertical] ||
    process.env.SALES_PAGE_UUID?.trim() ||
    "care-portea-com";

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

  // Unbounce shape: flat object, every value a single-element array. Every key
  // the receiver or the cron reads without an isset() guard must be present.
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
    adCampaign: [""],
    adGroup: [""],
    adCity: ["others"],
    gclid: [attr.gclid ?? ""],
    variant: [lead.ab_variant ?? "a"],
    otp_enabled: ["0"],
    is_rtb: ["0"],
    ticket_status: ["open"],
    loadToDialer: ["1"],
    promo_code: [""],
    terms: [CONSENT_TEXT],
  };

  const form = new URLSearchParams();
  form.append("data_json", JSON.stringify(data));

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
