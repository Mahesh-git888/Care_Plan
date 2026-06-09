// Landing-page view counter, backed by an aggregate Postgres table.
//
// One row per (day, path, vertical, utm_campaign), incremented per view, so the
// table stays small and never mixes with the leads table. Server-side only; do
// NOT import from a "use client" component.

import { execute, query } from "@/lib/db";

const ORGANIC = "(organic / direct)";

export async function recordPageView(input: {
  path: string;
  vertical?: string;
  utmCampaign?: string;
}): Promise<void> {
  const path = (input.path || "/").slice(0, 256);
  const vertical = (input.vertical || "").slice(0, 64);
  const campaign = (input.utmCampaign || "").slice(0, 128);
  await execute(
    `INSERT INTO page_views (day, path, vertical, utm_campaign, views)
     VALUES (CURRENT_DATE, $1, $2, $3, 1)
     ON CONFLICT (day, path, vertical, utm_campaign)
     DO UPDATE SET views = page_views.views + 1`,
    [path, vertical, campaign],
  );
}

export type PageViewStats = {
  total: number;
  byCampaign: Record<string, number>;
};

export async function getPageViewStats(): Promise<PageViewStats> {
  const totalRows = await query<{ total: number }>(
    `SELECT COALESCE(SUM(views), 0)::int AS total FROM page_views`,
  );
  const campRows = await query<{ utm_campaign: string; views: number }>(
    `SELECT utm_campaign, SUM(views)::int AS views FROM page_views GROUP BY utm_campaign`,
  );
  const byCampaign: Record<string, number> = {};
  for (const r of campRows) {
    const key = r.utm_campaign?.trim() || ORGANIC;
    byCampaign[key] = (byCampaign[key] ?? 0) + Number(r.views);
  }
  return { total: Number(totalRows[0]?.total ?? 0), byCampaign };
}
