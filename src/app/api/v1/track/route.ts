import { randomUUID, createHash } from "node:crypto";

import { NextResponse } from "next/server";

import { appendLead, type LeadAttribution } from "@/lib/lead-store";

type TrackPayload = {
  kind?: "call_click" | "whatsapp_click";
  vertical?: string;
  target?: string;
  attribution?: LeadAttribution;
};

function hashIp(ip: string | null) {
  if (!ip) return undefined;
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function POST(request: Request) {
  let body: TrackPayload;
  try {
    body = (await request.json()) as TrackPayload;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const kind = body.kind;
  if (kind !== "call_click" && kind !== "whatsapp_click") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;

  try {
    await appendLead({
      id: randomUUID(),
      kind,
      created_at: new Date().toISOString(),
      vertical: body.vertical,
      click_target: body.target,
      user_agent: request.headers.get("user-agent") ?? undefined,
      ip_hash: hashIp(ip),
      attribution: body.attribution ?? {},
    });
  } catch (err) {
    // Click tracking is best-effort. Never surface an error to sendBeacon.
    // eslint-disable-next-line no-console
    console.warn("[track] failed to save click event", err);
  }

  // 204 keeps sendBeacon happy.
  return new NextResponse(null, { status: 204 });
}
