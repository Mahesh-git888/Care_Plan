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
};

function isVerticalSlug(value: string): value is VerticalSlug {
  return value in verticals;
}

export async function POST(request: Request) {
  const body = (await request.json()) as IntakePayload;

  const fullName = body.full_name?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const city = body.city?.trim() ?? "";
  const situation = body.situation?.trim() ?? "";
  const vertical = body.vertical?.trim() ?? "";

  if (!fullName || !phone || !city || !situation || !vertical) {
    return NextResponse.json(
      { error: "All intake fields are required." },
      { status: 400 },
    );
  }

  if (!isVerticalSlug(vertical)) {
    return NextResponse.json(
      { error: "Please provide a valid care vertical." },
      { status: 400 },
    );
  }

  if (phone.replace(/\D/g, "").length < 8) {
    return NextResponse.json(
      { error: "Please provide a valid phone number." },
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
    status: "PENDING_CM_ASSIGNMENT",
  };

  console.log("intake submission", submission);

  return NextResponse.json({
    patient_id: submission.patient_id,
    status: submission.status,
  });
}
