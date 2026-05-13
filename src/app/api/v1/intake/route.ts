import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { verticals, type VerticalSlug } from "@/data/verticals";

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

  const submission = {
    patient_id: randomUUID(),
    full_name: fullName,
    phone,
    city,
    situation,
    vertical,
    ab_variant: body.ab_variant?.trim() || null,
    elder_name: body.elder_name?.trim() ?? null,
    condition: body.condition?.trim() ?? null,
    needs: body.needs?.trim() ?? null,
    relationship: body.relationship?.trim() ?? null,
    consent_given: true,
    status: "PENDING_CM_ASSIGNMENT",
    received_at: new Date().toISOString(),
  };

  // Mask phone for logging (PII): keep country + last 2 digits visible.
  const digits = phone.replace(/\D/g, "");
  const maskedPhone =
    digits.length >= 4 ? `${digits.slice(0, 2)}******${digits.slice(-2)}` : "***";
  // eslint-disable-next-line no-console
  console.log("[intake]", {
    patient_id: submission.patient_id,
    vertical: submission.vertical,
    ab_variant: submission.ab_variant,
    city: submission.city,
    phone: maskedPhone,
    status: submission.status,
  });

  // TODO: forward to upstream FastAPI service when NEXT_PUBLIC_INTAKE_API_URL is configured.
  return NextResponse.json({
    patient_id: submission.patient_id,
    status: submission.status,
    submittedAt: submission.received_at,
  });
}
