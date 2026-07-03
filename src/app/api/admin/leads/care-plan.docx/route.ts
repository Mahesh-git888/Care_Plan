import { NextResponse } from "next/server";

import { getSession, isAdminConfigured } from "@/lib/admin-auth";
import { carePlanFileName, renderCarePlanDocx } from "@/lib/care-plan-docx";
import { getLeadById, type LeadRecord } from "@/lib/lead-store";

export const dynamic = "force-dynamic";

function normalizeName(name: string | undefined | null): string {
  return (name ?? "").trim().toLowerCase();
}
function firstWord(name: string | undefined | null): string {
  return normalizeName(name).split(/\s+/)[0] ?? "";
}
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

// GET ?id=... -> renders the lead's stored care plan to a branded .docx and
// returns it as a download. Cookie-authenticated so a browser link works.
export async function GET(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin auth not configured." }, { status: 503 });
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "Missing lead id." }, { status: 400 });
  }

  const lead = await getLeadById(id);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }
  if (session.role === "cm" && !cmCanAccess(session.name, lead)) {
    return NextResponse.json({ error: "Not your lead." }, { status: 403 });
  }
  if (!lead.care_plan) {
    return NextResponse.json({ error: "No care plan generated yet." }, { status: 404 });
  }

  try {
    const buffer = await renderCarePlanDocx(lead.care_plan);
    const filename = carePlanFileName(lead.care_plan);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[leads/care-plan.docx] render failed", err);
    return NextResponse.json(
      { error: "Could not render the care plan document." },
      { status: 502 },
    );
  }
}
