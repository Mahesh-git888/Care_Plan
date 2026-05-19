import { NextResponse } from "next/server";

import {
  audit,
  extractClientIp,
  getSession,
  isAdminConfigured,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function normalizeName(name: string | undefined | null): string {
  return (name ?? "").trim().toLowerCase();
}
function firstWord(name: string | undefined | null): string {
  return normalizeName(name).split(/\s+/)[0] ?? "";
}

// Forwards CM updates back to the Google Sheet through the same Apps Script
// Web App URL we use for writes. The Apps Script must implement a doPost
// branch when body.action === "update_lead" (see the docs/apps-script.md
// snippet for the exact code to paste).
export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ ok: false, error: "Admin disabled" }, { status: 503 });
  }
  const session = await getSession();
  if (!session) {
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

  // Per-CM lead-write scoping. A CM may update leads where the existing
  // care_manager is unassigned, themselves, or where they're being assigned
  // to themselves. They cannot reassign or modify another CM's lead. Admins
  // bypass this check entirely.
  if (session.role === "cm") {
    const mineFull = normalizeName(session.name);
    const mineFirst = firstWord(session.name);
    const existing = normalizeName(body.existing_care_manager as string | undefined);
    const incoming = normalizeName(body.care_manager as string | undefined);

    const isMine = (cm: string) =>
      !cm || cm === "unassigned" || cm === mineFull || cm === mineFirst || firstWord(cm) === mineFirst;

    if (!isMine(existing) || (incoming && !isMine(incoming))) {
      audit({
        type: "auth.login.failure",
        ts: new Date().toISOString(),
        email: session.email,
        user_id: session.sub,
        ip: extractClientIp(request),
        reason: "lead_update_out_of_scope",
      });
      return NextResponse.json(
        { ok: false, error: "You can only update leads assigned to you or unassigned leads." },
        { status: 403 },
      );
    }
  }

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_lead",
        secret,
        updated_by: session.email,
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
