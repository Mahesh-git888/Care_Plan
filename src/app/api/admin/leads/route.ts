import { NextResponse } from "next/server";

import { getSession, isAdminConfigured } from "@/lib/admin-auth";
import { readLeads } from "@/lib/lead-store";

export const dynamic = "force-dynamic";

// Normalize a name for tolerant matching. "Meera Sharma" vs "Meera" vs
// "meera sharma" all need to compare equal because lead.care_manager (set
// in the dashboard dropdown) and session.name (from the user record) can
// drift in formatting.
function normalizeName(name: string | undefined | null): string {
  return (name ?? "").trim().toLowerCase();
}

function firstWord(name: string | undefined | null): string {
  return normalizeName(name).split(/\s+/)[0] ?? "";
}

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const kindFilter = searchParams.get("kind");
  const leads = await readLeads(1000);

  let filtered = kindFilter ? leads.filter((l) => l.kind === kindFilter) : leads;

  // Per-CM lead scoping: a CM sees their own assigned leads + anything that
  // is unassigned (so they can claim it). An admin sees everything.
  if (session.role === "cm") {
    const mineFull = normalizeName(session.name);
    const mineFirst = firstWord(session.name);
    filtered = filtered.filter((l) => {
      const cm = normalizeName(l.care_manager);
      if (!cm || cm === "unassigned") return true;
      // Tolerate both "Meera" stored in lead + "Meera Sharma" on the user record.
      return cm === mineFull || cm === mineFirst || firstWord(cm) === mineFirst;
    });
  }

  return NextResponse.json({
    leads: filtered,
    viewer: { role: session.role, name: session.name, email: session.email },
  });
}
