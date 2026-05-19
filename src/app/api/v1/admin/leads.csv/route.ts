import { NextResponse } from "next/server";

import { isAdminAuthed, isAdminConfigured } from "@/lib/admin-auth";
import { readLeads } from "@/lib/lead-store";

export const dynamic = "force-dynamic";

function csvEscape(value: unknown): string {
  if (value === undefined || value === null) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const HEADERS = [
  "created_at",
  "kind",
  "vertical",
  "full_name",
  "phone",
  "city",
  "elder_name",
  "condition",
  "needs",
  "relationship",
  "ab_variant",
  "status",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "referrer",
  "landing_path",
];

export async function GET() {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin auth is not configured on this server." },
      { status: 503 },
    );
  }

  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = await readLeads(5_000);
  const lines = [HEADERS.join(",")];

  for (const lead of leads) {
    const attr = lead.attribution ?? {};
    lines.push(
      [
        lead.created_at,
        lead.kind,
        lead.vertical ?? "",
        lead.full_name ?? "",
        lead.phone ?? "",
        lead.city ?? "",
        lead.elder_name ?? "",
        lead.condition ?? "",
        lead.needs ?? "",
        lead.relationship ?? "",
        lead.ab_variant ?? "",
        lead.status ?? "",
        attr.utm_source ?? "",
        attr.utm_medium ?? "",
        attr.utm_campaign ?? "",
        attr.utm_term ?? "",
        attr.utm_content ?? "",
        attr.gclid ?? "",
        attr.fbclid ?? "",
        attr.referrer ?? "",
        attr.landing_path ?? "",
      ]
        .map(csvEscape)
        .join(","),
    );
  }

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="portea-leads-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
