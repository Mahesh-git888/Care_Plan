import { NextResponse } from "next/server";

import { isAdminAuthed, isAdminConfigured } from "@/lib/admin-auth";
import { readLeads } from "@/lib/lead-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin auth is not configured on this server." },
      { status: 503 },
    );
  }
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const kindFilter = searchParams.get("kind");
  const leads = await readLeads(1000);

  const filtered = kindFilter
    ? leads.filter((l) => l.kind === kindFilter)
    : leads;

  return NextResponse.json({ leads: filtered });
}
