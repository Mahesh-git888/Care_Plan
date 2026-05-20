import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { isValidIndianMobile, normalizePhone } from "@/lib/chatbot";
import { verticals, type VerticalSlug } from "@/data/verticals";
import { appendLead, maskPhone, type LeadAttribution } from "@/lib/lead-store";

type IntakePayload = {
  full_name?: string;
  phone?: string;
  city?: string;
  situation?: string;
  vertical?: string;
  ab_variant?: string;
  elder_name?: string;
  condition?: string;
  needs?: string;
  relationship?: string;
  consent_given?: boolean;
  attribution?: LeadAttribution;
};

function isVerticalSlug(value: string): value is VerticalSlug {
  return value in verticals;
}

export async function POST(request: Request) {
  let body: IntakePayload;
  try {
    body = (await request.json()) as IntakePayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const fullName = body.full_name?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const city = body.city?.trim() ?? "";
  const vertical = body.vertical?.trim() ?? "";
  // Situation is optional. The chatbot supplies a rich narrative; the short
  // landing-page lead form omits it. Fall back to a placeholder so the care
  // manager can spot which intake path a lead came through.
  const situation =
    body.situation?.trim() || "Landing page lead form. Care manager to gather details on call.";

  if (!fullName || !phone || !city || !vertical) {
    return NextResponse.json(
      { error: "Please share your name, phone, city and the care program." },
      { status: 400 },
    );
  }

  if (!isVerticalSlug(vertical)) {
    return NextResponse.json(
      { error: "Please provide a valid care vertical." },
      { status: 400 },
    );
  }

  if (!isValidIndianMobile(phone)) {
    return NextResponse.json(
      { error: "Please provide a valid 10-digit Indian mobile number (starts with 6, 7, 8 or 9)." },
      { status: 400 },
    );
  }
  const normalizedPhone = normalizePhone(phone);

  if (!body.consent_given) {
    return NextResponse.json(
      { error: "We need your consent to call you back." },
      { status: 400 },
    );
  }

  const patientId = randomUUID();
  const receivedAt = new Date().toISOString();

  try {
    await appendLead({
      id: patientId,
      kind: "intake",
      created_at: receivedAt,
      vertical,
      full_name: fullName,
      phone: normalizedPhone,
      city,
      situation,
      ab_variant: body.ab_variant?.trim() || undefined,
      elder_name: body.elder_name?.trim() || undefined,
      condition: body.condition?.trim() || undefined,
      needs: body.needs?.trim() || undefined,
      relationship: body.relationship?.trim() || undefined,
      consent_given: true,
      status: "new",
      attribution: body.attribution ?? {},
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[intake] failed to save lead", err);
    return NextResponse.json(
      { error: "We couldn't save your request. Please try again or call us." },
      { status: 503 },
    );
  }

  // eslint-disable-next-line no-console
  console.log("[intake]", {
    patient_id: patientId,
    vertical,
    ab_variant: body.ab_variant ?? null,
    city,
    phone: maskPhone(normalizedPhone),
    utm_source: body.attribution?.utm_source ?? null,
    utm_campaign: body.attribution?.utm_campaign ?? null,
  });

  return NextResponse.json({
    patient_id: patientId,
    status: "new",
    submittedAt: receivedAt,
  });
}
