import { NextResponse } from "next/server";

import { getSession, isAdminConfigured } from "@/lib/admin-auth";
import { getLeadById, updateLead, type LifecycleStatus } from "@/lib/lead-store";
import { LIFECYCLE_STATUSES } from "@/lib/lead-types";

export const dynamic = "force-dynamic";

function normalizeName(name: string | undefined | null): string {
  return (name ?? "").trim().toLowerCase();
}
function firstWord(name: string | undefined | null): string {
  return normalizeName(name).split(/\s+/)[0] ?? "";
}

// Updates a lead row directly in Postgres. Replaces the old Apps Script
// round-trip. Per-CM scoping is enforced here: a CM may only update leads
// assigned to them or unassigned leads.
export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ ok: false, error: "Admin disabled" }, { status: 503 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ ok: false, error: "Lead id is required" }, { status: 400 });
  }

  const lead = await getLeadById(id);
  if (!lead) {
    return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
  }

  // Per-CM scoping: a CM may only touch their own leads or unassigned ones,
  // and may only (re)assign to themselves. Admins bypass this.
  if (session.role === "cm") {
    const mineFull = normalizeName(session.name);
    const mineFirst = firstWord(session.name);
    const isMine = (cm: string) =>
      !cm ||
      cm === "unassigned" ||
      cm === mineFull ||
      cm === mineFirst ||
      firstWord(cm) === mineFirst;

    const existing = normalizeName(lead.care_manager);
    const incoming = normalizeName(body.care_manager as string | undefined);

    if (!isMine(existing) || (incoming && !isMine(incoming))) {
      return NextResponse.json(
        {
          ok: false,
          error: "You can only update leads assigned to you or unassigned leads.",
        },
        { status: 403 },
      );
    }
  }

  // Validate status if provided.
  let status: LifecycleStatus | undefined;
  if (typeof body.status === "string") {
    if (!(LIFECYCLE_STATUSES as string[]).includes(body.status)) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }
    status = body.status as LifecycleStatus;
  }

  const ok = await updateLead({
    id,
    status,
    care_manager:
      typeof body.care_manager === "string" ? body.care_manager : undefined,
    follow_up_date:
      typeof body.follow_up_date === "string" ? body.follow_up_date : undefined,
    note: typeof body.note === "string" ? body.note : undefined,
    updated_by: session.email,
  });

  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "Nothing to update or lead not found" },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
