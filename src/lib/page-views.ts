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
    `INSERT INTO page_views (bucket, path, vertical, utm_campaign, views)
     VALUES (date_trunc('hour', now()), $1, $2, $3, 1)
     ON CONFLICT (bucket, path, vertical, utm_campaign)
     DO UPDATE SET views = page_views.views + 1`,
    [path, vertical, campaign],
  );
}

export type PageViewStats = {
  total: number;
  byCampaign: Record<string, number>;
};

// sinceIso limits the stats to views on or after that timestamp. Pass
// undefined for all-time.
export async function getPageViewStats(sinceIso?: string): Promise<PageViewStats> {
  const since = sinceIso ?? null;
  const totalRows = await query<{ total: number }>(
    `SELECT COALESCE(SUM(views), 0)::int AS total FROM page_views
     WHERE ($1::timestamptz IS NULL OR bucket >= $1)`,
    [since],
  );
  const campRows = await query<{ utm_campaign: string; views: number }>(
    `SELECT utm_campaign, SUM(views)::int AS views FROM page_views
     WHERE ($1::timestamptz IS NULL OR bucket >= $1)
     GROUP BY utm_campaign`,
    [since],
  );
  const byCampaign: Record<string, number> = {};
  for (const r of campRows) {
    const key = r.utm_campaign?.trim() || ORGANIC;
    byCampaign[key] = (byCampaign[key] ?? 0) + Number(r.views);
  }
  return { total: Number(totalRows[0]?.total ?? 0), byCampaign };
}

export type PageViewBreakdown = {
  byDay: { day: string; views: number }[];
  byHour: { hour: number; views: number }[];
};

// Landing-page views split by calendar day and by hour-of-day, both in IST
// (Asia/Kolkata) so the busiest hours read as local time, not UTC. Used by the
// marketing dashboard to time campaigns. Respects the same optional sinceIso
// window as getPageViewStats.
export async function getPageViewBreakdown(
  sinceIso?: string,
): Promise<PageViewBreakdown> {
  const since = sinceIso ?? null;
  const dayRows = await query<{ day: string; views: number }>(
    `SELECT to_char((bucket AT TIME ZONE 'Asia/Kolkata')::date, 'YYYY-MM-DD') AS day,
            SUM(views)::int AS views
     FROM page_views
     WHERE ($1::timestamptz IS NULL OR bucket >= $1)
     GROUP BY 1 ORDER BY 1`,
    [since],
  );
  const hourRows = await query<{ hour: number; views: number }>(
    `SELECT EXTRACT(HOUR FROM (bucket AT TIME ZONE 'Asia/Kolkata'))::int AS hour,
            SUM(views)::int AS views
     FROM page_views
     WHERE ($1::timestamptz IS NULL OR bucket >= $1)
     GROUP BY 1 ORDER BY 1`,
    [since],
  );
  return {
    byDay: dayRows.map((r) => ({ day: r.day, views: Number(r.views) })),
    byHour: hourRows.map((r) => ({ hour: Number(r.hour), views: Number(r.views) })),
  };
}
