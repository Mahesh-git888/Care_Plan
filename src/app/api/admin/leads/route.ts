import { NextResponse } from "next/server";

import { getSession, isAdminConfigured } from "@/lib/admin-auth";
import { isDbConfigured } from "@/lib/db";
import { readLeads } from "@/lib/lead-store";
import { readUsers } from "@/lib/users";

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

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Database not configured. Set POSTGRES_URL on the server." },
      { status: 503 },
    );
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

  // Dynamic CM list. Sourced from PORTEA_USERS_JSON so the dropdown reflects
  // real accounts instead of the old hardcoded ["Meera", "Priya", "Rahul"].
  // Only role === "cm" users are included so admins don't accidentally appear
  // as assignable care managers in the dashboard dropdowns.
  // Falls back to those three names if no users are configured (legacy mode).
  const userList = await readUsers();
  const cms = userList.length > 0
    ? userList
        .filter((u) => u.role === "cm" && u.active)
        .map((u) => u.name)
        .filter((n, i, arr) => arr.indexOf(n) === i)
    : ["Meera", "Priya", "Rahul"];

  return NextResponse.json({
    leads: filtered,
    viewer: {
      role: session.role,
      name: session.name,
      email: session.email,
      must_change_password: session.mustChangePassword ?? false,
    },
    cms,
  });
}
