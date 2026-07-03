import { NextResponse } from "next/server";

import { getSession, isAdminConfigured } from "@/lib/admin-auth";
import { generateCarePlan } from "@/lib/care-plan";
import { isDbConfigured } from "@/lib/db";
import { getLeadById, updateLeadCarePlan, type LeadRecord } from "@/lib/lead-store";

export const dynamic = "force-dynamic";

function normalizeName(name: string | undefined | null): string {
  return (name ?? "").trim().toLowerCase();
}
function firstWord(name: string | undefined | null): string {
  return normalizeName(name).split(/\s+/)[0] ?? "";
}

// Same per-CM scoping as the lead list and brief route: a CM may act on their
// own assigned or unassigned leads only; admins may act on any lead.
function cmCanAccess(sessionName: string, lead: LeadRecord): boolean {
  const cm = normalizeName(lead.care_manager);
  const mineFull = normalizeName(sessionName);
  const mineFirst = firstWord(sessionName);
  return (
    !cm ||
    cm === "unassigned" ||
    cm === mineFull ||
    cm === mineFirst ||
    firstWord(cm) === mineFirst
  );
}

// POST { id, notes? } -> generate (or regenerate) the care plan for one lead,
// store it with the doctor's notes, and return the structured plan.
export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin auth is not configured on this server." },
      { status: 503 },
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Database not configured. Set POSTGRES_URL on the server." },
      { status: 503 },
    );
  }

  let body: { id?: string; notes?: string };
  try {
    body = (await request.json()) as { id?: string; notes?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const id = body.id?.trim();
  const notes = (body.notes ?? "").toString();
  if (!id) {
    return NextResponse.json({ error: "Missing lead id." }, { status: 400 });
  }

  const lead = await getLeadById(id);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  if (session.role === "cm" && !cmCanAccess(session.name, lead)) {
    return NextResponse.json(
      { error: "This lead is assigned to another care manager." },
      { status: 403 },
    );
  }

  try {
    const carePlan = await generateCarePlan(lead, notes);
    await updateLeadCarePlan(id, carePlan, notes);
    return NextResponse.json({ ok: true, care_plan: carePlan });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[leads/care-plan] generation failed", err);
    return NextResponse.json(
      { error: "Could not generate the care plan. Please try again." },
      { status: 502 },
    );
  }
}
