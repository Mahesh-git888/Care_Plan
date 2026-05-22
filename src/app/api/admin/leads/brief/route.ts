import { NextResponse } from "next/server";

import { getSession, isAdminConfigured } from "@/lib/admin-auth";
import { generateBrief } from "@/lib/ai-brief";
import { isDbConfigured } from "@/lib/db";
import { getLeadById, updateLeadBrief } from "@/lib/lead-store";

export const dynamic = "force-dynamic";

// Tolerant name matching, mirroring /api/admin/leads so a CM's scoping here
// behaves identically to the lead list they can already see.
function normalizeName(name: string | undefined | null): string {
  return (name ?? "").trim().toLowerCase();
}
function firstWord(name: string | undefined | null): string {
  return normalizeName(name).split(/\s+/)[0] ?? "";
}

// POST { id } -> generates (or regenerates) the AI pre-call brief for one
// lead, stores it, and returns it. Admin-only, with the same per-CM scoping
// as the lead list: a CM may act on their own or unassigned leads only.
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

  let body: { id?: string };
  try {
    body = (await request.json()) as { id?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const id = body.id?.trim();
  if (!id) {
    return NextResponse.json({ error: "Missing lead id." }, { status: 400 });
  }

  const lead = await getLeadById(id);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  // Per-CM scoping: a CM may only generate briefs for their own assigned
  // leads or unassigned ones. Admins may generate for any lead.
  if (session.role === "cm") {
    const cm = normalizeName(lead.care_manager);
    const mineFull = normalizeName(session.name);
    const mineFirst = firstWord(session.name);
    const isMine =
      !cm ||
      cm === "unassigned" ||
      cm === mineFull ||
      cm === mineFirst ||
      firstWord(cm) === mineFirst;
    if (!isMine) {
      return NextResponse.json(
        { error: "This lead is assigned to another care manager." },
        { status: 403 },
      );
    }
  }

  try {
    const brief = await generateBrief(lead);
    await updateLeadBrief(id, brief);
    return NextResponse.json({ ok: true, brief });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[leads/brief] generation failed", err);
    return NextResponse.json(
      { error: "Could not generate the brief. Please try again." },
      { status: 502 },
    );
  }
}
