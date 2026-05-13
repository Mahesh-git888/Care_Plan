import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

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
  const situation = body.situation?.trim() ?? "";
  const vertical = body.vertical?.trim() ?? "";

  if (!fullName || !phone || !city || !situation || !vertical) {
    return NextResponse.json(
      { error: "Please complete every step of the intake." },
      { status: 400 },
    );
  }

  if (!isVerticalSlug(vertical)) {
    return NextResponse.json(
      { error: "Please provide a valid care vertical." },
      { status: 400 },
    );
  }

  if (phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json(
      { error: "Please provide a valid 10-digit phone number." },
      { status: 400 },
    );
  }

  if (!body.consent_given) {
    return NextResponse.json(
      { error: "We need your consent to call you back." },
      { status: 400 },
    );
  }

  const patientId = randomUUID();
  const receivedAt = new Date().toISOString();

  await appendLead({
    id: patientId,
    kind: "intake",
    created_at: receivedAt,
    vertical,
    full_name: fullName,
    phone,
    city,
    situation,
    ab_variant: body.ab_variant?.trim() || undefined,
    elder_name: body.elder_name?.trim() || undefined,
    condition: body.condition?.trim() || undefined,
    needs: body.needs?.trim() || undefined,
    relationship: body.relationship?.trim() || undefined,
    consent_given: true,
    status: "PENDING_CM_ASSIGNMENT",
    attribution: body.attribution ?? {},
  });

  // eslint-disable-next-line no-console
  console.log("[intake]", {
    patient_id: patientId,
    vertical,
    ab_variant: body.ab_variant ?? null,
    city,
    phone: maskPhone(phone),
    utm_source: body.attribution?.utm_source ?? null,
    utm_campaign: body.attribution?.utm_campaign ?? null,
  });

  return NextResponse.json({
    patient_id: patientId,
    status: "PENDING_CM_ASSIGNMENT",
    submittedAt: receivedAt,
  });
}
