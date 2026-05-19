import { NextResponse } from "next/server";

import { isAdminAuthed, isAdminConfigured } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Forwards CM updates back to the Google Sheet through the same Apps Script
// Web App URL we use for writes. The Apps Script must implement a doPost
// branch when body.action === "update_lead" (see the docs/apps-script.md
// snippet for the exact code to paste).
export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ ok: false, error: "Admin disabled" }, { status: 503 });
  }
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const webhookRaw = process.env.PORTEA_LEADS_WEBHOOK_URL?.trim();
  const secret = process.env.PORTEA_LEADS_READ_SECRET?.trim();
  if (!webhookRaw || !secret) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "PORTEA_LEADS_WEBHOOK_URL and PORTEA_LEADS_READ_SECRET must be set to enable status updates.",
      },
      { status: 503 },
    );
  }

  let url: URL;
  try {
    url = new URL(webhookRaw);
  } catch {
    return NextResponse.json({ ok: false, error: "Webhook URL invalid" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_lead",
        secret,
        ...body,
      }),
      signal: AbortSignal.timeout(10_000),
      redirect: "follow",
    });
    const text = await upstream.text();
    if (!upstream.ok) {
      // eslint-disable-next-line no-console
      console.warn("[admin/update] apps script non-2xx", upstream.status, text);
      return NextResponse.json(
        { ok: false, error: `Apps Script returned ${upstream.status}` },
        { status: 502 },
      );
    }
    try {
      const parsed = JSON.parse(text) as { ok?: boolean; error?: string };
      if (parsed.ok === false) {
        return NextResponse.json(
          { ok: false, error: parsed.error || "Update rejected" },
          { status: 400 },
        );
      }
      return NextResponse.json({ ok: true });
    } catch {
      // Apps Script returned non-JSON; treat as success since HTTP was 200.
      return NextResponse.json({ ok: true });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[admin/update] forward failed", err);
    return NextResponse.json({ ok: false, error: "Network error" }, { status: 502 });
  }
}
