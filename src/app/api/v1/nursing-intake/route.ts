// Nursing landing page intake. Every lead goes straight to the Portea ops
// Unbounce webhook (ubWebhook), the same endpoint the care flow forwards paid
// leads to. No database, no dashboard: this is a paid funnel where all leads
// belong with the sales/ops team. Uses the proven data_json form format.

import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { isValidIndianMobile, normalizePhone } from "@/lib/chatbot";

type LeadAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  msclkid?: string;
  landing_path?: string;
};

type Payload = {
  full_name?: string;
  phone?: string;
  city?: string;
  need?: string;
  duration?: string;
  attribution?: LeadAttribution;
};

const CONSENT_TEXT =
  "I authorize Portea to contact me and I understand that this will override the DND status on my mobile number";

// TODO(ops): confirm the exact service strings with Loka. The consumer defaults
// an unrecognised service to "Physiotherapy", so we send a known-good value and
// keep the visitor's actual selection in comments for the dialer agent.
const DEFAULT_SERVICE =
  process.env.SALES_SERVICE_NURSING?.trim() || "12 Hr Nursing - Classic";

const PAGE_UUID =
  process.env.SALES_PAGE_UUID_NURSING?.trim() || "care-portea-com-nursing-lp";

const w = (v?: string | null): [string] => [v == null ? "" : String(v)];

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = body.full_name?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const city = body.city?.trim() ?? "";
  if (!name || !isValidIndianMobile(phone) || !city) {
    return NextResponse.json(
      { error: "Please share your name, a valid 10-digit mobile number, and your city." },
      { status: 400 },
    );
  }

  const url = process.env.SALES_WEBHOOK_URL?.trim();
  if (!url) {
    // eslint-disable-next-line no-console
    console.error("[nursing-intake] SALES_WEBHOOK_URL not set; lead not forwarded", {
      city,
    });
    return NextResponse.json(
      { error: "We could not reach our team just now. Please call +91 91871 16003." },
      { status: 503 },
    );
  }

  const mobile = normalizePhone(phone).replace(/\D/g, "").slice(-10);
  const attr = body.attribution ?? {};
  const need = body.need?.trim() || "Not specified";
  const duration = body.duration?.trim() || "Not specified";
  const comments = `Nursing LP lead. Need: ${need}. Duration: ${duration}.`;
  const pageUrl = attr.landing_path
    ? `https://care.portea.com${attr.landing_path}`
    : "https://care.portea.com/nursing";

  const data: Record<string, [string]> = {
    page_uuid: w(PAGE_UUID),
    name: w(name),
    mobile: w(mobile),
    email: w(""),
    gender: w(""),
    city: w(city),
    service: w(DEFAULT_SERVICE),
    category: w("sales"),
    subcategory: w("general"),
    brandId: w(process.env.SALES_BRAND_ID?.trim() || "1"),
    page_type: w("general"),
    page_name: w("care.portea.com Nursing"),
    page_url: w(pageUrl),
    comments: w(comments),
    unique_id_for_lead: w(randomUUID()),
    utm_source: w(attr.utm_source),
    utm_medium: w(attr.utm_medium),
    utm_campaign: w(attr.utm_campaign),
    utm_term: w(attr.utm_term),
    utm_content: w(attr.utm_content),
    gclid: w(attr.gclid),
    variant: w("nursing"),
    otp_enabled: w("0"),
    is_rtb: w("0"),
    ticket_status: w("open"),
    loadToDialer: w("1"),
    promo_code: w(""),
    terms: w(CONSENT_TEXT),
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
      signal: AbortSignal.timeout(9000),
    });
    if (res.ok) return NextResponse.json({ ok: true });
    const detail = await res.text().catch(() => "");
    // eslint-disable-next-line no-console
    console.error("[nursing-intake] webhook non-2xx", res.status, detail.slice(0, 160));
    return NextResponse.json(
      { error: "We could not save your request. Please call +91 91871 16003." },
      { status: 502 },
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[nursing-intake] webhook failed", err);
    return NextResponse.json(
      { error: "We could not save your request. Please call +91 91871 16003." },
      { status: 502 },
    );
  }
}
