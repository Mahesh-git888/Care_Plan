import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { isValidIndianMobile, normalizePhone } from "@/lib/chatbot";
import { verticals, type VerticalSlug } from "@/data/verticals";
import {
  appendLead,
  updateLeadIntake,
  maskPhone,
  type LeadAttribution,
} from "@/lib/lead-store";

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
  // Early-capture support. `partial` marks the first save, made as soon as we
  // have name + phone, so a visitor who drops off mid-chat is never lost. The
  // backend returns the new lead's id; the client sends it back as `lead_id`
  // on the final submit so we patch that same row instead of creating a dupe.
  lead_id?: string;
  partial?: boolean;
};

// Shown in the dashboard for fields the visitor has not reached yet on a
// partial (early-capture) lead. The care manager sees the lead immediately and
// these get overwritten the moment the visitor finishes the chat.
const PENDING = "Awaiting details";

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

  const partial = body.partial === true;
  const leadId = body.lead_id?.trim() ?? "";

  const fullName = body.full_name?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const city = body.city?.trim() ?? "";
  const vertical = body.vertical?.trim() ?? "";

  // Name + phone + a valid vertical are required on every call, partial or not:
  // they are the minimum a care manager needs to make contact.
  if (!fullName || !phone || !vertical) {
    return NextResponse.json(
      { error: "Please share your name, phone and the care program." },
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

  // City and consent are only enforced on the final submit. A partial early
  // capture happens before the visitor has necessarily reached those, and the
  // whole point is to not block on them.
  if (!partial) {
    if (!city) {
      return NextResponse.json(
        { error: "Please share the elder's city or area." },
        { status: 400 },
      );
    }
    if (!body.consent_given) {
      return NextResponse.json(
        { error: "We need your consent to call you back." },
        { status: 400 },
      );
    }
  }

  const receivedAt = new Date().toISOString();

  // The chatbot builds a rich narrative on the final submit. Before that, mark
  // the lead clearly as an early capture so a care manager knows the detail is
  // still incomplete.
  const situation =
    body.situation?.trim() ||
    (partial
      ? "Early capture: visitor shared name and phone but had not finished the chat. Care manager to gather full details on call."
      : "Landing page lead. Care manager to gather details on call.");

  // --- Update path: this lead already exists from an earlier partial capture.
  // Patch it with whatever we now have rather than inserting a duplicate.
  if (leadId) {
    try {
      const updated = await updateLeadIntake({
        id: leadId,
        full_name: fullName,
        phone: normalizedPhone,
        city: city || undefined,
        vertical,
        situation,
        ab_variant: body.ab_variant?.trim() || undefined,
        elder_name: body.elder_name?.trim() || undefined,
        condition: body.condition?.trim() || undefined,
        needs: body.needs?.trim() || undefined,
        relationship: body.relationship?.trim() || undefined,
        consent_given: body.consent_given ?? undefined,
        attribution: body.attribution,
      });

      if (updated) {
        // eslint-disable-next-line no-console
        console.log("[intake] patched", {
          patient_id: leadId,
          vertical,
          partial,
          phone: maskPhone(normalizedPhone),
        });
        return NextResponse.json({
          patient_id: leadId,
          status: "new",
          submittedAt: receivedAt,
          updated: true,
        });
      }
      // Row vanished (e.g. pruned). Fall through and create a fresh one.
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[intake] failed to patch lead", err);
      return NextResponse.json(
        { error: "We couldn't save your request. Please try again or call us." },
        { status: 503 },
      );
    }
  }

  // --- Create path: a fresh lead. For a partial capture, fill the fields the
  // visitor has not reached with a clear placeholder so the row is usable.
  const patientId = randomUUID();

  try {
    await appendLead({
      id: patientId,
      kind: "intake",
      created_at: receivedAt,
      vertical,
      full_name: fullName,
      phone: normalizedPhone,
      city: city || (partial ? PENDING : ""),
      situation,
      ab_variant: body.ab_variant?.trim() || undefined,
      elder_name: body.elder_name?.trim() || (partial ? PENDING : undefined),
      condition: body.condition?.trim() || (partial ? PENDING : undefined),
      needs: body.needs?.trim() || (partial ? PENDING : undefined),
      relationship: body.relationship?.trim() || (partial ? PENDING : undefined),
      consent_given: body.consent_given ?? (partial ? false : true),
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
    partial,
    ab_variant: body.ab_variant ?? null,
    city: city || null,
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
